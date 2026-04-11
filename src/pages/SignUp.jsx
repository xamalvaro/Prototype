import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp } from '../firebase/auth';
import { isUsernameTaken } from '../firebase/firestore';
import './SignIn.css';
import './SignUp.css';

function SignUp() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '');
    if (!/^[a-z0-9_]+$/.test(cleanUsername)) {
      setError('Username can only contain letters, numbers, and underscores.');
      return;
    }

    setLoading(true);
    try {
      const taken = await isUsernameTaken(cleanUsername);
      if (taken) {
        setError('That username is already taken.');
        setLoading(false);
        return;
      }
      await signUp(email, password, cleanUsername, displayName.trim());
      navigate('/');
    } catch (err) {
      setError(getAuthError(err.code));
    }
    setLoading(false);
  }

  function getAuthError(code) {
    switch (code) {
      case 'auth/email-already-in-use': return 'An account with this email already exists.';
      case 'auth/invalid-email': return 'Invalid email address.';
      case 'auth/weak-password': return 'Password is too weak.';
      default: return 'Sign up failed. Please try again.';
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">
        <div className="auth-card__logo">NEWSPACE</div>
        <h1 className="auth-card__heading">Create account</h1>
        <p className="auth-card__sub">Join the conversation</p>

        {error && <div className="auth-card__error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form__field">
            <label className="auth-form__label" htmlFor="signup-display">Display Name</label>
            <input
              id="signup-display"
              type="text"
              className="auth-form__input"
              placeholder="Your full name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>

          <div className="auth-form__field">
            <label className="auth-form__label" htmlFor="signup-username">Username</label>
            <input
              id="signup-username"
              type="text"
              className="auth-form__input"
              placeholder="cabo32"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <span className="auth-form__hint">Lowercase letters, numbers and underscores only</span>
          </div>

          <div className="auth-form__field">
            <label className="auth-form__label" htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              type="email"
              className="auth-form__input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-form__field">
            <label className="auth-form__label" htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              className="auth-form__input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="auth-form__field">
            <label className="auth-form__label" htmlFor="signup-confirm">Confirm Password</label>
            <input
              id="signup-confirm"
              type="password"
              className="auth-form__input"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-form__submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-card__switch">
          Already have an account?{' '}
          <Link to="/signin" className="auth-card__switch-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default SignUp;
