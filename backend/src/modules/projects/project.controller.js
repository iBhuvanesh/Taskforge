import { createProject } from "./project.service.js";

export const createProjectController = async (
  req,
  res,
  next
) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user._id;

    const project = await createProject(
      workspaceId,
      userId,
      req.body
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Project created successfully.",
      data: project,
    });
  } catch (error) {
    next(error);
  }
};