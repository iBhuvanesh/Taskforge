
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
