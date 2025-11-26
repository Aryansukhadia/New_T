import { Router } from "express";
import {
    addAccessoryInventory,
    getAccessoryInventories,
    getAccessoryInventoryById,
    updateAccessoryInventory,
    deleteAccessoryInventory,
} from "../controllers/accessoryInventoryController.js";
import { isAdminOrSubAdmin, authenticate } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = Router();

router.post("/", isAdminOrSubAdmin, upload.array('images', 5), addAccessoryInventory); // POST /api/accessory-inventories
router.get("/", authenticate, getAccessoryInventories); // GET /api/accessory-inventories?page=1&limit=10
router.get("/:id", authenticate, getAccessoryInventoryById); // GET /api/accessory-inventories/:id
router.put("/:id", isAdminOrSubAdmin, upload.array('images', 5), updateAccessoryInventory); // PUT /api/accessory-inventories/:id
router.delete("/:id", isAdminOrSubAdmin, deleteAccessoryInventory); // DELETE /api/accessory-inventories/:id

export default router;

