
export const validateInvitationAcceptance = (req, res, next) => {
  const { body } = req;

  // 1. Validate request body structure
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({
      success: false,
      message: "Invalid input format. JSON object required.",
    });
  }

  // 2. Reject unexpected fields
  const allowedFields = ["invitationId", "token"];

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

  // 3. Extract request fields
  const { invitationId, token } = body;

  // 4. Validate required invitation ID
  if (
    typeof invitationId !== "string" ||
    invitationId.trim() === ""
  ) {
    return res.status(400).json({
      success: false,
      message: "Invitation ID is required.",
    });
  }

  // 5. Validate MongoDB ObjectId format
  if (!/^[a-fA-F0-9]{24}$/.test(invitationId)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid invitation ID.",
    });
  }

  // 6. Validate required invitation token
  if (
    typeof token !== "string" ||
    token.trim() === ""
  ) {
    return res.status(400).json({
      success: false,
      message: "Invitation token is required.",
    });
  }

  // 7. Validate invitation token format
  if (!/^[a-fA-F0-9]{64}$/.test(token)) {
    return res.status(400).json({
      success: false,
      message: "Invalid invitation token format.",
    });
  }

  // 8. Continue only after successful validation
  next();
};
