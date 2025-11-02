import { Router } from "express";
import roleRoutes from "./roleRoutes.js";
import userRoutes from "./userRoutes.js";
import customerRoutes from "./customerRoutes.js";

const router = Router();

router.use("/roles", roleRoutes);
router.use("/users", userRoutes);
router.use("/customers", customerRoutes);

export default router;


