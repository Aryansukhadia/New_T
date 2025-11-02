import { Router } from "express";
import roleRoutes from "./roleRoutes.js";
import userRoutes from "./userRoutes.js";

const router = Router();

router.use("/roles", roleRoutes);
router.use("/users", userRoutes);

export default router;


