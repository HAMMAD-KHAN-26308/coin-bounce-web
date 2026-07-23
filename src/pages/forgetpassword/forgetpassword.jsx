import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './forgetpassword.module.css';
import { forgotPassword } from '../../api/internal';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      setLoading(false);
      return;
    }

    try {
      const response = await forgotPassword(email.trim());
      if (response.success === false) {
        setError(response.message || 'Unable to send reset link right now.');
      } else {
        setMessage(response.data?.message || 'If an account exists, a reset link has been sent.');
        setEmail('');
      }
    } catch (err) {
      setError('Unable to send reset link right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.badge}>Secure recovery</div>
        <h2 className={styles.title}>Forgot your password?</h2>
        <p className={styles.description}>
          Enter the email connected to your CoinBounce account and we will send you a secure reset link.
        </p>

        {message && <div className={styles.success}>{message}</div>}
        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label} htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className={styles.input}
            required
          />

          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <p className={styles.footer}>
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;