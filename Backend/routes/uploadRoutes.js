import { Router } from "express";
import {
    uploadImage,
    uploadMultipleImages,
    deleteImage,
    getUploadedImages
} from "../controllers/uploadController.js";
import { authenticate } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Upload single image
router.post("/", upload.single('image'), uploadImage);

// Upload multiple images
router.post("/multiple", upload.array('images', 10), uploadMultipleImages);

// Get all uploaded images
router.get("/", getUploadedImages);

// Delete image
router.delete("/:filename", deleteImage);

export default router;

