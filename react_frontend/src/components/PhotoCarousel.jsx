import { useState } from 'react';

export default function PhotoCarousel({ cardId, emoji }) {
  const [idx, setIdx] = useState(0);
  const [failed, setFailed] = useState([false, false, false]);

  const total = 3;

  function handleError(i) {
    setFailed(prev => {
      const next = [...prev];
      next[i] = true;
      return next;
    });
  }

  function prev(e) {
    e.stopPropagation();
    setIdx(i => (i - 1 + total) % total);
  }
  function next(e) {
    e.stopPropagation();
    setIdx(i => (i + 1) % total);
  }

  return (
    <div className="card-photo-wrap">
      {[1, 2, 3].map((n, i) => (
        failed[i] ? null : (
          <img
            key={n}
            alt=""
            className={i === idx ? 'active' : ''}
            src={`/images/${cardId}_${n}.jpg`}
            onError={() => handleError(i)}
          />
        )
      ))}
      {failed[idx] && <span className="card-photo-emoji">{emoji}</span>}
      <button className="card-photo-arrow prev" onClick={prev}>‹</button>
      <button className="card-photo-arrow next" onClick={next}>›</button>
      <div className="card-photo-nav">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={`card-photo-dot${i === idx ? ' active' : ''}`}
            onClick={() => setIdx(i)}
          />
        ))}
      </div>
    </div>
  );
}
