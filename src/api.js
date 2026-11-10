// Talks to the PhishGuard Flask backend. In dev, Vite proxies /api -> http://127.0.0.1:5000
const BASE = import.meta.env.VITE_API_BASE || '';

async function request(path, options) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, options);
  } catch {
    throw new Error('Cannot reach the PhishGuard backend. Start it with "python app.py" (port 5000).');
  }
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON response */
  }
  if (!res.ok) throw new Error((data && data.error) || `Server error (${res.status})`);
  return data;
}

export const scanUrl = (url) =>
  request('/api/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

export const getModelInfo = () => request('/api/model-info');
