import { getWorkspaceMembers, leaveWorkspace, removeWorkspaceMember, updateWorkspaceMemberRole } from "./workspaceMember.service.js";

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



export const updateWorkspaceMemberRoleController = async (
  req,
  res,
  next
) => {
  try {
    const { workspaceId, memberId } = req.params;
    const { role } = req.body;

    const updatedMembership = await updateWorkspaceMemberRole(
      workspaceId,
      memberId,
      req.user._id,
      role
    );

    if (!updatedMembership) {
      return res.status(404).json({
        success: false,
        message: "Workspace or member not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Workspace member role updated successfully.",
      data: updatedMembership,
    });
  } catch (error) {
    next(error);
  }
};



export const removeWorkspaceMemberController = async (
  req,
  res,
  next
) => {
  try {
    const { workspaceId, memberId } = req.params;

    const result = await removeWorkspaceMember(
      workspaceId,
      memberId,
      req.user._id
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Workspace or member not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Workspace member removed successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};





export const leaveWorkspaceController = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;

    const result = await leaveWorkspace(
      workspaceId,
      req.user._id
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Workspace or membership not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "You have successfully left the workspace.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
