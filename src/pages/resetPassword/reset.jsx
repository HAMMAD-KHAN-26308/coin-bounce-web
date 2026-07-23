import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./reset.module.css";
import { resetPassword, verifyResetToken } from "../../api/internal";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [tokenValid, setTokenValid] = useState(false);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tokenFromUrl = queryParams.get("token");

    if (!tokenFromUrl) {
      setError("No reset token was provided in the link.");
      setVerifying(false);
      return;
    }

    setToken(tokenFromUrl);
    verifyToken(tokenFromUrl);
  }, [location.search]);

  const verifyToken = async (tokenFromUrl) => {
    try {
      const response = await verifyResetToken(tokenFromUrl);
      if (response.success === false) {
        setError(response.message || "Invalid or expired reset link.");
      } else if (response.data?.success) {
        setTokenValid(true);
      }
    } catch (err) {
      setError("Invalid or expired reset link.");
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      const response = await resetPassword({ token, newPassword, confirmPassword });
      if (response.success === false) {
        setError(response.message || "Something went wrong. Please try again.");
      } else {
        setMessage(response.data?.message || "Your password has been updated successfully.");
        setTimeout(() => navigate("/login"), 2500);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.badge}>Checking link</div>
          <h2 className={styles.title}>Verifying your reset link</h2>
          <p className={styles.description}>Please wait while we validate your secure reset link.</p>
        </div>
      </div>
    );
  }

  if (error && !tokenValid) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.error}>{error}</div>
          <button className={styles.button} onClick={() => navigate("/forgot-password")}>
            Request a new reset link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.badge}>Create a new password</div>
        <h2 className={styles.title}>Reset your password</h2>
        <p className={styles.description}>Choose a strong password to secure your account.</p>

        {message && <div className={styles.success}>{message}</div>}
        {error && <div className={styles.error}>{error}</div>}

        {tokenValid && (
          <form onSubmit={handleSubmit} className={styles.form}>
            <label className={styles.label} htmlFor="newPassword">New password</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter a new password"
              className={styles.input}
              required
            />

            <label className={styles.label} htmlFor="confirmPassword">Confirm password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              className={styles.input}
              required
            />

            <button type="submit" disabled={loading} className={styles.button}>
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
