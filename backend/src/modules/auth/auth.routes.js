import express from "express";
import { register, login, getMe, updateProfile, changePassword, forgotPassword,
  resetPassword, requestEmailChangeController, verifyEmailChangeController, logout } from "./auth.controller.js";

import { validateRegister } from "./validations/register.validation.js";
import { validateLogin } from "./validations/login.validation.js";
import { protect } from "./middlewares/auth.middleware.js";
import { validateProfileUpdate } from "./validations/profile.validation.js";
import { validatePasswordChange } from "./validations/password-change.validation.js";
import { loginLimiter, passwordResetLimiter } from "./middlewares/rate-limit.middleware.js";
import { validateForgotPassword } from "./validations/forgot-password.validation.js";
import { validateResetPassword } from "./validations/reset-password.validation.js";
import { validateEmailChange } from "./validations/email-change.validation.js";


const authRouter = express.Router();

// POST /api/v1/auth/register
authRouter.post("/register", validateRegister, register);

// POST /api/v1/auth/login
authRouter.post("/login", loginLimiter, validateLogin, login);


authRouter.get("/me", protect, getMe);

authRouter.patch("/me", protect, validateProfileUpdate, updateProfile);

authRouter.patch("/change-password", protect, validatePasswordChange, changePassword);

authRouter.post("/forgot-password", validateForgotPassword, forgotPassword);

authRouter.post("/reset-password/:token", passwordResetLimiter, validateResetPassword, resetPassword);

authRouter.post("/me/email", protect, validateEmailChange, requestEmailChangeController);

authRouter.post("/verify-email-change/:token", verifyEmailChangeController);

authRouter.post("/logout", protect, logout);


export default authRouter;