import prisma from "../dbConnect/prismaClient.js";
import sendResponse from "../utils/response.js";
import { randomUUID } from "crypto";

export const addCustomer = async (req, res) => {
    try {
        const { fullName, emailId, mobileNo, address, reference } = req.body;

        // Validation
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

        if (!mobileNo || typeof mobileNo !== "string" || mobileNo.trim() === "") {
            return sendResponse(res, 400, "mobileNo is required");
        }

        if (!address || typeof address !== "string" || address.trim() === "") {
            return sendResponse(res, 400, "address is required");
        }

        const id = randomUUID();

        const newCustomer = await prisma.customer.create({
            data: {
                customerId: id,
                fullName: fullName.trim(),
                emailId: emailId.trim().toLowerCase(),
                mobileNo: mobileNo.trim(),
                address: address.trim(),
                reference: reference && typeof reference === "string" && reference.trim() !== "" ? reference.trim() : null,
                createdBy: req.user?.userId || null,
                updatedBy: req.user?.userId || null
            }
        });

        return sendResponse(res, 201, "Customer created successfully", newCustomer);
    } catch (error) {
        console.error("addCustomer error:", error);
        return sendResponse(res, 500, "Failed to create customer", { error: error.message });
    }
};

export const getCustomers = async (req, res) => {
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

        // Build where clause
        const where = {
            isDeleted: false // Only get non-deleted customers
        };

        // Get total count for pagination
        const totalCount = await prisma.customer.count({ where });

        // Fetch customers with pagination
        const customers = await prisma.customer.findMany({
            where,
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

        return sendResponse(res, 200, "Customers fetched successfully", {
            customers,
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
        console.error("getCustomers error:", error);
        return sendResponse(res, 500, "Failed to fetch customers", { error: error.message });
    }
};

export const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;

        const customer = await prisma.customer.findFirst({
            where: {
                customerId: id,
                isDeleted: false // Only get if not deleted
            },
            include: {
                creator: {
                    select: {
                        userId: true,
                        fullName: true,
                        emailId: true
                    }
                },
                updater: {
                    select: {
                        userId: true,
                        fullName: true,
                        emailId: true
                    }
                }
            }
        });

        if (!customer) {
            return sendResponse(res, 404, "Customer not found");
        }

        return sendResponse(res, 200, "Customer fetched successfully", customer);
    } catch (error) {
        console.error("getCustomerById error:", error);
        return sendResponse(res, 500, "Failed to fetch customer", { error: error.message });
    }
};

export const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, emailId, mobileNo, address, reference } = req.body;

        // Check if customer exists and is not deleted
        const existing = await prisma.customer.findFirst({
            where: {
                customerId: id,
                isDeleted: false
            }
        });

        if (!existing) {
            return sendResponse(res, 404, "Customer not found");
        }

        // Build update data object with only provided fields
        const updateData = {};

        if (fullName !== undefined) {
            if (typeof fullName !== "string" || fullName.trim() === "") {
                return sendResponse(res, 400, "fullName must be a non-empty string");
            }
            updateData.fullName = fullName.trim();
        }

        if (emailId !== undefined) {
            if (typeof emailId !== "string" || emailId.trim() === "") {
                return sendResponse(res, 400, "emailId must be a non-empty string");
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailId.trim())) {
                return sendResponse(res, 400, "Invalid email format");
            }
            updateData.emailId = emailId.trim().toLowerCase();
        }

        if (mobileNo !== undefined) {
            if (typeof mobileNo !== "string" || mobileNo.trim() === "") {
                return sendResponse(res, 400, "mobileNo must be a non-empty string");
            }
            updateData.mobileNo = mobileNo.trim();
        }

        if (address !== undefined) {
            if (typeof address !== "string" || address.trim() === "") {
                return sendResponse(res, 400, "address must be a non-empty string");
            }
            updateData.address = address.trim();
        }

        if (reference !== undefined) {
            if (reference === null || reference === "") {
                updateData.reference = null;
            } else if (typeof reference === "string") {
                updateData.reference = reference.trim();
            } else {
                return sendResponse(res, 400, "reference must be a string, null, or empty string");
            }
        }

        // Add updatedBy if user is authenticated
        if (req.user?.userId) {
            updateData.updatedBy = req.user.userId;
        }

        // If no fields to update
        if (Object.keys(updateData).length === 0) {
            return sendResponse(res, 400, "No fields to update");
        }

        const updatedCustomer = await prisma.customer.update({
            where: { customerId: id },
            data: updateData
        });

        return sendResponse(res, 200, "Customer updated successfully", updatedCustomer);
    } catch (error) {
        console.error("updateCustomer error:", error);
        if (error.code === 'P2025') {
            return sendResponse(res, 404, "Customer not found");
        }
        return sendResponse(res, 500, "Failed to update customer", { error: error.message });
    }
};

export const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if customer exists and is not already deleted
        const existing = await prisma.customer.findFirst({
            where: {
                customerId: id,
                isDeleted: false
            }
        });

        if (!existing) {
            return sendResponse(res, 404, "Customer not found or already deleted");
        }

        // Soft delete: Update isDeleted to true instead of hard delete
        await prisma.customer.update({
            where: { customerId: id },
            data: {
                isDeleted: true,
                updatedBy: req.user?.userId
            }
        });

        return sendResponse(res, 200, "Customer deleted successfully");
    } catch (error) {
        console.error("deleteCustomer error:", error);
        if (error.code === 'P2025') {
            return sendResponse(res, 404, "Customer not found");
        }
        return sendResponse(res, 500, "Failed to delete customer", { error: error.message });
    }
};

