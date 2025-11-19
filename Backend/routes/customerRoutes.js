import { Router } from "express";
import { addCustomer, getCustomers, getCustomerById, updateCustomer, deleteCustomer } from "../controllers/customerController.js";
import { isAdminOrSubAdmin } from "../middleware/auth.js";

const router = Router();

// All routes require authentication
router.get("/", isAdminOrSubAdmin, getCustomers); // api/customers
router.get("/:id", isAdminOrSubAdmin, getCustomerById); // api/customers/:id
router.post("/", isAdminOrSubAdmin, addCustomer); // api/customers
router.put("/:id", isAdminOrSubAdmin, updateCustomer); // api/customers/:id
router.delete("/:id", isAdminOrSubAdmin, deleteCustomer); // api/customers/:id

export default router;

