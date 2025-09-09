import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import "./forgot-password.scss";

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await forgotPassword(email);
      setMessage("Check your email for password reset instructions.");
    } catch (err) {
      console.error("Forgot password error:", err);
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email address.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many requests. Please try again later.");
      } else {
        setError("Failed to send password reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <form className="forgot-password-form" onSubmit={handleSubmit}>
        <h2>Reset Password</h2>
        <p className="forgot-password-subtitle">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {error && <div className="error">{error}</div>}
       // In ForgotPassword.jsx, add this message
{message && (
  <div className="success">
    <p>✅ Password reset email sent!</p>
    <p><strong>Check your inbox</strong> (and spam folder) for the reset link.</p>
    <p>If you don't see it, try adding <code>noreply@firebase.com</code> to your contacts.</p>
  </div>
)}

        <div className="input-group">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading} className={loading ? "loading" : ""}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <div className="divider">
          <span>or</span>
        </div>

        <p className="back-to-login">
          Remember your password? <Link to="/login">Back to Login</Link>
        </p>
      </form>
    </div>
  );
};

export default ForgotPassword;
