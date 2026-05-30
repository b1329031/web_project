import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsername, fetchUser } from '../utils/state';
import Nav from '../components/Nav';
import Toast from '../components/Toast';

const LEVELS = [
  [0, 'Lv.1', '新手收藏家'],
  [5, 'Lv.2', '初級粉絲'],
  [10, 'Lv.3', '資深粉絲'],
  [20, 'Lv.4', '頂級粉絲'],
  [29, 'Lv.5', '完美收藏家'],
];
function getLevel(n) {
  let result = LEVELS[0];
  for (const entry of LEVELS) if (n >= entry[0]) result = entry;
  return result;
}

const AVATAR_EMOJIS = [
  '🌟','⭐','💫','🌙','🌸','🦋','🎵','🎤','👑','💜',
  '🌺','🍀','✨','🎀','🌈','🐰','🐱','🐻','🌹','🎭',
];

export default function UserPage() {
  const navigate = useNavigate();
  const username = getUsername();
  const profileKey = `sw_profile_${username}`;

  const [user, setUser] = useState(null);
  const [collectionCount, setCollectionCount] = useState(0);
  const [navPoints, setNavPoints] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });
  const toastTimer = useRef(null);

  const [profile, setProfile] = useState(() =>
    JSON.parse(localStorage.getItem(profileKey) || '{"avatarEmoji":"","birthday":"","school":"","grade":""}')
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!username) { navigate('/'); return; }
    fetchUser(username)
      .then(u => {
        setUser(u);
        setNavPoints(u.points);
        setCollectionCount((u.collection || []).length);
      })
      .catch(() => {});
  }, []);

  function showToast(message, type = 'info') {
    clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast({ message: '', type: '' }), 2800);
  }

  function saveProfile() {
    localStorage.setItem(profileKey, JSON.stringify(profile));
    setSaved(true);
    setShowPicker(false);
    showToast('個人資料已儲存！', 'success');
    setTimeout(() => setSaved(false), 2000);
  }

  const [lvNum, lvLabel] = getLevel(collectionCount).slice(1);
  const avatarContent = profile.avatarEmoji || username[0].toUpperCase();
  const acc = user && (user.correct + user.wrong) > 0
    ? Math.round(user.correct / (user.correct + user.wrong) * 100) + '%'
    : '—';

  return (
    <>
      <Nav points={navPoints} />
      <main>
        <div style={{ maxWidth: '520px', margin: '0 auto', padding: '0 1.5rem 4rem' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', padding: '1.5rem 0 2rem' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
              <div className="user-avatar-lg">{avatarContent}</div>
              <button className="avatar-edit-btn" onClick={() => setShowPicker(v => !v)} title="更換頭像">✎</button>
            </div>

            {showPicker && (
              <div className="emoji-picker">
                {AVATAR_EMOJIS.map(e => (
                  <button
                    key={e}
                    className={`emoji-btn${profile.avatarEmoji === e ? ' selected' : ''}`}
                    onClick={() => setProfile(p => ({ ...p, avatarEmoji: e }))}
                  >{e}</button>
                ))}
                {profile.avatarEmoji && (
                  <button
                    className="emoji-btn clear-btn"
                    onClick={() => setProfile(p => ({ ...p, avatarEmoji: '' }))}
                  >使用首字母</button>
                )}
              </div>
            )}

            <div style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '.5rem' }}>{username}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem' }}>
              <span className="level-badge">{lvNum}</span>
              <span style={{ fontSize: '.85rem', color: 'var(--muted)' }}>{lvLabel}</span>
            </div>
          </div>

          {/* 個人資料 */}
          <div className="panel">
            <div className="section-title" style={{ marginBottom: '1.25rem' }}>個人資料</div>
            <div className="profile-field">
              <label>🎂 生日 <span style={{ color: 'var(--muted)', fontSize: '.72rem' }}>（選填）</span></label>
              <input
                type="date"
                value={profile.birthday}
                onChange={e => setProfile(p => ({ ...p, birthday: e.target.value }))}
              />
            </div>
            <div className="profile-field">
              <label>🏫 學校 <span style={{ color: 'var(--muted)', fontSize: '.72rem' }}>（選填）</span></label>
              <input
                type="text"
                placeholder="例：長庚大學"
                value={profile.school}
                onChange={e => setProfile(p => ({ ...p, school: e.target.value }))}
              />
            </div>
            <div className="profile-field" style={{ marginBottom: 0 }}>
              <label>📚 年級 <span style={{ color: 'var(--muted)', fontSize: '.72rem' }}>（選填）</span></label>
              <input
                type="text"
                placeholder="例：大二"
                value={profile.grade}
                onChange={e => setProfile(p => ({ ...p, grade: e.target.value }))}
              />
            </div>
            <button
              className="btn btn-primary btn-full"
              style={{ marginTop: '1.25rem' }}
              onClick={saveProfile}
            >
              {saved ? '✅ 已儲存' : '儲存資料'}
            </button>
          </div>

          {/* 答題紀錄 */}
          <div className="panel" style={{ marginTop: '1.5rem' }}>
            <div className="section-title" style={{ marginBottom: '1.25rem' }}>答題紀錄</div>
            <div className="stats-grid">
              {[
                { val: user?.correct ?? '—', label: '✅答對次數' },
                { val: user?.wrong ?? '—', label: '❌答錯次數' },
                { val: acc, label: '📊整體正確率' },
                { val: user?.points ?? '—', label: '⭐剩餘點數' },
              ].map(({ val, label }) => (
                <div key={label} className="stat-card">
                  <div className="stat-num">{val}</div>
                  <div className="stat-label">{label}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
      <Toast message={toast.message} type={toast.type} />
    </>
  );
}
