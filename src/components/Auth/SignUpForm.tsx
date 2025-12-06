import React, { useState } from 'react';
import Link from '@docusaurus/Link';
import { auth, googleProvider } from '../../firebase/config';
import GoogleIcon from './GoogleIcon'; // Assuming you will create this component
import './Auth.css';

const SignUpForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    setError('');
    setLoading(true);
    try {
      await auth.createUserWithEmailAndPassword(email, password);
      window.location.href = '/';
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setLoading(true);
    try {
      await auth.signInWithPopup(googleProvider);
      window.location.href = '/';
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2 className="auth-title">Create Account</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            className="form-control"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Creating...' : 'Sign Up'}
        </button>
        <div className="divider">OR</div>
        <button
          type="button"
          className="auth-button google-auth-button"
          onClick={handleGoogleSignUp}
          disabled={loading}
        >
          <GoogleIcon />
          <span>Sign Up with Google</span>
        </button>
        <div className="auth-switch">
          Already have an account? <Link to="/login">Log In</Link>
        </div>
      </form>
    </div>
  );
};

export default SignUpForm;
