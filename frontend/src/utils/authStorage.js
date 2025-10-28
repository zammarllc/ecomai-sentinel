const TOKEN_KEY = 'cip_auth_token';
const USER_KEY = 'cip_auth_user';

function getStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch (error) {
    console.warn('Local storage unavailable', error);
    return null;
  }
}

export function getStoredAuth() {
  const storage = getStorage();
  if (!storage) {
    return { token: null, user: null };
  }

  const token = storage.getItem(TOKEN_KEY);
  const userRaw = storage.getItem(USER_KEY);

  try {
    const user = userRaw ? JSON.parse(userRaw) : null;
    return { token, user };
  } catch (error) {
    console.warn('Unable to parse stored user payload', error);
    storage.removeItem(USER_KEY);
    return { token, user: null };
  }
}

export function storeAuth({ token, user }) {
  const storage = getStorage();
  if (!storage) return;

  if (token) {
    storage.setItem(TOKEN_KEY, token);
  }
  if (user) {
    storage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function clearAuth() {
  const storage = getStorage();
  if (!storage) return;

  storage.removeItem(TOKEN_KEY);
  storage.removeItem(USER_KEY);
}
