import express from "express";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { getNotifications, markAsRead, markMessageAsRead } from "../controllers/notification.controller.js";

const router = express.Router();

router.route("/").get(isAuthenticated, getNotifications);
router.route("/read").post(isAuthenticated, markAsRead);
router.route("/read/message/:id").post(isAuthenticated, markMessageAsRead);

export default router;
