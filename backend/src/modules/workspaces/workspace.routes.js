import express from "express";
import { protect } from "../auth/middlewares/auth.middleware.js";
import { createWorkspaceController, deleteWorkspaceController, getUserWorkspacesController, getWorkspaceByIdController, updateWorkspaceController } from "./workspace.controller.js";
import { validateWorkspace } from "./validations/workspace.validation.js";
import { validateUpdateWorkspace } from "./validations/update-workspace.validation.js";



const workspaceRouter = express.Router();

workspaceRouter.use( protect );

workspaceRouter.post("/", validateWorkspace, createWorkspaceController);

workspaceRouter.get("/", getUserWorkspacesController);

workspaceRouter.get("/:workspaceId", getWorkspaceByIdController)

workspaceRouter.patch("/:workspaceId", validateUpdateWorkspace, updateWorkspaceController);

workspaceRouter.delete("/:workspaceId", deleteWorkspaceController);

export default workspaceRouter;