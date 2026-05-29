import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsername, fetchUser, API } from '../utils/state';
import { CARDS_LOCAL } from '../data';
import Nav from '../components/Nav';
import Toast from '../components/Toast';

const RARITY_ORDER = { SSR: 4, SR: 3, R: 2, N: 1 };

function bestRarityOf(cards) {
  return cards.reduce(
    (best, c) => (RARITY_ORDER[c.rarity] > RARITY_ORDER[best.rarity] ? c : best),
    cards[0]
  ).rarity;
}

export default function GachaPage() {
  const navigate = useNavigate();
  const username = getUsername();

  const [allCards, setAllCards] = useState(CARDS_LOCAL);
  const [history, setHistory] = useState(() =>
    JSON.parse(localStorage.getItem(`sw_history_${username}`) || '[]')
  );
  const [navPoints, setNavPoints] = useState(0);

  const [phase, setPhase] = useState('idle'); // idle | flash | dark | rarity | cards | result
  const [drawnCards, setDrawnCards] = useState([]);
  const [drawnPhotos, setDrawnPhotos] = useState([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [topRarity, setTopRarity] = useState('N');
  const [toast, setToast] = useState({ message: '', type: '' });

  const toastTimer = useRef(null);
  const timers = useRef([]);

  useEffect(() => {
    if (!username) { navigate('/'); return; }
    Promise.all([fetch(`${API}/cards/`), fetchUser(username)])
      .then(async ([cRes, user]) => {
        setAllCards(await cRes.json());
        setNavPoints(user.points);
      })
      .catch(() => showToast('請確認後端伺服器已啟動', 'error'));
  }, []);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function schedule(fn, delay) {
    const id = setTimeout(fn, delay);
    timers.current.push(id);
    return id;
  }

  function showToast(message, type = 'info') {
    clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast({ message: '', type: '' }), 2800);
  }

  async function drawCards() {
    if (phase !== 'idle') return;
    try {
      const res = await fetch(`${API}/user/${encodeURIComponent(username)}/gacha/`, { method: 'POST' });
      if (!res.ok) {
        const err = await res.json();
        showToast(err.error || '點數不足！需累積 10 點才能抽卡 📚', 'error');
        return;
      }
      const data = await res.json();
      setNavPoints(data.points);
      setDrawnCards(data.cards);
      setTopRarity(bestRarityOf(data.cards));

      const card0 = data.cards[0];
      if (card0.group === 'IU') {
        const nums = [1, 2, 3, 4, 5].sort(() => Math.random() - 0.5).slice(0, 3);
        setDrawnPhotos(nums.map(n => `/images/iu${n}_1.jpg`));
      } else {
        setDrawnPhotos(data.cards.map((card, i) => `/images/${card.card_id}_${i + 1}.jpg`));
      }

      const newHistory = [...data.cards.map(c => c.card_id), ...history].slice(0, 60);
      setHistory(newHistory);
      localStorage.setItem(`sw_history_${username}`, JSON.stringify(newHistory));

      timers.current.forEach(clearTimeout);
      timers.current = [];

      setPhase('flash');
      schedule(() => setPhase('dark'), 1200);
      schedule(() => setPhase('rarity'), 1800);
      schedule(() => {
        setPhase('cards');
        setVisibleCount(0);
        schedule(() => setVisibleCount(1), 150);
        schedule(() => setVisibleCount(2), 850);
        schedule(() => setVisibleCount(3), 1550);
        schedule(() => setPhase('result'), 2400);
      }, 3200);
    } catch {
      showToast('連線失敗', 'error');
    }
  }

  function confirmCards() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPhase('idle');
    setDrawnCards([]);
    setVisibleCount(0);
  }

  const showOverlay = phase !== 'idle';

  return (
    <>
      <Nav points={navPoints} />

      {showOverlay && (
        <div className={`gacha-overlay phase-${phase}`}>
          {phase === 'rarity' && (
            <div className={`gacha-rarity-text ${topRarity}`}>{topRarity}</div>
          )}
          {(phase === 'cards' || phase === 'result') && (
            <>
              <div className={`gacha-top-rarity ${topRarity}`}>{topRarity}</div>
              <div className="gacha-cards-row">
                {drawnCards.slice(0, visibleCount).map((card, i) => (
                  <div key={i} className={`gacha-result-card ${card.rarity}`}>
                    <div className="card-photo-slot">
                      <img
                        src={drawnPhotos[i] || `/images/${card.card_id}_${i + 1}.jpg`}
                        alt={card.name}
                        onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                      />
                      <span className="card-emoji-fallback" style={{ display: 'none' }}>{card.emoji}</span>
                    </div>
                    <div className="card-name">{card.name}</div>
                    <div className="card-group">{card.group}</div>
                    <div className="card-rarity-badge">{card.rarity}</div>
                  </div>
                ))}
              </div>
              {phase === 'result' && (
                <button className="gacha-confirm-btn" onClick={confirmCards}>
                  收入至卡冊 ✦
                </button>
              )}
            </>
          )}
        </div>
      )}

      <main>
        <div id="gacha-section">
          <div style={{ textAlign: 'center', padding: '2rem 1.5rem 0' }}>
            <div className="gacha-cost">
              每次抽取消耗 <span>10 點</span>｜每包 3 張｜機率：SSR 5% / SR 15% / R 35% / N 45%
            </div>
          </div>

          <div className="blind-box-wrap">
            <div
              className="blind-box"
              onClick={drawCards}
              style={{ cursor: phase === 'idle' ? 'pointer' : 'default' }}
            >
              <div className="box-body">
                <div className="box-top">
                  <svg className="box-svg" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
                    <rect x="5" y="5" width="190" height="90" rx="8" fill="#ede9fe" stroke="#9b6dff" strokeWidth="1.5"/>
                    <rect x="25" y="20" width="150" height="60" rx="6" fill="#f5f3ff" stroke="rgba(155,109,255,.3)" strokeWidth="1"/>
                    <text x="100" y="58" textAnchor="middle" fontSize="32" fill="#9b6dff">✦</text>
                    <rect x="0" y="88" width="200" height="4" fill="#9b6dff" opacity=".5"/>
                  </svg>
                </div>
                <div className="box-bottom">
                  <svg className="box-svg" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
                    <rect x="5" y="5" width="190" height="90" rx="8" fill="#ede9fe" stroke="#9b6dff" strokeWidth="1.5"/>
                    <text x="100" y="40" textAnchor="middle" fontSize="12" fill="#8b7bb5" fontFamily="sans-serif">K-POP</text>
                    <text x="100" y="62" textAnchor="middle" fontSize="12" fill="#8b7bb5" fontFamily="sans-serif">MYSTERY BOX</text>
                    <rect x="0" y="3" width="200" height="4" fill="#9b6dff" opacity=".5"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--muted)', fontSize: '.85rem', marginBottom: '1.5rem' }}>
              點擊盒子或按下方按鈕抽取
            </p>
            <button
              className="btn btn-primary"
              style={{ width: '220px', margin: '0 auto' }}
              onClick={drawCards}
              disabled={phase !== 'idle'}
            >
              🎁 抽取卡包（10點）
            </button>
          </div>

          {history.length > 0 && (
            <div className="gacha-history" style={{ padding: '2rem 0 4rem' }}>
              <h3>抽取紀錄</h3>
              <div className="history-grid">
                {history.slice(0, 18).map((id, idx) => {
                  const c = allCards.find(x => x.card_id === id);
                  if (!c) return null;
                  const photoSrc = c.group === 'IU'
                    ? `/images/iu${(idx % 5) + 1}_1.jpg`
                    : `/images/${id}_${(idx % 3) + 1}.jpg`;
                  return (
                    <div key={idx} className="mini-card">
                      <img
                        src={photoSrc}
                        alt={c.name}
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                      <span>{c.emoji}</span>
                      <span>{c.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      <Toast message={toast.message} type={toast.type} />
    </>
  );
}
