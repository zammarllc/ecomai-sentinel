async function triggerSyncLoop(payload) {
  const url = process.env.SYNC_LOOP_URL;

  if (!url) {
    console.warn('[syncLoop] SYNC_LOOP_URL not configured; skipping trigger.');
    return;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('[syncLoop] Remote returned error:', response.status, text);
    }
  } catch (error) {
    console.error('[syncLoop] Failed to trigger sync loop:', error.message);
  }
}

module.exports = { triggerSyncLoop };
