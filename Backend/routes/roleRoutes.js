import { Router } from "express";
import { addRole, getRoles, getRoleById, updateRole, deleteRole } from "../controllers/roleController.js";

const router = Router();

router.get("/", getRoles);
router.get("/:id", getRoleById);
router.post("/", addRole);
router.put("/:id", updateRole);
router.delete("/:id", deleteRole);

export default router;


