import mongoose from "mongoose";
import Workspace from "./workspace.model.js";
import WorkspaceMember from "./workspaceMember.model.js";
import { toWorkspaceResponse } from "./mappers/workspace.mapper.js";


export const createWorkspace = async (userId, {name, description = ""}) => {
    
    const session = await mongoose.startSession();

    try {
        const workspace = await session.withTransaction(async () => {
            const [newWorkspace] = await Workspace.create([{
                name: name.trim(),
                description: description.trim(),
                createdBy: userId,
            },], {session});

            await WorkspaceMember.create(
                [{
                    workspace: newWorkspace._id,
                    user: userId,
                    role: "owner",
                },],{ session }
            );
            return newWorkspace;
        });
        return toWorkspaceResponse(workspace);
        
    } finally{
        await session.endSession();
    }
};



export const getUserWorkspaces = async (userId) => {
    const memberships = await WorkspaceMember.find({ user: userId })
      .populate({
        path: "workspace",
        select: "name description createdBy createdAt updatedAt",
        match: {
          isDeleted: { $ne: true },
        },
      })
      .sort({ createdAt: -1 });

    return memberships
      .filter((membership) => membership.workspace !== null)
      .map((membership) => ({
        ...membership.workspace.toObject(),
        role: membership.role,
        joinedAt: membership.joinedAt,
      }));
};


export const getWorkspaceById = async (workspaceId, userId) => {
    if(!mongoose.isValidObjectId(workspaceId)){
        return null;
    }

    const membership = await WorkspaceMember.findOne({
      workspace: workspaceId,
      user: userId,
    }).populate({
      path: "workspace",
      select: "name description createdBy createdAt updatedAt",
      match: {
        isDeleted: { $ne: true },
      },
    });


    if(!membership || !membership.workspace){
        return null;
    }

    return {
        ...membership.workspace.toObject(),
        role: membership.role,
        joinedAt: membership.joinedAt,
    };
};


export const updateWorkspace = async (
  workspaceId,
  userId,
  updates
) => {
  if (!mongoose.isValidObjectId(workspaceId)) {
    return null;
  }

  const membership = await WorkspaceMember.findOne({
    workspace: workspaceId,
    user: userId,
  });

  if (!membership) {
    return null;
  }

// The Below code is to check whether unchanged fields are there

//   const isNameUnchanged =
//     updates.name === undefined ||
//     membership.workspace.name === updates.name.trim();

//   const isDescriptionUnchanged =
//     updates.description === undefined ||
//     membership.workspace.description === updates.description.trim();

//   if (isNameUnchanged) {
//     const error = new Error("No changes detected on name");
//     error.statusCode = 400;
//     throw error;
//   }

//   if (isDescriptionUnchanged) {
//     const error = new Error("No changes detected on description");
//     error.statusCode = 400;
//     throw error;
//   }

  const allowedRoles = ["owner", "admin"];

  if (!allowedRoles.includes(membership.role)) {
    return null;
  }

  const updateFields = {};

  if (updates.name !== undefined) {
    updateFields.name = updates.name.trim();
  }

  if (updates.description !== undefined) {
    updateFields.description = updates.description.trim();
  }

  const updatedWorkspace = await Workspace.findByIdAndUpdate(
    {
      _id: workspaceId,
      isDeleted: { $ne: true },
    },
    { $set: updateFields },
    {
      new: true,
      runValidators: true,
    },
  );

  return updatedWorkspace;
};


export const deleteWorkspace = async (workspaceId, userId) => {
  if (!mongoose.isValidObjectId(workspaceId)) {
    return null;
  }

  const membership = await WorkspaceMember.findOne({
    workspace: workspaceId,
    user: userId,
  });

  if (!membership || membership.role !== "owner") {
    return null;
  }

  const deletedWorkspace = await Workspace.findOneAndUpdate(
    {
      _id: workspaceId,
      isDeleted: { $ne: true },
    },
    {
      $set: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  return deletedWorkspace;
};