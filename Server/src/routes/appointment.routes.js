import { Router } from "express";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { isDoctor, isPatient } from "../utils/helper.js";
import {
  approveAppointment,
  createAppointment,
  deleteAppointment,
  getAllAppointments,
  updateAppointment,
  declineAppointment,
  joinAppointment,
  getAllPatientAppointments,
} from "../controller/appointment.controller.js";

const router = Router();

router.get("/", isAuthenticated,isPatient, getAllAppointments);
router.get("/appointments", isAuthenticated, isDoctor, getAllPatientAppointments);
router.post("/", isAuthenticated, isPatient, createAppointment);
router.put("/:id", isAuthenticated, updateAppointment);
router.delete("/:id", isAuthenticated, isPatient, deleteAppointment);
router.put("/approve/:id", isAuthenticated, isDoctor, approveAppointment);
router.put("/decline/:id", isAuthenticated, isDoctor, declineAppointment);
// router.get("/:id", isAuthenticated, getAppointmentById);
router.get("/join/:id", isAuthenticated, joinAppointment);

export default router;
