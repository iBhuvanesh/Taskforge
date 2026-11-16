export const toWorkspaceResponse = (workspace) => {
  return {
    _id: workspace._id,
    name: workspace.name,
    description: workspace.description,
    createdBy: workspace.createdBy,
    createdAt: workspace.createdAt,
    updatedAt: workspace.updatedAt,
  };
};