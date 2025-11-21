import fs from "fs";
import path from "path";

/**
 * Deletes uploaded files from the server
 * @param {Array} files - Array of uploaded files from multer (req.files)
 */
export const deleteUploadedFiles = (files) => {
    if (files && files.length > 0) {
        files.forEach(file => {
            const filePath = path.join(process.cwd(), 'uploads', file.filename);
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(`Failed to delete file ${file.filename}:`, err);
                }
            });
        });
    }
};

/**
 * Processes uploaded images and returns a JSON string of image URLs
 * @param {Array} files - Array of uploaded files from multer (req.files)
 * @param {string} baseUrl - Base URL for the server (e.g., "http://localhost:3000")
 * @returns {string|null} - JSON string of image URLs or null if no files
 */
export const processUploadedImages = (files, baseUrl = "http://localhost:3000") => {
    if (files && files.length > 0) {
        const imageUrls = files.map(file => `${baseUrl}/uploads/${file.filename}`);
        return JSON.stringify(imageUrls);
    }
    return null;
};

/**
 * Processes image URL input and normalizes it to JSON array format
 * @param {string} imageUrl - Image URL string (can be single URL or JSON array string)
 * @returns {string|null} - JSON string of image URLs array or null
 */
export const processImageUrlInput = (imageUrl) => {
    if (!imageUrl || typeof imageUrl !== "string" || imageUrl.trim() === "") {
        return null;
    }

    try {
        const parsed = JSON.parse(imageUrl);
        if (Array.isArray(parsed)) {
            return imageUrl.trim();
        } else {
            return JSON.stringify([imageUrl.trim()]);
        }
    } catch {
        return JSON.stringify([imageUrl.trim()]);
    }
};

/**
 * Handles image upload logic - prioritizes uploaded files, falls back to URL input
 * @param {Array} files - Array of uploaded files from multer (req.files)
 * @param {string} imageUrl - Image URL string from request body
 * @param {string} existingImageUrl - Existing image URL to keep if no new images provided
 * @param {string} baseUrl - Base URL for the server
 * @returns {string|null} - Final image URL(s) as JSON string or null
 */
export const handleImageUpload = (files, imageUrl, existingImageUrl = null, baseUrl = "http://localhost:3000") => {
    // Priority 1: Uploaded files
    if (files && files.length > 0) {
        return processUploadedImages(files, baseUrl);
    }

    // Priority 2: Provided URL
    if (imageUrl !== undefined) {
        return processImageUrlInput(imageUrl);
    }

    // Priority 3: Keep existing
    return existingImageUrl;
};

