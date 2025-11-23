import prisma from "../dbConnect/prismaClient.js";
import sendResponse from "../utils/response.js";
import { deleteUploadedFiles, handleImageUpload, deleteFilesByUrls, processUploadedImages, processImageUrlInput } from "../utils/fileUtils.js";

export const addProductItem = async (req, res) => {
    try {
        const { name, imageUrl } = req.body;

        if (!name || typeof name !== "string" || name.trim() === "") {
            // Delete uploaded files if validation fails
            deleteUploadedFiles(req.files);
            return sendResponse(res, 400, "name is required");
        }

        // Check if item with same name already exists
        const existingItem = await prisma.productItem.findFirst({
            where: {
                name: name.trim(),
            }
        });

        if (existingItem) {
            // Delete uploaded files if duplicate name
            deleteUploadedFiles(req.files);
            return sendResponse(res, 409, "Product item with this name already exists");
        }

        // Handle images using generalized utility function
        const finalImageUrl = handleImageUpload(req.files, imageUrl);

        const newProductItem = await prisma.productItem.create({
            data: {
                name: name.trim(),
                imageUrl: finalImageUrl,
                createdBy: req.user.userId,
                updatedBy: req.user.userId,
            }
        });

        return sendResponse(res, 201, "Product item created successfully", newProductItem);
    } catch (error) {
        console.error("addProductItem error:", error);
        // Delete uploaded files if database operation fails
        deleteUploadedFiles(req.files);
        return sendResponse(res, 500, "Failed to create product item", { error: error.message });
    }
};

export const getProductItems = async (req, res) => {
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
        const totalCount = await prisma.productItem.count();

        // Fetch product items with pagination
        const productItems = await prisma.productItem.findMany({
            where: {
                isDeleted: false
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

        return sendResponse(res, 200, "Product items fetched successfully", {
            productItems,
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
        console.error("getProductItems error:", error);
        return sendResponse(res, 500, "Failed to fetch product items", { error: error.message });
    }
};

export const getProductItemById = async (req, res) => {
    try {
        const { id } = req.params;

        const productItem = await prisma.productItem.findUnique({
            where: { id },
            include: {
                variants: true,
                itemStatuses: {
                    include: {
                        orderItem: true,
                        updatedBy: true
                    }
                }
            }
        });

        if (!productItem) {
            return sendResponse(res, 404, "Product item not found");
        }

        return sendResponse(res, 200, "Product item fetched successfully", productItem);
    } catch (error) {
        console.error("getProductItemById error:", error);
        return sendResponse(res, 500, "Failed to fetch product item", { error: error.message });
    }
};

export const updateProductItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, imageUrl, deletedImageUrls } = req.body;

        if (!name || typeof name !== "string" || name.trim() === "") {
            // Delete uploaded files if validation fails
            deleteUploadedFiles(req.files);
            return sendResponse(res, 400, "name is required");
        }

        // Check if item exists
        const existingItem = await prisma.productItem.findUnique({
            where: { id }
        });

        if (!existingItem) {
            // Delete uploaded files if item not found
            deleteUploadedFiles(req.files);
            return sendResponse(res, 404, "Product item not found");
        }
        else if (existingItem.isDeleted) {
            return sendResponse(res, 400, "Product item is deleted");
        }

        // Handle deleted image URLs - delete files from server
        let remainingOriginalImages = [];
        if (deletedImageUrls) {
            try {
                const deletedUrls = JSON.parse(deletedImageUrls);
                if (Array.isArray(deletedUrls)) {
                    // Parse existing images
                    let existingImages = [];
                    if (existingItem.imageUrl) {
                        try {
                            existingImages = JSON.parse(existingItem.imageUrl);
                            if (!Array.isArray(existingImages)) {
                                existingImages = [existingItem.imageUrl];
                            }
                        } catch {
                            existingImages = [existingItem.imageUrl];
                        }
                    }

                    // Get remaining original images (not deleted)
                    remainingOriginalImages = existingImages.filter(img => !deletedUrls.includes(img));

                    // Delete files from server using utility function
                    deleteFilesByUrls(deletedUrls);
                }
            } catch (err) {
                console.error("Error parsing deletedImageUrls:", err);
            }
        } else {
            // No deletions, keep all original images
            if (existingItem.imageUrl) {
                try {
                    remainingOriginalImages = JSON.parse(existingItem.imageUrl);
                    if (!Array.isArray(remainingOriginalImages)) {
                        remainingOriginalImages = [existingItem.imageUrl];
                    }
                } catch {
                    remainingOriginalImages = [existingItem.imageUrl];
                }
            }
        }

        // Handle images - combine new uploads with remaining original images
        let finalImageUrl = null;
        if (req.files && req.files.length > 0) {
            // New files uploaded - combine with remaining original images
            const newImageUrlsJson = processUploadedImages(req.files);
            if (newImageUrlsJson) {
                const newImageUrls = JSON.parse(newImageUrlsJson);
                const allImages = [...remainingOriginalImages, ...newImageUrls];
                finalImageUrl = allImages.length === 1 ? allImages[0] : JSON.stringify(allImages);
            } else {
                // No new images processed, use remaining original images
                finalImageUrl = remainingOriginalImages.length === 1
                    ? remainingOriginalImages[0]
                    : JSON.stringify(remainingOriginalImages);
            }
        } else if (imageUrl !== undefined) {
            // imageUrl provided - use it (should contain remaining original images)
            finalImageUrl = processImageUrlInput(imageUrl);
        } else if (remainingOriginalImages.length > 0) {
            // No new uploads, no imageUrl provided, but we have remaining original images
            finalImageUrl = remainingOriginalImages.length === 1
                ? remainingOriginalImages[0]
                : JSON.stringify(remainingOriginalImages);
        }

        const updatedProductItem = await prisma.productItem.update({
            where: { id },
            data: {
                name: name.trim(),
                imageUrl: finalImageUrl,
                updatedBy: req.user.userId,
            },
        });

        return sendResponse(res, 200, "Product item updated successfully", updatedProductItem);
    } catch (error) {
        console.error("updateProductItem error:", error);
        // Delete uploaded files if database operation fails
        deleteUploadedFiles(req.files);
        return sendResponse(res, 500, "Failed to update product item", { error: error.message });
    }
};

export const deleteProductItem = async (req, res) => {
    try {
        const { id } = req.params;

        const productItem = await prisma.productItem.findUnique({
            where: { id }
        });

        if (!productItem) {
            return sendResponse(res, 404, "Product item not found");
        }
        else if (productItem.isDeleted) {
            return sendResponse(res, 400, "Product item is deleted");
        }

        // Check if item is used in any item statuses
        const itemStatusesCount = await prisma.itemStatus.count({
            where: { productItemId: id }
        });

        if (itemStatusesCount > 0) {
            return sendResponse(res, 400, "Cannot delete product item that is used in order statuses.");
        }

        await prisma.productItem.update({
            where: { id },
            data: {
                isDeleted: true,
                updatedBy: req.user.userId,
            },
            include: {
                variants: true,
                itemStatuses: true
            }
        });

        return sendResponse(res, 200, "Product item deleted successfully");
    } catch (error) {
        console.error("deleteProductItem error:", error);
        return sendResponse(res, 500, "Failed to delete product item", { error: error.message });
    }
};