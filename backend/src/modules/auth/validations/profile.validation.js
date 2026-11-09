export const validateProfileUpdate = (req, res, next) => {
  const { name } = req.body ?? {};

  const allowedFields = ["name"];

  // Reject unexpected fields
  const invalidFields = Object.keys(req.body ?? {}).filter(
    (field) => !allowedFields.includes(field)
  );

  if (invalidFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: "You can only update name",
      invalidFields,
    });
  }

  // Require at least one field
  if (name === undefined) {
    return res.status(400).json({
      success: false,
      message: "Provide at least one field to update",
    });
  }

  // Validate name if provided
  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name must be a non-empty string",
      });
    }
  }

  

  next();
};