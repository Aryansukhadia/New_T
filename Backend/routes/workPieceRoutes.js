import { Router } from "express";
import {
    convertPendingToCutting,
    getWorkPieceById,
    getWorkPieceStatusHistory,
} from "../controllers/workPieceController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.patch("/:workpieceId/convert-pending-to-cutting", convertPendingToCutting); // PATCH /api/workPieces/:workpieceId/convert-pending-to-cutting
router.get("/:workpieceId/status-history", getWorkPieceStatusHistory); // GET /api/workPieces/:workpieceId/status-history
router.get("/:workpieceId", getWorkPieceById); // GET /api/workPieces/:workpieceId

export default router;

