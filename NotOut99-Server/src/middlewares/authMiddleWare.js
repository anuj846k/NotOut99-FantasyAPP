import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import { Admin } from "../models/admin.models.js";

export const authMiddleware = async (req, res, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "") ||
            req.headers?.authorization?.replace("Bearer ", "");

        // console.log("Auth attempt:", {
        //     tokenExists: !!token,
        //     authHeader:
        //         req.headers?.authorization ||
        //         req.header("Authorization") ||
        //         "None",
        //     cookies: req.cookies || "No cookies",
        // });

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. Please login.",
            });
        }

        // Verify token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Find user
        const user = await User.findById(decodedToken.id).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid token or user not found",
            });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        console.log("Auth middleware error:", error.message);
        return res.status(401).json({
            success: false,
            message: "Authentication failed",
            error: error.message,
        });
    }
};

// Admin authentication middleware
export const adminAuthMiddleware = async (req, res, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Admin authentication required",
            });
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const admin = await Admin.findById(decodedToken.id).select("-password");

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Invalid token or admin not found",
            });
        }

        req.user = admin;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Admin authentication failed",
            error: error.message,
        });
    }
};
