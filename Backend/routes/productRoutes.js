import { Router } from "express";
import {
    addProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} from "../controllers/productController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.post("/", addProduct); // POST /api/products
router.get("/", getProducts); // GET /api/products
router.get("/:id", getProductById); // GET /api/products/:id
router.put("/:id", updateProduct); // PUT /api/products/:id
router.delete("/:id", deleteProduct); // DELETE /api/products/:id

export default router;

