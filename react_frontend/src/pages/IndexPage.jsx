import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getCookie, setCookie, getUsername, fetchUser, API } from '../utils/state';
import Toast from '../components/Toast';

export default function IndexPage() {
  const [username, setUsername] = useState(getUsername());
  const [points, setPoints] = useState('?');
  const [input, setInput] = useState('');
  const [toast, setToast] = useState({ message: '', type: '' });
  const toastTimer = useRef(null);

  function showToast(message, type = 'info') {
    clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast({ message: '', type: '' }), 2800);
  }

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!username) return;
    fetchUser(username)
      .then(user => setPoints(user.points))
      .catch(() => setPoints('?'));
  }, [username]);

  // 🔑 處理舊用戶登入
  async function handleLogin() {
    const name = input.trim();
    if (!name) { showToast('請輸入名稱', 'error'); return; }
    if (name.length < 2) { showToast('名稱至少 2 個字', 'error'); return; }
    try {
      const res = await fetch(`${API}/user/${encodeURIComponent(name)}/`);
      if (res.status === 404) {
        showToast('帳號不存在，請點選「建立新帳號」📚', 'error');
        return;
      }
      if (!res.ok) throw new Error();
      
      setCookie('sw_username', name, 7);
      setUsername(name);
      showToast(`歡迎回來，${name}！`, 'success');
    } catch {
      showToast('無法連接伺服器，請確認後端已啟動', 'error');
    }
  }

  // 📝 處理新用戶註冊（防撞名機制）
  async function handleRegister() {
    const name = input.trim();
    if (!name) { showToast('請輸入名稱', 'error'); return; }
    if (name.length < 2) { showToast('名稱至少 2 個字', 'error'); return; }
    try {
      const res = await fetch(`${API}/user/${encodeURIComponent(name)}/`);
      
      if (res.ok) {
        showToast('此名稱已被使用，請換個超酷的名字！✨', 'error');
        return;
      }

      // 如果後端回傳 404 代表沒人使用，可以安全創建
      if (res.status === 404) {
        // 呼叫後端創建用戶的 API (通常直接 fetchUser 或 POST 創建，這裡沿用原本的登入進去創建邏輯)
        setCookie('sw_username', name, 7);
        setUsername(name);
        showToast(`成功建立全新帳號：${name}！✦`, 'success');
      }
    } catch {
      showToast('無法連接伺服器，請確認後端已啟動', 'error');
    }
  }

  function logout() {
    setCookie('sw_username', '', -1);
    setUsername(null);
    setPoints('?');
  }

  return (
    <>
      <nav>
        <span className="nav-logo">StarWords</span>
        <div />
      </nav>
      <main>
        {/* ✨ 升級大標題：利用 SVG <textPath> 繪製超華麗漸層弧形 STARWORDS 大字 */}
        <div className="hero">
          <div className="hero-tag">✦ Learn &amp; Collect</div>
          
          <div className="arc-title-wrap">
            <svg viewBox="0 0 500 160" className="arc-title-svg">
              <defs>
                {/* 定義主題紫粉漸變色 */}
                <linearGradient id="starwords-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#9b6dff">
                    <animate attributeName="stop-color" values="#9b6dff; #f472b6; #9b6dff" dur="4s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="100%" stopColor="#f472b6">
                    <animate attributeName="stop-color" values="#f472b6; #9b6dff; #f472b6" dur="4s" repeatCount="indefinite" />
                  </stop>
                </linearGradient>
                {/* 定義圓弧路徑 (扇形弧線) */}
                <path id="text-arc-path" d="M 50,140 A 210,210 0 0,1 450,140" fill="transparent" />
              </defs>
              {/* 讓粗體 STARWORDS 順著弧線排開 */}
              <text fontStyle="normal" fontWeight="900" fontSize="56" fontFamily="'Bebas Neue', sans-serif" letterSpacing="4">
                <textPath href="#text-arc-path" startOffset="50%" textAnchor="middle">
                  STARWORDS
                </textPath>
              </text>
            </svg>
            {/* 副標題寫成一行，優雅放在下方 */}
            <h2 className="arc-sub-title">背單字抽小卡</h2>
          </div>

          <p style={{ marginTop: '0.5rem' }}>答對單字累積點數，點數可以抽你最愛的韓國偶像小卡！</p>
        </div>

        {!username ? (
          <div id="login-section">
            <div className="panel">
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', textAlign: 'center' }}>開始遊玩網站</h2>
              <input
                className="login-input"
                type="text"
                placeholder="例：StarFan123"
                maxLength={20}
                autoComplete="off"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
              
              {/* ⚙️ 拆分為登入與建立帳號兩個按鈕 */}
              <div className="login-btn-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button className="btn btn-secondary btn-lg" onClick={handleLogin}>登入帳號</button>
                <button className="btn btn-primary btn-lg" onClick={handleRegister}>建立新帳號 ✦</button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '0 1.5rem 4rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '.5rem' }}>
                歡迎回來，<span style={{ color: 'var(--accent)' }}>{username}</span>！
              </div>
              <div style={{ fontSize: '.9rem', color: 'var(--muted)' }}>
                你現在有 <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{points}</span> ⭐ 點
              </div>
              <button
                onClick={logout}
                style={{ marginTop: '1rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', padding: '.4rem .9rem', borderRadius: '8px', cursor: 'pointer', fontSize: '.8rem' }}
              >換帳號</button>
            </div>
            
            {/* ⚙️ 升級大廳排版：加入單字本方塊，呈現 3+1 格式平衡對齊 */}
            <div className="home-cards custom-lobby-grid">
              <Link to="/quiz" className="home-card">
                <span className="home-card-icon">📚</span>
                <div className="home-card-title">背單字</div>
                <div className="home-card-desc">答題累積點數</div>
              </Link>
              
              {/* ✨ 新增的「單字本」方塊 */}
              <Link to="/vocab" className="home-card">
                <span className="home-card-icon">📖</span>
                <div className="home-card-title">單字本</div>
                <div className="home-card-desc">複習與收藏單字</div>
              </Link>

              <Link to="/gacha" className="home-card">
                <span className="home-card-icon">🎁</span>
                <div className="home-card-title">抽卡包</div>
                <div className="home-card-desc">10點抽三張小卡</div>
              </Link>
              
              <Link to="/profile" className="home-card full-row-card" style={{ gridColumn: '1 / -1' }}>
                <span className="home-card-icon">🎴</span>
                <div className="home-card-title">我的卡冊</div>
                <div className="home-card-desc">查看收集進度與統計</div>
              </Link>
            </div>
          </div>
        )}
      </main>
      <Toast message={toast.message} type={toast.type} />
    </>
  );
}