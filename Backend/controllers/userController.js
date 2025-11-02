import prisma from "../dbConnect/prismaClient.js";
import sendResponse from "../utils/response.js";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

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
            }
        });

        return sendResponse(res, 200, "Users fetched successfully", users);
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