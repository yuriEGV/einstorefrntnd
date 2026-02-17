const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

export async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    credentials: 'include', // para enviar cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.msg || 'Error en la petición');
  }
  return res.json();
} 