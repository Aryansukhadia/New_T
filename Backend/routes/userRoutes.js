import { Router } from "express";
import { addUser, getUsers, getUserById, updateUser, deleteUser, login, createAdminBySuperAdmin } from "../controllers/userController.js";
import { isAdmin, isSuperAdmin } from "../middleware/auth.js";

const router = Router();

router.post("/login", login); // api/users/login
router.get("/", isAdmin, getUsers); // api/users
router.get("/:id", isAdmin, getUserById); // api/users/:id
router.post("/", isAdmin, addUser); // api/users
router.post("/create-admin", isSuperAdmin, createAdminBySuperAdmin); // api/users/superadmin/create-admin (SuperAdmin only)
router.put("/:id", isAdmin, updateUser); // api/users/:id
router.delete("/:id", isAdmin, deleteUser); // api/users/:id

export default router;

