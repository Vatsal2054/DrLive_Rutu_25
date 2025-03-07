import { Router } from "express";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { deleteMessage, getChat, sendMessage } from "../controller/chat.controller.js";

const router = Router();

router.get("/", isAuthenticated, getChat);
router.post("/send", isAuthenticated, sendMessage);
router.delete("/delete/:id", isAuthenticated,deleteMessage);


export default router;