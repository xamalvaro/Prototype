import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signIn } from '../firebase/auth';
import './SignIn.css';

function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/');
    } catch (err) {
      setError(getAuthError(err.code));
    }
    setLoading(false);
  }

  function getAuthError(code) {
    switch (code) {
      case 'auth/user-not-found': return 'No account found with this email.';
      case 'auth/wrong-password': return 'Incorrect password.';
      case 'auth/invalid-email': return 'Invalid email address.';
      case 'auth/too-many-requests': return 'Too many attempts. Try again later.';
      case 'auth/invalid-credential': return 'Invalid email or password.';
      default: return 'Sign in failed. Please try again.';
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-stars"></div>
      <div className="auth-deco">✦ ✦ ✦</div>
      <div className="auth-card">
        <div className="auth-card__logo">PULSAR</div>
        <p className="auth-card__tagline">[ CONNECT • SHARE • EXPLORE ]<span className="blink-cursor">_</span></p>
        <h1 className="auth-card__heading">Welcome back</h1>
        <p className="auth-card__sub">Sign in to your account</p>

        {error && <div className="auth-card__error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form__field">
            <label className="auth-form__label" htmlFor="signin-email">Email</label>
            <input
              id="signin-email"
              type="email"
              className="auth-form__input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-form__field">
            <label className="auth-form__label" htmlFor="signin-password">Password</label>
            <input
              id="signin-password"
              type="password"
              className="auth-form__input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-form__submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-card__switch">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="auth-card__switch-link">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default SignIn;
