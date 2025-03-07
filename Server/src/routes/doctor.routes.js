import Router from "express";
import {
  dashboard,
  getDoctor,
  getDoctorsNearUser,
} from "../controller/doctor.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { isDoctor } from "../utils/helper.js";

const router = Router();

router.get("/getDoctor", getDoctor);
router.get("/getDoctorBycity", isAuthenticated, getDoctorsNearUser);
router.get("/", isAuthenticated, isDoctor, dashboard);

export default router;
