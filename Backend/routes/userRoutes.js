import { Router } from "express";
import { addUser, getUsers, getUserById, updateUser, deleteUser, login, getUserRoles, getMe, changePassword } from "../controllers/userController.js";
import { authenticate, isAdmin } from "../middleware/auth.js";

const router = Router();

router.post("/login", login); // api/users/login
router.get("/me", authenticate, getMe); // api/users/me (must be before /:id)
router.post("/change-password", authenticate, changePassword); // api/users/change-password
router.get("/roles", authenticate, getUserRoles); // api/users/roles (must be before /:id)
router.get("/", authenticate, getUsers); // api/users
router.get("/:id", authenticate, getUserById); // api/users/:id
router.post("/", authenticate, addUser); // api/users
router.put("/:id", authenticate, updateUser); // api/users/:id
router.delete("/:id", authenticate, deleteUser); // api/users/:id

export default router;

