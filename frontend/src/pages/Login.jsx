import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

function AuthShell({ children }) {
  return (
    <div className="app-shell" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="card" style={{ maxWidth: 420, width: '100%' }}>
        <div className="card-header">
          <div>
            <h1 className="card-title" style={{ fontSize: '1.5rem' }}>
              Customer Intelligence Portal
            </h1>
            <p className="card-subtitle">Sign in to orchestrate insight-driven decisions.</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, authLoading, error } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [formError, setFormError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);

    if (!form.email || !form.password) {
      setFormError('Email and password are required.');
      return;
    }

    try {
      await login({ email: form.email, password: form.password });
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Unable to sign in';
      setFormError(message);
    }
  };

  return (
    <AuthShell>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <span>Email address</span>
          <input
            type="email"
            name="email"
            placeholder="you@company.com"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <span>Password</span>
          <input
            type="password"
            name="password"
            placeholder="Enter secure password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
          />
        </label>

        {(formError || error) && (
          <div className="alert alert-danger" role="alert">
            {formError || error}
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={authLoading}>
          {authLoading ? 'Authenticating…' : 'Sign in'}
        </button>
      </form>

      <p className="notice" style={{ marginTop: '1rem' }}>
        Assalamu alaikum. Our platform upholds halal privacy principles. Only share customer data that you have
        explicit permission to process, and ensure all sensitive identifiers are removed before submitting queries.
      </p>

      <p className="notice" style={{ marginTop: '1rem' }}>
        New to the platform? <Link to="/register">Create an account</Link>
      </p>
    </AuthShell>
  );
}
