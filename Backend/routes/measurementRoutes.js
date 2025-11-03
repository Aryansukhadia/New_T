import { Router } from "express";
import { addUserMeasurements, editMeasurement, getCustomerMeasurements } from "../controllers/measurementController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// All routes require authentication
router.post("/", authenticate, addUserMeasurements); // api/measurements
router.put("/", authenticate, editMeasurement); // api/measurements 
router.get("/:customerId", authenticate, getCustomerMeasurements); // api/measurements/:customerId

export default router;

