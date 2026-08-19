const express = require("express");
const router = express.Router();

// const { register, login } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const User = require("../models/User");
const { 
  register, 
  login, 
  verifyOtp, 
  resendOtp, 
  forgotPassword, 
  resetPassword 
} = require("../controllers/authController");

/* Register */
router.post("/register", register);

/* Resend OTP */
router.post("/resend-otp", resendOtp);

/* Verify OTP */
router.post("/verify-otp", verifyOtp);

/* Forgot Password - Send Reset Code */
router.post("/forgot-password", forgotPassword);

/* Reset Password */
router.post("/reset-password", resetPassword);

/* Login */
router.post("/login", login);

/* Get Logged-in User (Profile) */
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;