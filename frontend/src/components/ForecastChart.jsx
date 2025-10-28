import { useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { fetchForecast, submitForecast } from '../api/forecast';

const DEFAULT_FORM = {
  horizon: 6,
  scenario: 'baseline',
  notes: ''
};

export default function ForecastChart({ featureEnabled = true }) {
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);

  const loadForecast = async () => {
    setLoading(true);
    try {
      const data = await fetchForecast();
      setForecast(Array.isArray(data) ? data : data?.points ?? []);
      setError(null);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Unable to load forecast data';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!featureEnabled) {
      setLoading(false);
      setSubmitting(false);
      setForecast([]);
      setForm({ ...DEFAULT_FORM });
      setError(null);
      return;
    }

    loadForecast();
  }, [featureEnabled]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!featureEnabled) {
      setError('Forecasting is not enabled for your subscription tier.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        horizon: Number(form.horizon) || DEFAULT_FORM.horizon,
        scenario: form.scenario,
        notes: form.notes || undefined
      };
      const response = await submitForecast(payload);
      const nextData = response?.points ?? response ?? [];
      setForecast(Array.isArray(nextData) ? nextData : []);
      setError(null);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Unable to generate new forecast scenario';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const chartData = useMemo(() => {
    return forecast.map((entry, index) => ({
      key: entry.id ?? entry.date ?? `p-${index}`,
      date: entry.date ?? `Month ${index + 1}`,
      baseline: entry.baseline ?? entry.value ?? entry.demand,
      optimistic: entry.optimistic ?? entry.upperBound,
      conservative: entry.conservative ?? entry.lowerBound
    }));
  }, [forecast]);

  return (
    <section className="card" style={{ minHeight: '100%' }}>
      <div className="card-header">
        <div>
          <h3 className="card-title">Demand Forecast</h3>
          <p className="card-subtitle">
            Visualise confidence-banded scenarios while respecting halal ethical forecasting principles.
          </p>
        </div>
      </div>

      <div className="privacy-hint">
        Forecasts exclude interest-based projections and follow halal supply-chain assumptions. Review inputs carefully
        to maintain integrity and privacy.
      </div>

      {!featureEnabled ? (
        <div className="alert" role="alert" style={{ marginTop: '1rem' }}>
          Forecasting dashboards are paused for your current subscription tier. Reach out to your halal compliance lead
          to activate predictive insights.
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <span>Forecast horizon (months)</span>
                <input
                  type="number"
                  min="1"
                  max="24"
                  name="horizon"
                  value={form.horizon}
                  onChange={handleChange}
                  disabled={submitting || !featureEnabled}
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <span>Scenario</span>
                <select
                  name="scenario"
                  value={form.scenario}
                  onChange={handleChange}
                  disabled={submitting || !featureEnabled}
                >
                  <option value="baseline">Baseline</option>
                  <option value="optimistic">Optimistic</option>
                  <option value="conservative">Conservative</option>
                </select>
              </label>
            </div>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <span>Key assumptions (halal-compliant)</span>
              <textarea
                rows="2"
                name="notes"
                placeholder="Demand surge expected during Ramadan promotions…"
                value={form.notes}
                onChange={handleChange}
                disabled={submitting || !featureEnabled}
              />
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-primary" disabled={submitting || !featureEnabled}>
                {submitting ? 'Updating forecast…' : 'Update forecast'}
              </button>
            </div>
          </form>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {loading ? (
            <div className="loading-state" style={{ marginTop: '1rem' }}>
              <span className="loading-dot" />
              <span className="loading-dot" />
              <span className="loading-dot" />
              <span>Loading forecast scenarios…</span>
            </div>
          ) : chartData.length === 0 ? (
            <p className="card-subtitle" style={{ marginTop: '1rem' }}>
              No forecast data available. Submit a scenario to populate the chart.
            </p>
          ) : (
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 12, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.35)" />
                  <XAxis dataKey="date" tick={{ fill: '#64748b' }} />
                  <YAxis tick={{ fill: '#64748b' }} tickFormatter={(value) => `${value}`} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, borderColor: 'rgba(148, 163, 184, 0.3)', boxShadow: 'var(--shadow-sm)' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="baseline" stroke="#16a34a" strokeWidth={3} dot={false} name="Baseline" />
                  <Line type="monotone" dataKey="optimistic" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Optimistic" />
                  <Line
                    type="monotone"
                    dataKey="conservative"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={false}
                    name="Conservative"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </section>
  );
}
