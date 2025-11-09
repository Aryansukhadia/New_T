import { Router } from "express";
import roleRoutes from "./roleRoutes.js";
import userRoutes from "./userRoutes.js";
import customerRoutes from "./customerRoutes.js";
import measurementRoutes from "./measurementRoutes.js";
import productRoutes from "./productRoutes.js";
import productVariantRoutes from "./productVariantRoutes.js";
import productItemRoutes from "./productItemRoutes.js";
import itemStatusRoutes from "./itemStatusRoutes.js";
import itemStagePhotoRoutes from "./itemStagePhotoRoutes.js";
import uploadRoutes from "./uploadRoutes.js";
import productOrderRoutes from "./productOrderRoutes.js";

const router = Router();

router.use("/roles", roleRoutes);
router.use("/users", userRoutes);
router.use("/measurements", measurementRoutes);
router.use("/customers", customerRoutes);

// Upload Routes
router.use("/upload", uploadRoutes);

// Product Management Routes
router.use("/products", productRoutes);
router.use("/productVariants", productVariantRoutes);
router.use("/productItems", productItemRoutes);
router.use("/itemStatuses", itemStatusRoutes);
router.use("/itemStagePhotos", itemStagePhotoRoutes);

// Order Management Routes
router.use("/productOrders", productOrderRoutes);

export default router;


