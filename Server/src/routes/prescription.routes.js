import { Router } from "express";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import {
  newPrescription,
  getPrescriptionById,
  listPrescription,
} from "../controller/prescription.controller.js";
import { isDoctor, isPatient } from "../utils/helper.js";

const router = Router();

router.post("/", isAuthenticated, isDoctor, newPrescription);

router.get("/", isAuthenticated,  listPrescription);

router.get("/:id", isAuthenticated,getPrescriptionById );

export default router;
