import { Router } from "express";
import {
    bookOrder,
    getBookedOrders,
    getOrderDetails,
    getOrderWorkPieces,
    getOrderItemWorkPieces,
    getWorkpieceMeasurements,
    getAvailableReadyMadeItems,
} from "../controllers/productOrderController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/", getBookedOrders); // GET /api/productOrders - Get all booked orders with pagination
router.get("/ready-made-items", getAvailableReadyMadeItems); // GET /api/productOrders/ready-made-items - Get available ready-made items for ordering
router.get("/workpiece/:workpieceId/measurements", getWorkpieceMeasurements); // GET /api/productOrders/workpiece/:workpieceId/measurements - Get measurements for a workpiece
router.get("/:id/items/:itemId/workpieces", getOrderItemWorkPieces); // GET /api/productOrders/:id/items/:itemId/workpieces - Get work pieces for a specific order item
router.get("/:id/workpieces", getOrderWorkPieces); // GET /api/productOrders/:id/workpieces - Get all work pieces for a specific order
router.get("/:id", getOrderDetails); // GET /api/productOrders/:id - Get order details with order items
router.post("/book", bookOrder); // POST /api/productOrders/book - Book order with multiple items (custom or ready-made)

export default router;

