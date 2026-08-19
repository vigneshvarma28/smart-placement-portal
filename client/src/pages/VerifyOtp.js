import { useState, useEffect } from "react";
import API from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialEmail = location.state?.email || sessionStorage.getItem("verifyEmail") || "";
  const [form, setForm] = useState({
    email: initialEmail,
    otp: "",
  });
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!form.email) {
      toast.warning("Please enter your registered email to verify your account.");
    }
  }, [form.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email) {
      toast.error("Email is required.");
      return;
    }
    if (!form.otp || form.otp.length !== 6) {
      toast.warning("Please enter the 6-digit OTP code.");
      return;
    }
    setLoading(true);

    try {
      const { data } = await API.post("/auth/verify-otp", {
        email: form.email.trim(),
        otp: form.otp.trim(),
      });
      sessionStorage.removeItem("verifyEmail");
      toast.success(data.msg || "Account Verified! Please Login.");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.msg || "Verification Failed. Check your OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!form.email) {
      toast.warning("Please enter your email first");
      return;
    }
    setResending(true);
    try {
      const { data } = await API.post("/auth/resend-otp", { email: form.email.trim() });
      toast.success(data.msg || "New OTP sent to your email!");
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>✅ Verify Account</h2>
        <p className="auth-subtitle">
          Enter the 6-digit OTP sent to <br />
          <strong style={{ color: 'var(--primary)', fontSize: '1rem' }}>{form.email || "your registered email"}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          {!initialEmail && (
            <input
              type="email"
              placeholder="Enter your registered email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              style={{ marginBottom: '15px' }}
            />
          )}

          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={form.otp}
            onChange={(e) => setForm({ ...form, otp: e.target.value })}
            required
            maxLength="6"
            autoFocus
            style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}
          />

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Verifying..." : "Verify & Login"}
          </button>

          <div style={{ textAlign: 'center', marginTop: '15px' }}>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || loading}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '0.88rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {resending ? "Sending New Code..." : "Didn't get the code? Resend OTP"}
            </button>
          </div>
        </form>

        <p className="auth-footer" style={{ marginTop: '20px' }}>
          <button className="auth-secondary-btn" onClick={() => navigate("/")}>
            Back to Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default VerifyOtp;
