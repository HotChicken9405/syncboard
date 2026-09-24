const BASE_URL = 'http://localhost:4000/api';

let accessToken = null;
let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export async function request(path, options = {}) {
  const res = await fetch(BASE_URL + path, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...options.headers,
    },
  });

  if (res.status === 401 && path !== '/auth/refresh' && path !== '/auth/login') {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        return request(path, {
          ...options,
          headers: { ...options.headers, Authorization: `Bearer ${token}` },
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!refreshRes.ok) throw new Error('Refresh failed');

      const data     = await refreshRes.json();
      const newToken = data.data.token;
      setAccessToken(newToken);
      processQueue(null, newToken);

      return request(path, options);
    } catch (err) {
      processQueue(err, null);
      setAccessToken(null);
      window.dispatchEvent(new Event('auth:expired'));
      throw new Error('Session expired, please log in again', { cause: err }); // ← cause attached
    } finally {
      isRefreshing = false;
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: { message: 'Request failed' } }));
    throw new Error(error.error?.message || 'Request failed');
  }

  return res.status === 204 ? null : res.json();
}