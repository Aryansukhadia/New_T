import { Router } from "express";
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
import workPieceRoutes from "./workPieceRoutes.js";
import fabricInventoryRoutes from "./fabricInventoryRoutes.js";
import readyMadeInventoryRoutes from "./readyMadeInventoryRoutes.js";
import accessoryInventoryRoutes from "./accessoryInventoryRoutes.js";

const router = Router();
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
router.use("/workPieces", workPieceRoutes);

// Inventory Management Routes
router.use("/fabric-inventories", fabricInventoryRoutes);
router.use("/ready-made-inventories", readyMadeInventoryRoutes);
router.use("/accessory-inventories", accessoryInventoryRoutes);

export default router;