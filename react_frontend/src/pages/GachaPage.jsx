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
  const [drawnPhotos, setDrawnPhotos] = useState([]); // 朋友新增：儲存抽到的偶像圖片路徑
  const [visibleCount, setVisibleCount] = useState(0);
  const [topRarity, setTopRarity] = useState('N');
  const [toast, setToast] = useState({ message: '', type: '' });

  const toastTimer = useRef(null);
  const timers = useRef([]);

  // 🎵 你新增的音效控制器 Ref
  const audioOpen = useRef(null);
  const audioReveal = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    // 初始化音效對象
    audioOpen.current = new Audio('/gacha_open.mp3');
    audioReveal.current = new Audio('/gacha_reveal.mp3');

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

      setDrawnPhotos(data.cards.map((card, i) => `/images/${card.card_id}_${i + 1}.jpg`));

      const newHistory = [...data.cards.map(c => c.card_id), ...history].slice(0, 60);
      setHistory(newHistory);
      localStorage.setItem(`sw_history_${username}`, JSON.stringify(newHistory));

      timers.current.forEach(clearTimeout);
      timers.current = [];

      setPhase('flash');
      
      // 🎵 播放開包爆發音效（點擊時立刻放，模擬撕開包裝紙的聲音）
      if (audioOpen.current) {
        audioOpen.current.currentTime = 0;
        audioOpen.current.play().catch(() => {});
      }

      /* 🔍 【分鏡時間軸微調】
         0.0s ~ 1.5s: 純卡包慢動作分離
         0.8s ~ 3.5s: 降臨強光與極光爆發演出
         3.5s: 進入暗場
         4.0s: 秀出 SSR/SR 等級大字
         5.5s: 依序翻開小卡
      */
      
      schedule(() => setPhase('dark'), 2200); // 讓極光多燃燒一會兒 (原為 3200)
      
      schedule(() => {
        setPhase('rarity');
        if (audioReveal.current) {
          audioReveal.current.currentTime = 0;
          audioReveal.current.play().catch(() => {});
        }
      }, 2700); // 等級揭曉往後順延 (原為 3700)

      schedule(() => {
        setPhase('cards');
        setVisibleCount(0);
        schedule(() => setVisibleCount(1), 150);
        schedule(() => setVisibleCount(2), 850);
        schedule(() => setVisibleCount(3), 1550);
        schedule(() => setPhase('result'), 2400);
      }, 4200); // 最終秀卡網後順延 (原為 5200)

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
          {/* ✨ 你寫的粉紫極光與白色璀璨光芒四散效果 */}
          {phase === 'flash' && (
            <div className="magic-ray-container">
              <div className="center-white-core"></div>
              <div className="aurora-wave aw1"></div>
              <div className="aurora-wave aw2"></div>
              <div className="gacha-light-ray r1"></div>
              <div className="gacha-light-ray r2"></div>
              <div className="gacha-light-ray r3"></div>
              <div className="gacha-light-ray r4"></div>
            </div>
          )}

          {phase === 'rarity' && (
            <div className={`gacha-rarity-text ${topRarity} bling-bling-${topRarity.toLowerCase()}`}>
              {topRarity}
            </div>
          )}

          {(phase === 'cards' || phase === 'result') && (
            <>
              <div className={`gacha-top-rarity ${topRarity} bling-bling-${topRarity.toLowerCase()}`}>{topRarity}</div>
              
              {/* 融合你改的大尺寸樣式 `dynamic-cards-view` 與朋友的相片卡牌 HTML */}
              <div className="gacha-cards-row dynamic-cards-view">
                {drawnCards.slice(0, visibleCount).map((card, i) => (
                  <div key={i} className={`gacha-result-card ${card.rarity} large-result-card`}>
                    <div className="card-photo-slot" style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', marginBottom: '10px' }}>
                      <img
                        src={drawnPhotos[i] || `/images/${card.card_id}_${i + 1}.jpg`}
                        alt={card.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { 
                          e.target.style.display = 'none'; 
                          if (e.target.nextSibling) e.target.nextSibling.style.display = 'block'; 
                        }}
                      />
                      <span className="card-emoji-fallback" style={{ display: 'none', fontSize: '3rem', padding: '1rem 0' }}>{card.emoji}</span>
                    </div>
                    <div className="card-name">{card.name}</div>
                    <div className="card-group">{card.group}</div>
                    <div className="card-rarity-badge">{card.rarity}</div>
                  </div>
                ))}
              </div>

              {phase === 'result' && (
                <button className="gacha-confirm-btn enhanced-confirm-btn" onClick={confirmCards}>
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

          {/* 套用你寫的修長型長方形卡包 HTML 與動畫類名 */}
          <div className="blind-box-wrap enhanced-pack-wrap">
            <div
              className={`blind-box custom-slitted-pack ${phase !== 'idle' ? 'is-opening' : ''}`}
              onClick={drawCards}
              style={{ cursor: phase === 'idle' ? 'pointer' : 'default' }}
            >
              <div className="box-body">
                <div className="box-top slitted-top">
                  <svg className="box-svg" viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg">
                    <rect x="5" y="5" width="190" height="120" rx="10" fill="#fcfaff" stroke="#9b6dff" strokeWidth="2"/>
                    <rect x="25" y="25" width="150" height="80" rx="8" fill="#f5f3ff" stroke="rgba(155,109,255,.35)" strokeWidth="1.5"/>
                    <text x="100" y="75" textAnchor="middle" fontSize="40" fill="#9b6dff">✦</text>
                    <rect x="0" y="125" width="200" height="5" fill="#9b6dff" opacity=".6"/>
                  </svg>
                </div>
                <div className="box-bottom slitted-bottom">
                  <svg className="box-svg" viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg">
                    <rect x="5" y="5" width="190" height="120" rx="10" fill="#fcfaff" stroke="#9b6dff" strokeWidth="2"/>
                    <text x="100" y="55" textAnchor="middle" fontSize="14" fill="#8b7bb5" fontWeight="bold" fontFamily="sans-serif">K-POP</text>
                    <text x="100" y="80" textAnchor="middle" fontSize="14" fill="#8b7bb5" fontWeight="bold" fontFamily="sans-serif">MYSTERY BOX</text>
                    <rect x="0" y="0" width="200" height="5" fill="#9b6dff" opacity=".6"/>
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
              style={{ width: '220px', margin: '0 auto', fontWeight: 'bold' }}
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
                  
                  const photoSrc = `/images/${id}_${(idx % 3) + 1}.jpg`;
                  
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