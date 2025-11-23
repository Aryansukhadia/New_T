import prisma from "../dbConnect/prismaClient.js";
import sendResponse from "../utils/response.js";
import { deleteUploadedFiles, handleImageUpload, deleteFilesByUrls, processUploadedImages, processImageUrlInput } from "../utils/fileUtils.js";

export const addProductVariant = async (req, res) => {
    try {
        const { productId, name, description, photoUrl, productItemIds: productItemIdsRaw } = req.body;

        if (!productId || typeof productId !== "string" || productId.trim() === "") {
            // Delete uploaded files if validation fails
            deleteUploadedFiles(req.files);
            return sendResponse(res, 400, "productId is required");
        }

        if (!name || typeof name !== "string" || name.trim() === "") {
            // Delete uploaded files if validation fails
            deleteUploadedFiles(req.files);
            return sendResponse(res, 400, "name is required");
        }

        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id: productId.trim(), isDeleted: false }
        });

        if (!product) {
            // Delete uploaded files if product not found
            deleteUploadedFiles(req.files);
            return sendResponse(res, 404, "Product not found");
        }

        // Check if variant with same name already exists for this product
        const existingVariant = await prisma.productVariant.findFirst({
            where: {
                productId: productId.trim(),
                name: name.trim(),
            }
        });

        if (existingVariant) {
            // Delete uploaded files if duplicate name
            deleteUploadedFiles(req.files);
            return sendResponse(res, 409, "Product variant with this name already exists for this product");
        }

        // Parse productItemIds if it's a JSON string (from FormData)
        let productItemIds = productItemIdsRaw;
        if (productItemIds && typeof productItemIds === "string") {
            try {
                productItemIds = JSON.parse(productItemIds);
            } catch (parseError) {
                return sendResponse(res, 400, "Invalid productItemIds format");
            }
        }

        // Validate productItemIds if provided
        if (productItemIds && Array.isArray(productItemIds) && productItemIds.length > 0) {
            const validProductItemIds = productItemIds.filter(id => typeof id === "string" && id.trim() !== "");

            if (validProductItemIds.length > 0) {
                // Check if all product items exist
                const productItems = await prisma.productItem.findMany({
                    where: {
                        id: { in: validProductItemIds }
                    }
                });

                if (productItems.length !== validProductItemIds.length) {
                    // Delete uploaded files if product items not found
                    deleteUploadedFiles(req.files);
                    return sendResponse(res, 404, "One or more product items not found");
                }
            }
        }
        else {
            // Delete uploaded files if productItemIds is required but not provided
            deleteUploadedFiles(req.files);
            return sendResponse(res, 400, "productItemIds is required");
        }

        // Handle images using generalized utility function (supports up to 5 images)
        const finalPhotoUrl = handleImageUpload(req.files, photoUrl);

        const newProductVariant = await prisma.productVariant.create({
            data: {
                productId: productId.trim(),
                name: name.trim(),
                description: description && typeof description === "string" && description.trim() !== "" ? description.trim() : null,
                photoUrl: finalPhotoUrl,
                createdBy: req.user.userId,
                updatedBy: req.user.userId,
                productItems: productItemIds && Array.isArray(productItemIds) && productItemIds.length > 0
                    ? {
                        connect: productItemIds
                            .filter(id => typeof id === "string" && id.trim() !== "")
                            .map(id => ({ id: id.trim() }))
                    }
                    : undefined
            },
            include: {
                product: true,
                productItems: true
            }
        });

        // const data = {
        //     productId: productId.trim(),
        //     name: name.trim(),
        //     description: description && typeof description === "string" && description.trim() !== "" ? description.trim() : null,
        //     photoUrl: finalPhotoUrl,
        //     productItems: productItemIds && Array.isArray(productItemIds) && productItemIds.length > 0
        //         ? {
        //             connect: productItemIds
        //                 .filter(id => typeof id === "string" && id.trim() !== "")
        //                 .map(id => ({ id: id.trim() }))
        //         }
        //         : undefined
        // };

        return sendResponse(res, 201, "Product variant created successfully", newProductVariant);
    } catch (error) {
        // Delete uploaded files if database operation fails
        deleteUploadedFiles(req.files);
        return sendResponse(res, 500, "Failed to create product variant", { error: error.message });
    }
};

export const getProductVariants = async (req, res) => {
    try {
        const {
            productId,
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

        const where = {};
        if (productId) {
            where.productId = productId;
        }

        // Get total count for pagination
        const totalCount = await prisma.productVariant.count({ where });

        // Fetch product variants with pagination
        const productVariants = await prisma.productVariant.findMany({
            where: { ...where, isDeleted: false },
            include: {
                product: true,
                productItems: true
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

        return sendResponse(res, 200, "Product variants fetched successfully", {
            productVariants,
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
        console.error("getProductVariants error:", error);
        return sendResponse(res, 500, "Failed to fetch product variants", { error: error.message });
    }
};

export const getProductVariantById = async (req, res) => {
    try {
        const { id } = req.params;

        const productVariant = await prisma.productVariant.findUnique({
            where: { id },
            include: {
                product: true,
                productItems: true
            }
        });

        if (!productVariant) {
            return sendResponse(res, 404, "Product variant not found");
        }

        return sendResponse(res, 200, "Product variant fetched successfully", productVariant);
    } catch (error) {
        console.error("getProductVariantById error:", error);
        return sendResponse(res, 500, "Failed to fetch product variant", { error: error.message });
    }
};

export const updateProductVariant = async (req, res) => {
    try {
        const { id } = req.params;
        const { productId, name, description, photoUrl, productItemIds: productItemIdsRaw, deletedImageUrls } = req.body;

        if (productId && (typeof productId !== "string" || productId.trim() === "")) {
            // Delete uploaded files if validation fails
            deleteUploadedFiles(req.files);
            return sendResponse(res, 400, "productId must be a valid string");
        }

        if (!name || typeof name !== "string" || name.trim() === "") {
            // Delete uploaded files if validation fails
            deleteUploadedFiles(req.files);
            return sendResponse(res, 400, "name is required");
        }

        // Check if variant exists
        const existingVariant = await prisma.productVariant.findUnique({
            where: { id }
        });

        if (!existingVariant) {
            // Delete uploaded files if variant not found
            deleteUploadedFiles(req.files);
            return sendResponse(res, 404, "Product variant not found");
        }

        // If productId is provided, check if it exists
        if (productId) {
            const product = await prisma.product.findUnique({
                where: { id: productId.trim() }
            });

            if (!product) {
                // Delete uploaded files if product not found
                deleteUploadedFiles(req.files);
                return sendResponse(res, 404, "Product not found");
            }
        }

        // Check if another variant with same name exists for the product
        const variantProductId = productId ? productId.trim() : existingVariant.productId;
        const duplicateVariant = await prisma.productVariant.findFirst({
            where: {
                productId: variantProductId,
                name: name.trim(),
                id: { not: id }
            }
        });

        if (duplicateVariant) {
            // Delete uploaded files if duplicate name
            deleteUploadedFiles(req.files);
            return sendResponse(res, 409, "Product variant with this name already exists for this product");
        }

        // Parse productItemIds if it's a JSON string (from FormData)
        let productItemIds = productItemIdsRaw;
        if (productItemIds !== undefined && typeof productItemIds === "string") {
            try {
                productItemIds = JSON.parse(productItemIds);
            } catch (parseError) {
                // Delete uploaded files if parsing fails
                deleteUploadedFiles(req.files);
                return sendResponse(res, 400, "Invalid productItemIds format");
            }
        }

        // Validate productItemIds if provided
        if (productItemIds && Array.isArray(productItemIds) && productItemIds.length > 0) {
            const validProductItemIds = productItemIds.filter(id => typeof id === "string" && id.trim() !== "");

            if (validProductItemIds.length > 0) {
                // Check if all product items exist
                const productItems = await prisma.productItem.findMany({
                    where: {
                        id: { in: validProductItemIds }
                    }
                });

                if (productItems.length !== validProductItemIds.length) {
                    // Delete uploaded files if product items not found
                    deleteUploadedFiles(req.files);
                    return sendResponse(res, 404, "One or more product items not found");
                }
            }
        }

        // Handle images using generalized utility function (supports up to 5 images)
        // Handle deleted image URLs - delete files from server
        let remainingOriginalImages = [];

        if (deletedImageUrls) {
            try {
                const deletedUrls = JSON.parse(deletedImageUrls);
                if (Array.isArray(deletedUrls)) {
                    // Parse existing images
                    let existingImages = [];
                    if (existingVariant.photoUrl) {
                        try {
                            existingImages = JSON.parse(existingVariant.photoUrl);
                            if (!Array.isArray(existingImages)) {
                                existingImages = [existingVariant.photoUrl];
                            }
                        } catch {
                            existingImages = [existingVariant.photoUrl];
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
            if (existingVariant.photoUrl) {
                try {
                    remainingOriginalImages = JSON.parse(existingVariant.photoUrl);
                    if (!Array.isArray(remainingOriginalImages)) {
                        remainingOriginalImages = [existingVariant.photoUrl];
                    }
                } catch {
                    remainingOriginalImages = [existingVariant.photoUrl];
                }
            }
        }

        // Handle images - combine new uploads with remaining original images
        let finalPhotoUrl = null;
        if (req.files && req.files.length > 0) {
            // New files uploaded - combine with remaining original images
            const newImageUrlsJson = processUploadedImages(req.files);
            if (newImageUrlsJson) {
                const newImageUrls = JSON.parse(newImageUrlsJson);
                const allImages = [...remainingOriginalImages, ...newImageUrls];
                finalPhotoUrl = allImages.length === 1 ? allImages[0] : JSON.stringify(allImages);
            } else {
                // No new images processed, use remaining original images
                finalPhotoUrl = remainingOriginalImages.length === 1
                    ? remainingOriginalImages[0]
                    : JSON.stringify(remainingOriginalImages);
            }
        } else if (photoUrl !== undefined) {
            // photoUrl provided - use it (should contain remaining original images)
            finalPhotoUrl = processImageUrlInput(photoUrl);
        } else if (remainingOriginalImages.length > 0) {
            // No new uploads, no photoUrl provided, but we have remaining original images
            finalPhotoUrl = remainingOriginalImages.length === 1
                ? remainingOriginalImages[0]
                : JSON.stringify(remainingOriginalImages);
        }

        const updateData = {
            name: name.trim(),
            description: description && typeof description === "string" && description.trim() !== "" ? description.trim() : null,
            photoUrl: finalPhotoUrl,
        };

        if (productId) {
            updateData.productId = productId.trim();
        }

        // Handle productItems update
        if (productItemIds !== undefined) {
            if (Array.isArray(productItemIds) && productItemIds.length > 0) {
                const validProductItemIds = productItemIds
                    .filter(id => typeof id === "string" && id.trim() !== "")
                    .map(id => id.trim());

                updateData.productItems = {
                    set: validProductItemIds.map(id => ({ id }))
                };
            } else {
                // Empty array means remove all product items
                updateData.productItems = {
                    set: []
                };
            }
        }

        const updatedProductVariant = await prisma.productVariant.update({
            where: { id },
            data: updateData,
            include: {
                product: true,
                productItems: true
            }
        });

        return sendResponse(res, 200, "Product variant updated successfully", updatedProductVariant);
    } catch (error) {
        console.error("updateProductVariant error:", error);
        // Delete uploaded files if database operation fails
        deleteUploadedFiles(req.files);
        return sendResponse(res, 500, "Failed to update product variant", { error: error.message });
    }
};

export const addProductItemsToVariant = async (req, res) => {
    try {
        const { id } = req.params;
        const { productItemIds } = req.body;

        if (!productItemIds || !Array.isArray(productItemIds) || productItemIds.length === 0) {
            return sendResponse(res, 400, "productItemIds array is required and must not be empty");
        }

        // Check if variant exists
        const productVariant = await prisma.productVariant.findUnique({
            where: { id },
            include: {
                productItems: true
            }
        });

        if (!productVariant) {
            return sendResponse(res, 404, "Product variant not found");
        }

        // Validate and filter product item IDs
        const validProductItemIds = productItemIds
            .filter(id => typeof id === "string" && id.trim() !== "")
            .map(id => id.trim());

        if (validProductItemIds.length === 0) {
            return sendResponse(res, 400, "No valid product item IDs provided");
        }

        // Check if all product items exist
        const productItems = await prisma.productItem.findMany({
            where: {
                id: { in: validProductItemIds }
            }
        });

        if (productItems.length !== validProductItemIds.length) {
            return sendResponse(res, 404, "One or more product items not found");
        }

        // Get existing product item IDs to avoid duplicates
        const existingProductItemIds = productVariant.productItems.map(item => item.id);

        // Filter out product items that are already connected
        const newProductItemIds = validProductItemIds.filter(
            itemId => !existingProductItemIds.includes(itemId)
        );

        if (newProductItemIds.length === 0) {
            return sendResponse(res, 409, "All provided product items are already associated with this variant");
        }

        // Add new product items to the variant
        const updatedProductVariant = await prisma.productVariant.update({
            where: { id },
            data: {
                productItems: {
                    connect: newProductItemIds.map(itemId => ({ id: itemId }))
                }
            },
            include: {
                product: true,
                productItems: true
            }
        });

        return sendResponse(res, 200, "Product items added to variant successfully", updatedProductVariant);
    } catch (error) {
        console.error("addProductItemsToVariant error:", error);
        return sendResponse(res, 500, "Failed to add product items to variant", { error: error.message });
    }
};

export const removeProductItemsFromVariant = async (req, res) => {
    try {
        const { id } = req.params;
        const { productItemIds } = req.body;

        if (!productItemIds || !Array.isArray(productItemIds) || productItemIds.length === 0) {
            return sendResponse(res, 400, "productItemIds array is required and must not be empty");
        }

        // Check if variant exists
        const productVariant = await prisma.productVariant.findUnique({
            where: { id },
            include: {
                productItems: true
            }
        });

        if (!productVariant) {
            return sendResponse(res, 404, "Product variant not found");
        }

        // Validate and filter product item IDs
        const validProductItemIds = productItemIds
            .filter(id => typeof id === "string" && id.trim() !== "")
            .map(id => id.trim());

        if (validProductItemIds.length === 0) {
            return sendResponse(res, 400, "No valid product item IDs provided");
        }

        // Get existing product item IDs
        const existingProductItemIds = productVariant.productItems.map(item => item.id);

        // Filter to only include product items that are actually associated with this variant
        const itemsToRemove = validProductItemIds.filter(
            itemId => existingProductItemIds.includes(itemId)
        );

        if (itemsToRemove.length === 0) {
            return sendResponse(res, 409, "None of the provided product items are associated with this variant");
        }

        // Remove product items from the variant
        const updatedProductVariant = await prisma.productVariant.update({
            where: { id },
            data: {
                productItems: {
                    disconnect: itemsToRemove.map(itemId => ({ id: itemId }))
                }
            },
            include: {
                product: true,
                productItems: true
            }
        });

        return sendResponse(res, 200, "Product items removed from variant successfully", updatedProductVariant);
    } catch (error) {
        console.error("removeProductItemsFromVariant error:", error);
        return sendResponse(res, 500, "Failed to remove product items from variant", { error: error.message });
    }
};

export const deleteProductVariant = async (req, res) => {
    try {
        const { id } = req.params;

        const productVariant = await prisma.productVariant.findUnique({
            where: { id }
        });

        if (!productVariant) {
            return sendResponse(res, 404, "Product variant not found");
        }

        // Check if variant is used in any order items
        const orderItemsCount = await prisma.orderItem.count({
            where: { productVariantId: id }
        });

        if (orderItemsCount > 0) {
            return sendResponse(res, 400, "Cannot delete product variant that is used in orders.");
        }

        await prisma.productVariant.update({
            where: { id },
            data: {
                isDeleted: true,
                updatedBy: req.user.userId
            }
        });

        return sendResponse(res, 200, "Product variant deleted successfully");
    } catch (error) {
        console.error("deleteProductVariant error:", error);
        return sendResponse(res, 500, "Failed to delete product variant", { error: error.message });
    }
};

