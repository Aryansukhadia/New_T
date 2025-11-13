import prisma from "../dbConnect/prismaClient.js";
import sendResponse from "../utils/response.js";

export const addItemStatus = async (req, res) => {
    try {
        const { orderItemId, productItemId, status, remarks } = req.body;

        if (!orderItemId || typeof orderItemId !== "string" || orderItemId.trim() === "") {
            return sendResponse(res, 400, "orderItemId is required");
        }

        if (!productItemId || typeof productItemId !== "string" || productItemId.trim() === "") {
            return sendResponse(res, 400, "productItemId is required");
        }

        if (!status || !['cutting', 'stitching', 'finishing', 'ready_to_deliver'].includes(status)) {
            return sendResponse(res, 400, "status must be one of: cutting, stitching, finishing, ready_to_deliver");
        }

        // Check if order item exists
        const orderItem = await prisma.orderItem.findUnique({
            where: { id: orderItemId.trim() }
        });

        if (!orderItem) {
            return sendResponse(res, 404, "Order item not found");
        }

        // Check if product item exists
        const productItem = await prisma.productItem.findUnique({
            where: { id: productItemId.trim() }
        });

        if (!productItem) {
            return sendResponse(res, 404, "Product item not found");
        }

        // Verify that the product item belongs to the same variant as the order item
        const orderItemWithVariant = await prisma.orderItem.findUnique({
            where: { id: orderItemId.trim() },
            include: {
                productVariant: {
                    include: {
                        items: true
                    }
                }
            }
        });

        const productItemBelongsToVariant = orderItemWithVariant.productVariant.items.some(
            item => item.id === productItemId.trim()
        );

        if (!productItemBelongsToVariant) {
            return sendResponse(res, 400, "Product item does not belong to the product variant of this order item");
        }

        const newItemStatus = await prisma.itemStatus.create({
            data: {
                orderItemId: orderItemId.trim(),
                productItemId: productItemId.trim(),
                status: status,
                remarks: remarks && typeof remarks === "string" && remarks.trim() !== "" ? remarks.trim() : null,
                updatedById: req.user?.userId || null,
            },
            include: {
                orderItem: {
                    include: {
                        productOrder: {
                            include: {
                                customer: true
                            }
                        },
                        productVariant: {
                            include: {
                                product: true
                            }
                        }
                    }
                },
                productItem: {
                    include: {
                        productVariant: {
                            include: {
                                product: true
                            }
                        }
                    }
                },
                updatedBy: true,
                photos: true
            }
        });

        return sendResponse(res, 201, "Item status created successfully", newItemStatus);
    } catch (error) {
        console.error("addItemStatus error:", error);
        return sendResponse(res, 500, "Failed to create item status", { error: error.message });
    }
};

export const getItemStatuses = async (req, res) => {
    try {
        const { orderItemId, productItemId, status } = req.query;

        const where = {};
        if (orderItemId) {
            where.orderItemId = orderItemId;
        }
        if (productItemId) {
            where.productItemId = productItemId;
        }
        if (status) {
            where.status = status;
        }

        const itemStatuses = await prisma.itemStatus.findMany({
            where,
            include: {
                orderItem: {
                    include: {
                        productOrder: {
                            include: {
                                customer: true
                            }
                        },
                        productVariant: {
                            include: {
                                product: true
                            }
                        }
                    }
                },
                productItem: {
                    include: {
                        productVariant: {
                            include: {
                                product: true
                            }
                        }
                    }
                },
                updatedBy: true,
                photos: true
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        return sendResponse(res, 200, "Item statuses fetched successfully", itemStatuses);
    } catch (error) {
        console.error("getItemStatuses error:", error);
        return sendResponse(res, 500, "Failed to fetch item statuses", { error: error.message });
    }
};

export const getItemStatusById = async (req, res) => {
    try {
        const { id } = req.params;

        const itemStatus = await prisma.itemStatus.findUnique({
            where: { id },
            include: {
                orderItem: {
                    include: {
                        productOrder: {
                            include: {
                                customer: true
                            }
                        },
                        productVariant: {
                            include: {
                                product: true
                            }
                        }
                    }
                },
                productItem: {
                    include: {
                        productVariant: {
                            include: {
                                product: true
                            }
                        }
                    }
                },
                updatedBy: true,
                photos: true
            }
        });

        if (!itemStatus) {
            return sendResponse(res, 404, "Item status not found");
        }

        return sendResponse(res, 200, "Item status fetched successfully", itemStatus);
    } catch (error) {
        console.error("getItemStatusById error:", error);
        return sendResponse(res, 500, "Failed to fetch item status", { error: error.message });
    }
};

export const updateItemStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { orderItemId, productItemId, status, remarks } = req.body;

        // Check if item status exists
        const existingItemStatus = await prisma.itemStatus.findUnique({
            where: { id }
        });

        if (!existingItemStatus) {
            return sendResponse(res, 404, "Item status not found");
        }

        // If orderItemId is provided, check if it exists
        if (orderItemId) {
            if (typeof orderItemId !== "string" || orderItemId.trim() === "") {
                return sendResponse(res, 400, "orderItemId must be a valid string");
            }

            const orderItem = await prisma.orderItem.findUnique({
                where: { id: orderItemId.trim() }
            });

            if (!orderItem) {
                return sendResponse(res, 404, "Order item not found");
            }
        }

        // If productItemId is provided, check if it exists
        if (productItemId) {
            if (typeof productItemId !== "string" || productItemId.trim() === "") {
                return sendResponse(res, 400, "productItemId must be a valid string");
            }

            const productItem = await prisma.productItem.findUnique({
                where: { id: productItemId.trim() }
            });

            if (!productItem) {
                return sendResponse(res, 404, "Product item not found");
            }
        }

        // Validate status if provided
        if (status && !['cutting', 'stitching', 'finishing', 'ready_to_deliver'].includes(status)) {
            return sendResponse(res, 400, "status must be one of: cutting, stitching, finishing, ready_to_deliver");
        }

        const updateData = {
            remarks: remarks !== undefined ? (remarks && typeof remarks === "string" && remarks.trim() !== "" ? remarks.trim() : null) : existingItemStatus.remarks,
        };

        if (orderItemId) {
            updateData.orderItemId = orderItemId.trim();
        }
        if (productItemId) {
            updateData.productItemId = productItemId.trim();
        }
        if (status) {
            updateData.status = status;
        }
        if (req.user?.userId) {
            updateData.updatedById = req.user.userId;
        }

        const updatedItemStatus = await prisma.itemStatus.update({
            where: { id },
            data: updateData,
            include: {
                orderItem: {
                    include: {
                        productOrder: {
                            include: {
                                customer: true
                            }
                        },
                        productVariant: {
                            include: {
                                product: true
                            }
                        }
                    }
                },
                productItem: {
                    include: {
                        productVariant: {
                            include: {
                                product: true
                            }
                        }
                    }
                },
                updatedBy: true,
                photos: true
            }
        });

        return sendResponse(res, 200, "Item status updated successfully", updatedItemStatus);
    } catch (error) {
        console.error("updateItemStatus error:", error);
        return sendResponse(res, 500, "Failed to update item status", { error: error.message });
    }
};

export const deleteItemStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const itemStatus = await prisma.itemStatus.findUnique({
            where: { id }
        });

        if (!itemStatus) {
            return sendResponse(res, 404, "Item status not found");
        }

        await prisma.itemStatus.delete({
            where: { id }
        });

        return sendResponse(res, 200, "Item status deleted successfully");
    } catch (error) {
        console.error("deleteItemStatus error:", error);
        return sendResponse(res, 500, "Failed to delete item status", { error: error.message });
    }
};
