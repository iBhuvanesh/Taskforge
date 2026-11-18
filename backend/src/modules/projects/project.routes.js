import express from "express";

import { protect } from "../auth/middlewares/auth.middleware.js";

import { validateCreateProject } from "./validations/project.validation.js";

import { createProjectController } from "./project.controller.js";

const projectRouter = express.Router();

projectRouter.use(protect);

projectRouter.post("/workspaces/:workspaceId/projects", validateCreateProject, createProjectController);

export default projectRouter;
