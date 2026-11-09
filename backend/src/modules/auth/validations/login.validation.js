export const validateLogin = (req, res, next) => {
  const { email, password } = req.body ?? {};

  const errors = [];

  if (typeof email !== "string" || !email.trim()) {
    errors.push("Email is required");
  }

  if (typeof password !== "string" || !password.trim()) {
    errors.push("Password is required");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};