import { Router } from "express";
import { addProductItem, getProductItems, getProductItemById, updateProductItem, deleteProductItem } from "../controllers/productItemsController.js";
import { authenticate } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = Router();

router.use(authenticate);

router.post("/", upload.single('image'), addProductItem); // POST /api/productItems
router.get("/", getProductItems); // GET /api/productItems
router.get("/:id", getProductItemById); // GET /api/productItems/:id
router.put("/:id", upload.single('image'), updateProductItem); // PUT /api/productItems/:id
router.delete("/:id", deleteProductItem); // DELETE /api/productItems/:id

export default router;