import { Router } from "express";
import {
    bookOrder,
    getBookedOrders,
    getOrderDetails,
    getWorkpieceMeasurements,
} from "../controllers/productOrderController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/", getBookedOrders); // GET /api/productOrders - Get all booked orders with pagination
router.get("/workpiece/:workpieceId/measurements", getWorkpieceMeasurements); // GET /api/productOrders/workpiece/:workpieceId/measurements - Get measurements for a workpiece
router.get("/:id", getOrderDetails); // GET /api/productOrders/:id - Get order details with all work pieces
router.post("/book", bookOrder); // POST /api/productOrders/book - Book order with multiple items

export default router;

