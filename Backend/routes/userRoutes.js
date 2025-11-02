import { Router } from "express";
import { addUser, getUsers, getUserById, updateUser, deleteUser, login } from "../controllers/userController.js";

const router = Router();

router.post("/login", login); // api/users/login
router.get("/", getUsers); // api/users
router.get("/:id", getUserById); // api/users/:id
router.post("/", addUser); // api/users
router.put("/:id", updateUser); // api/users/:id
router.delete("/:id", deleteUser); // api/users/:id

export default router;

