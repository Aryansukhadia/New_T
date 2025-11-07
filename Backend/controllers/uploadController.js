import sendResponse from "../utils/response.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Upload single image
 * POST /api/upload
 */
export const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return sendResponse(res, 400, "No file uploaded");
        }

        // Return the filename and URL
        const imageUrl = `http://localhost:3000/uploads/${req.file.filename}`;

        return sendResponse(res, 201, "Image uploaded successfully", {
            filename: req.file.filename,
            imageUrl: imageUrl,
            originalName: req.file.originalname,
            size: req.file.size,
            mimeType: req.file.mimetype
        });
    } catch (error) {
        console.error("uploadImage error:", error);
        return sendResponse(res, 500, "Failed to upload image", { error: error.message });
    }
};

/**
 * Upload multiple images
 * POST /api/upload/multiple
 */
export const uploadMultipleImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return sendResponse(res, 400, "No files uploaded");
        }

        const uploadedFiles = req.files.map(file => ({
            filename: file.filename,
            imageUrl: `http://localhost:3000/uploads/${file.filename}`,
            originalName: file.originalname,
            size: file.size,
            mimeType: file.mimetype
        }));

        return sendResponse(res, 201, "Images uploaded successfully", uploadedFiles);
    } catch (error) {
        console.error("uploadMultipleImages error:", error);
        return sendResponse(res, 500, "Failed to upload images", { error: error.message });
    }
};

/**
 * Delete image
 * DELETE /api/upload/:filename
 */
export const deleteImage = async (req, res) => {
    try {
        const { filename } = req.params;

        if (!filename) {
            return sendResponse(res, 400, "Filename is required");
        }

        const uploadsDir = path.join(__dirname, '..', 'uploads');
        const filePath = path.join(uploadsDir, filename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return sendResponse(res, 404, "Image not found");
        }

        // Delete the file
        fs.unlinkSync(filePath);

        return sendResponse(res, 200, "Image deleted successfully");
    } catch (error) {
        console.error("deleteImage error:", error);
        return sendResponse(res, 500, "Failed to delete image", { error: error.message });
    }
};

/**
 * Get all uploaded images
 * GET /api/upload
 */
export const getUploadedImages = async (req, res) => {
    try {
        const uploadsDir = path.join(__dirname, '..', 'uploads');

        // Check if uploads directory exists
        if (!fs.existsSync(uploadsDir)) {
            return sendResponse(res, 200, "No images found", []);
        }

        // Read all files from uploads directory
        const files = fs.readdirSync(uploadsDir);

        const images = files
            .filter(file => {
                const ext = path.extname(file).toLowerCase();
                return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
            })
            .map(file => {
                const filePath = path.join(uploadsDir, file);
                const stats = fs.statSync(filePath);

                return {
                    filename: file,
                    imageUrl: `http://localhost:3000/uploads/${file}`,
                    size: stats.size,
                    createdAt: stats.birthtime,
                    modifiedAt: stats.mtime
                };
            });

        return sendResponse(res, 200, "Images fetched successfully", images);
    } catch (error) {
        console.error("getUploadedImages error:", error);
        return sendResponse(res, 500, "Failed to fetch images", { error: error.message });
    }
};

