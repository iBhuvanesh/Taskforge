import mongoose from "mongoose";
import Workspace from "../workspaces/workspace.model.js";
import WorkspaceMember from "../workspaces/workspaceMember.model.js";
import Project from "./project.model.js";
import { toProjectResponse } from "./mappers/project.mapper.js";

const normalizeProjectName = (name) => {
    return name.trim().normalize("NKFC").replace(/\s+/g, " ").toLowerCase();
};


export const createProject = async (workspaceId, userId, {name, description=""}) => {
    if(!mongoose.isValidObjectId(workspaceId)){
        return null;
    }

    const workspace = await Workspace.findOne({
        _id: workspaceId,
        isDeleted: {$ne: true},
    }).select("_id");

    if(!workspace){
        return null;
    }

    const membership = await WorkspaceMember.findOne({
        user: userId,
        workspace: workspaceId
    }).select("role");

    if(!membership){
        const error = new Error("You are not a member of this workspace.");
        error.statusCode = 403;
        throw error;
    }

    const allowedRoles = ["owner", "admin", "project_manager"];

    if (!allowedRoles.includes(membership.role)) {
      const error = new Error("You do not have permission to create projects.");
      error.statusCode = 403;
      throw error;
    }

    const normalizedName = normalizeProjectName(name);

    try {
      const project = await Project.create({
        workspace: workspace._id,
        name: name.trim(),
        nameKey: normalizedName,
        description: description.trim(),
        createdBy: userId,
      });

      return toProjectResponse(project);
    } catch (error) {
      if (
        error.code === 11000 &&
        error.keyPattern?.workspace &&
        error.keyPattern?.nameKey
      ) {
        const duplicateError = new Error(
          "An active or completed project with this name already exists in this workspace.",
        );

        duplicateError.statusCode = 409;

        throw duplicateError;
      }

      throw error;
    }
}