import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Enter OTP & New Password
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Step 1: Submit email / username to receive reset code
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast.warning("Please enter your email or username");
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post("/auth/forgot-password", { identifier: identifier.trim() });
      setEmail(data.email);
      toast.success(data.msg || "Password reset code sent to your email!");
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to send reset code. Check your input.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit OTP and new password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.warning("Please enter the 6-digit reset code");
      return;
    }

    if (newPassword.length < 6) {
      toast.warning("Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post("/auth/reset-password", {
        email,
        otp: otp.trim(),
        newPassword,
      });

      toast.success(data.msg || "Password reset successful! Please log in.");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to reset password. Please check your OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Resend reset code
  const handleResend = async () => {
    if (!identifier && !email) return;
    setLoading(true);
    try {
      const { data } = await API.post("/auth/forgot-password", { identifier: identifier || email });
      toast.success(data.msg || "A new reset code has been sent to your email!");
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>🔒 Reset Password</h2>
        <p className="auth-subtitle">
          {step === 1 
            ? "Enter your account email or username to receive a reset code"
            : `Enter the 6-digit code sent to ${email}`}
        </p>

        {step === 1 ? (
          <form onSubmit={handleRequestOtp}>
            <input
              type="text"
              placeholder="Username or Registered Email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              autoFocus
            />

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Sending Reset Code..." : "Send Reset Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <input
              type="text"
              placeholder="Enter 6-digit Code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength="6"
              style={{ letterSpacing: '6px', textAlign: 'center', fontSize: '1.3rem', fontWeight: 'bold' }}
              autoFocus
            />

            <div style={{ position: 'relative', marginBottom: '15px' }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                style={{ marginBottom: 0, paddingRight: '45px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  color: 'var(--primary)',
                  padding: '5px'
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Resetting Password..." : "Change Password"}
            </button>

            <div style={{ textAlign: 'center', marginTop: '15px' }}>
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Didn't receive code? Resend
              </button>
            </div>
          </form>
        )}

        <p className="auth-footer" style={{ marginTop: '25px' }}>
          Remember your password?{" "}
          <button className="auth-secondary-btn" onClick={() => navigate("/")}>
            Back to Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
