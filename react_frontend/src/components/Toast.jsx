import { useEffect, useRef } from 'react';

export default function Toast({ message, type }) {
  const timerRef = useRef(null);

  useEffect(() => {
    clearTimeout(timerRef.current);
  }, [message]);

  if (!message) return <div className="toast" />;
  return <div className={`toast show ${type || 'info'}`}>{message}</div>;
}
