import { Router } from "express";
import {
    addReadyMadeInventory,
    getReadyMadeInventories,
    getReadyMadeInventoryById,
    updateReadyMadeInventory,
    deleteReadyMadeInventory,
} from "../controllers/readyMadeInventoryController.js";
import { isAdminOrSubAdmin, authenticate } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = Router();

router.post("/", isAdminOrSubAdmin, upload.array('images', 5), addReadyMadeInventory); // POST /api/ready-made-inventories
router.get("/", authenticate, getReadyMadeInventories); // GET /api/ready-made-inventories?page=1&limit=10
router.get("/:id", authenticate, getReadyMadeInventoryById); // GET /api/ready-made-inventories/:id
router.put("/:id", isAdminOrSubAdmin, upload.array('images', 5), updateReadyMadeInventory); // PUT /api/ready-made-inventories/:id
router.delete("/:id", isAdminOrSubAdmin, deleteReadyMadeInventory); // DELETE /api/ready-made-inventories/:id

export default router;

