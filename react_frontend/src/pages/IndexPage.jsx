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
    if (!username) return;
    fetchUser(username)
      .then(user => setPoints(user.points))
      .catch(() => setPoints('?'));
  }, [username]);

  async function startGame() {
    const name = input.trim();
    if (!name) { showToast('請輸入名稱', 'error'); return; }
    if (name.length < 2) { showToast('名稱至少 2 個字', 'error'); return; }
    try {
      await fetchUser(name);
      setCookie('sw_username', name, 7);
      setUsername(name);
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
        <div className="hero">
          <div className="hero-tag">✦ Learn &amp; Collect</div>
          <h1>背單字<br /><span>抽小卡</span></h1>
          <p>答對單字累積點數，點數可以抽你最愛的韓國偶像小卡！</p>
        </div>

        {!username ? (
          <div id="login-section">
            <div className="panel">
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', textAlign: 'center' }}>輸入你的名稱開始遊戲</h2>
              <input
                className="login-input"
                type="text"
                placeholder="例：StarFan123"
                maxLength={20}
                autoComplete="off"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && startGame()}
              />
              <button className="btn btn-primary btn-full btn-lg" onClick={startGame}>開始 ✦</button>
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
            <div className="home-cards">
              <Link to="/quiz" className="home-card">
                <span className="home-card-icon">📚</span>
                <div className="home-card-title">背單字</div>
                <div className="home-card-desc">答題累積點數</div>
              </Link>
              <Link to="/gacha" className="home-card">
                <span className="home-card-icon">🎁</span>
                <div className="home-card-title">抽卡包</div>
                <div className="home-card-desc">10點抽三張小卡</div>
              </Link>
              <Link to="/profile" className="home-card" style={{ gridColumn: '1 / -1' }}>
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
