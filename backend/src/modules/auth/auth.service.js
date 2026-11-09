import User from "../users/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendPasswordResetEmail, sendEmailChangeVerification } from "../../config/email.js";

export const registerUser = async (userData) => {
    const { name, email, password } = userData;

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if(existingUser) {
        const error = new Error("User with this email already exists");
        error.statusCode = 409;
        throw error;
    }

    const user = new User({name: name.trim(), email: normalizedEmail, password});

    await user.save();

    return {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
    };
}


export const loginUser = async (userData) => {
    const {email , password} = userData;
    
    //normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Explicitly retrieve the password hash
    const user = await User.findOne({email: normalizedEmail}).select("+password");

    if(!user){
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    // Compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid){
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    // generate a JWT token
    const token = jwt.sign(
        {userId: user._id,
          tokenVersion: user.tokenVersion,
        },
        process.env.JWT_SECRET,
        {expiresIn: "1d"}
    );

    return {
      token,
      User: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    };
}


export const updateUserProfile = async (userId, userData) => {
  const { name } = userData;

  // Find the authenticated user
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  // Update name if provided
  if (name !== undefined) {
    user.name = name.trim();
  }


  // Save changes
  await user.save();

  // Return safe user information
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    updatedAt: user.updatedAt,
  };
};


export const changeUserPassword = async (userId, currentPassword, newPassword) => {
  
  const user = await User.findById(userId).select("+password");

  if(!user){
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const isValidCurrentPassword = await bcrypt.compare(currentPassword, user.password);

  if(!isValidCurrentPassword){
    const error = new Error("Current password is incorrect");
    error.statusCode = 401;
    throw error;
  }

  // Update the password
  user.password = newPassword;
  await user.save();
  await invalidateUserSessions(user._id);

  return {
    message: "Password updated successfully",
  };

}


export const forgotUserPassword = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail, isActive: {$ne: false} });

  if(!user){
    return;
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  await sendPasswordResetEmail(user.email, resetUrl);
}


export const resetUserPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select("+resetPasswordToken +resetPasswordExpires");


  if(!user){
    const error = new Error("Invalid or expired password reset token");
    error.statusCode = 400;
    throw error;
  }

  user.password = newPassword;
  
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  await invalidateUserSessions(user._id);

  return {
    message: "Password reset successfully",
  };
}



export const requestEmailChange = async (userId, newEmail) => {
  const normalizedEmail = newEmail.trim().toLowerCase();

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    const error = new Error("Email is already registered");
    error.statusCode = 409;
    throw error;
  }

  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.email === normalizedEmail) {
    const error = new Error("This is already your current email");
    error.statusCode = 400;
    throw error;
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.pendingEmail = normalizedEmail;
  user.emailChangeToken = hashedToken;
  user.emailChangeExpires = new Date(Date.now() + 15 * 60 * 1000);

  await user.save();

  const verificationUrl =
    `${process.env.CLIENT_URL}/verify-email-change/${resetToken}`;


  try {
    await sendEmailChangeVerification(normalizedEmail, verificationUrl);
  } catch (error) {
    user.pendingEmail = undefined;
    user.emailChangeToken = undefined;
    user.emailChangeExpires = undefined;

    await user.save();

    throw error;
  }

  return {
    message: "Verification email sent to your new email address",
  };
};



export const verifyEmailChange = async (token) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    emailChangeToken: hashedToken,
    emailChangeExpires: { $gt: new Date() },
  }).select(
    "+emailChangeToken +emailChangeExpires +pendingEmail"
  );

  if (!user) {
    const error = new Error("Invalid or expired verification link");
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await User.findOne({
    email: user.pendingEmail,
    _id: { $ne: user._id },
  });

  if (existingUser) {
    const error = new Error("This email address is already registered");
    error.statusCode = 409;
    throw error;
  }

  user.email = user.pendingEmail;
  user.pendingEmail = undefined;
  user.emailChangeToken = undefined;
  user.emailChangeExpires = undefined;

  await user.save();

  return {
    message: "Email address verified and updated successfully",
  };
};


export const invalidateUserSessions = async (userId) => {
  const user = await User.findOne(userId);

  if(!user){
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  user.tokenVersion += 1;
  await user.save();
}


export const logoutUser = async (userId) => {
  await invalidateUserSessions(userId);

  return {
    message: "Logged out successfully",
  };
};