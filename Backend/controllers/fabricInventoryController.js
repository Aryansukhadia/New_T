import prisma from "../dbConnect/prismaClient.js";
import sendResponse from "../utils/response.js";
import { deleteUploadedFiles, handleImageUpload, deleteFilesByUrls, processUploadedImages, processImageUrlInput } from "../utils/fileUtils.js";

export const addFabricInventory = async (req, res) => {
    try {
        const { name, color, imageUrl, price, length } = req.body;

        // Validate required fields
        if (!name || typeof name !== "string" || name.trim() === "") {
            deleteUploadedFiles(req.files);
            return sendResponse(res, 400, "name is required");
        }

        else if (!color || typeof color !== "string" || color.trim() === "") {
            deleteUploadedFiles(req.files);
            return sendResponse(res, 400, "color is required");
        }

        // Validate length (required)
        else if (length === undefined || length === null || length === "") {
            deleteUploadedFiles(req.files);
            return sendResponse(res, 400, "length is required");
        }

        const lengthDecimal = parseFloat(length);
        if (isNaN(lengthDecimal) || lengthDecimal < 0) {
            deleteUploadedFiles(req.files);
            return sendResponse(res, 400, "length must be a non-negative number");
        }

        // Validate price if provided
        let priceDecimal = null;
        if (price !== undefined && price !== null && price !== "") {
            priceDecimal = parseFloat(price);
            if (isNaN(priceDecimal) || priceDecimal < 0) {
                deleteUploadedFiles(req.files);
                return sendResponse(res, 400, "price must be a non-negative number");
            }
        }

        // Handle images
        const finalImageUrl = handleImageUpload(req.files, imageUrl);
        if (!finalImageUrl) {
            deleteUploadedFiles(req.files);
            return sendResponse(res, 400, "imageUrl is required");
        }

        // Create inventory with fabric inventory
        const newFabricInventory = await prisma.inventory.create({
            data: {
                type: "fabric",
                name: name.trim(),
                createdBy: req.user.userId,
                updatedBy: req.user.userId,
                fabric: {
                    create: {
                        color: color.trim(),
                        imageUrl: finalImageUrl,
                        price: priceDecimal,
                        length: lengthDecimal,
                    }
                }
            },
            include: {
                fabric: true,
            }
        });

        return sendResponse(res, 201, "Fabric inventory created successfully", newFabricInventory);
    } catch (error) {
        console.error("addFabricInventory error:", error);
        deleteUploadedFiles(req.files);
        return sendResponse(res, 500, "Failed to create fabric inventory", { error: error.message });
    }
};

export const getFabricInventories = async (req, res) => {
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
                type: "fabric",
                isDeleted: false
            }
        });

        // Fetch fabric inventories with pagination
        const inventories = await prisma.inventory.findMany({
            where: {
                type: "fabric",
                isDeleted: false
            },
            include: {
                fabric: true,
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

        return sendResponse(res, 200, "Fabric inventories fetched successfully", {
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
        console.error("getFabricInventories error:", error);
        return sendResponse(res, 500, "Failed to fetch fabric inventories", { error: error.message });
    }
};

export const getFabricInventoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const inventory = await prisma.inventory.findUnique({
            where: { id },
            include: {
                fabric: true,
            }
        });

        if (!inventory) {
            return sendResponse(res, 404, "Fabric inventory not found");
        }

        if (inventory.isDeleted) {
            return sendResponse(res, 404, "Fabric inventory not found");
        }

        if (inventory.type !== "fabric") {
            return sendResponse(res, 400, "This inventory is not a fabric inventory");
        }

        return sendResponse(res, 200, "Fabric inventory fetched successfully", inventory);
    } catch (error) {
        console.error("getFabricInventoryById error:", error);
        return sendResponse(res, 500, "Failed to fetch fabric inventory", { error: error.message });
    }
};

export const updateFabricInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, color, imageUrl, price, length, deletedImageUrls } = req.body;

        // Check if inventory exists and is fabric type
        const existingInventory = await prisma.inventory.findUnique({
            where: { id },
            include: {
                fabric: true,
            }
        });

        if (!existingInventory) {
            deleteUploadedFiles(req.files);
            return sendResponse(res, 404, "Fabric inventory not found");
        }

        if (existingInventory.isDeleted) {
            deleteUploadedFiles(req.files);
            return sendResponse(res, 404, "Fabric inventory not found");
        }

        if (existingInventory.type !== "fabric") {
            deleteUploadedFiles(req.files);
            return sendResponse(res, 400, "This inventory is not a fabric inventory");
        }

        if (!existingInventory.fabric) {
            deleteUploadedFiles(req.files);
            return sendResponse(res, 404, "Fabric inventory details not found");
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

        // Validate price if provided
        let priceDecimal = existingInventory.fabric.price;
        if (price !== undefined) {
            if (price === null || price === "") {
                priceDecimal = null;
            } else {
                priceDecimal = parseFloat(price);
                if (isNaN(priceDecimal) || priceDecimal < 0) {
                    deleteUploadedFiles(req.files);
                    return sendResponse(res, 400, "price must be a non-negative number");
                }
            }
        }

        // Validate length (required)
        let lengthDecimal = existingInventory.fabric.length;
        if (length !== undefined) {
            if (length === null || length === "") {
                deleteUploadedFiles(req.files);
                return sendResponse(res, 400, "length is required");
            } else {
                lengthDecimal = parseFloat(length);
                if (isNaN(lengthDecimal) || lengthDecimal < 0) {
                    deleteUploadedFiles(req.files);
                    return sendResponse(res, 400, "length must be a non-negative number");
                }
            }
        }
        // Ensure length is always set (use existing if not provided in update)
        if (lengthDecimal === null || lengthDecimal === undefined) {
            deleteUploadedFiles(req.files);
            return sendResponse(res, 400, "length is required");
        }

        // Handle images - similar to product variant update
        let remainingOriginalImages = [];
        if (existingInventory.fabric.imageUrl) {
            try {
                remainingOriginalImages = JSON.parse(existingInventory.fabric.imageUrl);
                if (!Array.isArray(remainingOriginalImages)) {
                    remainingOriginalImages = [existingInventory.fabric.imageUrl];
                }
            } catch {
                remainingOriginalImages = [existingInventory.fabric.imageUrl];
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
        let finalImageUrl = existingInventory.fabric.imageUrl;
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

        // Update inventory and fabric inventory
        const updatedInventory = await prisma.inventory.update({
            where: { id },
            data: {
                name: name !== undefined ? name.trim() : existingInventory.name,
                updatedBy: req.user.userId,
                fabric: {
                    update: {
                        color: color !== undefined ? color.trim() : existingInventory.fabric.color,
                        imageUrl: finalImageUrl,
                        price: priceDecimal,
                        length: lengthDecimal,
                    }
                }
            },
            include: {
                fabric: true,
            }
        });

        return sendResponse(res, 200, "Fabric inventory updated successfully", updatedInventory);
    } catch (error) {
        console.error("updateFabricInventory error:", error);
        deleteUploadedFiles(req.files);
        return sendResponse(res, 500, "Failed to update fabric inventory", { error: error.message });
    }
};

export const deleteFabricInventory = async (req, res) => {
    try {
        const { id } = req.params;

        const inventory = await prisma.inventory.findUnique({
            where: { id },
            include: {
                fabric: true,
            }
        });

        if (!inventory) {
            return sendResponse(res, 404, "Fabric inventory not found");
        }

        if (inventory.isDeleted) {
            return sendResponse(res, 404, "Fabric inventory not found");
        }

        if (inventory.type !== "fabric") {
            return sendResponse(res, 400, "This inventory is not a fabric inventory");
        }

        // Soft delete
        await prisma.inventory.update({
            where: { id },
            data: {
                isDeleted: true,
                updatedBy: req.user.userId
            }
        });

        return sendResponse(res, 200, "Fabric inventory deleted successfully");
    } catch (error) {
        console.error("deleteFabricInventory error:", error);
        return sendResponse(res, 500, "Failed to delete fabric inventory", { error: error.message });
    }
};

