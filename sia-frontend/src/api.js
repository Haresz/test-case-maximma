const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    // Pesan error dari backend (Indonesia) ditampilkan apa adanya
    throw new Error(data?.error || `Terjadi kesalahan (HTTP ${res.status}).`);
  }
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body = {}) =>
    request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body = {}) =>
    request(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: (path) => request(path, { method: 'DELETE' }),
};
