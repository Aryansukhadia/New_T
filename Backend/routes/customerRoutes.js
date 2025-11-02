import { Router } from "express";
import { addCustomer, getCustomers, getCustomerById, updateCustomer, deleteCustomer } from "../controllers/customerController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// All routes require authentication
router.get("/", authenticate, getCustomers); // api/customers
router.get("/:id", authenticate, getCustomerById); // api/customers/:id
router.post("/", authenticate, addCustomer); // api/customers
router.put("/:id", authenticate, updateCustomer); // api/customers/:id
router.delete("/:id", authenticate, deleteCustomer); // api/customers/:id

export default router;

