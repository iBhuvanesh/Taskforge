import mongoose from "mongoose";

import Workspace from "./workspace.model.js";
import WorkspaceMember from "./workspaceMember.model.js";
import WorkspaceInvitation from "./workspaceInvitation.model.js";
import User from "../users/user.model.js";
import crypto from "crypto";
import { sendWorkspaceInvitation } from "../../config/email.js";


export const createWorkspaceInvitation = async (
  workspaceId,
  requesterId,
  { email, role = "member" }
) => {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Verify workspace and requester permissions
  const requesterMembership = await WorkspaceMember.findOne({
    workspace: workspaceId,
    user: requesterId,
  }).populate({
    path: "workspace",
    match: { isDeleted: { $ne: true } },
  });

  if (!requesterMembership || !requesterMembership.workspace) {
    return null;
  }

  const allowedRoles = ["owner", "admin"];

  if (!allowedRoles.includes(requesterMembership.role)) {
    const error = new Error(
      "You do not have permission to invite members"
    );
    error.statusCode = 403;
    throw error;
  }

  // 2. Check whether the user is already a workspace member
  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    const existingMembership = await WorkspaceMember.findOne({
      workspace: workspaceId,
      user: existingUser._id,
    });

    if (existingMembership) {
      const error = new Error(
        "This user is already a workspace member"
      );
      error.statusCode = 409;
      throw error;
    }
  }

  // 3. Check for an existing pending invitation
  const existingInvitation = await WorkspaceInvitation.findOne({
    workspace: workspaceId,
    email: normalizedEmail,
    status: "pending",
  });

  if (existingInvitation) {
    if (existingInvitation.expiresAt > new Date()) {
      const error = new Error(
        "A pending invitation already exists for this email"
      );
      error.statusCode = 409;
      throw error;
    }

    // Preserve history by marking the old invitation as expired
    existingInvitation.status = "expired";
    await existingInvitation.save();
  }

    // 4. Generate a secure invitation token
  const rawToken = crypto.randomBytes(32).toString("hex");

  const tokenHash = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  // 5. Set invitation expiry to 24 hours
  const expiresAt = new Date(
    Date.now() + 24 * 60 * 60 * 1000
  );

  // 6. Create the invitation record
  let invitation;

  try {
    invitation = await WorkspaceInvitation.create({
      workspace: workspaceId,
      email: normalizedEmail,
      role,
      invitedBy: requesterId,
      tokenHash,
      expiresAt,
    });
  } catch (error) {
    // Handle concurrent duplicate invitation requests
    if (error.code === 11000) {
      const duplicateError = new Error(
        "A pending invitation already exists for this email"
      );

      duplicateError.statusCode = 409;
      throw duplicateError;
    }

    throw error;
  }

  // 7. Build the invitation URL
  const invitationUrl =
    `${process.env.FRONTEND_URL}/accept-invitation` +
    `?invitationId=${invitation._id}` +
    `&token=${encodeURIComponent(rawToken)}`;

  // 8. Send the invitation email
  try {
    await sendWorkspaceInvitation(
      normalizedEmail,
      invitationUrl,
      requesterMembership.workspace.name
    );
  } catch (error) {
    invitation.status = "delivery_failed";
    await invitation.save();

    const deliveryError = new Error(
      "Invitation email could not be delivered"
    );

    deliveryError.statusCode = 502;
    throw deliveryError;
  }

  // 9. Return a safe API response
  return {
    _id: invitation._id,
    workspace: invitation.workspace,
    email: invitation.email,
    role: invitation.role,
    status: invitation.status,
    expiresAt: invitation.expiresAt,
    createdAt: invitation.createdAt,
  };
};






export const acceptWorkspaceInvitation = async (
  invitationId,
  rawToken,
  userId
) => {
  const session = await mongoose.startSession();

  try {
    const result = await session.withTransaction(async () => {
      // 1. Retrieve the invitation and its hidden token hash
      const invitation = await WorkspaceInvitation.findById(
        invitationId
      )
        .select("+tokenHash")
        .session(session);

      if (!invitation) {
        const error = new Error("Invitation not found");
        error.statusCode = 404;
        throw error;
      }

      // 2. Verify invitation status
      if (invitation.status !== "pending") {
        const error = new Error(
          "This invitation is no longer valid"
        );
        error.statusCode = 400;
        throw error;
      }

      // 3. Verify invitation expiry
      if (invitation.expiresAt <= new Date()) {
        await WorkspaceInvitation.updateOne(
          {
            _id: invitation._id,
            status: "pending",
          },
          {
            $set: {
              status: "expired",
            },
          },
          { session }
        );

        return {
          expired: true,
        };
      }

      // 4. Verify invitation token
      const providedTokenHash = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

      if (providedTokenHash !== invitation.tokenHash) {
        const error = new Error("Invalid invitation token");
        error.statusCode = 400;
        throw error;
      }

      // 5. Verify the authenticated user
      const user = await User.findById(userId).session(session);

      if (!user || !user.isActive) {
        const error = new Error("User account is unavailable");
        error.statusCode = 403;
        throw error;
      }

      // 6. Verify that the authenticated user's email matches
      if (
        user.email.toLowerCase() !== invitation.email.toLowerCase()
      ) {
        const error = new Error(
          "This invitation belongs to a different email address"
        );
        error.statusCode = 403;
        throw error;
      }

      // 7. Verify the workspace is still active
      const workspace = await Workspace.findOne({
        _id: invitation.workspace,
        isDeleted: { $ne: true },
      }).session(session);

      if (!workspace) {
        const error = new Error("Workspace is unavailable");
        error.statusCode = 404;
        throw error;
      }

      // 8. Check existing membership
      const existingMembership = await WorkspaceMember.findOne({
        workspace: invitation.workspace,
        user: userId,
      }).session(session);

      if (existingMembership) {
        const error = new Error(
          "You are already a member of this workspace"
        );
        error.statusCode = 409;
        throw error;
      }

      // 9. Create workspace membership
      await WorkspaceMember.create(
        [
          {
            workspace: invitation.workspace,
            user: userId,
            role: invitation.role,
          },
        ],
        { session }
      );

      // 10. Mark invitation as accepted
      const updatedInvitation =
        await WorkspaceInvitation.findOneAndUpdate(
          {
            _id: invitation._id,
            status: "pending",
            expiresAt: { $gt: new Date() },
          },
          {
            $set: {
              status: "accepted",
              acceptedAt: new Date(),
            },
          },
          {
            new: true,
            session,
          }
        );

      if (!updatedInvitation) {
        const error = new Error(
          "Invitation is no longer available"
        );
        error.statusCode = 409;
        throw error;
      }

      return {
        workspaceId: workspace._id,
        workspaceName: workspace.name,
        role: invitation.role,
        joinedAt: new Date(),
      };
    });
    if (result?.expired) {
      const error = new Error("Invitation has expired");
      error.statusCode = 400;
      throw error;
    }

    return result;
  } finally {
    await session.endSession();
  }
};



