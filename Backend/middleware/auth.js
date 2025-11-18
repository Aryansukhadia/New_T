import { verifyToken } from "../utils/jwt.js";
import sendResponse from "../utils/response.js";
import prisma from "../dbConnect/prismaClient.js";

export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return sendResponse(res, 401, "Authorization token is required");
        }

        const token = authHeader.substring(7); // Remove "Bearer " prefix

        if (!token) {
            return sendResponse(res, 401, "Authorization token is required");
        }

        // Verify token
        const decoded = verifyToken(token);

        if (!decoded) {
            return sendResponse(res, 401, "Invalid or expired token");
        }

        // Get user from database to ensure user still exists and is active
        const user = await prisma.user.findUnique({
            where: { userId: decoded.userId }
        });

        if (!user) {
            return sendResponse(res, 401, "User not found");
        }

        if (user.isDeleted) {
            return sendResponse(res, 401, "User account is deactivated");
        }

        // Attach user info to request object
        req.user = {
            userId: user.userId,
            role: user.role
        };

        next();
    } catch (error) {
        console.error("Authentication error:", error);
        return sendResponse(res, 500, "Authentication failed", { error: error.message });
    }
};

export const isAdmin = async (req, res, next) => {
    try {
        // First authenticate the user
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return sendResponse(res, 401, "Authorization token is required");
        }

        const token = authHeader.substring(7);

        if (!token) {
            return sendResponse(res, 401, "Authorization token is required");
        }

        // Verify token
        const decoded = verifyToken(token);

        if (!decoded) {
            return sendResponse(res, 401, "Invalid or expired token");
        }

        // Get user from database to check role
        const user = await prisma.user.findUnique({
            where: { userId: decoded.userId }
        });

        if (!user) {
            return sendResponse(res, 401, "User not found");
        }

        if (user.isDeleted) {
            return sendResponse(res, 401, "User account is deactivated");
        }

        // Check if user is Admin or SuperAdmin
        if (user.role !== "admin" && user.role !== "superAdmin") {
            return sendResponse(res, 403, "Access denied. Admin privileges required");
        }

        // Attach user info to request object
        req.user = {
            userId: user.userId,
            role: user.role
        };

        next();
    } catch (error) {
        console.error("Admin check error:", error);
        return sendResponse(res, 500, "Authorization failed", { error: error.message });
    }
};

export const isSuperAdmin = async (req, res, next) => {
    try {
        // First authenticate the user
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return sendResponse(res, 401, "Authorization token is required");
        }

        const token = authHeader.substring(7);

        if (!token) {
            return sendResponse(res, 401, "Authorization token is required");
        }

        // Verify token
        const decoded = verifyToken(token);

        if (!decoded) {
            return sendResponse(res, 401, "Invalid or expired token");
        }

        // Get user from database to check role
        const user = await prisma.user.findUnique({
            where: { userId: decoded.userId }
        });

        if (!user) {
            return sendResponse(res, 401, "User not found");
        }

        if (user.isDeleted) {
            return sendResponse(res, 401, "User account is deactivated");
        }

        // Check if user is SuperAdmin
        if (user.role !== "superAdmin") {
            return sendResponse(res, 403, "Access denied. SuperAdmin privileges required");
        }

        // Attach user info to request object
        req.user = {
            userId: user.userId,
            role: user.role
        };

        next();
    } catch (error) {
        console.error("SuperAdmin check error:", error);
        return sendResponse(res, 500, "Authorization failed", { error: error.message });
    }
};

export const isSubAdmin = async (req, res, next) => {
    try {
        // First authenticate the user
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return sendResponse(res, 401, "Authorization token is required");
        }

        const token = authHeader.substring(7);

        if (!token) {
            return sendResponse(res, 401, "Authorization token is required");
        }

        // Verify token
        const decoded = verifyToken(token);

        if (!decoded) {
            return sendResponse(res, 401, "Invalid or expired token");
        }

        // Get user from database to check role
        const user = await prisma.user.findUnique({
            where: { userId: decoded.userId }
        });

        if (!user) {
            return sendResponse(res, 401, "User not found");
        }

        if (user.isDeleted) {
            return sendResponse(res, 401, "User account is deactivated");
        }

        // Check if user is SubAdmin
        if (user.role !== "subAdmin") {
            return sendResponse(res, 403, "Access denied. SubAdmin privileges required");
        }

        // Attach user info to request object
        req.user = {
            userId: user.userId,
            role: user.role
        };

        next();
    } catch (error) {
        console.error("SubAdmin check error:", error);
        return sendResponse(res, 500, "Authorization failed", { error: error.message });
    }
};

export const isAdminOrSubAdmin = async (req, res, next) => {
    try {
        // First authenticate the user
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return sendResponse(res, 401, "Authorization token is required");
        }

        const token = authHeader.substring(7);

        if (!token) {
            return sendResponse(res, 401, "Authorization token is required");
        }

        // Verify token
        const decoded = verifyToken(token);

        if (!decoded) {
            return sendResponse(res, 401, "Invalid or expired token");
        }

        // Get user from database to check role
        const user = await prisma.user.findUnique({
            where: { userId: decoded.userId }
        });

        if (!user) {
            return sendResponse(res, 401, "User not found");
        }

        if (user.isDeleted) {
            return sendResponse(res, 401, "User account is deactivated");
        }

        // Check if user is Admin or SubAdmin
        if (user.role !== "admin" && user.role !== "subAdmin") {
            return sendResponse(res, 403, "Access denied. Admin or SubAdmin privileges required");
        }

        // Attach user info to request object
        req.user = {
            userId: user.userId,
            role: user.role
        };

        next();
    } catch (error) {
        console.error("AdminOrSubAdmin check error:", error);
        return sendResponse(res, 500, "Authorization failed", { error: error.message });
    }
};