// export const validateResetPassword = (req, res, next) => {
//   const { newPassword } = req.body ?? {};
//   const { token } = req.params;

//   if (typeof token !== "string" || !/^[a-f0-9]{64}$/i.test(token)) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid password reset token",
//     });
//   }

//   if (
//     typeof newPassword !== "string" ||
//     newPassword.length < 8
//   ) {
//     return res.status(400).json({
//       success: false,
//       message: "Password must contain at least 8 characters",
//     });
//   }

//   next();
// };




export const validateResetPassword = (req, res, next) => {
  const { newPassword } = req.body ?? {};
  const { token } = req.params;

  console.log("Reset token diagnostics:", {
    exists: typeof token === "string",
    length: token?.length,
    isHex: /^[a-f0-9]+$/i.test(token ?? ""),
    isExpectedLength: token?.length === 64,
  });

  if (
    typeof token !== "string" ||
    !/^[a-f0-9]{64}$/i.test(token)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid password reset token",
    });
  }

  if (
    typeof newPassword !== "string" ||
    newPassword.length < 8
  ) {
    return res.status(400).json({
      success: false,
      message: "Password must contain at least 8 characters",
    });
  }

  next();
};