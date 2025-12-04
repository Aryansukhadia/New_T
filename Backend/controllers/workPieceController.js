import prisma from "../dbConnect/prismaClient.js";
import sendResponse from "../utils/response.js";
import { getAvailableWorkPieceStatus } from "../utils/workPiece.js";

/**
 * Get All Work Pieces with Pagination
 * GET /api/workPieces
 * 
 * @query page - Page number (default: 1)
 * @query limit - Number of items per page (default: 10)
 * @query status - Filter by currentStatus (optional)
 * Returns paginated list of work pieces
 */
export const getAllWorkPieces = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
        const status = req.query.status;

        const skip = (page - 1) * limit;

        const currentStatusAsPerRole = getAvailableWorkPieceStatus(req.user.role);

        // Build where clause
        const whereClause = {};
        if (status && currentStatusAsPerRole.includes(status)) {
            whereClause.currentStatus = status;
        }
        else if (!status) {
            whereClause.currentStatus = {
                in: currentStatusAsPerRole
            };
        }
        else {
            return sendResponse(res, 400, "You are not authorized to view this status");
        }

        // Get total count and work pieces in parallel
        const [totalCount, workPieces] = await Promise.all([
            prisma.orderWorkPiece.count({ where: whereClause }),
            prisma.orderWorkPiece.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc'
                },
                select: {
                    id: true,
                    currentStatus: true,
                    remarks: true,
                    createdAt: true,
                    productItem: {
                        select: {
                            id: true,
                            name: true,
                            imageUrl: true
                        }
                    },
                    assignedTo: {
                        select: {
                            userId: true,
                            fullName: true
                        }
                    }
                }
            })
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        return sendResponse(res, 200, "Work pieces fetched successfully", {
            workPieces,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        });
    } catch (error) {
        console.error("getAllWorkPieces error:", error);
        return sendResponse(res, 500, "Failed to fetch work pieces", { error: error.message });
    }
};

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
 * Convert Work Piece Status from Ready to Stitch to Stitching
 * PATCH /api/workPieces/:workpieceId/convert-ready-to-stitch-to-stitching
 * Allowed Roles: stitcher, admin, subAdmin, superAdmin
 */
export const convertReadyToStitchToStitching = async (req, res) => {
    try {
        const { workpieceId } = req.params;
        const { remarks } = req.body;
        const userRole = req.user?.role;

        const allowedRoles = ['stitcher', 'admin', 'subAdmin', 'superAdmin'];
        if (!allowedRoles.includes(userRole)) {
            return sendResponse(res, 403, `Your role (${userRole}) is not authorized to perform this action.`);
        }

        if (!workpieceId || typeof workpieceId !== "string" || workpieceId.trim() === "") {
            return sendResponse(res, 400, "Workpiece ID is required");
        }

        const workPiece = await prisma.orderWorkPiece.findUnique({
            where: { id: workpieceId.trim() }
        });

        if (!workPiece) {
            return sendResponse(res, 404, "Work piece not found");
        }

        if (workPiece.currentStatus.toLowerCase() !== 'redaytostich') {
            return sendResponse(res, 400, `Work piece status is ${workPiece.currentStatus}. Only ready to stitch work pieces can be converted to stitching.`);
        }

        await prisma.$transaction(async (tx) => {
            await tx.orderWorkPiece.update({
                where: { id: workpieceId.trim() },
                data: { currentStatus: 'stitching' }
            });

            const previousStage = await tx.workStage.findFirst({
                where: { orderWorkPieceId: workpieceId.trim(), stage: 'redayToStich', completedAt: null },
                orderBy: { startedAt: 'desc' }
            });

            if (previousStage) {
                await tx.workStage.update({
                    where: { id: previousStage.id },
                    data: { completedAt: new Date() }
                });
            }

            await tx.workStage.create({
                data: {
                    orderWorkPieceId: workpieceId.trim(),
                    stage: 'stitching',
                    startedAt: new Date(),
                    updatedById: req.user?.userId || null,
                    remarks: remarks && typeof remarks === "string" ? remarks.trim() : null
                }
            });
        });

        return sendResponse(res, 200, "Successfully converted work piece from ready to stitch to stitching.");
    } catch (error) {
        console.error("convertReadyToStitchToStitching error:", error);
        return sendResponse(res, 500, "Failed to convert work piece status", { error: error.message });
    }
};

/**
 * Convert Work Piece Status from Cutting to Ready to Stitch
 * PATCH /api/workPieces/:workpieceId/convert-cutting-to-ready-to-stitch
 * Allowed Roles: cutter, admin, subAdmin, superAdmin
 */
export const convertCuttingToReadyToStitch = async (req, res) => {
    try {
        const { workpieceId } = req.params;
        const { remarks } = req.body;
        const userRole = req.user?.role;

        // Check role permission
        const allowedRoles = ['cutter', 'admin', 'subAdmin', 'superAdmin'];
        if (!allowedRoles.includes(userRole)) {
            return sendResponse(res, 403, `Your role (${userRole}) is not authorized to perform this action.`);
        }

        if (!workpieceId || typeof workpieceId !== "string" || workpieceId.trim() === "") {
            return sendResponse(res, 400, "Workpiece ID is required");
        }

        const workPiece = await prisma.orderWorkPiece.findUnique({
            where: { id: workpieceId.trim() }
        });

        if (!workPiece) {
            return sendResponse(res, 404, "Work piece not found");
        }

        if (workPiece.currentStatus.toLowerCase() !== 'cutting') {
            return sendResponse(res, 400, `Work piece status is ${workPiece.currentStatus}. Only cutting work pieces can be converted to ready to stitch.`);
        }

        await prisma.$transaction(async (tx) => {
            await tx.orderWorkPiece.update({
                where: { id: workpieceId.trim() },
                data: { currentStatus: 'redayToStich' }
            });

            const previousStage = await tx.workStage.findFirst({
                where: { orderWorkPieceId: workpieceId.trim(), stage: 'cutting', completedAt: null },
                orderBy: { startedAt: 'desc' }
            });

            if (previousStage) {
                await tx.workStage.update({
                    where: { id: previousStage.id },
                    data: { completedAt: new Date() }
                });
            }

            await tx.workStage.create({
                data: {
                    orderWorkPieceId: workpieceId.trim(),
                    stage: 'redayToStich',
                    startedAt: new Date(),
                    updatedById: req.user?.userId || null,
                    remarks: remarks && typeof remarks === "string" ? remarks.trim() : null
                }
            });
        });

        return sendResponse(res, 200, "Successfully converted work piece from cutting to ready to stitch.");
    } catch (error) {
        console.error("convertCuttingToReadyToStitch error:", error);
        return sendResponse(res, 500, "Failed to convert work piece status", { error: error.message });
    }
};

/**
 * Convert Work Piece Status from Ready to Stitch to Stitching
 * PATCH /api/workPieces/:workpieceId/convert-ready-to-stitch-to-stitching
 * Allowed Roles: stitcher, admin, subAdmin, superAdmin
 */
// export const convertReadyToStitchToStitching = async (req, res) => {
//     try {
//         const { workpieceId } = req.params;
//         const { remarks } = req.body;
//         const userRole = req.user?.role;

//         const allowedRoles = ['stitcher', 'admin', 'subAdmin', 'superAdmin'];
//         if (!allowedRoles.includes(userRole)) {
//             return sendResponse(res, 403, `Your role (${userRole}) is not authorized to perform this action.`);
//         }

//         if (!workpieceId || typeof workpieceId !== "string" || workpieceId.trim() === "") {
//             return sendResponse(res, 400, "Workpiece ID is required");
//         }

//         const workPiece = await prisma.orderWorkPiece.findUnique({
//             where: { id: workpieceId.trim() }
//         });

//         if (!workPiece) {
//             return sendResponse(res, 404, "Work piece not found");
//         }

//         if (workPiece.currentStatus.toLowerCase() !== 'redaytostich') {
//             return sendResponse(res, 400, `Work piece status is ${workPiece.currentStatus}. Only ready to stitch work pieces can be converted to stitching.`);
//         }

//         await prisma.$transaction(async (tx) => {
//             await tx.orderWorkPiece.update({
//                 where: { id: workpieceId.trim() },
//                 data: { currentStatus: 'stitching' }
//             });

//             const previousStage = await tx.workStage.findFirst({
//                 where: { orderWorkPieceId: workpieceId.trim(), stage: 'redayToStich', completedAt: null },
//                 orderBy: { startedAt: 'desc' }
//             });

//             if (previousStage) {
//                 await tx.workStage.update({
//                     where: { id: previousStage.id },
//                     data: { completedAt: new Date() }
//                 });
//             }

//             await tx.workStage.create({
//                 data: {
//                     orderWorkPieceId: workpieceId.trim(),
//                     stage: 'stitching',
//                     startedAt: new Date(),
//                     updatedById: req.user?.userId || null,
//                     remarks: remarks && typeof remarks === "string" ? remarks.trim() : null
//                 }
//             });
//         });

//         return sendResponse(res, 200, "Successfully converted work piece from ready to stitch to stitching.");
//     } catch (error) {
//         console.error("convertReadyToStitchToStitching error:", error);
//         return sendResponse(res, 500, "Failed to convert work piece status", { error: error.message });
//     }
// };

/**
 * Convert Work Piece Status from Stitching to Ready to Finishing
 * PATCH /api/workPieces/:workpieceId/convert-stitching-to-ready-to-finishing
 * Allowed Roles: stitcher, admin, subAdmin, superAdmin
 */
export const convertStitchingToReadyToFinishing = async (req, res) => {
    try {
        const { workpieceId } = req.params;
        const { remarks } = req.body;
        const userRole = req.user?.role;

        const allowedRoles = ['stitcher', 'admin', 'subAdmin', 'superAdmin'];
        if (!allowedRoles.includes(userRole)) {
            return sendResponse(res, 403, `Your role (${userRole}) is not authorized to perform this action.`);
        }

        if (!workpieceId || typeof workpieceId !== "string" || workpieceId.trim() === "") {
            return sendResponse(res, 400, "Workpiece ID is required");
        }

        const workPiece = await prisma.orderWorkPiece.findUnique({
            where: { id: workpieceId.trim() }
        });

        if (!workPiece) {
            return sendResponse(res, 404, "Work piece not found");
        }

        if (workPiece.currentStatus.toLowerCase() !== 'stitching') {
            return sendResponse(res, 400, `Work piece status is ${workPiece.currentStatus}. Only stitching work pieces can be converted to ready to finishing.`);
        }

        await prisma.$transaction(async (tx) => {
            await tx.orderWorkPiece.update({
                where: { id: workpieceId.trim() },
                data: { currentStatus: 'readyToFinishing' }
            });

            const previousStage = await tx.workStage.findFirst({
                where: { orderWorkPieceId: workpieceId.trim(), stage: 'stitching', completedAt: null },
                orderBy: { startedAt: 'desc' }
            });

            if (previousStage) {
                await tx.workStage.update({
                    where: { id: previousStage.id },
                    data: { completedAt: new Date() }
                });
            }

            await tx.workStage.create({
                data: {
                    orderWorkPieceId: workpieceId.trim(),
                    stage: 'readyToFinishing',
                    startedAt: new Date(),
                    updatedById: req.user?.userId || null,
                    remarks: remarks && typeof remarks === "string" ? remarks.trim() : null
                }
            });
        });

        return sendResponse(res, 200, "Successfully converted work piece from stitching to ready to finishing.");
    } catch (error) {
        console.error("convertStitchingToReadyToFinishing error:", error);
        return sendResponse(res, 500, "Failed to convert work piece status", { error: error.message });
    }
};

/**
 * Convert Work Piece Status from Ready to Finishing to Finishing
 * PATCH /api/workPieces/:workpieceId/convert-ready-to-finishing-to-finishing
 * Allowed Roles: finisher, admin, subAdmin, superAdmin
 */
export const convertReadyToFinishingToFinishing = async (req, res) => {
    try {
        const { workpieceId } = req.params;
        const { remarks } = req.body;
        const userRole = req.user?.role;

        const allowedRoles = ['finisher', 'admin', 'subAdmin', 'superAdmin'];
        if (!allowedRoles.includes(userRole)) {
            return sendResponse(res, 403, `Your role (${userRole}) is not authorized to perform this action.`);
        }

        if (!workpieceId || typeof workpieceId !== "string" || workpieceId.trim() === "") {
            return sendResponse(res, 400, "Workpiece ID is required");
        }

        const workPiece = await prisma.orderWorkPiece.findUnique({
            where: { id: workpieceId.trim() }
        });

        if (!workPiece) {
            return sendResponse(res, 404, "Work piece not found");
        }

        if (workPiece.currentStatus.toLowerCase() !== 'readytofinishing') {
            return sendResponse(res, 400, `Work piece status is ${workPiece.currentStatus}. Only ready to finishing work pieces can be converted to finishing.`);
        }

        await prisma.$transaction(async (tx) => {
            await tx.orderWorkPiece.update({
                where: { id: workpieceId.trim() },
                data: { currentStatus: 'finishing' }
            });

            const previousStage = await tx.workStage.findFirst({
                where: { orderWorkPieceId: workpieceId.trim(), stage: 'readyToFinishing', completedAt: null },
                orderBy: { startedAt: 'desc' }
            });

            if (previousStage) {
                await tx.workStage.update({
                    where: { id: previousStage.id },
                    data: { completedAt: new Date() }
                });
            }

            await tx.workStage.create({
                data: {
                    orderWorkPieceId: workpieceId.trim(),
                    stage: 'finishing',
                    startedAt: new Date(),
                    updatedById: req.user?.userId || null,
                    remarks: remarks && typeof remarks === "string" ? remarks.trim() : null
                }
            });
        });

        return sendResponse(res, 200, "Successfully converted work piece from ready to finishing to finishing.");
    } catch (error) {
        console.error("convertReadyToFinishingToFinishing error:", error);
        return sendResponse(res, 500, "Failed to convert work piece status", { error: error.message });
    }
};

/**
 * Convert Work Piece Status from Finishing to Ready to Deliver
 * PATCH /api/workPieces/:workpieceId/convert-finishing-to-ready-to-deliver
 * Allowed Roles: finisher, admin, subAdmin, superAdmin
 */
export const convertFinishingToReadyToDeliver = async (req, res) => {
    try {
        const { workpieceId } = req.params;
        const { remarks } = req.body;
        const userRole = req.user?.role;

        const allowedRoles = ['finisher', 'admin', 'subAdmin', 'superAdmin'];
        if (!allowedRoles.includes(userRole)) {
            return sendResponse(res, 403, `Your role (${userRole}) is not authorized to perform this action.`);
        }

        if (!workpieceId || typeof workpieceId !== "string" || workpieceId.trim() === "") {
            return sendResponse(res, 400, "Workpiece ID is required");
        }

        const workPiece = await prisma.orderWorkPiece.findUnique({
            where: { id: workpieceId.trim() }
        });

        if (!workPiece) {
            return sendResponse(res, 404, "Work piece not found");
        }

        if (workPiece.currentStatus.toLowerCase() !== 'finishing') {
            return sendResponse(res, 400, `Work piece status is ${workPiece.currentStatus}. Only finishing work pieces can be converted to ready to deliver.`);
        }

        await prisma.$transaction(async (tx) => {
            await tx.orderWorkPiece.update({
                where: { id: workpieceId.trim() },
                data: { currentStatus: 'readyToDeliver' }
            });

            const previousStage = await tx.workStage.findFirst({
                where: { orderWorkPieceId: workpieceId.trim(), stage: 'finishing', completedAt: null },
                orderBy: { startedAt: 'desc' }
            });

            if (previousStage) {
                await tx.workStage.update({
                    where: { id: previousStage.id },
                    data: { completedAt: new Date() }
                });
            }

            await tx.workStage.create({
                data: {
                    orderWorkPieceId: workpieceId.trim(),
                    stage: 'readyToDeliver',
                    startedAt: new Date(),
                    updatedById: req.user?.userId || null,
                    remarks: remarks && typeof remarks === "string" ? remarks.trim() : null
                }
            });
        });

        return sendResponse(res, 200, "Successfully converted work piece from finishing to ready to deliver.");
    } catch (error) {
        console.error("convertFinishingToReadyToDeliver error:", error);
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

