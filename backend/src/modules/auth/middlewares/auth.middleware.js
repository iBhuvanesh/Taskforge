import jwt from 'jsonwebtoken';
import User from '../../users/user.model.js';


export const protect = async(req, res, next) => {

    try {
      let token;

      const authHeader = req.headers.authorization;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Not authorized. No token provided.",
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.userId);

      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: "Not authorized. User not found.",
        });
      }

      if (decoded.tokenVersion !== user.tokenVersion) {
        return res.status(401).json({
          success: false,
          message: "Session expired. Please log in again.",
        });
      }

      req.user = user;

      next();
    } catch (error) {
      if (
        error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError" ||
        error.name === "NotBeforeError"
      ) {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired token.",
        });
      }

      next(error);
    }


}