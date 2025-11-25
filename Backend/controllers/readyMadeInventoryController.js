import prisma from "../dbConnect/prismaClient.js";
import sendResponse from "../utils/response.js";
import { deleteUploadedFiles, handleImageUpload, deleteFilesByUrls, processUploadedImages, processImageUrlInput } from "../utils/fileUtils.js";

export const addReadyMadeInventory = async (req, res) => {
    try {
        const { name, color, imageUrl, price, quantity, sizeLabel, sizeNumber } = req.body;

        // Validate required fields
        if (!name || typeof name !== "string" || name.trim() === "") {
            deleteUploadedFiles(req.files);
            return sendResponse(res, 400, "name is required");
        }

        if (!color || typeof color !== "string" || color.trim() === "") {
            deleteUploadedFiles(req.files);
            return sendResponse(res, 400, "color is required");
        }

        // Validate price (required)
        if (price === undefined || price === null || price === "") {
            deleteUploadedFiles(req.files);
            return sendResponse(res, 400, "price is required");
        }

        const priceDecimal = parseFloat(price);
        if (isNaN(priceDecimal) || priceDecimal < 0) {
            deleteUploadedFiles(req.files);
            return sendResponse(res, 400, "price must be a non-negative number");
        }

        // Validate quantity (default to 0 if not provided)
        let quantityInt = 0;
        if (quantity !== undefined && quantity !== null && quantity !== "") {
            quantityInt = parseInt(quantity, 10);
            if (isNaN(quantityInt) || quantityInt < 0) {
                deleteUploadedFiles(req.files);
                return sendResponse(res, 400, "quantity must be a non-negative integer");
            }
        }

        // Validate sizeNumber if provided
        let sizeNumberInt = null;
        if (sizeNumber !== undefined && sizeNumber !== null && sizeNumber !== "") {
            sizeNumberInt = parseInt(sizeNumber, 10);
            if (isNaN(sizeNumberInt) || sizeNumberInt < 0) {
                deleteUploadedFiles(req.files);
                return sendResponse(res, 400, "sizeNumber must be a non-negative integer");
            }
        }

        // Validate that at least one of sizeLabel or sizeNumber is provided
        const hasSizeLabel = sizeLabel !== undefined && sizeLabel !== null && sizeLabel !== "";
        const hasSizeNumber = sizeNumber !== undefined && sizeNumber !== null && sizeNumber !== "";
        if (!hasSizeLabel && !hasSizeNumber) {
            deleteUploadedFiles(req.files);
            return sendResponse(res, 400, "Either sizeLabel or sizeNumber is required");
        }

        // Handle images
        const finalImageUrl = handleImageUpload(req.files, imageUrl);
        if (!finalImageUrl) {
            deleteUploadedFiles(req.files);
            return sendResponse(res, 400, "imageUrl is required");
        }

        // Create inventory with readyMade inventory
        const newReadyMadeInventory = await prisma.inventory.create({
            data: {
                type: "readyMade",
                name: name.trim(),
                createdBy: req.user.userId,
                updatedBy: req.user.userId,
                readyMade: {
                    create: {
                        color: color.trim(),
                        imageUrl: finalImageUrl,
                        price: priceDecimal,
                        quantity: quantityInt,
                        sizeLabel: sizeLabel ? sizeLabel.trim() : null,
                        sizeNumber: sizeNumberInt,
                    }
                }
            },
            include: {
                readyMade: true,
            }
        });

        return sendResponse(res, 201, "Ready-made inventory created successfully", newReadyMadeInventory);
    } catch (error) {
        console.error("addReadyMadeInventory error:", error);
        deleteUploadedFiles(req.files);
        return sendResponse(res, 500, "Failed to create ready-made inventory", { error: error.message });
    }
};

export const getReadyMadeInventories = async (req, res) => {
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
                type: "readyMade",
                isDeleted: false
            }
        });

        // Fetch readyMade inventories with pagination
        const inventories = await prisma.inventory.findMany({
            where: {
                type: "readyMade",
                isDeleted: false
            },
            include: {
                readyMade: true,
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

        return sendResponse(res, 200, "Ready-made inventories fetched successfully", {
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
        console.error("getReadyMadeInventories error:", error);
        return sendResponse(res, 500, "Failed to fetch ready-made inventories", { error: error.message });
    }
};

export const getReadyMadeInventoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const inventory = await prisma.inventory.findUnique({
            where: { id },
            include: {
                readyMade: true,
            }
        });

        if (!inventory) {
            return sendResponse(res, 404, "Ready-made inventory not found");
        }

        if (inventory.isDeleted) {
            return sendResponse(res, 404, "Ready-made inventory not found");
        }

        if (inventory.type !== "readyMade") {
            return sendResponse(res, 400, "This inventory is not a ready-made inventory");
        }

        return sendResponse(res, 200, "Ready-made inventory fetched successfully", inventory);
    } catch (error) {
        console.error("getReadyMadeInventoryById error:", error);
        return sendResponse(res, 500, "Failed to fetch ready-made inventory", { error: error.message });
    }
};

export const updateReadyMadeInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, color, imageUrl, price, quantity, sizeLabel, sizeNumber, deletedImageUrls } = req.body;

        // Check if inventory exists and is readyMade type
        const existingInventory = await prisma.inventory.findUnique({
            where: { id },
            include: {
                readyMade: true,
            }
        });

        if (!existingInventory) {
            deleteUploadedFiles(req.files);
            return sendResponse(res, 404, "Ready-made inventory not found");
        }

        if (existingInventory.isDeleted) {
            deleteUploadedFiles(req.files);
            return sendResponse(res, 404, "Ready-made inventory not found");
        }

        if (existingInventory.type !== "readyMade") {
            deleteUploadedFiles(req.files);
            return sendResponse(res, 400, "This inventory is not a ready-made inventory");
        }

        if (!existingInventory.readyMade) {
            deleteUploadedFiles(req.files);
            return sendResponse(res, 404, "Ready-made inventory details not found");
        }

        // Validate name if provided
        if (name !== undefined && (!name || typeof name !== "string" || name.trim() === "")) {
            deleteUploadedFiles(req.files);
            return sendResponse(res, 400, "name must be a valid non-empty string");
        }

        // Validate color if provided
        if (color !== undefined && (!color || typeof color !== "string" || color.trim() === "")) {
            deleteUploadedFiles(req.files);
            return sendResponse(res, 400, "color must be a valid non-empty string");
        }

        // Validate price (required)
        let priceDecimal = existingInventory.readyMade.price;
        if (price !== undefined) {
            if (price === null || price === "") {
                deleteUploadedFiles(req.files);
                return sendResponse(res, 400, "price is required");
            } else {
                priceDecimal = parseFloat(price);
                if (isNaN(priceDecimal) || priceDecimal < 0) {
                    deleteUploadedFiles(req.files);
                    return sendResponse(res, 400, "price must be a non-negative number");
                }
            }
        }

        // Validate quantity if provided
        let quantityInt = existingInventory.readyMade.quantity;
        if (quantity !== undefined) {
            if (quantity === null || quantity === "") {
                quantityInt = 0;
            } else {
                quantityInt = parseInt(quantity, 10);
                if (isNaN(quantityInt) || quantityInt < 0) {
                    deleteUploadedFiles(req.files);
                    return sendResponse(res, 400, "quantity must be a non-negative integer");
                }
            }
        }

        // Validate sizeNumber if provided
        let sizeNumberInt = existingInventory.readyMade.sizeNumber;
        if (sizeNumber !== undefined) {
            if (sizeNumber === null || sizeNumber === "") {
                sizeNumberInt = null;
            } else {
                sizeNumberInt = parseInt(sizeNumber, 10);
                if (isNaN(sizeNumberInt) || sizeNumberInt < 0) {
                    deleteUploadedFiles(req.files);
                    return sendResponse(res, 400, "sizeNumber must be a non-negative integer");
                }
            }
        }

        // Validate that at least one of sizeLabel or sizeNumber is provided
        const finalSizeLabel = sizeLabel !== undefined ? (sizeLabel ? sizeLabel.trim() : null) : existingInventory.readyMade.sizeLabel;
        const finalSizeNumber = sizeNumberInt !== undefined ? sizeNumberInt : existingInventory.readyMade.sizeNumber;
        const hasSizeLabel = finalSizeLabel !== null && finalSizeLabel !== "";
        const hasSizeNumber = finalSizeNumber !== null && finalSizeNumber !== undefined;
        if (!hasSizeLabel && !hasSizeNumber) {
            deleteUploadedFiles(req.files);
            return sendResponse(res, 400, "Either sizeLabel or sizeNumber is required");
        }

        // Handle images - similar to product variant update
        let remainingOriginalImages = [];
        if (existingInventory.readyMade.imageUrl) {
            try {
                remainingOriginalImages = JSON.parse(existingInventory.readyMade.imageUrl);
                if (!Array.isArray(remainingOriginalImages)) {
                    remainingOriginalImages = [existingInventory.readyMade.imageUrl];
                }
            } catch {
                remainingOriginalImages = [existingInventory.readyMade.imageUrl];
            }
        }

        // Handle deleted image URLs
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
        let finalImageUrl = existingInventory.readyMade.imageUrl;
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

        // Update inventory and readyMade inventory
        const updatedInventory = await prisma.inventory.update({
            where: { id },
            data: {
                name: name !== undefined ? name.trim() : existingInventory.name,
                updatedBy: req.user.userId,
                readyMade: {
                    update: {
                        color: color !== undefined ? color.trim() : existingInventory.readyMade.color,
                        imageUrl: finalImageUrl,
                        price: priceDecimal,
                        quantity: quantityInt,
                        sizeLabel: sizeLabel !== undefined ? (sizeLabel ? sizeLabel.trim() : null) : existingInventory.readyMade.sizeLabel,
                        sizeNumber: sizeNumberInt,
                    }
                }
            },
            include: {
                readyMade: true,
            }
        });

        return sendResponse(res, 200, "Ready-made inventory updated successfully", updatedInventory);
    } catch (error) {
        console.error("updateReadyMadeInventory error:", error);
        deleteUploadedFiles(req.files);
        return sendResponse(res, 500, "Failed to update ready-made inventory", { error: error.message });
    }
};

export const deleteReadyMadeInventory = async (req, res) => {
    try {
        const { id } = req.params;

        const inventory = await prisma.inventory.findUnique({
            where: { id },
            include: {
                readyMade: true,
            }
        });

        if (!inventory) {
            return sendResponse(res, 404, "Ready-made inventory not found");
        }

        if (inventory.isDeleted) {
            return sendResponse(res, 404, "Ready-made inventory not found");
        }

        if (inventory.type !== "readyMade") {
            return sendResponse(res, 400, "This inventory is not a ready-made inventory");
        }

        // Soft delete
        await prisma.inventory.update({
            where: { id },
            data: {
                isDeleted: true,
                updatedBy: req.user.userId
            }
        });

        return sendResponse(res, 200, "Ready-made inventory deleted successfully");
    } catch (error) {
        console.error("deleteReadyMadeInventory error:", error);
        return sendResponse(res, 500, "Failed to delete ready-made inventory", { error: error.message });
    }
};

