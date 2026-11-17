
import mongoose from "mongoose";

import Workspace from "./workspace.model.js";
import WorkspaceMember from "./workspaceMember.model.js";

import {
  toWorkspaceMemberResponse,
} from "./mappers/workspaceMember.mapper.js";

export const getWorkspaceMembers = async (
  workspaceId,
  userId,
  { page = 1, limit = 20 }
) => {
  // 1. Verify workspace ID
  if (!mongoose.isValidObjectId(workspaceId)) {
    return null;
  }

  // 2. Verify workspace exists and is active
  const workspace = await Workspace.findOne({
    _id: workspaceId,
    isDeleted: { $ne: true },
  }).select("_id");

  if (!workspace) {
    return null;
  }

  // 3. Verify requester is a workspace member
  const requesterMembership = await WorkspaceMember.findOne({
    workspace: workspaceId,
    user: userId,
  }).select("_id");

  if (!requesterMembership) {
    return null;
  }

  // 4. Calculate pagination values
  const currentPage = Number(page);
  const pageLimit = Number(limit);
  const skip = (currentPage - 1) * pageLimit;

  // 5. Retrieve workspace members
  const [members, totalMembers] = await Promise.all([
    WorkspaceMember.find({
      workspace: workspaceId,
    })
      .populate({
        path: "user",
        select: "name email",
      })
      .sort({ joinedAt: 1, _id: 1 })
      .skip(skip)
      .limit(pageLimit),

    WorkspaceMember.countDocuments({
      workspace: workspaceId,
    }),
  ]);

  // 6. Map database documents to API responses
  const formattedMembers = members
    .filter((membership) => membership.user != null)
    .map(toWorkspaceMemberResponse);

  // 7. Return members and pagination metadata
  return {
    members: formattedMembers,
    pagination: {
      currentPage,
      limit: pageLimit,
      totalMembers,
      totalPages: Math.ceil(totalMembers / pageLimit),
    },
  };
};




export const updateWorkspaceMemberRole = async (
  workspaceId,
  memberId,
  requesterId,
  newRole
) => {
  // 1. Validate resource identifiers
  if (
    !mongoose.isValidObjectId(workspaceId) ||
    !mongoose.isValidObjectId(memberId)
  ) {
    return null;
  }

  // 2. Verify workspace exists and is active
  const workspace = await Workspace.findOne({
    _id: workspaceId,
    isDeleted: { $ne: true },
  }).select("_id");

  if (!workspace) {
    return null;
  }

  // 3. Find the requester's membership
  const requesterMembership = await WorkspaceMember.findOne({
    workspace: workspaceId,
    user: requesterId,
  });

  if (!requesterMembership) {
    return null;
  }

  // 4. Only owners and admins can manage roles
  const allowedRoles = ["owner", "admin"];

  if (!allowedRoles.includes(requesterMembership.role)) {
    const error = new Error(
      "You do not have permission to manage member roles."
    );
    error.statusCode = 403;
    throw error;
  }

  // 5. Find the target membership
  const targetMembership = await WorkspaceMember.findOne({
    _id: memberId,
    workspace: workspaceId,
  });

  if (!targetMembership) {
    return null;
  }

  // 6. Prevent users from modifying their own role
  if (targetMembership.user.toString() === requesterId.toString()) {
    const error = new Error("You cannot change your own role.");
    error.statusCode = 403;
    throw error;
  }

  // 7. Protect workspace ownership
  if (targetMembership.role === "owner") {
    const error = new Error(
      "Workspace owner role cannot be changed through this operation."
    );
    error.statusCode = 403;
    throw error;
  }

  // 8. Only the owner can assign the admin role
  if (
    newRole === "admin" &&
    requesterMembership.role !== "owner"
  ) {
    const error = new Error(
      "Only the workspace owner can promote members to admin."
    );
    error.statusCode = 403;
    throw error;
  }

  // 9. Prevent unnecessary updates
  if (targetMembership.role === newRole) {
    const error = new Error(
      "The member already has the requested role."
    );
    error.statusCode = 400;
    throw error;
  }

  // 10. Update the target membership
  const updatedMembership = await WorkspaceMember.findOneAndUpdate(
    {
      _id: memberId,
      workspace: workspaceId,
      role: { $ne: "owner" },
    },
    {
      $set: {
        role: newRole,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  ).populate({
  path: "user",
  select: "name email",
});

if (!updatedMembership) {
  const error = new Error(
    "Member role changed concurrently. Please refresh and try again."
  );
  error.statusCode = 409;
  throw error;
}

return toWorkspaceMemberResponse(updatedMembership);
};


