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
import { authenticate } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = Router();

router.use(authenticate);

router.post("/", upload.single('photo'), addProductVariant); // POST /api/productVariants
router.get("/", getProductVariants); // GET /api/productVariants?productId=xxx
router.get("/:id", getProductVariantById); // GET /api/productVariants/:id
router.put("/:id", upload.single('photo'), updateProductVariant); // PUT /api/productVariants/:id
router.post("/:id/productItems", addProductItemsToVariant); // POST /api/productVariants/:id/productItems
router.delete("/:id/productItems", removeProductItemsFromVariant); // DELETE /api/productVariants/:id/productItems
router.delete("/:id", deleteProductVariant); // DELETE /api/productVariants/:id

export default router;

