import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../utils/auth.js';

const EMAIL_REGEX = /[^\s@]+@[^\s@]+\.[^\s@]+/;

export default function LoginModal({ isOpen, onClose, onSuccess }) {
  const navigate = useNavigate();
  const overlayRef = useRef(null);
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setValues({ email: '', password: '' });
      setErrors({});
      setFeedback('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (event) => {
    if (overlayRef.current && event.target === overlayRef.current) {
      onClose?.();
    }
  };

  const handleChange = (field) => (event) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
    setFeedback('');
  };

  const validate = () => {
    const nextErrors = {};
    const email = values.email.trim();
    if (!email) {
      nextErrors.email = 'Email is required.';
    } else if (!EMAIL_REGEX.test(email)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!values.password.trim()) {
      nextErrors.password = 'Password is required.';
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setFeedback('');

    try {
      await login(values.email.trim(), values.password);
      onSuccess?.();
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Unable to login. Please try again.';
      setFeedback(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 py-12 backdrop-blur"
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-2xl shadow-indigo-500/20"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
          aria-label="Close login modal"
        >
          <span className="text-lg leading-none">×</span>
        </button>

        <div className="space-y-6 px-8 pb-9 pt-10">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.45em] text-indigo-500">Welcome back</p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Access your command center</h2>
            <p className="text-sm text-slate-500">Use the demo credentials: demo@ecomai.com / demo123</p>
          </div>

          {feedback && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {feedback}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-600">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={handleChange('email')}
                className={`w-full rounded-2xl border px-4 py-3 text-base shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 ${
                  errors.email ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200'
                }`}
                placeholder="you@brand.com"
              />
              {errors.email && <p className="text-sm text-rose-600">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-600">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={values.password}
                onChange={handleChange('password')}
                className={`w-full rounded-2xl border px-4 py-3 text-base shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 ${
                  errors.password ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200'
                }`}
                placeholder="Enter your password"
              />
              {errors.password && <p className="text-sm text-rose-600">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-600 hover:via-indigo-700 hover:to-indigo-800 disabled:cursor-not-allowed disabled:opacity-80"
            >
              {isSubmitting ? 'Signing in…' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
