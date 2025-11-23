import { Router } from "express";
import {
    addProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} from "../controllers/productController.js";
import { isAdminOrSubAdmin, authenticate } from "../middleware/auth.js";

const router = Router();

router.post("/", isAdminOrSubAdmin, addProduct); // POST /api/products
router.get("/", authenticate, getProducts); // GET /api/products
router.get("/:id", authenticate, getProductById); // GET /api/products/:id
router.put("/:id", isAdminOrSubAdmin, updateProduct); // PUT /api/products/:id
router.delete("/:id", isAdminOrSubAdmin, deleteProduct); // DELETE /api/products/:id

export default router;

