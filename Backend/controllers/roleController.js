import prisma from "../dbConnect/prismaClient.js";
import sendResponse from "../utils/response.js";
import { randomUUID } from "crypto";

export const addRole = async (req, res) => {
    try {
        const { roleName } = req.body;

        if (!roleName || typeof roleName !== "string" || roleName.trim() === "") {
            return sendResponse(res, 400, "roleName is required");
        }

        // Check if role name already exists
        const existing = await prisma.role.findFirst({
            where: { roleName: roleName.trim() }
        });

        if (existing) {
            return sendResponse(res, 409, "Role name already exists");
        }

        const id = randomUUID();

        const newRole = await prisma.role.create({
            data: {
                roleId: id,
                roleName: roleName.trim()
            },
            select: {
                roleId: true,
                roleName: true,
                createdAt: true
            }
        });

        return sendResponse(res, 201, "Role created successfully", newRole);
    } catch (error) {
        console.error("addRole error:", error);
        return sendResponse(res, 500, "Failed to create role", { error: error.message });
    }
};

export const getRoles = async (req, res) => {
    try {
        const roles = await prisma.role.findMany({
            select: {
                roleId: true,
                roleName: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return sendResponse(res, 200, "Roles fetched successfully", roles);
    } catch (error) {
        console.error("getRoles error:", error);
        return sendResponse(res, 500, "Failed to fetch roles", { error: error.message });
    }
};

export const getRoleById = async (req, res) => {
    try {
        const { id } = req.params;

        const role = await prisma.role.findUnique({
            where: {
                roleId: id
            },
            select: {
                roleId: true,
                roleName: true,
                createdAt: true
            }
        });

        if (!role) {
            return sendResponse(res, 404, "Role not found");
        }

        return sendResponse(res, 200, "Role fetched successfully", role);
    } catch (error) {
        console.error("getRoleById error:", error);
        return sendResponse(res, 500, "Failed to fetch role", { error: error.message });
    }
};

export const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { roleName } = req.body || {};

        if (!roleName || typeof roleName !== "string" || roleName.trim() === "") {
            return sendResponse(res, 400, "roleName is required");
        }

        // Check if role exists
        const existing = await prisma.role.findUnique({
            where: { roleId: id }
        });

        if (!existing) {
            return sendResponse(res, 404, "Role not found");
        }

        // Check for duplicate role name
        const dup = await prisma.role.findFirst({
            where: {
                roleName: roleName.trim(),
                roleId: { not: id }
            }
        });

        if (dup) {
            return sendResponse(res, 409, "Role name already exists");
        }

        const updatedRole = await prisma.role.update({
            where: { roleId: id },
            data: { roleName: roleName.trim() },
            select: {
                roleId: true,
                roleName: true,
                createdAt: true
            }
        });

        return sendResponse(res, 200, "Role updated successfully", updatedRole);
    } catch (error) {
        console.error("updateRole error:", error);
        return sendResponse(res, 500, "Failed to update role", { error: error.message });
    }
};

export const deleteRole = async (req, res) => {
    try {
        const { id } = req.params;

        try {
            const deletedRole = await prisma.role.delete({
                where: { roleId: id }
            });

            return sendResponse(res, 200, "Role deleted successfully");
        } catch (error) {
            // Handle FK restriction (users referencing role) - Prisma P2003 error code
            if (error.code === 'P2025') {
                return sendResponse(res, 404, "Role not found");
            }
            if (error.code === 'P2003') {
                return sendResponse(res, 409, "Cannot delete role: it is referenced by users");
            }
            throw error;
        }
    } catch (error) {
        console.error("deleteRole error:", error);
        return sendResponse(res, 500, "Failed to delete role", { error: error.message });
    }
};


