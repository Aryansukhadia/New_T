import prisma from "../dbConnect/prismaClient.js";
import sendResponse from "../utils/response.js";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.js";

export const addUser = async (req, res) => {
    try {
        const { fullName, emailId, password, roleId } = req.body;

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

        if (!password || typeof password !== "string" || password.trim() === "") {
            return sendResponse(res, 400, "password is required");
        }

        if (!roleId || typeof roleId !== "string" || roleId.trim() === "") {
            return sendResponse(res, 400, "roleId is required");
        }

        // Check if emailId already exists
        const existingUser = await prisma.user.findUnique({
            where: { emailId: emailId.trim().toLowerCase() }
        });

        if (existingUser) {
            return sendResponse(res, 409, "Email already exists");
        }

        // Check if role exists
        const roleExists = await prisma.role.findUnique({
            where: { roleId: roleId.trim() }
        });

        if (!roleExists) {
            return sendResponse(res, 404, "Role not found");
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
                roleId: roleId.trim()
            },
            select: {
                userId: true,
                fullName: true,
                emailId: true,
                roleId: true,
                createdAt: true,
                role: {
                    select: {
                        roleId: true,
                        roleName: true
                    }
                }
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
        if (limitNum < 1 || limitNum > 100) {
            return sendResponse(res, 400, "Limit must be between 1 and 100");
        }

        // Get total count for pagination
        const totalCount = await prisma.user.count();

        // Fetch users with pagination
        const users = await prisma.user.findMany({
            select: {
                userId: true,
                fullName: true,
                emailId: true,
                roleId: true,
                createdAt: true,
                role: {
                    select: {
                        roleId: true,
                        roleName: true
                    }
                }
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

        const user = await prisma.user.findUnique({
            where: {
                userId: id
            },
            select: {
                userId: true,
                fullName: true,
                emailId: true,
                roleId: true,
                createdAt: true,
                role: {
                    select: {
                        roleId: true,
                        roleName: true
                    }
                }
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

        // Check if user exists
        const existing = await prisma.user.findUnique({
            where: { userId: id }
        });

        if (!existing) {
            return sendResponse(res, 404, "User not found");
        }

        // Validate fullName is provided
        if (!fullName || typeof fullName !== "string" || fullName.trim() === "") {
            return sendResponse(res, 400, "fullName is required");
        }

        const updatedUser = await prisma.user.update({
            where: { userId: id },
            data: {
                fullName: fullName.trim()
            },
            select: {
                userId: true,
                fullName: true,
                emailId: true,
                roleId: true,
                createdAt: true,
                role: {
                    select: {
                        roleId: true,
                        roleName: true
                    }
                }
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

        try {
            const deletedUser = await prisma.user.delete({
                where: { userId: id }
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

export const createUserByAdmin = async (req, res) => {
    try {
        const { fullName, emailId, password, roleId } = req.body;

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

        if (!password || typeof password !== "string" || password.trim() === "") {
            return sendResponse(res, 400, "password is required");
        }

        if (!roleId || typeof roleId !== "string" || roleId.trim() === "") {
            return sendResponse(res, 400, "roleId is required");
        }

        // Check if emailId already exists
        const existingUser = await prisma.user.findUnique({
            where: { emailId: emailId.trim().toLowerCase() }
        });

        if (existingUser) {
            return sendResponse(res, 409, "Email already exists");
        }

        // Check if role exists
        const roleExists = await prisma.role.findUnique({
            where: { roleId: roleId.trim() }
        });

        if (!roleExists) {
            return sendResponse(res, 404, "Role not found");
        }

        const id = randomUUID();
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password.trim(), saltRounds);

        // Create user with admin's userId as updatedBy
        const newUser = await prisma.user.create({
            data: {
                userId: id,
                fullName: fullName.trim(),
                emailId: emailId.trim().toLowerCase(),
                password: hashedPassword,
                roleId: roleId.trim(),
                updatedBy: req.user.userId // Admin who created the user
            },
            select: {
                userId: true,
                fullName: true,
                emailId: true,
                roleId: true,
                createdAt: true,
                role: {
                    select: {
                        roleId: true,
                        roleName: true
                    }
                }
            }
        });

        return sendResponse(res, 201, "User created successfully by admin", newUser);
    } catch (error) {
        console.error("createUserByAdmin error:", error);
        return sendResponse(res, 500, "Failed to create user", { error: error.message });
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
            },
            include: {
                role: {
                    select: {
                        roleId: true,
                        roleName: true
                    }
                }
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

        // Generate JWT token with userId and roleId
        const token = generateToken({
            userId: user.userId,
            roleId: user.roleId
        });

        // Return user info and token
        const userData = {
            userId: user.userId,
            fullName: user.fullName,
            emailId: user.emailId,
            roleName: user.role.roleName,
            token: token
        };

        return sendResponse(res, 200, "Login successful", userData);
    } catch (error) {
        console.error("login error:", error);
        return sendResponse(res, 500, "Failed to login", { error: error.message });
    }
};