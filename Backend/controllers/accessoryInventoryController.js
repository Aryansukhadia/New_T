import prisma from "../dbConnect/prismaClient.js";
import sendResponse from "../utils/response.js";
import { deleteUploadedFiles, handleImageUpload, deleteFilesByUrls, processUploadedImages, processImageUrlInput } from "../utils/fileUtils.js";

export const addAccessoryInventory = async (req, res) => {
    try {
        const { name, imageUrl, properties, quantity } = req.body;

        // Validate required fields
        if (!name || typeof name !== "string" || name.trim() === "") {
            deleteUploadedFiles(req.files);
            return sendResponse(res, 400, "name is required");
        }

        // Validate properties (optional, defaults to empty object)
        let propertiesObj = {};
        if (properties) {
            try {
                propertiesObj = typeof properties === 'string' ? JSON.parse(properties) : properties;
                if (typeof propertiesObj !== 'object' || Array.isArray(propertiesObj)) {
                    deleteUploadedFiles(req.files);
                    return sendResponse(res, 400, "properties must be a valid JSON object");
                }
            } catch (error) {
                deleteUploadedFiles(req.files);
                return sendResponse(res, 400, "properties must be a valid JSON object");
            }
        }

        // Validate quantity (required in properties)
        if (quantity === undefined || quantity === null || quantity === "") {
            deleteUploadedFiles(req.files);
            return sendResponse(res, 400, "quantity is required in properties");
        }

        let quantityInt = parseInt(quantity, 10);
        if (isNaN(quantityInt) || quantityInt < 0) {
            deleteUploadedFiles(req.files);
            return sendResponse(res, 400, "quantity must be a non-negative integer");
        }
        // Handle images
        const finalImageUrl = handleImageUpload(req.files, imageUrl);
        if (!finalImageUrl) {
            deleteUploadedFiles(req.files);
            return sendResponse(res, 400, "imageUrl is required");
        }

        // Add imageUrl to properties if not already present
        if (!propertiesObj.imageUrl) {
            propertiesObj.imageUrl = finalImageUrl;
        }

        // Create inventory with accessory inventory
        const newAccessoryInventory = await prisma.inventory.create({
            data: {
                type: "accessory",
                name: name.trim(),
                createdBy: req.user.userId,
                updatedBy: req.user.userId,
                accessory: {
                    create: {
                        quantity: quantityInt,
                        properties: propertiesObj,
                    }
                }
            },
            include: {
                accessory: true,
            }
        });

        return sendResponse(res, 201, "Accessory inventory created successfully", newAccessoryInventory);
    } catch (error) {
        console.error("addAccessoryInventory error:", error);
        deleteUploadedFiles(req.files);
        return sendResponse(res, 500, "Failed to create accessory inventory", { error: error.message });
    }
};

export const getAccessoryInventories = async (req, res) => {
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
        const totalCount = await prisma.inventory.count({
            where: {
                type: "accessory",
                isDeleted: false
            }
        });

        // Fetch accessory inventories with pagination
        const inventories = await prisma.inventory.findMany({
            where: {
                type: "accessory",
                isDeleted: false
            },
            include: {
                accessory: true,
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

        return sendResponse(res, 200, "Accessory inventories fetched successfully", {
            inventories,
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
        console.error("getAccessoryInventories error:", error);
        return sendResponse(res, 500, "Failed to fetch accessory inventories", { error: error.message });
    }
};

export const getAccessoryInventoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const inventory = await prisma.inventory.findUnique({
            where: { id },
            include: {
                accessory: true,
            }
        });

        if (!inventory) {
            return sendResponse(res, 404, "Accessory inventory not found");
        }

        if (inventory.isDeleted) {
            return sendResponse(res, 404, "Accessory inventory not found");
        }

        if (inventory.type !== "accessory") {
            return sendResponse(res, 400, "This inventory is not an accessory inventory");
        }

        return sendResponse(res, 200, "Accessory inventory fetched successfully", inventory);
    } catch (error) {
        console.error("getAccessoryInventoryById error:", error);
        return sendResponse(res, 500, "Failed to fetch accessory inventory", { error: error.message });
    }
};

export const updateAccessoryInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, imageUrl, properties, quantity, deletedImageUrls } = req.body;

        // Check if inventory exists and is accessory type
        const existingInventory = await prisma.inventory.findUnique({
            where: { id },
            include: {
                accessory: true,
            }
        });

        if (!existingInventory) {
            deleteUploadedFiles(req.files);
            return sendResponse(res, 404, "Accessory inventory not found");
        }

        if (existingInventory.isDeleted) {
            deleteUploadedFiles(req.files);
            return sendResponse(res, 404, "Accessory inventory not found");
        }

        if (existingInventory.type !== "accessory") {
            deleteUploadedFiles(req.files);
            return sendResponse(res, 400, "This inventory is not an accessory inventory");
        }

        if (!existingInventory.accessory) {
            deleteUploadedFiles(req.files);
            return sendResponse(res, 404, "Accessory inventory details not found");
        }

        // Validate name if provided
        if (name !== undefined && (!name || typeof name !== "string" || name.trim() === "")) {
            deleteUploadedFiles(req.files);
            return sendResponse(res, 400, "name must be a valid non-empty string");
        }

        // Validate quantity if provided
        let quantityInt = existingInventory.accessory.quantity;
        if (quantity !== undefined) {
            if (quantity === null || quantity === "") {
                deleteUploadedFiles(req.files);
                return sendResponse(res, 400, "quantity must be a non-negative integer");
            }
            quantityInt = parseInt(quantity, 10);
            if (isNaN(quantityInt) || quantityInt < 0) {
                deleteUploadedFiles(req.files);
                return sendResponse(res, 400, "quantity must be a non-negative integer");
            }
        }

        // Validate properties if provided
        let propertiesObj = existingInventory.accessory.properties;
        if (properties !== undefined) {
            try {
                propertiesObj = typeof properties === 'string' ? JSON.parse(properties) : properties;
                if (typeof propertiesObj !== 'object' || Array.isArray(propertiesObj)) {
                    deleteUploadedFiles(req.files);
                    return sendResponse(res, 400, "properties must be a valid JSON object");
                }
            } catch (error) {
                deleteUploadedFiles(req.files);
                return sendResponse(res, 400, "properties must be a valid JSON object");
            }
        }

        // Handle images - extract imageUrl from properties if it exists
        let existingImageUrl = null;
        if (propertiesObj && propertiesObj.imageUrl) {
            try {
                const imageUrls = typeof propertiesObj.imageUrl === 'string'
                    ? (propertiesObj.imageUrl.startsWith('[') ? JSON.parse(propertiesObj.imageUrl) : [propertiesObj.imageUrl])
                    : Array.isArray(propertiesObj.imageUrl) ? propertiesObj.imageUrl : [propertiesObj.imageUrl];
                existingImageUrl = imageUrls.length === 1 ? imageUrls[0] : JSON.stringify(imageUrls);
            } catch {
                existingImageUrl = propertiesObj.imageUrl;
            }
        }

        // Handle deleted image URLs
        let remainingOriginalImages = [];
        if (existingImageUrl) {
            try {
                remainingOriginalImages = JSON.parse(existingImageUrl);
                if (!Array.isArray(remainingOriginalImages)) {
                    remainingOriginalImages = [existingImageUrl];
                }
            } catch {
                remainingOriginalImages = [existingImageUrl];
            }
        }

        if (deletedImageUrls) {
            try {
                const deletedUrls = JSON.parse(deletedImageUrls);
                if (Array.isArray(deletedUrls)) {
                    remainingOriginalImages = remainingOriginalImages.filter(img => !deletedUrls.includes(img));
                    deleteFilesByUrls(deletedUrls);
                }
            } catch (err) {
                console.error("Error parsing deletedImageUrls:", err);
            }
        }

        // Handle new image uploads
        let finalImageUrl = existingImageUrl;
        if (req.files && req.files.length > 0) {
            const newImageUrlsJson = processUploadedImages(req.files);
            if (newImageUrlsJson) {
                const newImageUrls = JSON.parse(newImageUrlsJson);
                const allImages = [...remainingOriginalImages, ...newImageUrls];
                finalImageUrl = allImages.length === 1 ? allImages[0] : JSON.stringify(allImages);
            } else {
                finalImageUrl = remainingOriginalImages.length === 1
                    ? remainingOriginalImages[0]
                    : JSON.stringify(remainingOriginalImages);
            }
        } else if (imageUrl !== undefined) {
            finalImageUrl = processImageUrlInput(imageUrl);
        } else if (remainingOriginalImages.length > 0) {
            finalImageUrl = remainingOriginalImages.length === 1
                ? remainingOriginalImages[0]
                : JSON.stringify(remainingOriginalImages);
        }

        // Update imageUrl in properties
        if (finalImageUrl) {
            propertiesObj.imageUrl = finalImageUrl;
        }

        // Update inventory and accessory inventory
        const updatedInventory = await prisma.inventory.update({
            where: { id },
            data: {
                name: name !== undefined ? name.trim() : existingInventory.name,
                updatedBy: req.user.userId,
                accessory: {
                    update: {
                        quantity: quantityInt,
                        properties: propertiesObj,
                    }
                }
            },
            include: {
                accessory: true,
            }
        });

        return sendResponse(res, 200, "Accessory inventory updated successfully", updatedInventory);
    } catch (error) {
        console.error("updateAccessoryInventory error:", error);
        deleteUploadedFiles(req.files);
        return sendResponse(res, 500, "Failed to update accessory inventory", { error: error.message });
    }
};

export const deleteAccessoryInventory = async (req, res) => {
    try {
        const { id } = req.params;

        const inventory = await prisma.inventory.findUnique({
            where: { id },
            include: {
                accessory: true,
            }
        });

        if (!inventory) {
            return sendResponse(res, 404, "Accessory inventory not found");
        }

        if (inventory.isDeleted) {
            return sendResponse(res, 404, "Accessory inventory not found");
        }

        if (inventory.type !== "accessory") {
            return sendResponse(res, 400, "This inventory is not an accessory inventory");
        }

        // Soft delete
        await prisma.inventory.update({
            where: { id },
            data: {
                isDeleted: true,
                updatedBy: req.user.userId
            }
        });

        return sendResponse(res, 200, "Accessory inventory deleted successfully");
    } catch (error) {
        console.error("deleteAccessoryInventory error:", error);
        return sendResponse(res, 500, "Failed to delete accessory inventory", { error: error.message });
    }
};

