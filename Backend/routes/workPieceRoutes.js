import { Router } from "express";
import {
    getAllWorkPieces,
    convertPendingToUnderCutting,
    convertUnderCuttingToReadyToStitch,
    convertReadyToStitchToUnderStitching,
    convertUnderStitchingToReadyToFinishing,
    convertReadyToFinishingToUnderFinishing,
    convertUnderFinishingToReadyToDeliver,
    getWorkPieceById,
    getWorkPieceStatusHistory,
} from "../controllers/workPieceController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

// List workpieces
router.get("/", getAllWorkPieces); // GET /api/workPieces?page=1&limit=10&status=pending

// Status transition endpoints (role-based)
router.patch("/:workpieceId/convert-pending-to-under-cutting", convertPendingToUnderCutting); // Cutter, Admin
router.patch("/:workpieceId/convert-under-cutting-to-ready-to-stitch", convertUnderCuttingToReadyToStitch); // Cutter, Admin
router.patch("/:workpieceId/convert-ready-to-stitch-to-under-stitching", convertReadyToStitchToUnderStitching); // Stitcher, Admin
router.patch("/:workpieceId/convert-under-stitching-to-ready-to-finishing", convertUnderStitchingToReadyToFinishing); // Stitcher, Admin
router.patch("/:workpieceId/convert-ready-to-finishing-to-under-finishing", convertReadyToFinishingToUnderFinishing); // Finisher, Admin
router.patch("/:workpieceId/convert-under-finishing-to-ready-to-deliver", convertUnderFinishingToReadyToDeliver); // Finisher, Admin

// Get workpiece details and history
router.get("/:workpieceId/status-history", getWorkPieceStatusHistory); // GET /api/workPieces/:workpieceId/status-history
router.get("/:workpieceId", getWorkPieceById); // GET /api/workPieces/:workpieceId

export default router;

