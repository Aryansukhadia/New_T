import { Router } from "express";
import {
    addItemStatus,
    getItemStatuses,
    getItemStatusById,
    updateItemStatus,
    deleteItemStatus,
} from "../controllers/itemStatusController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.post("/", addItemStatus); // POST /api/itemStatuses
router.get("/", getItemStatuses); // GET /api/itemStatuses?orderItemId=xxx&productItemId=xxx&status=cutting
router.get("/:id", getItemStatusById); // GET /api/itemStatuses/:id
router.put("/:id", updateItemStatus); // PUT /api/itemStatuses/:id
router.delete("/:id", deleteItemStatus); // DELETE /api/itemStatuses/:id

export default router;

