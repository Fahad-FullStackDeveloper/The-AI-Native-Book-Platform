import React, { useState } from 'react';
import { useHistory } from '@docusaurus/router';
import Link from '@docusaurus/Link';
import { useAuth } from '../../contexts/AuthContext';
import BackgroundQuestions from './BackgroundQuestions';
import './Auth.css';

const SignUpForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showBackgroundQuestions, setShowBackgroundQuestions] = useState(false);
  const [backgroundData, setBackgroundData] = useState({
    backgroundSoftware: '',
    backgroundHardware: '',
    backgroundDescription: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const history = useHistory();

  const validatePassword = (password: string) => {
    // Password should be at least 8 characters with at least one uppercase, lowercase, and number
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    return hasMinLength && hasUpperCase && hasLowerCase && hasNumbers;
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (!validatePassword(password)) {
      return setError('Password must be at least 8 characters with uppercase, lowercase, and number');
    }

    // Show background questions after basic signup validation passes
    setShowBackgroundQuestions(true);
  };

  const handleBackgroundSubmit = async (backgroundInfo: {
    backgroundSoftware: string;
    backgroundHardware: string;
    backgroundDescription?: string;
  }) => {
    setBackgroundData(backgroundInfo);
    setLoading(true);

    try {
      // Call better-auth signup API with background data
      const response = await fetch('http://localhost:3001/api/auth/sign-up/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name: email.split('@')[0], // Use part of email as name if no name provided
          // Add background fields to the signup request
          backgroundSoftware: backgroundInfo.backgroundSoftware,
          backgroundHardware: backgroundInfo.backgroundHardware,
          backgroundDescription: backgroundInfo.backgroundDescription || null
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to create an account');
      }

      // Login after successful signup
      const loginResponse = await fetch('http://localhost:3001/api/auth/sign-in/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(loginData.error?.message || 'Failed to login after signup');
      }

      // Set the session in our auth context
      signup(data.user.email, loginData.session.id);

      setSuccess('Account created successfully! Redirecting...');

      // Redirect after a short delay to show success message
      setTimeout(() => {
        history.push('/');
      }, 1500);
    } catch (err: any) {
      setError(err.message);
      setShowBackgroundQuestions(false); // Go back to signup form on error
    }
    setLoading(false);
  };

  const handleBackgroundCancel = () => {
    setShowBackgroundQuestions(false);
  };

  if (showBackgroundQuestions) {
    return (
      <div className="auth-container">
        <div className="auth-form">
          <BackgroundQuestions
            onBackgroundSubmit={handleBackgroundSubmit}
            onCancel={handleBackgroundCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSignUpSubmit}>
        <h2 className="auth-title">Create Account</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <div style={{ position: 'relative' }}>
            <input
              type="email"
              id="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
            <span className="input-icon">📧</span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type="password"
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              required
              disabled={loading}
            />
            <span className="input-icon">🔒</span>
          </div>
          <small style={{ color: '#718096', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
            Must be at least 8 characters with uppercase, lowercase, and number
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type="password"
              id="confirmPassword"
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              disabled={loading}
            />
            <span className="input-icon">✅</span>
          </div>
        </div>

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? (
            <span>Creating Account...</span>
          ) : (
            <span>Sign Up Now</span>
          )}
        </button>

        <div className="auth-switch">
          Already have an account? <Link to="/login">Log In</Link>
        </div>
      </form>
    </div>
  );
};

export default SignUpForm;

