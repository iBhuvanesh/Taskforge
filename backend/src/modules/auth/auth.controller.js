import {
  registerUser,
  loginUser,
  updateUserProfile,
  changeUserPassword,
  forgotUserPassword,
  resetUserPassword,
  requestEmailChange,
  verifyEmailChange,
  logoutUser
} from "./auth.service.js";



export const register = async (req, res, next) => {
  try {
    const user = await registerUser(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await loginUser(req.body);

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: "true",
      message: "User profile fetched successfully!",
      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const updatedUser = await updateUserProfile(req.user._id, req.body);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const result = await changeUserPassword(
      req.user._id,
      req.body.currentPassword,
      req.body.newPassword,
    );

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};


export const forgotPassword = async (req, res, next) => {
    try{
        await forgotUserPassword(req.body.email);

        res.status(200).json({
            success: true,
            message: "If an account exists with that email, a password reset link will be sent.",
        });

    }catch(error){
        next(error);
    }
}

export const resetPassword = async (req, res, next) => {
  try {
    const result = await resetUserPassword(
      req.params.token,
      req.body.newPassword
    );

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};


export const requestEmailChangeController = async (req, res, next) => {
  try {
    const result = await requestEmailChange(
      req.user._id,
      req.body.email
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmailChangeController = async (req, res, next) => {
  try {
    const result = await verifyEmailChange(req.params.token);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try{
    const result = await logoutUser(req.user._id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  }
  catch (error) {
    next(error);
  }
}