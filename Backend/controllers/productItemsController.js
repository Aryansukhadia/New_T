import prisma from "../dbConnect/prismaClient.js";
import sendResponse from "../utils/response.js";

export const addProductItem = async (req, res) => {
    try {
        const { name, imageUrl } = req.body;

        if (!name || typeof name !== "string" || name.trim() === "") {
            return sendResponse(res, 400, "name is required");
        }

        // Check if item with same name already exists
        const existingItem = await prisma.productItem.findFirst({
            where: {
                name: name.trim(),
            }
        });

        if (existingItem) {
            return sendResponse(res, 409, "Product item with this name already exists");
        }

        const newProductItem = await prisma.productItem.create({
            data: {
                name: name.trim(),
                imageUrl: imageUrl && typeof imageUrl === "string" && imageUrl.trim() !== "" ? imageUrl.trim() : null,
            },
            include: {
                variants: true,
                itemStatuses: true
            }
        });

        return sendResponse(res, 201, "Product item created successfully", newProductItem);
    } catch (error) {
        console.error("addProductItem error:", error);
        return sendResponse(res, 500, "Failed to create product item", { error: error.message });
    }
};

export const getProductItems = async (req, res) => {
    try {
        const productItems = await prisma.productItem.findMany({
            include: {
                variants: true,
                itemStatuses: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return sendResponse(res, 200, "Product items fetched successfully", productItems);
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
                        updatedBy: true,
                        photos: true
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
        const { name, imageUrl } = req.body;

        if (!name || typeof name !== "string" || name.trim() === "") {
            return sendResponse(res, 400, "name is required");
        }

        // Check if item exists
        const existingItem = await prisma.productItem.findUnique({
            where: { id }
        });

        if (!existingItem) {
            return sendResponse(res, 404, "Product item not found");
        }

        // Check if another item with same name exists
        const duplicateItem = await prisma.productItem.findFirst({
            where: {
                name: name.trim(),
                id: { not: id }
            }
        });

        if (duplicateItem) {
            return sendResponse(res, 409, "Product item with this name already exists");
        }

        const updatedProductItem = await prisma.productItem.update({
            where: { id },
            data: {
                name: name.trim(),
                imageUrl: imageUrl && typeof imageUrl === "string" && imageUrl.trim() !== "" ? imageUrl.trim() : null,
            },
            include: {
                variants: true,
                itemStatuses: true
            }
        });

        return sendResponse(res, 200, "Product item updated successfully", updatedProductItem);
    } catch (error) {
        console.error("updateProductItem error:", error);
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

        // Check if item is used in any item statuses
        const itemStatusesCount = await prisma.itemStatus.count({
            where: { productItemId: id }
        });

        if (itemStatusesCount > 0) {
            return sendResponse(res, 400, "Cannot delete product item that is used in order statuses.");
        }

        await prisma.productItem.delete({
            where: { id }
        });

        return sendResponse(res, 200, "Product item deleted successfully");
    } catch (error) {
        console.error("deleteProductItem error:", error);
        return sendResponse(res, 500, "Failed to delete product item", { error: error.message });
    }
};