import { Router } from "express";
import { addProductItem, getProductItems, getProductItemById, updateProductItem, deleteProductItem } from "../controllers/productItemsController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.post("/", addProductItem); // POST /api/productItems
router.get("/", getProductItems); // GET /api/productItems
router.get("/:id", getProductItemById); // GET /api/productItems/:id
router.put("/:id", updateProductItem); // PUT /api/productItems/:id
router.delete("/:id", deleteProductItem); // DELETE /api/productItems/:id

export default router;