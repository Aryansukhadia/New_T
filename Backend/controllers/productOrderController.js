import prisma from "../dbConnect/prismaClient.js";
import sendResponse from "../utils/response.js";


/**
 * Book Order - Create an order with multiple items and automatically create OrderWorkPiece and ItemStatus entries
 * POST /api/productOrders/book
 * 
 * Request Body:
 * {
 *   "customerId": "string",
 *   "deliveryDate": "2024-01-15T00:00:00.000Z" (optional),
 *   "notes": "string" (optional),
 *   "items": [
 *     {
 *       "productId": "string",
 *       "productVariantId": "string",
 *       "quantity": 1
 *     },
 *     ...
 *   ]
 * }
 */
export const bookOrder = async (req, res) => {
    try {
        const { customerId, deliveryDate = null, notes = null, items } = req.body;

        // Validate customerId
        if (!customerId || typeof customerId !== "string" || customerId.trim() === "") {
            return sendResponse(res, 400, "customerId is required");
        }

        // Validate items array
        if (!items || !Array.isArray(items) || items.length === 0) {
            return sendResponse(res, 400, "items array is required and must not be empty");
        }

        // Validate each item
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item.productId || typeof item.productId !== "string" || item.productId.trim() === "") {
                return sendResponse(res, 400, `Item at index ${i}: productId is required`);
            }
            if (!item.productVariantId || typeof item.productVariantId !== "string" || item.productVariantId.trim() === "") {
                return sendResponse(res, 400, `Item at index ${i}: productVariantId is required`);
            }
            if (!item.quantity || typeof item.quantity !== "number" || item.quantity < 1) {
                return sendResponse(res, 400, `Item at index ${i}: quantity must be a positive number`);
            }
        }

        // Check if customer exists
        const customer = await prisma.customer.findUnique({
            where: { customerId: customerId.trim() }
        });

        if (!customer) {
            return sendResponse(res, 404, "Customer not found");
        }

        // Validate all product variants exist and match their productIds
        const productVariantIds = items.map(item => item.productVariantId.trim());
        const productVariants = await prisma.productVariant.findMany({
            where: {
                id: { in: productVariantIds }
            },
            include: {
                product: true,
                productItems: true
            }
        });

        if (productVariants.length !== productVariantIds.length) {
            const foundIds = productVariants.map(v => v.id);
            const missingIds = productVariantIds.filter(id => !foundIds.includes(id));
            return sendResponse(res, 404, `One or more product variants not found: ${missingIds.join(", ")}`);
        }

        // Validate that each productId matches the variant's product
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const variant = productVariants.find(v => v.id === item.productVariantId.trim());
            if (variant && variant.productId !== item.productId.trim()) {
                return sendResponse(res, 400, `Item at index ${i}: productId does not match the product variant's product`);
            }
        }

        // Validate that all variants have product items
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const variant = productVariants.find(v => v.id === item.productVariantId.trim());
            console.log(variant);
            if (!variant.productItems || variant.productItems.length === 0) {
                return sendResponse(res, 400, `Item at index ${i}: Product variant has no product items associated. Please add product items to the variant first.`);
            }
        }

        // Validate delivery date if provided
        let deliveryDateObj = null;
        if (deliveryDate) {
            deliveryDateObj = new Date(deliveryDate);
            if (isNaN(deliveryDateObj.getTime())) {
                return sendResponse(res, 400, "Invalid delivery date format");
            }
        }

        // Create order and items in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create the product order
            const productOrder = await tx.productOrder.create({
                data: {
                    customerId: customerId.trim(),
                    deliveryDate: deliveryDateObj,
                    notes: notes && typeof notes === "string" && notes.trim() !== "" ? notes.trim() : null,
                    status: 'pending',
                }
            });

            // Create all order items and their item statuses
            const orderItems = await Promise.all(
                items.map(async (item) => {
                    const variant = productVariants.find(v => v.id === item.productVariantId.trim());

                    // Create the order item
                    const orderItem = await tx.orderItem.create({
                        data: {
                            productOrderId: productOrder.id,
                            productVariantId: item.productVariantId.trim(),
                            quantity: item.quantity,
                        }
                    });

                    // Create OrderWorkPiece entries for each ProductItem × quantity
                    // Each ProductItem in the variant needs to be tracked individually as a work piece
                    const workPiecesToCreate = [];
                    for (const productItem of variant.productItems) {
                        // For each unit (quantity), create an OrderWorkPiece entry
                        for (let qty = 0; qty < item.quantity; qty++) {
                            workPiecesToCreate.push({
                                orderItemId: orderItem.id,
                                productItemId: productItem.id,
                                currentStatus: 'pending', // Start with cutting stage
                                assignedToId: null, // Can be assigned later
                                remarks: null,
                            });
                        }
                    }

                    // Create all work pieces for this order item
                    if (workPiecesToCreate.length > 0) {
                        await tx.orderWorkPiece.createMany({
                            data: workPiecesToCreate
                        });
                    }

                    // Create ItemStatus entries for each ProductItem × quantity
                    // Each ProductItem in the variant needs to be tracked individually
                    const itemStatusesToCreate = [];
                    for (const productItem of variant.productItems) {
                        // For each unit (quantity), create an ItemStatus entry
                        for (let qty = 0; qty < item.quantity; qty++) {
                            itemStatusesToCreate.push({
                                orderItemId: orderItem.id,
                                productItemId: productItem.id,
                                status: 'cutting', // Start with cutting stage
                                updatedById: req.user?.userId || null,
                            });
                        }
                    }

                    // Create all item statuses for this order item
                    if (itemStatusesToCreate.length > 0) {
                        await tx.itemStatus.createMany({
                            data: itemStatusesToCreate
                        });
                    }

                    return orderItem;
                })
            );

            // Fetch the complete order with all relations
            const completeOrder = await tx.productOrder.findUnique({
                where: { id: productOrder.id },
                include: {
                    customer: true,
                    orderItems: {
                        include: {
                            productVariant: {
                                include: {
                                    product: true,
                                    productItems: true
                                }
                            },
                            itemStatuses: {
                                include: {
                                    productItem: true,
                                    updatedBy: true
                                }
                            },
                            workPieces: {
                                include: {
                                    productItem: true,
                                    assignedTo: true,
                                    workStages: {
                                        include: {
                                            updatedBy: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            return completeOrder;
        });

        return sendResponse(res, 201, "Order booked successfully", result);
    } catch (error) {
        console.error("bookOrder error:", error);
        return sendResponse(res, 500, "Failed to book order", { error: error.message });
    }
};

/**
 * Get Booked Orders - Retrieve all booked orders with pagination
 * GET /api/productOrders
 * 
 * Query Parameters (all optional):
 * - page: Page number for pagination (default: 1)
 * - limit: Number of items per page (default: 10)
 */
export const getBookedOrders = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10
        } = req.query;

        // Build where clause - only exclude deleted orders
        const where = {
            isDeleted: false,
        };

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
        const totalCount = await prisma.productOrder.count({ where });

        // Fetch orders with only customer name
        const orders = await prisma.productOrder.findMany({
            where,
            select: {
                id: true,
                customerId: true,
                orderDate: true,
                deliveryDate: true,
                status: true,
                totalAmount: true,
                customer: {
                    select: {
                        fullName: true,
                    }
                }
            },
            orderBy: {
                orderDate: 'desc' // Most recent orders first
            },
            skip,
            take: limitNum,
        });

        // Map orders to simplified format with customerName
        const simplifiedOrders = orders.map(order => ({
            id: order.id,
            customerId: order.customerId,
            orderDate: order.orderDate,
            deliveryDate: order.deliveryDate,
            status: order.status,
            customerName: order.customer?.fullName || null,
            totalAmount: order.totalAmount,
        }));

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / limitNum);
        const hasNextPage = pageNum < totalPages;
        const hasPreviousPage = pageNum > 1;

        return sendResponse(res, 200, "Booked orders fetched successfully", {
            orders: simplifiedOrders,
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
        console.error("getBookedOrders error:", error);
        return sendResponse(res, 500, "Failed to fetch booked orders", { error: error.message });
    }
};

/**
 * Get Order Details - Retrieve detailed information about a specific order including all work pieces
 * GET /api/productOrders/:id
 * 
 * @param id - Order ID from URL parameters
 */
export const getOrderDetails = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || typeof id !== "string" || id.trim() === "") {
            return sendResponse(res, 400, "Order ID is required");
        }

        // Fetch order with all related data including work pieces
        const order = await prisma.productOrder.findUnique({
            where: {
                id: id.trim(),
                isDeleted: false
            },
            select: {
                id: true,
                customerId: true,
                orderDate: true,
                deliveryDate: true,
                status: true,
                notes: true,
                totalAmount: true,
                customer: {
                    select: {
                        fullName: true,
                    }
                },
                orderItems: {
                    select: {
                        id: true,
                        quantity: true,

                        workPieces: {
                            select: {
                                id: true,
                                currentStatus: true,
                                remarks: true,
                                createdAt: true,
                                productItem: {
                                    select: {
                                        id: true,
                                        name: true,
                                        imageUrl: true,
                                    }
                                },
                                assignedTo: {
                                    select: {
                                        userId: true,
                                        fullName: true,
                                        emailId: true,
                                    }
                                },

                            },
                            orderBy: {
                                createdAt: 'asc'
                            }
                        }
                    }
                }
            }
        });

        if (!order) {
            return sendResponse(res, 404, "Order not found");
        }

        // Format the response
        const formattedOrder = {
            id: order.id,
            customerId: order.customerId,
            orderDate: order.orderDate,
            deliveryDate: order.deliveryDate,
            status: order.status,
            customerName: order.customer?.fullName || null,
            notes: order.notes,
            totalAmount: order.totalAmount,
            workPieces: order.orderItems.flatMap(orderItem =>
                orderItem.workPieces.map(workPiece => ({
                    id: workPiece.id,
                    productItem: {
                        id: workPiece.productItem.id,
                        name: workPiece.productItem.name,
                        imageUrl: workPiece.productItem.imageUrl,
                    },
                    currentStatus: workPiece.currentStatus,
                    assignedTo: workPiece.assignedTo ? {
                        userId: workPiece.assignedTo.userId,
                        fullName: workPiece.assignedTo.fullName,
                        emailId: workPiece.assignedTo.emailId,
                    } : null,
                    remarks: workPiece.remarks,
                    createdAt: workPiece.createdAt,
                }))
            )
        };

        return sendResponse(res, 200, "Order details fetched successfully", formattedOrder);
    } catch (error) {
        console.error("getOrderDetails error:", error);
        return sendResponse(res, 500, "Failed to fetch order details", { error: error.message });
    }
};

/**
 * Get Workpiece Measurements - Retrieve measurements for a specific workpiece
 * GET /api/productOrders/workpiece/:workpieceId/measurements
 * 
 * @param workpieceId - Workpiece ID from URL parameters
 */
export const getWorkpieceMeasurements = async (req, res) => {
    try {
        const { workpieceId } = req.params;

        if (!workpieceId || typeof workpieceId !== "string" || workpieceId.trim() === "") {
            return sendResponse(res, 400, "Workpiece ID is required");
        }

        // Fetch workpiece with all related data including customer and measurements
        const workpiece = await prisma.orderWorkPiece.findUnique({
            where: {
                id: workpieceId.trim()
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
                orderItem: {
                    select: {
                        id: true,
                        quantity: true,
                        productOrder: {
                            select: {
                                id: true,
                                customerId: true,
                                customer: {
                                    select: {
                                        customerId: true,
                                        fullName: true,
                                        emailId: true,
                                        mobileNo: true,
                                        topMeasurement: {
                                            select: {
                                                topMeasurementId: true,
                                                length: true,
                                                shoulder: true,
                                                sleeveLength: true,
                                                sleeveBottom: true,
                                                chest: true,
                                                waist: true,
                                                hip: true,
                                                neck: true,
                                                createdAt: true,
                                                updatedAt: true
                                            }
                                        },
                                        bottomMeasurement: {
                                            select: {
                                                bottomMeasurementId: true,
                                                length: true,
                                                waist: true,
                                                hip: true,
                                                thigh: true,
                                                knee: true,
                                                calf: true,
                                                bottom: true,
                                                langot: true,
                                                createdAt: true,
                                                updatedAt: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!workpiece) {
            return sendResponse(res, 404, "Workpiece not found");
        }

        // Format the response
        const formattedResponse = {
            workpiece: {
                id: workpiece.id,
                currentStatus: workpiece.currentStatus,
                remarks: workpiece.remarks,
                createdAt: workpiece.createdAt,
                productItem: {
                    id: workpiece.productItem.id,
                    name: workpiece.productItem.name,
                    imageUrl: workpiece.productItem.imageUrl
                }
            },
            customer: {
                customerId: workpiece.orderItem.productOrder.customer.customerId,
                fullName: workpiece.orderItem.productOrder.customer.fullName,
                emailId: workpiece.orderItem.productOrder.customer.emailId,
                mobileNo: workpiece.orderItem.productOrder.customer.mobileNo
            },
            measurements: {
                top: workpiece.orderItem.productOrder.customer.topMeasurement,
                bottom: workpiece.orderItem.productOrder.customer.bottomMeasurement
            }
        };

        return sendResponse(res, 200, "Workpiece measurements fetched successfully", formattedResponse);
    } catch (error) {
        console.error("getWorkpieceMeasurements error:", error);
        return sendResponse(res, 500, "Failed to fetch workpiece measurements", { error: error.message });
    }
};

