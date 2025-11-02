import { Router } from "express";
import { addUser, getUsers, getUserById, updateUser, deleteUser, login, createUserByAdmin } from "../controllers/userController.js";
import { isAdmin } from "../middleware/auth.js";

const router = Router();

router.post("/login", login); // api/users/login
router.get("/", getUsers); // api/users
router.get("/:id", getUserById); // api/users/:id
router.post("/", addUser); // api/users
router.post("/admin/create", isAdmin, createUserByAdmin); // api/users/admin/create (Admin only)
router.put("/:id", updateUser); // api/users/:id
router.delete("/:id", deleteUser); // api/users/:id

export default router;

