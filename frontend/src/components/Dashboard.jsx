import { useEffect, useMemo, useState } from 'react';
import { fetchDashboard } from '../api/dashboard';

function MetricTile({ label, value, trend }) {
  return (
    <div className="metric-tile">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value ?? '—'}</div>
      {trend && (
        <div className="card-subtitle" style={{ marginTop: '0.35rem' }}>
          {trend.direction === 'up' ? '▲' : trend.direction === 'down' ? '▼' : '•'} {trend.message ?? ''}
        </div>
      )}
    </div>
  );
}

export default function Dashboard({ onFeaturesChange }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [features, setFeatures] = useState({ forecast: true, queryChat: true });

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      setLoading(true);
      try {
        const data = await fetchDashboard();
        if (isMounted) {
          setDashboard(data);
          setError(null);

          const resolvedSubscription = data?.subscription ?? {};
          const derivedFeatures = {
            forecast: true,
            queryChat: true,
            ...(resolvedSubscription.features || {})
          };
          setFeatures(derivedFeatures);
          if (typeof onFeaturesChange === 'function') {
            onFeaturesChange(derivedFeatures);
          }
        }
      } catch (err) {
        if (isMounted) {
          const message = err.response?.data?.message || err.message || 'Unable to load dashboard insights';
          setError(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = useMemo(() => {
    if (!dashboard?.metrics) return [];
    if (Array.isArray(dashboard.metrics)) return dashboard.metrics;
    return Object.entries(dashboard.metrics).map(([key, value]) => ({
      label: key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (char) => char.toUpperCase()),
      value
    }));
  }, [dashboard]);

  const recentQueries = dashboard?.recentQueries ?? [];
  const forecastAlerts = dashboard?.forecastAlerts ?? [];
  const subscription = dashboard?.subscription ?? {};

  return (
    <section className="layout-grid">
      <div className="card" style={{ gridColumn: '1 / -1' }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">Customer Intelligence Pulse</h2>
            <p className="card-subtitle">Your latest summary metrics drawn from live operational data streams.</p>
          </div>
          {subscription?.plan && <div className="badge">{subscription.plan} plan</div>}
        </div>

        {loading && (
          <div className="loading-state">
            <span className="loading-dot" />
            <span className="loading-dot" />
            <span className="loading-dot" />
            <span>Gathering fresh metrics…</span>
          </div>
        )}

        {error && !loading && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="metrics-grid">
            {metrics.length === 0 && <p className="card-subtitle">No metrics available yet. Connect a data source.</p>}
            {metrics.map((metric) => (
              <MetricTile key={metric.label} label={metric.label} value={metric.value} trend={metric.trend} />
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Recent Customer Queries</h3>
            <p className="card-subtitle">Latest questions routed through the halal-safe AI concierge.</p>
          </div>
          {!features?.queryChat && <span className="badge">Feature locked</span>}
        </div>

        {!features?.queryChat && (
          <p className="notice">Upgrade your subscription to explore conversational analytics.</p>
        )}

        {features?.queryChat && (
          <ul className="list">
            {recentQueries.length === 0 && <li className="card-subtitle">No queries have been submitted yet.</li>}
            {recentQueries.map((item) => (
              <li key={item.id ?? item.createdAt} className="list-item">
                <strong style={{ display: 'block', marginBottom: '0.35rem' }}>{item.subject ?? 'Customer Query'}</strong>
                <p style={{ margin: 0, color: 'var(--slate-500)' }}>{item.prompt ?? item.question}</p>
                {item.response && (
                  <p style={{ marginTop: '0.4rem', color: 'var(--slate-700)' }}>
                    <em>{item.response}</em>
                  </p>
                )}
                <div className="notice" style={{ marginTop: '0.5rem' }}>
                  {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Awaiting timestamp'}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Forecast Alerts</h3>
            <p className="card-subtitle">Signals calibrated to your halal-compliant forecasting models.</p>
          </div>
          {!features?.forecast && <span className="badge">Feature locked</span>}
        </div>

        {!features?.forecast && (
          <p className="notice">Enable forecasting in your subscription to surface proactive guidance.</p>
        )}

        {features?.forecast && (
          <ul className="list">
            {forecastAlerts.length === 0 && <li className="card-subtitle">No alerts triggered in the current window.</li>}
            {forecastAlerts.map((alert) => (
              <li key={alert.id ?? alert.message} className="list-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>{alert.title ?? 'Forecast notice'}</strong>
                  {alert.severity && <span className="badge">{alert.severity}</span>}
                </div>
                <p style={{ margin: '0.4rem 0 0', color: 'var(--slate-500)' }}>{alert.message}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
