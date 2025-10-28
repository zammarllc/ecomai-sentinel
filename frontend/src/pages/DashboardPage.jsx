import { useState } from 'react';
import Dashboard from '../components/Dashboard.jsx';
import ForecastChart from '../components/ForecastChart.jsx';
import QueryChat from '../components/QueryChat.jsx';
import { useAuth } from '../hooks/useAuth.js';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [features, setFeatures] = useState({ forecast: true, queryChat: true });

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <div className="app-logo">InsightStream</div>
          <p className="card-subtitle" style={{ marginTop: '0.2rem' }}>
            Welcome back{user?.name ? `, ${user.name}` : ''}. Ready to interpret what customers are telling you?
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {user?.email && <span className="badge">{user.email}</span>}
          <button type="button" className="btn-secondary" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>

      <main className="app-content">
        <Dashboard onFeaturesChange={setFeatures} />

        <section className="layout-grid">
          <QueryChat featureEnabled={features.queryChat} />
          <ForecastChart featureEnabled={features.forecast} />
        </section>
      </main>
    </div>
  );
}
