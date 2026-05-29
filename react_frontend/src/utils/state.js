export const API = 'http://127.0.0.1:8000/api';

export function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

export function getCookie(name) {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, null);
}

export function getUsername() {
  return getCookie('sw_username');
}

export async function fetchUser(username) {
  const res = await fetch(`${API}/user/${encodeURIComponent(username)}/`);
  return res.json();
}
