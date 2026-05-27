import { Link, useLocation } from 'react-router-dom';
import { getUsername } from '../utils/state';

export default function Nav({ points }) {
  const { pathname } = useLocation();
  const username = getUsername();
  const profile = username
    ? JSON.parse(localStorage.getItem(`sw_profile_${username}`) || '{}')
    : {};
  const avatarContent = profile.avatarEmoji || (username ? username[0].toUpperCase() : '?');

  return (
    <nav>
      <Link className="nav-logo" to="/">StarWords</Link>
      <div className="nav-links">
        <Link to="/quiz"    className={`nav-link${pathname === '/quiz'    ? ' active' : ''}`}>📚 背單字</Link>
        <Link to="/vocab"   className={`nav-link${pathname === '/vocab'   ? ' active' : ''}`}>📖 單字本</Link>
        <Link to="/gacha"   className={`nav-link${pathname === '/gacha'   ? ' active' : ''}`}>🎁 抽卡包</Link>
        <Link to="/profile" className={`nav-link${pathname === '/profile' ? ' active' : ''}`}>🎴 卡冊</Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
        <div className="nav-points">
          <span style={{ color: 'var(--muted)', fontSize: '.8rem' }}>點數</span>
          <span className="pts-badge">⭐ {points}</span>
        </div>
        {username && (
          <Link to="/user" className={`nav-avatar${pathname === '/user' ? ' active' : ''}`} title="個人頁面">
            {avatarContent}
          </Link>
        )}
      </div>
    </nav>
  );
}
