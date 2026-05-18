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

export const getAssets = (params = {}) => {
  const qs = new URLSearchParams();
  if (params.pageSize)          qs.set('pageSize',          params.pageSize);
  if (params.continuationToken) qs.set('continuationToken', params.continuationToken);
  if (params.q)                 qs.set('q',                 params.q);
  if (params.department)        qs.set('department',        params.department);
  if (params.type)              qs.set('type',              params.type);
  if (params.status)            qs.set('status',            params.status);
  const query = qs.toString();
  return request(`/assets${query ? `?${query}` : ''}`);
};

export const getReports  = ()            => request('/reports');
export const createAsset = (data)       => request('/assets',       { method: 'POST',   body: JSON.stringify(data) });
export const updateAsset = (id, data)   => request(`/assets/${id}`, { method: 'PUT',    body: JSON.stringify(data) });
export const deleteAsset = (id)         => request(`/assets/${id}`, { method: 'DELETE' });
