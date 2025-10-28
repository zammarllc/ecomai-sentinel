import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

function AuthShell({ children }) {
  return (
    <div className="app-shell" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="card" style={{ maxWidth: 460, width: '100%' }}>
        <div className="card-header">
          <div>
            <h1 className="card-title" style={{ fontSize: '1.5rem' }}>
              Begin Your Insights Journey
            </h1>
            <p className="card-subtitle">
              Register to unlock privacy-aligned analytics for your customer experience team.
            </p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function Register() {
  const { register, authLoading, error } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    company: ''
  });
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!form.email || !form.password || !form.name) {
      setFormError('Name, email, and password are required.');
      return;
    }

    try {
      const response = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        company: form.company || undefined
      });

      if (response?.token) {
        navigate('/', { replace: true });
        return;
      }

      setSuccessMessage('Registration successful. Please sign in with your new credentials.');
      setTimeout(() => navigate('/login', { replace: true }), 1500);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Unable to register account';
      setFormError(message);
    }
  };

  return (
    <AuthShell>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <span>Full name</span>
          <input
            type="text"
            name="name"
            placeholder="Fatima Al Zahra"
            value={form.name}
            onChange={handleChange}
            autoComplete="name"
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <span>Company (optional)</span>
          <input
            type="text"
            name="company"
            placeholder="Ummah CX Collective"
            value={form.company}
            onChange={handleChange}
            autoComplete="organization"
          />
        </label>

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
            placeholder="Create a strong password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
          />
        </label>

        {(formError || error) && (
          <div className="alert alert-danger" role="alert">
            {formError || error}
          </div>
        )}

        {successMessage && (
          <div className="alert" role="status">
            {successMessage}
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={authLoading}>
          {authLoading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="privacy-hint" style={{ marginTop: '1rem' }}>
        We honour halal data stewardship. Only register team members who respect our privacy charter, and ensure
        consent logs are maintained for every customer dataset connected to this platform.
      </p>

      <p className="notice" style={{ marginTop: '1rem' }}>
        Already verified? <Link to="/login">Return to sign in</Link>
      </p>
    </AuthShell>
  );
}
