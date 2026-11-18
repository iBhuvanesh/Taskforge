export const validateWorkspaceMembersQuery = (req, res, next) => {
  const { query } = req;

  // 1. Validate query parameter structure
  if (!query || typeof query !== "object" || Array.isArray(query)) {
    return res.status(400).json({
      success: false,
      message: "Invalid query parameter format.",
    });
  }

  // 2. Reject unexpected query parameters
  const allowedFields = ["page", "limit"];

  const invalidFields = Object.keys(query).filter(
    (field) => !allowedFields.includes(field),
  );

  if (invalidFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid query parameters found.",
      invalidFields,
    });
  }

  // Validate workspace ID
  const { workspaceId } = req.params;

  if (
    typeof workspaceId !== "string" ||
    !/^[a-fA-F0-9]{24}$/.test(workspaceId)
  ) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid workspace ID.",
    });
  }

  // 3. Extract pagination values
  const { page = "1", limit = "20" } = query;

  // 4. Validate page
  if (!/^[1-9]\d*$/.test(page)) {
    return res.status(400).json({
      success: false,
      message: "Page must be a positive integer.",
    });
  }

  // 5. Validate limit
  if (!/^[1-9]\d*$/.test(limit)) {
    return res.status(400).json({
      success: false,
      message: "Limit must be a positive integer.",
    });
  }

  // 6. Enforce pagination limits
  if (Number(limit) > 100) {
    return res.status(400).json({
      success: false,
      message: "Limit cannot exceed 100.",
    });
  }

  next();
};



export const validateWorkspaceMemberRole = (req, res, next) => {
  const { body } = req;

  // 1. Validate request body structure
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({
      success: false,
      message: "Invalid input format. JSON object required.",
    });
  }

  // 2. Reject unexpected fields
  const allowedFields = ["role"];

  const invalidFields = Object.keys(body).filter(
    (field) => !allowedFields.includes(field)
  );

  if (invalidFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid fields found.",
      invalidFields,
    });
  }

  // 3. Validate role
  const { role } = body;

  const allowedRoles = ["admin", "project_manager", "member"];

  if (typeof role !== "string" || !allowedRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid workspace role.",
    });
  }

  next();
};




export const validateRemoveWorkspaceMember = (req, res, next) => {
  const { workspaceId, memberId } = req.params;

  // 1. Validate workspace ID
  if (
    typeof workspaceId !== "string" ||
    !/^[a-fA-F0-9]{24}$/.test(workspaceId)
  ) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid workspace ID.",
    });
  }

  // 2. Validate membership ID
  if (
    typeof memberId !== "string" ||
    !/^[a-fA-F0-9]{24}$/.test(memberId)
  ) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid membership ID.",
    });
  }

  next();
};






export const validateWorkspaceId = (req, res, next) => {
  const { workspaceId } = req.params;

  // 1. Validate workspace ID
  if (
    typeof workspaceId !== "string" ||
    !/^[a-fA-F0-9]{24}$/.test(workspaceId)
  ) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid workspace ID.",
    });
  }

  next();
};




export const validateOwnershipTransfer = (req, res, next) => {
  const { body } = req;

  // 1. Validate request body structure
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({
      success: false,
      message: "Invalid input format. JSON object required.",
    });
  }

  // 2. Reject unexpected fields
  const allowedFields = ["newOwnerMemberId"];

  const invalidFields = Object.keys(body).filter(
    (field) => !allowedFields.includes(field)
  );

  if (invalidFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid fields found.",
      invalidFields,
    });
  }

  // 3. Validate required membership ID
  const { newOwnerMemberId } = body;

  if (
    typeof newOwnerMemberId !== "string" ||
    newOwnerMemberId.trim() === ""
  ) {
    return res.status(400).json({
      success: false,
      message: "New owner membership ID is required.",
    });
  }

  // 4. Validate MongoDB ObjectId format
  if (!/^[a-fA-F0-9]{24}$/.test(newOwnerMemberId)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid membership ID.",
    });
  }

  next();
};
