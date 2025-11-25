import { Router } from "express";
import {
    addFabricInventory,
    getFabricInventories,
    getFabricInventoryById,
    updateFabricInventory,
    deleteFabricInventory,
} from "../controllers/fabricInventoryController.js";
import { isAdminOrSubAdmin, authenticate } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = Router();

router.post("/", isAdminOrSubAdmin, upload.array('images', 5), addFabricInventory); // POST /api/fabric-inventories
router.get("/", authenticate, getFabricInventories); // GET /api/fabric-inventories?page=1&limit=10
router.get("/:id", authenticate, getFabricInventoryById); // GET /api/fabric-inventories/:id
router.put("/:id", isAdminOrSubAdmin, upload.array('images', 5), updateFabricInventory); // PUT /api/fabric-inventories/:id
router.delete("/:id", isAdminOrSubAdmin, deleteFabricInventory); // DELETE /api/fabric-inventories/:id

export default router;

