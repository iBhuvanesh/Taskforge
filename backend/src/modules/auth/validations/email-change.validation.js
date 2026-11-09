export const validateEmailChange = (req, res, next) => {
  const { email } = req.body ?? {};

  // Allow only the email field
  const allowedFields = ["email"];

  const invalidFields = Object.keys(req.body ?? {}).filter(
    (field) => !allowedFields.includes(field)
  );

  if (invalidFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: "You can only update your email address",
      invalidFields,
    });
  }

  // Check whether email exists and is valid
  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address",
    });
  }

  next();
};