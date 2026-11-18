export const toProjectResponse = (project) => {
  return {
    _id: project._id,
    workspace: project.workspace,
    name: project.name,
    description: project.description,
    createdBy: project.createdBy,
    status: project.status,
    completedAt: project.completedAt,
    archivedAt: project.archivedAt,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
};