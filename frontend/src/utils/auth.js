const TOKEN_KEY = 'ecomai_sentinel_token';

function getStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch (error) {
    console.warn('Local storage is not available', error);
    return null;
  }
}

export function getToken() {
  const storage = getStorage();
  if (!storage) {
    return null;
  }
  return storage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  if (token) {
    storage.setItem(TOKEN_KEY, token);
  } else {
    storage.removeItem(TOKEN_KEY);
  }
}

export function clearToken() {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  storage.removeItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}

function resolveApiBaseUrl() {
  const base = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.trim() : '';
  if (!base) {
    return '';
  }
  return base.endsWith('/') ? base.slice(0, -1) : base;
}

export async function login(email, password) {
  const payload = {
    email: email?.trim() ?? '',
    password: password ?? ''
  };

  const response = await fetch(`${resolveApiBaseUrl()}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  let data = null;
  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }

  if (!response.ok) {
    const message = data?.message || 'Unable to authenticate with the provided credentials.';
    const customError = new Error(message);
    if (data) {
      customError.response = { data };
    }
    throw customError;
  }

  const token = data?.token;
  if (!token) {
    const message = 'Invalid login response: token missing.';
    const customError = new Error(message);
    customError.response = { data };
    throw customError;
  }

  setToken(token);
  return data;
}
