const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

export const getAssets    = ()           => request('/assets');
export const createAsset  = (data)       => request('/assets',       { method: 'POST',   body: JSON.stringify(data) });
export const updateAsset  = (id, data)   => request(`/assets/${id}`, { method: 'PUT',    body: JSON.stringify(data) });
export const deleteAsset  = (id)         => request(`/assets/${id}`, { method: 'DELETE' });
