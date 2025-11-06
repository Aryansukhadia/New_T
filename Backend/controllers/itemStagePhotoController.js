import prisma from "../dbConnect/prismaClient.js";
import sendResponse from "../utils/response.js";

export const addItemStagePhoto = async (req, res) => {
    try {
        const { itemStatusId, photoUrl } = req.body;

        if (!itemStatusId || typeof itemStatusId !== "string" || itemStatusId.trim() === "") {
            return sendResponse(res, 400, "itemStatusId is required");
        }

        if (!photoUrl || typeof photoUrl !== "string" || photoUrl.trim() === "") {
            return sendResponse(res, 400, "photoUrl is required");
        }

        // Check if item status exists
        const itemStatus = await prisma.itemStatus.findUnique({
            where: { id: itemStatusId.trim() }
        });

        if (!itemStatus) {
            return sendResponse(res, 404, "Item status not found");
        }

        const newItemStagePhoto = await prisma.itemStagePhoto.create({
            data: {
                itemStatusId: itemStatusId.trim(),
                photoUrl: photoUrl.trim(),
            },
            include: {
                itemStatus: {
                    include: {
                        orderItem: true,
                        productItem: true
                    }
                }
            }
        });

        return sendResponse(res, 201, "Item stage photo created successfully", newItemStagePhoto);
    } catch (error) {
        console.error("addItemStagePhoto error:", error);
        return sendResponse(res, 500, "Failed to create item stage photo", { error: error.message });
    }
};

export const getItemStagePhotos = async (req, res) => {
    try {
        const { itemStatusId } = req.query;

        const where = {};
        if (itemStatusId) {
            where.itemStatusId = itemStatusId;
        }

        const itemStagePhotos = await prisma.itemStagePhoto.findMany({
            where,
            include: {
                itemStatus: {
                    include: {
                        orderItem: true,
                        productItem: true
                    }
                }
            },
            orderBy: {
                uploadedAt: 'desc'
            }
        });

        return sendResponse(res, 200, "Item stage photos fetched successfully", itemStagePhotos);
    } catch (error) {
        console.error("getItemStagePhotos error:", error);
        return sendResponse(res, 500, "Failed to fetch item stage photos", { error: error.message });
    }
};

export const getItemStagePhotoById = async (req, res) => {
    try {
        const { id } = req.params;

        const itemStagePhoto = await prisma.itemStagePhoto.findUnique({
            where: { id },
            include: {
                itemStatus: {
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
                        updatedBy: true
                    }
                }
            }
        });

        if (!itemStagePhoto) {
            return sendResponse(res, 404, "Item stage photo not found");
        }

        return sendResponse(res, 200, "Item stage photo fetched successfully", itemStagePhoto);
    } catch (error) {
        console.error("getItemStagePhotoById error:", error);
        return sendResponse(res, 500, "Failed to fetch item stage photo", { error: error.message });
    }
};

export const updateItemStagePhoto = async (req, res) => {
    try {
        const { id } = req.params;
        const { itemStatusId, photoUrl } = req.body;

        // Check if photo exists
        const existingPhoto = await prisma.itemStagePhoto.findUnique({
            where: { id }
        });

        if (!existingPhoto) {
            return sendResponse(res, 404, "Item stage photo not found");
        }

        // If itemStatusId is provided, check if it exists
        if (itemStatusId) {
            if (typeof itemStatusId !== "string" || itemStatusId.trim() === "") {
                return sendResponse(res, 400, "itemStatusId must be a valid string");
            }

            const itemStatus = await prisma.itemStatus.findUnique({
                where: { id: itemStatusId.trim() }
            });

            if (!itemStatus) {
                return sendResponse(res, 404, "Item status not found");
            }
        }

        if (!photoUrl || typeof photoUrl !== "string" || photoUrl.trim() === "") {
            return sendResponse(res, 400, "photoUrl is required");
        }

        const updateData = {
            photoUrl: photoUrl.trim(),
        };

        if (itemStatusId) {
            updateData.itemStatusId = itemStatusId.trim();
        }

        const updatedItemStagePhoto = await prisma.itemStagePhoto.update({
            where: { id },
            data: updateData,
            include: {
                itemStatus: {
                    include: {
                        orderItem: true,
                        productItem: true
                    }
                }
            }
        });

        return sendResponse(res, 200, "Item stage photo updated successfully", updatedItemStagePhoto);
    } catch (error) {
        console.error("updateItemStagePhoto error:", error);
        return sendResponse(res, 500, "Failed to update item stage photo", { error: error.message });
    }
};

export const deleteItemStagePhoto = async (req, res) => {
    try {
        const { id } = req.params;

        const itemStagePhoto = await prisma.itemStagePhoto.findUnique({
            where: { id }
        });

        if (!itemStagePhoto) {
            return sendResponse(res, 404, "Item stage photo not found");
        }

        await prisma.itemStagePhoto.delete({
            where: { id }
        });

        return sendResponse(res, 200, "Item stage photo deleted successfully");
    } catch (error) {
        console.error("deleteItemStagePhoto error:", error);
        return sendResponse(res, 500, "Failed to delete item stage photo", { error: error.message });
    }
};

