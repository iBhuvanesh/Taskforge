import { createWorkspace, deleteWorkspace, getUserWorkspaces, getWorkspaceById, updateWorkspace } from "./workspace.service.js";


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