import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsername, fetchUser, API } from '../utils/state';
import { CARDS_LOCAL } from '../data';
import Nav from '../components/Nav';
import PhotoCarousel from '../components/PhotoCarousel';
import Toast from '../components/Toast';

const rarityColor = { SSR: 'var(--gold)', SR: 'var(--accent)', R: 'var(--accent2)', N: 'var(--muted)' };

export default function ProfilePage() {
  const navigate = useNavigate();
  const username = getUsername();

  const [allCards, setAllCards] = useState(CARDS_LOCAL);
  const [myCollection, setMyCollection] = useState([]);
  const [filter, setFilter] = useState('all');
  const [navPoints, setNavPoints] = useState(0);
  const [modalCard, setModalCard] = useState(null);
  const [toast, setToast] = useState({ message: '', type: '' });
  const toastTimer = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!username) { navigate('/'); return; }
    Promise.all([fetch(`${API}/cards/`), fetchUser(username)])
      .then(async ([cRes, u]) => {
        setAllCards(await cRes.json());
        setMyCollection(u.collection || []);
        setNavPoints(u.points);
      })
      .catch(() => showToast('請確認後端伺服器已啟動', 'error'));
  }, []);

  function showToast(message, type = 'info') {
    clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast({ message: '', type: '' }), 2800);
  }

  const have = myCollection.length;
  const total = allCards.length;
  const pct = total > 0 ? Math.round(have / total * 100) : 0;

  let visibleCards = allCards;
  if (filter === 'owned') visibleCards = allCards.filter(c => myCollection.includes(c.card_id));
  else if (['SSR', 'SR', 'R', 'N'].includes(filter)) visibleCards = allCards.filter(c => c.rarity === filter);

  return (
    <>
      <Nav points={navPoints} />
      <main>
        <div id="profile-section">

          <div className="panel">
            <div className="section-title">收集進度</div>
            <div className="progress-wrap">
              <div className="progress-label">
                <span>{have} / {total} 張</span>
                <span>{pct}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '.5rem', fontSize: '.75rem', textAlign: 'center', color: 'var(--muted)' }}>
              {['SSR', 'SR', 'R', 'N'].map(r => (
                <div key={r}>
                  <div style={{ color: rarityColor[r], fontWeight: 700, fontSize: '1.1rem' }}>
                    {allCards.filter(c => c.rarity === r && myCollection.includes(c.card_id)).length}
                  </div>
                  {r}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="section-title" style={{ marginBottom: '1rem' }}>我的小卡</div>
            <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              {[
                { key: 'all',   label: '全部',  color: undefined },
                { key: 'SSR',   label: 'SSR',   color: 'var(--gold)' },
                { key: 'SR',    label: 'SR',    color: 'var(--accent)' },
                { key: 'R',     label: 'R',     color: 'var(--accent2)' },
                { key: 'N',     label: 'N',     color: undefined },
                { key: 'owned', label: '已收集', color: 'var(--green)', ml: 'auto' },
              ].map(({ key, label, color, ml }) => (
                <button
                  key={key}
                  className={`btn btn-secondary${filter === key ? ' btn-primary' : ''}`}
                  style={{ fontSize: '.8rem', padding: '.4rem .8rem', color: filter !== key ? color : undefined, marginLeft: ml }}
                  onClick={() => setFilter(key)}
                >{label}</button>
              ))}
            </div>
            <div className="collection-grid">
              {visibleCards.map(card => {
                const owned = myCollection.includes(card.card_id);
                return (
                  <div
                    key={card.card_id}
                    className={`coll-card${owned ? '' : ' locked'}`}
                    title={owned ? card.name : '???'}
                    onClick={() => owned && setModalCard(card)}
                  >
                    {owned && (
                      <img
                        className="c-photo"
                        src={`/images/${card.card_id}_1.jpg`}
                        alt={card.name}
                        onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                      />
                    )}
                    <span className="c-emoji-wrap" style={{ display: owned ? 'none' : undefined }}>
                      {owned ? card.emoji : '❓'}
                    </span>
                    <div className="c-info">
                      <div className="c-name">{owned ? card.name : '???'}</div>
                      <div className="c-rarity" style={{ color: rarityColor[card.rarity] }}>{card.rarity}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {modalCard && (
        <div className="modal-overlay show" onClick={e => { if (e.target.classList.contains('modal-overlay')) setModalCard(null); }}>
          <div className={`modal-box rarity-${modalCard.rarity}`}>
            <PhotoCarousel cardId={modalCard.card_id} emoji={modalCard.emoji} />
            <div className="idol-info" style={{ padding: '1rem 1.25rem 1.25rem' }}>
              <div className="idol-name">{modalCard.name}</div>
              <div className="idol-group" style={{ fontSize: '.85rem', color: 'var(--muted)', marginBottom: '.5rem' }}>{modalCard.group}</div>
              <span className="rarity-tag">{modalCard.rarity}</span>
              <div className="idol-quote">"{modalCard.quote}"</div>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast.message} type={toast.type} />
    </>
  );
}
