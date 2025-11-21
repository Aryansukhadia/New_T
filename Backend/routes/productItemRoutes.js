import { Router } from "express";
import { addProductItem, getProductItems, getProductItemById, updateProductItem, deleteProductItem } from "../controllers/productItemsController.js";
import { isAdminOrSubAdmin } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = Router();

router.post("/", isAdminOrSubAdmin, upload.array('images', 5), addProductItem); // POST /api/productItems
router.get("/", getProductItems); // GET /api/productItems
router.get("/:id", getProductItemById); // GET /api/productItems/:id
router.put("/:id", isAdminOrSubAdmin, upload.array('images', 5), updateProductItem); // PUT /api/productItems/:id
router.delete("/:id", isAdminOrSubAdmin, deleteProductItem); // DELETE /api/productItems/:id

export default router;