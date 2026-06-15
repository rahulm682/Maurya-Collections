import { auth } from '../firebase';

export async function apiFetch(path: string, options: RequestInit = {}) {
  const idToken = auth.currentUser ? await auth.currentUser.getIdToken() : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as any || {})
  };
  if (idToken) {
    headers['Authorization'] = `Bearer ${idToken}`;
  } else {
    // If authenticated offline, pass the static fallback bypass token
    const isOfflineAuth = localStorage.getItem('maurya_admin_auth') === 'true';
    if (isOfflineAuth) {
      headers['Authorization'] = 'Bearer static_fallback_token';
    }
  }
  const response = await fetch(path, {
    ...options,
    headers
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `API network error: status ${response.status}`);
  }
  return response.json();
}
