import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsername, fetchUser } from '../utils/state';
import Nav from '../components/Nav';

function formatTime(ts) {
  const d = new Date(ts);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function VocabPage() {
  const navigate = useNavigate();
  const username = getUsername();

  const logKey = `sw_vocab_log_${username}`;
  const favKey = `sw_favorites_${username}`;

  const [navPoints, setNavPoints] = useState(0);
  const [log, setLog] = useState(() => JSON.parse(localStorage.getItem(logKey) || '[]'));
  const [favorites, setFavorites] = useState(() => new Set(JSON.parse(localStorage.getItem(favKey) || '[]')));
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'correct' | 'wrong' | 'fav'
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    if (!username) return;
    fetchUser(username).then(u => setNavPoints(u.points)).catch(() => {});
  }, []);

  if (!username) { navigate('/'); return null; }

  function toggleFavorite(chinese) {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(chinese) ? next.delete(chinese) : next.add(chinese);
      localStorage.setItem(favKey, JSON.stringify([...next]));
      return next;
    });
  }

  function clearLog() {
    if (!confirmClear) { setConfirmClear(true); return; }
    localStorage.removeItem(logKey);
    setLog([]);
    setConfirmClear(false);
  }

  const filtered = useMemo(() => {
    let result = log;
    if (filter === 'correct') result = result.filter(w => w.correct);
    else if (filter === 'wrong') result = result.filter(w => !w.correct);
    else if (filter === 'fav') result = result.filter(w => favorites.has(w.chinese));
    const q = search.trim().toLowerCase();
    if (q) result = result.filter(w => w.chinese.includes(q) || w.english.toLowerCase().includes(q));
    return result;
  }, [log, filter, favorites, search]);

  const filterBtns = [
    { key: 'all',     label: '全部' },
    { key: 'correct', label: '✅ 答對', color: 'var(--green)' },
    { key: 'wrong',   label: '❌ 答錯', color: 'var(--red)' },
    { key: 'fav',     label: '❤️ 收藏' },
  ];

  return (
    <>
      <Nav points={navPoints} />
      <main>
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 1.5rem 4rem' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '.75rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)' }}>VOCAB LOG</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '.2rem' }}>
                📖 我的單字本 <span style={{ fontSize: '.9rem', color: 'var(--accent)', fontWeight: 400 }}>({log.length} 筆)</span>
              </div>
            </div>
            {log.length > 0 && (
              <button
                className="btn btn-secondary"
                style={{ fontSize: '.8rem', padding: '.4rem .8rem', color: confirmClear ? 'var(--red)' : undefined, borderColor: confirmClear ? 'var(--red)' : undefined }}
                onClick={clearLog}
                onBlur={() => setConfirmClear(false)}
              >{confirmClear ? '確認清除？' : '清除紀錄'}</button>
            )}
          </div>

          {log.length === 0 ? (
            <div className="panel" style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
              <div style={{ color: 'var(--muted)' }}>還沒有紀錄，去背單字累積吧！</div>
            </div>
          ) : (
            <>
              {/* Search */}
              <input
                className="login-input"
                style={{ marginBottom: '.75rem' }}
                type="text"
                placeholder="搜尋中文或英文..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />

              {/* Filter bar */}
              <div className="vocab-filter-bar">
                {filterBtns.map(({ key, label, color }) => (
                  <button
                    key={key}
                    className={`btn btn-secondary${filter === key ? ' btn-primary' : ''}`}
                    style={{ fontSize: '.8rem', padding: '.35rem .8rem', color: filter !== key ? color : undefined }}
                    onClick={() => setFilter(key)}
                  >{label}</button>
                ))}
                <span style={{ marginLeft: 'auto', fontSize: '.75rem', color: 'var(--muted)' }}>
                  顯示 {filtered.length} / {log.length} 筆
                </span>
              </div>

              {/* List */}
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>找不到符合的紀錄</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                  {filtered.map((w, i) => (
                    <div key={i} className="vocab-entry">
                      <div className="vocab-entry-left">
                        <span className="vocab-chinese">{w.chinese}</span>
                        {w.part_of_speech && <span className="pos-tag">{w.part_of_speech}</span>}
                        <span className="vocab-english">{w.english}</span>
                        <span className={`vocab-result ${w.correct ? 'ok' : 'bad'}`}>
                          {w.correct ? '✓ 正確' : '✗ 錯誤'}
                        </span>
                      </div>
                      <div className="vocab-entry-right">
                        <span className="vocab-time">{formatTime(w.timestamp)}</span>
                        <button
                          className="heart-btn"
                          onClick={() => toggleFavorite(w.chinese)}
                          title={favorites.has(w.chinese) ? '取消收藏' : '加入收藏'}
                        >
                          {favorites.has(w.chinese) ? '❤️' : '🤍'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
