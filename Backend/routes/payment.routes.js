import express from "express";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { withdrawFunds } from "../controllers/payment.controller.js";
import { User } from "../models/user.model.js";

const router = express.Router();

router.post("/withdraw", isAuthenticated, withdrawFunds);

// Temporary test route to top up balance
router.post("/topup", isAuthenticated, async (req, res) => {
  const user = await User.findById(req.id);
  user.walletBalance = (user.walletBalance || 0) + 150;
  await user.save();
  res.json({ success: true, balance: user.walletBalance });
});

export default router;
