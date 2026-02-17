let API_URL = '/api/v1';

export async function apiFetch(endpoint, options = {}) {
  const headers = { ...options.headers };

  // Si no es FormData, ponemos el JSON content type por defecto
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    credentials: 'include',
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.msg || 'Error en la petición');
  }
  return res.json();
}