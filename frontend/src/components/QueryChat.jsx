import { useEffect, useState } from 'react';
import { fetchRecentQueries, submitQuery } from '../api/query';

export default function QueryChat({ featureEnabled = true }) {
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    if (!featureEnabled) {
      setPrompt('');
      setHistory([]);
      setError(null);
      return () => {
        isMounted = false;
      };
    }

    const loadRecent = async () => {
      try {
        const recent = await fetchRecentQueries();
        if (isMounted) {
          setHistory(recent);
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Unable to load recent queries', err);
        }
      }
    };

    loadRecent();
    return () => {
      isMounted = false;
    };
  }, [featureEnabled]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!featureEnabled) {
      setError('Your current subscription does not include Query Chat.');
      return;
    }

    if (!prompt.trim()) {
      setError('Please enter a customer query before submitting.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await submitQuery({ prompt: prompt.trim() });
      const message = {
        id: response.id ?? Date.now().toString(),
        prompt: prompt.trim(),
        response: response.answer ?? response.response ?? 'Response recorded.',
        createdAt: response.createdAt ?? new Date().toISOString()
      };
      setHistory((prev) => [message, ...prev]);
      setPrompt('');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Unable to submit the query at this time.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card" style={{ minHeight: '100%' }}>
      <div className="card-header">
        <div>
          <h3 className="card-title">Query Chat</h3>
          <p className="card-subtitle">
            Provide anonymised customer narratives to receive sharia-compliant AI guidance.
          </p>
        </div>
      </div>

      <div className="privacy-hint">
        The assistant is privacy-conscious and halal-aligned. Never paste personal identifiers; focus on intentions and
        sentiment. All interactions are logged for accountability.
      </div>

      {!featureEnabled ? (
        <div className="alert" role="alert" style={{ marginTop: '1rem' }}>
          Query Chat is not included in your current subscription tier. Contact your administrator to unlock
          conversational analytics.
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <textarea
              rows="4"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="E.g. A customer from Riyadh feels delivery updates are unclear…"
              disabled={loading || !featureEnabled}
            />

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading || !featureEnabled}>
              {loading ? 'Processing query…' : 'Submit query'}
            </button>
          </form>

          <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 className="card-title" style={{ fontSize: '1rem' }}>
              Recent conversations
            </h4>

            {history.length === 0 && <p className="card-subtitle">Conversations will appear here after submission.</p>}

            <ul className="list">
              {history.map((item) => (
                <li key={item.id} className="list-item">
                  <p style={{ margin: 0, fontWeight: 600, color: 'var(--slate-700)' }}>{item.prompt}</p>
                  {item.response && (
                    <p style={{ marginTop: '0.5rem', color: 'var(--slate-500)' }}>{item.response}</p>
                  )}
                  <span className="notice" style={{ marginTop: '0.5rem' }}>
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Awaiting timestamp'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </section>
  );
}
