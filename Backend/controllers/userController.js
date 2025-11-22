import prisma from "../dbConnect/prismaClient.js";
import sendResponse from "../utils/response.js";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.js";
import { getAvailableRoles } from "../utils/roles.js";
import { validatePassword } from "../utils/passwordValidation.js";

export const addUser = async (req, res) => {
    try {
        const { fullName, emailId, password, role } = req.body;

        if (!fullName || typeof fullName !== "string" || fullName.trim() === "") {
            return sendResponse(res, 400, "fullName is required");
        }

        if (!emailId || typeof emailId !== "string" || emailId.trim() === "") {
            return sendResponse(res, 400, "emailId is required");
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailId.trim())) {
            return sendResponse(res, 400, "Invalid email format");
        }

        // Validate password
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return sendResponse(res, 400, passwordValidation.message);
        }

        if (!role || typeof role !== "string" || role.trim() === "") {
            return sendResponse(res, 400, "role is required");
        }

        // Validate role is one of the allowed values
        const allowedRoles = ['superAdmin', 'admin', 'subAdmin'];
        if (!allowedRoles.includes(role.trim())) {
            return sendResponse(res, 400, "Invalid role. Must be one of: superAdmin, admin, subAdmin");
        }

        // Check if emailId already exists
        const existingUser = await prisma.user.findUnique({
            where: { emailId: emailId.trim().toLowerCase() }
        });

        if (existingUser) {
            return sendResponse(res, 409, "Email already exists");
        }

        // Role validation based on the authenticated user's role
        // SuperAdmin can create: admin, subAdmin
        // Admin can create: subAdmin
        // SubAdmin cannot create anyone
        const userRole = req.user.role;

        if (userRole === 'subAdmin') {
            return sendResponse(res, 403, "You are not authorized to create users");
        }

        if (userRole === 'admin' && role !== 'subAdmin') {
            return sendResponse(res, 403, "Admins can only create SubAdmin users");
        }

        if (userRole === 'superAdmin' && !['admin', 'subAdmin'].includes(role)) {
            return sendResponse(res, 400, "SuperAdmin can only create Admin or SubAdmin users");
        }

        const id = randomUUID();
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password.trim(), saltRounds);

        const newUser = await prisma.user.create({
            data: {
                userId: id,
                fullName: fullName.trim(),
                emailId: emailId.trim().toLowerCase(),
                password: hashedPassword,
                role: role.trim()
            },
            select: {
                userId: true,
                fullName: true,
                emailId: true,
                role: true,
                createdAt: true
            }
        });

        return sendResponse(res, 201, "User created successfully", newUser);
    } catch (error) {
        console.error("addUser error:", error);
        return sendResponse(res, 500, "Failed to create user", { error: error.message });
    }
};

export const getUsers = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10
        } = req.query;

        // Parse pagination parameters
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const skip = (pageNum - 1) * limitNum;

        // Validate pagination
        if (pageNum < 1) {
            return sendResponse(res, 400, "Page number must be at least 1");
        }

        const userRole = getAvailableRoles(req.user.role);

        // Get total count for pagination
        const totalCount = await prisma.user.count({
            where: {
                role: {
                    in: userRole
                }
            }
        });

        // Fetch users with pagination
        const users = await prisma.user.findMany({
            where: {
                role: {
                    in: userRole
                }
            },
            select: {
                userId: true,
                fullName: true,
                emailId: true,
                role: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limitNum
        });

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / limitNum);
        const hasNextPage = pageNum < totalPages;
        const hasPreviousPage = pageNum > 1;

        return sendResponse(res, 200, "Users fetched successfully", {
            users,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalCount,
                limit: limitNum,
                hasNextPage,
                hasPreviousPage,
            }
        });
    } catch (error) {
        console.error("getUsers error:", error);
        return sendResponse(res, 500, "Failed to fetch users", { error: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        // Get user role based on the user's role
        const userRole = getAvailableRoles(req.user.role);

        const user = await prisma.user.findUnique({
            where: {
                userId: id,
                role: {
                    in: userRole
                }
            },
            select: {
                userId: true,
                fullName: true,
                emailId: true,
                role: true,
                createdAt: true
            }
        });

        if (!user) {
            return sendResponse(res, 404, "User not found");
        }

        return sendResponse(res, 200, "User fetched successfully", user);
    } catch (error) {
        console.error("getUserById error:", error);
        return sendResponse(res, 500, "Failed to fetch user", { error: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName } = req.body || {};

        const userRole = getAvailableRoles(req.user.role);

        // Check if user exists
        const existing = await prisma.user.findUnique({
            where: { userId: id, role: { in: userRole } }
        });

        if (!existing) {
            return sendResponse(res, 404, "User not found");
        }

        // Validate fullName is provided
        if (!fullName || typeof fullName !== "string" || fullName.trim() === "") {
            return sendResponse(res, 400, "fullName is required");
        }

        const updatedUser = await prisma.user.update({
            where: { userId: id, role: { in: userRole } },
            data: {
                fullName: fullName.trim()
            },
            select: {
                userId: true,
                fullName: true,
                emailId: true,
                role: true,
                createdAt: true
            }
        });

        return sendResponse(res, 200, "User updated successfully", updatedUser);
    } catch (error) {
        console.error("updateUser error:", error);
        return sendResponse(res, 500, "Failed to update user", { error: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const userRole = getAvailableRoles(req.user.role);

        try {
            const deletedUser = await prisma.user.delete({
                where: { userId: id, role: { in: userRole } }
            });

            return sendResponse(res, 200, "User deleted successfully");
        } catch (error) {
            if (error.code === 'P2025') {
                return sendResponse(res, 404, "User not found");
            }
            if (error.code === 'P2003') {
                return sendResponse(res, 409, "Cannot delete user: it is referenced by other records");
            }
            throw error;
        }
    } catch (error) {
        console.error("deleteUser error:", error);
        return sendResponse(res, 500, "Failed to delete user", { error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { emailId, password } = req.body;

        if (!emailId || typeof emailId !== "string" || emailId.trim() === "") {
            return sendResponse(res, 400, "emailId is required");
        }

        if (!password || typeof password !== "string" || password.trim() === "") {
            return sendResponse(res, 400, "password is required");
        }

        // Find user by emailId
        const user = await prisma.user.findUnique({
            where: {
                emailId: emailId.trim().toLowerCase()
            }
        });

        if (!user) {
            return sendResponse(res, 401, "Invalid email or password");
        }

        // Check if user is deleted
        if (user.isDeleted) {
            return sendResponse(res, 401, "User account is deactivated");
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password.trim(), user.password);

        if (!isPasswordValid) {
            return sendResponse(res, 401, "Invalid email or password");
        }

        // Generate JWT token with userId and role
        const token = generateToken({
            userId: user.userId,
            role: user.role
        });

        // Return user info and token
        const userData = {
            userId: user.userId,
            fullName: user.fullName,
            emailId: user.emailId,
            role: user.role,
            token: token
        };

        return sendResponse(res, 200, "Login successful", userData);
    } catch (error) {
        console.error("login error:", error);
        return sendResponse(res, 500, "Failed to login", { error: error.message });
    }
};

export const getUserRoles = async (req, res) => {
    try {
        const roles = getAvailableRoles(req.user.role);
        return sendResponse(res, 200, "User roles fetched successfully", roles);
    } catch (error) {
        console.error("getUserRoles error:", error);
        return sendResponse(res, 500, "Failed to fetch user roles", { error: error.message || "Internal server error" });
    }
};

export const getMe = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = {
            userId: userId,
            fullName: req.user.fullName,
            emailId: req.user.emailId,
            role: req.user.role,
            createdAt: req.user.createdAt
        }

        return sendResponse(res, 200, "User details fetched successfully", user);
    } catch (error) {
        console.error("getMe error:", error);
        return sendResponse(res, 500, "Failed to fetch user details", { error: error.message });
    }
};

export const changePassword = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { password } = req.body;

        // Validate password
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return sendResponse(res, 400, passwordValidation.message);
        }

        // Hash new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password.trim(), saltRounds);

        // Update password and set needToResetPassword to false
        await prisma.user.update({
            where: { userId },
            data: {
                password: hashedPassword,
                needToResetPassword: false
            }
        });

        return sendResponse(res, 200, "Password changed successfully");
    } catch (error) {
        console.error("changePassword error:", error);
        return sendResponse(res, 500, "Failed to change password", { error: error.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { newPassword } = req.body;

        // Validate password
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            return sendResponse(res, 400, passwordValidation.message);
        }

        // Hash new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword.trim(), saltRounds);

        const roles = getAvailableRoles(req.user.role);

        // Single DB operation: Update only if user exists and role is authorized
        const updateResult = await prisma.user.updateMany({
            where: {
                userId,
                role: { in: roles }
            },
            data: {
                password: hashedPassword,
                needToResetPassword: true
            }
        });

        // If no rows were updated, check if user exists to provide appropriate error
        if (updateResult.count === 0) {
            const userExists = await prisma.user.findUnique({
                where: { userId },
                select: { userId: true }
            });

            if (!userExists) {
                return sendResponse(res, 404, "User not found");
            }
            return sendResponse(res, 403, "You are not authorized to change the password for this customer");
        }

        return sendResponse(res, 200, "Password changed successfully");
    } catch (error) {
        console.error("changePassword error:", error);
        return sendResponse(res, 500, "Failed to change password", { error: error.message });
    }
};