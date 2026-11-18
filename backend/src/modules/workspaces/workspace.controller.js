import { createWorkspace, deleteWorkspace, getUserWorkspaces, getWorkspaceById, updateWorkspace } from "./workspace.service.js";
import { acceptWorkspaceInvitation, createWorkspaceInvitation } from "./workspaceInvitation.service.js";
import { transferWorkspaceOwnership } from "./workspaceMember.service.js";


export const createWorkspaceController = async (req, res, next) => {

    try {
        const { name, description} = req.body;
        const result = await createWorkspace(req.user._id, {name, description});

        return res.status(201).json({
            success: true,
            message: "Workspace created successfully.",
            data: result,
        });

    } catch (error) {
        next(error);
    }
    
}


export const getUserWorkspacesController = async (req, res, next) => {
    try {
        const result = await getUserWorkspaces(req.user._id);

        return res.status(200).json({
            success: true,
            count: result.length,
            data: result,
        })

    } catch (error) {
        next(error);
    }
}


export const getWorkspaceByIdController = async (req, res, next) => {
    try {
        const result = await getWorkspaceById(req.params.workspaceId, req.user._id);

        if(!result){
            return res.status(404).json({
                success: false,
                message: "workspace not found",
            })
        }

        return res.status(200).json({
            success: true,
            data: result,
        })

    } catch (error) {
        next(error);
    }
}


export const updateWorkspaceController = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const { name, description } = req.body;

    const workspace = await updateWorkspace(
      workspaceId,
      req.user._id,
      { name, description }
    );

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found or you don't have permission to update it",
      });
    }

    res.status(200).json({
      success: true,
      message: "Workspace updated successfully",
      data: workspace,
    });
  } catch (error) {
    next(error);
  }
};


export const deleteWorkspaceController = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await deleteWorkspace(
      workspaceId,
      req.user._id
    );

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found or you don't have permission to delete it",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Workspace deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};


export const createWorkspaceInvitationController = async (
  req,
  res,
  next
) => {
  try {
    const invitation = await createWorkspaceInvitation(
      req.params.workspaceId,
      req.user._id,
      req.body
    );

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found or access denied",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Workspace invitation sent successfully",
      data: invitation,
    });
  } catch (error) {
    next(error);
  }
};


export const acceptWorkspaceInvitationController = async (req, res, next) => {
  try {
    const { invitationId, token } = req.body;

    const result = await acceptWorkspaceInvitation(
      invitationId,
      token,
      req.user._id,
    );

    return res.status(200).json({
      success: true,
      message: "Workspace invitation accepted successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}


export const transferWorkspaceOwnershipController = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const { newOwnerMemberId } = req.body;

    const result = await transferWorkspaceOwnership(workspaceId, req.user._id, newOwnerMemberId);

    if(!result){
      return res.status(404).json({
        success: false,
        message: "workspace or target member not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Workspace ownership transferred successfully.",
      data: result,
    });

  } catch (error) {
    next(error);
  }
}