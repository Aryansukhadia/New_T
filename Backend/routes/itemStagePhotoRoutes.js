import { Router } from "express";
import {
    addItemStagePhoto,
    getItemStagePhotos,
    getItemStagePhotoById,
    updateItemStagePhoto,
    deleteItemStagePhoto,
} from "../controllers/itemStagePhotoController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.post("/", addItemStagePhoto); // POST /api/itemStagePhotos
router.get("/", getItemStagePhotos); // GET /api/itemStagePhotos?itemStatusId=xxx
router.get("/:id", getItemStagePhotoById); // GET /api/itemStagePhotos/:id
router.put("/:id", updateItemStagePhoto); // PUT /api/itemStagePhotos/:id
router.delete("/:id", deleteItemStagePhoto); // DELETE /api/itemStagePhotos/:id

export default router;

