// Django 後端 API 的根路徑
export const API = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

// 將登入帳號寫入瀏覽器 Cookie，days 決定有效天數
export function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

// 從 Cookie 讀取指定欄位的值
export function getCookie(name) {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, null);
}

// 取得目前登入的帳號名稱（從 Cookie 讀取）
export function getUsername() {
  return getCookie('sw_username');
}

// 向後端請求使用者資料（點數、答題紀錄、收藏清單）
export async function fetchUser(username) {
  const res = await fetch(`${API}/user/${encodeURIComponent(username)}/`);
  return res.json();
}
