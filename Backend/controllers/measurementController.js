import prisma from "../dbConnect/prismaClient.js";
import sendResponse from "../utils/response.js";
import { randomUUID } from "crypto";

export const addUserMeasurements = async (req, res) => {
    try {
        const { customerId } = req.body;
        const { top, bottom } = req.body;

        // Validate userId
        if (!customerId || typeof customerId !== "string" || customerId.trim() === "") {
            return sendResponse(res, 400, "customerId is required");
        }

        // Check if customer exists
        const customer = await prisma.customer.findUnique({
            where: { customerId: customerId.trim() }
        });

        if (!customer) {
            return sendResponse(res, 404, "Customer not found");
        }

        // Validate top measurements if provided
        if (top) {
            const topRequiredFields = ['length', 'shoulder', 'sleeveLength', 'sleeveBottom', 'chest', 'waist', 'hip', 'neck'];
            for (const field of topRequiredFields) {
                if (top[field] === undefined || top[field] === null) {
                    return sendResponse(res, 400, `Top measurement field '${field}' is required`);
                }
                if (typeof top[field] !== 'number' || top[field] < 0) {
                    return sendResponse(res, 400, `Top measurement field '${field}' must be a positive number`);
                }
            }
        }

        // Validate bottom measurements if provided
        if (bottom) {
            const bottomRequiredFields = ['length', 'waist', 'hip', 'thigh', 'knee', 'calf', 'bottom', 'langot'];
            for (const field of bottomRequiredFields) {
                if (bottom[field] === undefined || bottom[field] === null) {
                    return sendResponse(res, 400, `Bottom measurement field '${field}' is required`);
                }
                if (typeof bottom[field] !== 'number' || bottom[field] < 0) {
                    return sendResponse(res, 400, `Bottom measurement field '${field}' must be a positive number`);
                }
            }
        }

        // At least one measurement type must be provided
        if (!top && !bottom) {
            return sendResponse(res, 400, "At least one of 'top' or 'bottom' measurements must be provided");
        }

        const result = {};
        let topMeasurementId = null;
        let bottomMeasurementId = null;

        // Create top measurement if provided
        if (top) {
            topMeasurementId = randomUUID();
            const topMeasurement = await prisma.topMeasurement.create({
                data: {
                    topMeasurementId: topMeasurementId,
                    length: top.length,
                    shoulder: top.shoulder,
                    sleeveLength: top.sleeveLength,
                    sleeveBottom: top.sleeveBottom,
                    chest: top.chest,
                    waist: top.waist,
                    hip: top.hip,
                    neck: top.neck,
                    updatedBy: req.user?.userId || null
                },
                select: {
                    topMeasurementId: true,
                    length: true,
                    shoulder: true,
                    sleeveLength: true,
                    sleeveBottom: true,
                    chest: true,
                    waist: true,
                    hip: true,
                    neck: true,
                    createdAt: true
                }
            });
            result.topMeasurement = topMeasurement;
        }

        // Create bottom measurement if provided
        if (bottom) {
            bottomMeasurementId = randomUUID();
            const bottomMeasurement = await prisma.bottomMeasurement.create({
                data: {
                    bottomMeasurementId: bottomMeasurementId,
                    length: bottom.length,
                    waist: bottom.waist,
                    hip: bottom.hip,
                    thigh: bottom.thigh,
                    knee: bottom.knee,
                    calf: bottom.calf,
                    bottom: bottom.bottom,
                    langot: bottom.langot,
                    updatedBy: req.user?.userId || null
                },
                select: {
                    bottomMeasurementId: true,
                    length: true,
                    waist: true,
                    hip: true,
                    thigh: true,
                    knee: true,
                    calf: true,
                    bottom: true,
                    langot: true,
                    createdAt: true
                }
            });
            result.bottomMeasurement = bottomMeasurement;
        }

        // Update customer to link the measurements
        const updateData = {};
        if (topMeasurementId) {
            updateData.topMeasurementId = topMeasurementId;
        }
        if (bottomMeasurementId) {
            updateData.bottomMeasurementId = bottomMeasurementId;
        }

        if (Object.keys(updateData).length > 0) {
            await prisma.customer.update({
                where: { customerId: customerId.trim() },
                data: {
                    ...updateData,
                    updatedBy: req.user?.userId || null
                }
            });
        }

        return sendResponse(res, 201, "Measurements added successfully", result);
    } catch (error) {
        console.error("addUserMeasurements error:", error);
        return sendResponse(res, 500, "Failed to add measurements", { error: error.message });
    }
};

export const editMeasurement = async (req, res) => {
    try {
        const { topMeasurementId, bottomMeasurementId } = req.body;
        const { top, bottom } = req.body;

        // Validate that at least one measurement ID is provided
        if (!topMeasurementId && !bottomMeasurementId) {
            return sendResponse(res, 400, "Either topMeasurementId or bottomMeasurementId is required");
        }

        // Validate that both IDs are not provided
        if (topMeasurementId && bottomMeasurementId) {
            return sendResponse(res, 400, "Please provide only one measurement ID at a time");
        }

        const result = {};

        // Editable fields for top measurement
        const editableTopFields = ['length', 'shoulder', 'sleeveLength', 'sleeveBottom', 'chest', 'waist', 'hip', 'neck'];

        // Editable fields for bottom measurement
        const editableBottomFields = ['length', 'waist', 'hip', 'thigh', 'knee', 'calf', 'bottom', 'langot'];

        // Handle top measurement update
        if (topMeasurementId) {
            // Check if top measurement exists
            const existingTopMeasurement = await prisma.topMeasurement.findUnique({
                where: { topMeasurementId: topMeasurementId.trim() }
            });

            if (!existingTopMeasurement) {
                return sendResponse(res, 404, "Top measurement not found");
            }

            if (!top) {
                return sendResponse(res, 400, "Top measurement data is required");
            }

            // Validate and build update data - only include editable fields that are provided
            const updateData = {};
            for (const field of editableTopFields) {
                if (top[field] !== undefined && top[field] !== null) {
                    if (typeof top[field] !== 'number' || top[field] < 0) {
                        return sendResponse(res, 400, `Top measurement field '${field}' must be a positive number`);
                    }
                    updateData[field] = top[field];
                }
            }

            // Check if at least one field is being updated
            if (Object.keys(updateData).length === 0) {
                return sendResponse(res, 400, "At least one editable field must be provided for update");
            }

            // Update the top measurement
            const updatedTopMeasurement = await prisma.topMeasurement.update({
                where: { topMeasurementId: topMeasurementId.trim() },
                data: {
                    ...updateData,
                    updatedBy: req.user?.userId || null
                },
                select: {
                    topMeasurementId: true,
                    length: true,
                    shoulder: true,
                    sleeveLength: true,
                    sleeveBottom: true,
                    chest: true,
                    waist: true,
                    hip: true,
                    neck: true,
                    updatedAt: true,
                    createdAt: true
                }
            });

            result.topMeasurement = updatedTopMeasurement;
        }

        // Handle bottom measurement update
        if (bottomMeasurementId) {
            // Check if bottom measurement exists
            const existingBottomMeasurement = await prisma.bottomMeasurement.findUnique({
                where: { bottomMeasurementId: bottomMeasurementId.trim() }
            });

            if (!existingBottomMeasurement) {
                return sendResponse(res, 404, "Bottom measurement not found");
            }

            if (!bottom) {
                return sendResponse(res, 400, "Bottom measurement data is required");
            }

            // Validate and build update data - only include editable fields that are provided
            const updateData = {};
            for (const field of editableBottomFields) {
                if (bottom[field] !== undefined && bottom[field] !== null) {
                    if (typeof bottom[field] !== 'number' || bottom[field] < 0) {
                        return sendResponse(res, 400, `Bottom measurement field '${field}' must be a positive number`);
                    }
                    updateData[field] = bottom[field];
                }
            }

            // Check if at least one field is being updated
            if (Object.keys(updateData).length === 0) {
                return sendResponse(res, 400, "At least one editable field must be provided for update");
            }

            // Update the bottom measurement
            const updatedBottomMeasurement = await prisma.bottomMeasurement.update({
                where: { bottomMeasurementId: bottomMeasurementId.trim() },
                data: {
                    ...updateData,
                    updatedBy: req.user?.userId || null
                },
                select: {
                    bottomMeasurementId: true,
                    length: true,
                    waist: true,
                    hip: true,
                    thigh: true,
                    knee: true,
                    calf: true,
                    bottom: true,
                    langot: true,
                    updatedAt: true,
                    createdAt: true
                }
            });

            result.bottomMeasurement = updatedBottomMeasurement;
        }

        return sendResponse(res, 200, "Measurement updated successfully", result);
    } catch (error) {
        console.error("editMeasurement error:", error);
        return sendResponse(res, 500, "Failed to update measurement", { error: error.message });
    }
};

export const getCustomerMeasurements = async (req, res) => {
    try {
        const { customerId } = req.params;

        // Validate customerId
        if (!customerId || typeof customerId !== "string" || customerId.trim() === "") {
            return sendResponse(res, 400, "customerId is required");
        }

        // Check if customer exists
        const customer = await prisma.customer.findUnique({
            where: { customerId: customerId.trim() },
            select: {
                customerId: true,
                fullName: true,
                topMeasurementId: true,
                bottomMeasurementId: true,
                topMeasurement: {
                    select: {
                        topMeasurementId: true,
                        length: true,
                        shoulder: true,
                        sleeveLength: true,
                        sleeveBottom: true,
                        chest: true,
                        waist: true,
                        hip: true,
                        neck: true,
                        isDeleted: true,
                        createdAt: true,
                        updatedAt: true
                    }
                },
                bottomMeasurement: {
                    select: {
                        bottomMeasurementId: true,
                        length: true,
                        waist: true,
                        hip: true,
                        thigh: true,
                        knee: true,
                        calf: true,
                        bottom: true,
                        langot: true,
                        isDeleted: true,
                        createdAt: true,
                        updatedAt: true
                    }
                }
            }
        });

        if (!customer) {
            return sendResponse(res, 404, "Customer not found");
        }

        // Filter out deleted measurements
        const result = {
            customerId: customer.customerId,
            fullName: customer.fullName,
            topMeasurement: customer.topMeasurement && !customer.topMeasurement.isDeleted
                ? {
                    topMeasurementId: customer.topMeasurement.topMeasurementId,
                    length: customer.topMeasurement.length,
                    shoulder: customer.topMeasurement.shoulder,
                    sleeveLength: customer.topMeasurement.sleeveLength,
                    sleeveBottom: customer.topMeasurement.sleeveBottom,
                    chest: customer.topMeasurement.chest,
                    waist: customer.topMeasurement.waist,
                    hip: customer.topMeasurement.hip,
                    neck: customer.topMeasurement.neck,
                    createdAt: customer.topMeasurement.createdAt,
                    updatedAt: customer.topMeasurement.updatedAt
                }
                : null,
            bottomMeasurement: customer.bottomMeasurement && !customer.bottomMeasurement.isDeleted
                ? {
                    bottomMeasurementId: customer.bottomMeasurement.bottomMeasurementId,
                    length: customer.bottomMeasurement.length,
                    waist: customer.bottomMeasurement.waist,
                    hip: customer.bottomMeasurement.hip,
                    thigh: customer.bottomMeasurement.thigh,
                    knee: customer.bottomMeasurement.knee,
                    calf: customer.bottomMeasurement.calf,
                    bottom: customer.bottomMeasurement.bottom,
                    langot: customer.bottomMeasurement.langot,
                    createdAt: customer.bottomMeasurement.createdAt,
                    updatedAt: customer.bottomMeasurement.updatedAt
                }
                : null
        };

        return sendResponse(res, 200, "Measurements retrieved successfully", result);
    } catch (error) {
        console.error("getCustomerMeasurements error:", error);
        return sendResponse(res, 500, "Failed to retrieve measurements", { error: error.message });
    }
};

