const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendEmail, sendResetPasswordEmail } = require("../utils/sendEmail");
const logger = require("../config/logger");

/* ================= REGISTER ================= */
exports.register = async (req, res) => {
  try {
    const { name, username, email, password, role, skills = [] } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ msg: "Password must be at least 6 characters long" });
    }

    const lowerEmail = email.toLowerCase();
    const lowerUsername = (username || email.split("@")[0]).toLowerCase();

    const existingUser = await User.findOne({ $or: [{ email: lowerEmail }, { username: lowerUsername }] });
    if (existingUser) {
      if (!existingUser.isVerified) {
        // If not verified yet, update OTP and allow them to verify
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        existingUser.otp = newOtp;
        existingUser.otpExpiry = Date.now() + 5 * 60 * 1000;
        await existingUser.save();
        const emailRes = await sendEmail(lowerEmail, newOtp);
        if (!emailRes.success) {
          return res.status(500).json({ 
            msg: "Failed to send verification email. Please ensure the email sender is properly configured." 
          });
        }
        return res.json({ 
          msg: "Account exists but is unverified. Verification OTP sent to your email!", 
          email: lowerEmail 
        });
      }
      return res.status(400).json({ msg: "User or Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await User.create({
      name,
      username: lowerUsername,
      email: lowerEmail,
      password: hashedPassword,
      role: role || "student",
      skills: Array.isArray(skills) ? skills : [],
      otp,
      otpExpiry: Date.now() + 5 * 60 * 1000,
      isVerified: false,
    });

    const emailRes = await sendEmail(lowerEmail, otp);

    if (!emailRes.success) {
      return res.status(500).json({ 
        msg: "Failed to send OTP to your email. Please ensure the email sender is properly configured." 
      });
    }

    res.json({ 
      msg: "OTP sent to your email! Please check your inbox.", 
      email: lowerEmail 
    });

  } catch (error) {
    logger.error(`Registration Error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

/* ================= RESEND OTP ================= */
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = newOtp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    const emailRes = await sendEmail(user.email, newOtp);

    if (!emailRes.success) {
      return res.status(500).json({ 
        msg: "Failed to send verification email. Please check server email configuration." 
      });
    }

    res.json({ 
      msg: "New verification OTP sent to your email! Please check your inbox.",
      email: user.email
    });
  } catch (error) {
    logger.error(`Resend OTP Error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

/* ================= VERIFY OTP ================= */
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user)
      return res.status(404).json({ msg: "User not found" });

    if (user.otp !== otp)
      return res.status(400).json({ msg: "Invalid OTP. Please enter the correct 6-digit code." });

    if (user.otpExpiry < Date.now())
      return res.status(400).json({ msg: "OTP expired. Please request a new one." });

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    res.json({ msg: "Email verified successfully! You can now log in." });

  } catch (error) {
    logger.error(`Verify OTP Error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

/* ================= LOGIN ================= */
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({
      $or: [
        { email: { $regex: `^${identifier}$`, $options: 'i' } },
        { username: { $regex: `^${identifier}$`, $options: 'i' } }
      ]
    });

    if (!user)
      return res.status(400).json({ msg: "Invalid credentials" });

    // 🔥 VERY IMPORTANT CHECK
    if (!user.isVerified)
      return res.status(400).json({ msg: "Please verify your email first", unverified: true, email: user.email });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, role: user.role });

  } catch (error) {
    logger.error(`Login Error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

/* ================= FORGOT PASSWORD ================= */
exports.forgotPassword = async (req, res) => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({ msg: "Please enter your username or registered email" });
    }

    const user = await User.findOne({
      $or: [
        { email: { $regex: `^${identifier.trim()}$`, $options: 'i' } },
        { username: { $regex: `^${identifier.trim()}$`, $options: 'i' } }
      ]
    });

    if (!user) {
      return res.status(404).json({ msg: "No account found with this email or username" });
    }

    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = resetOtp;
    user.resetOtpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes valid
    await user.save();

    const emailRes = await sendResetPasswordEmail(user.email, resetOtp);

    if (!emailRes.success) {
      return res.status(500).json({ 
        msg: "Failed to send password reset email. Please ensure the email service is properly configured." 
      });
    }

    res.json({
      msg: "Password reset code sent to your email! Please check your inbox.",
      email: user.email
    });

  } catch (error) {
    logger.error(`Forgot Password Error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

/* ================= RESET PASSWORD ================= */
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ msg: "Please provide your email, reset code, and new password" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ msg: "New password must be at least 6 characters long" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (!user.resetOtp || user.resetOtp !== otp) {
      return res.status(400).json({ msg: "Invalid or expired reset code" });
    }

    if (!user.resetOtpExpiry || user.resetOtpExpiry < Date.now()) {
      return res.status(400).json({ msg: "Reset code has expired. Please request a new code." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    // Also ensure account is verified if they successfully reset password
    user.isVerified = true;
    await user.save();

    res.json({ msg: "Password has been reset successfully! You can now log in." });

  } catch (error) {
    logger.error(`Reset Password Error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};
