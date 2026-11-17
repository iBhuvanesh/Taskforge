import express from "express";
import { protect } from "../auth/middlewares/auth.middleware.js";
import { acceptWorkspaceInvitationController, createWorkspaceController, createWorkspaceInvitationController, deleteWorkspaceController, getUserWorkspacesController, getWorkspaceByIdController, updateWorkspaceController } from "./workspace.controller.js";
import { validateWorkspace } from "./validations/workspace.validation.js";
import { validateUpdateWorkspace } from "./validations/update-workspace.validation.js";
import { validateWorkspaceInvitation } from "./validations/invitation.validation.js";
import { validateInvitationAcceptance } from "./validations/invitationAcceptance.validation.js"
import { validateWorkspaceMembersQuery } from "./validations/membership.validation.js";
import { getWorkspaceMembersController } from "../workspaceMember.controller.js";
 


const workspaceRouter = express.Router();

workspaceRouter.use( protect );

workspaceRouter.post("/", validateWorkspace, createWorkspaceController);

workspaceRouter.get("/", getUserWorkspacesController);

workspaceRouter.get("/:workspaceId", getWorkspaceByIdController)

workspaceRouter.patch("/:workspaceId", validateUpdateWorkspace, updateWorkspaceController);

workspaceRouter.delete("/:workspaceId", deleteWorkspaceController);

workspaceRouter.post("/:workspaceId/invitations", validateWorkspaceInvitation, createWorkspaceInvitationController);

workspaceRouter.post("/invitations/accept", validateInvitationAcceptance, acceptWorkspaceInvitationController)

workspaceRouter.get("/:workspaceId/members", validateWorkspaceMembersQuery, getWorkspaceMembersController);



export default workspaceRouter;