import { Router } from "express";

import {
  createUser,
  getUser,
  logout,
  ping,
} from "../controller/user.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", createUser);

router.post("/login", getUser);

router.get("/logout", isAuthenticated, logout);

router.get("/ping", isAuthenticated, ping);

export default router;
