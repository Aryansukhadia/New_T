import { Router } from "express";
import {
    addProductVariant,
    getProductVariants,
    getProductVariantById,
    updateProductVariant,
    deleteProductVariant,
    addProductItemsToVariant,
    removeProductItemsFromVariant,
} from "../controllers/productVariantController.js";
import { isAdminOrSubAdmin, authenticate } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = Router();

router.post("/", isAdminOrSubAdmin, upload.array('images', 5), addProductVariant); // POST /api/productVariants
router.get("/", authenticate, getProductVariants); // GET /api/productVariants?productId=xxx
router.get("/:id", authenticate, getProductVariantById); // GET /api/productVariants/:id
router.put("/:id", isAdminOrSubAdmin, upload.array('images', 5), updateProductVariant); // PUT /api/productVariants/:id
router.post("/:id/productItems", isAdminOrSubAdmin, addProductItemsToVariant); // POST /api/productVariants/:id/productItems
router.delete("/:id/productItems", isAdminOrSubAdmin, removeProductItemsFromVariant); // DELETE /api/productVariants/:id/productItems
router.delete("/:id", isAdminOrSubAdmin, deleteProductVariant); // DELETE /api/productVariants/:id

export default router;

