import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Login.css';


const Login = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const { login } = useContext(AuthContext);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to send OTP. Please check the email and try again.');
      }

      setIsOtpSent(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      if (!response.ok) {
        throw new Error('Invalid OTP. Please try again.');
      }

      const data = await response.json();
      if (data.accessToken) {
        login(data.accessToken);
      } else {
        throw new Error('Access token not received.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Two Six CMS</h1>
        {!isOtpSent ? (
          <form onSubmit={handleEmailSubmit}>
            <h2>Login</h2>
            <p>Enter your email to receive a login code.</p>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your-email@example.com" required />
            <button type="submit">Send Code</button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit}>
            <h2>Verify Code</h2>
            <p>A code has been sent to <strong>{email}</strong>. Please enter it below.</p>
            <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" required />
            <button type="submit">Verify & Login</button>
          </form>
        )}
        {error && <p className="login-error">{error}</p>}
      </div>
    </div>
  );
};

export default Login;