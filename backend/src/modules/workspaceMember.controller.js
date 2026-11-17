import { getWorkspaceMembers } from "./workspaces/workspaceMember.service.js";

export const getWorkspaceMembersController = async (
  req,
  res,
  next
) => {
  try {
    const { page = "1", limit = "20" } = req.query;

    const result = await getWorkspaceMembers(
      req.params.workspaceId,
      req.user._id,
      { page, limit }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found or access denied.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Workspace members retrieved successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};