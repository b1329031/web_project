const API = 'http://127.0.0.1:8000/api';

function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function getCookie(name) {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, null);
}

function getUsername() {
  return getCookie('sw_username');
}

function requireLogin() {
  if (!getUsername()) {
    window.location.href = 'index.html';
  }
}

let toastTimer;
function showToast(msg, type = 'info') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

function setNavPoints(pts) {
  const el = document.getElementById('nav-points');
  if (el) el.textContent = pts;
}

async function fetchUser(username) {
  const res = await fetch(`${API}/user/${encodeURIComponent(username)}/`);
  return res.json();
}

// 嘗試 jpg → png，都找不到就 fallback 到 emoji
function setPhotoWithFallback(imgEl, cardId, photoNum, fallbackEmoji) {
  const jpg = `images/${cardId}_${photoNum}.jpg`;
  const png = `images/${cardId}_${photoNum}.png`;
  imgEl.src = jpg;
  imgEl.onerror = () => {
    if (imgEl.src.endsWith('.jpg')) {
      imgEl.src = png;
    } else {
      imgEl.style.display = 'none';
      if (fallbackEmoji && !imgEl.parentElement.querySelector('.card-photo-emoji')) {
        const sp = document.createElement('span');
        sp.className = 'card-photo-emoji';
        sp.textContent = fallbackEmoji;
        imgEl.parentElement.prepend(sp);
      }
    }
  };
}
