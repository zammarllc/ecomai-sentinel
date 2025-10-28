import { useEffect, useState } from 'react';
import './App.css';

interface HealthResponse {
  status: string;
  environment: string;
  timestamp: string;
}

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Backend responded with ${response.status}`);
        }
        return response.json() as Promise<HealthResponse>;
      })
      .then(setHealth)
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <main className="container">
      <h1>Full-stack Vercel Template</h1>
      <p>
        This React + Vite frontend is configured to deploy on Vercel alongside a serverless Express
        API. Use this project as a reference for configuring local development and production
        deployments.
      </p>

      <section className="card">
        <h2>API health</h2>
        {health ? (
          <pre>{JSON.stringify(health, null, 2)}</pre>
        ) : error ? (
          <p className="error">Unable to reach backend: {error}</p>
        ) : (
          <p>Loading API status…</p>
        )}
      </section>
    </main>
  );
}

export default App;
