import prisma from "../dbConnect/prismaClient.js";
import sendResponse from "../utils/response.js";

/**
 * Convert Work Piece Status from Pending to Cutting
 * PATCH /api/workPieces/:workpieceId/convert-pending-to-cutting
 * 
 * @param workpieceId - Workpiece ID from URL parameters
 * Updates:
 * 1. OrderWorkPiece.currentStatus from 'pending' to 'cutting'
 * 2. Creates a WorkStage record to track the status change
 * Only updates the specified work piece and its own work stages
 */
export const convertPendingToCutting = async (req, res) => {
    try {
        const { workpieceId } = req.params;

        // Validate workpieceId
        if (!workpieceId || typeof workpieceId !== "string" || workpieceId.trim() === "") {
            return sendResponse(res, 400, "Workpiece ID is required");
        }

        // Find the work piece
        const workPiece = await prisma.orderWorkPiece.findUnique({
            where: { id: workpieceId.trim() },
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
                productItem: true,
                assignedTo: true,
                workStages: {
                    orderBy: {
                        startedAt: 'desc'
                    },
                    take: 1
                }
            }
        });

        if (!workPiece) {
            return sendResponse(res, 404, "Work piece not found");
        }

        // Check if current status is 'pending'
        if (workPiece.currentStatus.toLowerCase() !== 'pending') {
            return sendResponse(res, 400, `Work piece status is already ${workPiece.currentStatus}. Only pending work pieces can be converted to cutting.`);
        }

        // Use transaction to ensure all updates happen atomically
        const result = await prisma.$transaction(async (tx) => {
            // 1. Update OrderWorkPiece currentStatus to 'cutting'
            const updatedWorkPiece = await tx.orderWorkPiece.update({
                where: { id: workpieceId.trim() },
                data: {
                    currentStatus: 'cutting'
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
                    productItem: true,
                    assignedTo: true
                }
            });

            // 2. Complete the previous pending stage if it exists
            const previousPendingStage = await tx.workStage.findFirst({
                where: {
                    orderWorkPieceId: workpieceId.trim(),
                    stage: 'pending',
                    completedAt: null
                },
                orderBy: {
                    startedAt: 'desc'
                }
            });

            if (previousPendingStage) {
                await tx.workStage.update({
                    where: { id: previousPendingStage.id },
                    data: {
                        completedAt: new Date()
                    }
                });
            }

            // 3. Create a new WorkStage record for 'cutting' stage
            const newWorkStage = await tx.workStage.create({
                data: {
                    orderWorkPieceId: workpieceId.trim(),
                    stage: 'cutting',
                    startedAt: new Date(),
                    updatedById: req.user?.userId,
                    remarks: null
                },
                include: {
                    updatedBy: true
                }
            });

            // Only mutate this work piece and its stages
            return { workPiece: updatedWorkPiece, workStage: newWorkStage };
        });

        return sendResponse(
            res,
            200,
            `Successfully converted work piece from pending to cutting.`
        );
    } catch (error) {
        console.error("convertPendingToCutting error:", error);
        return sendResponse(res, 500, "Failed to convert work piece status", { error: error.message });
    }
};

/**
 * Get Work Piece Details
 * GET /api/workPieces/:workpieceId
 * 
 * @param workpieceId - Workpiece ID from URL parameters
 */
export const getWorkPieceById = async (req, res) => {
    try {
        const { workpieceId } = req.params;

        if (!workpieceId || typeof workpieceId !== "string" || workpieceId.trim() === "") {
            return sendResponse(res, 400, "Workpiece ID is required");
        }

        const workPiece = await prisma.orderWorkPiece.findUnique({
            where: { id: workpieceId.trim() },
            select: {
                id: true,
                createdAt: true,
                orderItem: {
                    select: {
                        productOrder: {
                            select: {
                                orderDate: true
                            }
                        }
                    }
                },
                productItem: {
                    select: {
                        id: true,
                        name: true,
                        imageUrl: true,
                        createdAt: true
                    }
                },
                workStages: {
                    orderBy: {
                        startedAt: 'desc'
                    },
                    take: 1,
                    select: {
                        id: true,
                        stage: true,
                        startedAt: true,
                        completedAt: true,
                        remarks: true
                    }
                }
            }
        });

        if (!workPiece) {
            return sendResponse(res, 404, "Work piece not found");
        }

        const latestStage = Array.isArray(workPiece.workStages) && workPiece.workStages.length > 0
            ? workPiece.workStages[0]
            : null;

        const lastUpdated =
            (latestStage && (latestStage.completedAt || latestStage.startedAt)) ||
            workPiece.createdAt ||
            null;

        return sendResponse(res, 200, "Work piece fetched successfully", {
            workPieceStage: latestStage,
            orderDate: workPiece.orderItem?.productOrder?.orderDate ?? null,
            productItem: workPiece.productItem,
            lastUpdated
        });
    } catch (error) {
        console.error("getWorkPieceById error:", error);
        return sendResponse(res, 500, "Failed to fetch work piece", { error: error.message });
    }
};

/**
 * Get Work Piece Status History
 * GET /api/workPieces/:workpieceId/status-history
 * 
 * @param workpieceId - Workpiece ID from URL parameters
 * Returns all WorkStage records for the workpiece, ordered by startedAt (newest first)
 */
export const getWorkPieceStatusHistory = async (req, res) => {
    try {
        const { workpieceId } = req.params;

        // Validate workpieceId
        if (!workpieceId || typeof workpieceId !== "string" || workpieceId.trim() === "") {
            return sendResponse(res, 400, "Workpiece ID is required");
        }

        // Check if work piece exists
        const workPiece = await prisma.orderWorkPiece.findUnique({
            where: { id: workpieceId.trim() },
            select: {
                id: true,
                currentStatus: true,
                productItem: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        if (!workPiece) {
            return sendResponse(res, 404, "Work piece not found");
        }

        // Fetch all work stages for this work piece
        const workStages = await prisma.workStage.findMany({
            where: {
                orderWorkPieceId: workpieceId.trim()
            },
            include: {
                updatedBy: {
                    select: {
                        userId: true,
                        fullName: true,
                        emailId: true
                    }
                }
            },
            orderBy: {
                startedAt: 'desc' // Newest first
            }
        });

        // Format the response with additional information
        const formattedHistory = {
            workPiece: {
                id: workPiece.id,
                currentStatus: workPiece.currentStatus,
                productItem: workPiece.productItem
            },
            statusHistory: workStages.map(stage => ({
                id: stage.id,
                stage: stage.stage,
                startedAt: stage.startedAt,
                completedAt: stage.completedAt,
                remarks: stage.remarks,
                updatedBy: stage.updatedBy ? {
                    userId: stage.updatedBy.userId,
                    fullName: stage.updatedBy.fullName,
                    emailId: stage.updatedBy.emailId
                } : null,
                duration: stage.startedAt && stage.completedAt
                    ? Math.round((new Date(stage.completedAt) - new Date(stage.startedAt)) / (1000 * 60 * 60)) // Duration in hours
                    : stage.startedAt
                        ? Math.round((new Date() - new Date(stage.startedAt)) / (1000 * 60 * 60)) // Current duration if not completed
                        : null,
                isCompleted: stage.completedAt !== null,
                isActive: stage.completedAt === null && stage.startedAt !== null
            })),
            totalStages: workStages.length,
            completedStages: workStages.filter(s => s.completedAt !== null).length,
            activeStages: workStages.filter(s => s.completedAt === null && s.startedAt !== null).length
        };

        return sendResponse(res, 200, "Work piece status history fetched successfully", formattedHistory);
    } catch (error) {
        console.error("getWorkPieceStatusHistory error:", error);
        return sendResponse(res, 500, "Failed to fetch work piece status history", { error: error.message });
    }
};

