import { Router } from "express";
import {
    getAllWorkPieces,
    convertPendingToCutting,
    convertCuttingToReadyToStitch,
    convertReadyToStitchToStitching,
    convertStitchingToReadyToFinishing,
    convertReadyToFinishingToFinishing,
    convertFinishingToReadyToDeliver,
    getWorkPieceById,
    getWorkPieceStatusHistory,
} from "../controllers/workPieceController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

// List workpieces
router.get("/", getAllWorkPieces); // GET /api/workPieces?page=1&limit=10&status=pending

// Status transition endpoints (role-based)
router.patch("/:workpieceId/convert-pending-to-cutting", convertPendingToCutting); // Cutter, Admin
router.patch("/:workpieceId/convert-cutting-to-ready-to-stitch", convertCuttingToReadyToStitch); // Cutter, Admin
router.patch("/:workpieceId/convert-ready-to-stitch-to-stitching", convertReadyToStitchToStitching); // Stitcher, Admin
router.patch("/:workpieceId/convert-stitching-to-ready-to-finishing", convertStitchingToReadyToFinishing); // Stitcher, Admin
router.patch("/:workpieceId/convert-ready-to-finishing-to-finishing", convertReadyToFinishingToFinishing); // Finisher, Admin
router.patch("/:workpieceId/convert-finishing-to-ready-to-deliver", convertFinishingToReadyToDeliver); // Finisher, Admin

// Get workpiece details and history
router.get("/:workpieceId/status-history", getWorkPieceStatusHistory); // GET /api/workPieces/:workpieceId/status-history
router.get("/:workpieceId", getWorkPieceById); // GET /api/workPieces/:workpieceId

export default router;

