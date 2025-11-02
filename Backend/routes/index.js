import { Router } from "express";
import roleRoutes from "./roleRoutes.js";

const router = Router();

router.use("/roles", roleRoutes);

export default router;


