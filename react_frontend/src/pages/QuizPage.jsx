import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsername, fetchUser, API } from '../utils/state';
import Nav from '../components/Nav';
import Toast from '../components/Toast';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuizPage() {
  const navigate = useNavigate();
  const username = getUsername();

  const [words, setWords] = useState([]);
  const [curIdx, setCurIdx] = useState(0);
  const [combo, setCombo] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalWrong, setTotalWrong] = useState(0);
  const [answeredSet, setAnsweredSet] = useState(new Set());
  const [navPoints, setNavPoints] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [inputState, setInputState] = useState('');
  const [feedback, setFeedback] = useState({ msg: '', type: '' });
  const [toast, setToast] = useState({ message: '', type: '' });
  const [loaded, setLoaded] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [hintLetter, setHintLetter] = useState('');

  const wordsRef = useRef([]);
  const feedbackTimer = useRef(null);
  const toastTimer = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!username) { navigate('/'); return; }
    Promise.all([fetch(`${API}/words/`), fetchUser(username)])
      .then(async ([wRes, user]) => {
        const shuffled = shuffle(await wRes.json());
        wordsRef.current = shuffled;
        setWords(shuffled);
        setTotalCorrect(user.correct);
        setTotalWrong(user.wrong);
        setNavPoints(user.points);
        setLoaded(true);
      })
      .catch(() => showToast('請確認後端伺服器已啟動', 'error'));
  }, []);

  function saveVocabLog(word, isCorrect) {
    const key = `sw_vocab_log_${username}`;
    const log = JSON.parse(localStorage.getItem(key) || '[]');
    const entry = {
      chinese: word.chinese,
      english: word.english,
      part_of_speech: word.part_of_speech || '',
      timestamp: Date.now(),
      correct: isCorrect,
    };
    localStorage.setItem(key, JSON.stringify([entry, ...log].slice(0, 300)));
  }

  function showToast(message, type = 'info') {
    clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast({ message: '', type: '' }), 2800);
  }

  function setFeedbackMsg(msg, type) {
    clearTimeout(feedbackTimer.current);
    setFeedback({ msg, type });
    feedbackTimer.current = setTimeout(() => setFeedback({ msg: '', type: '' }), 2000);
  }

  function useHint() {
    if (hintUsed || !currentWord) return;
    setHintUsed(true);
    setHintLetter(currentWord.english[0].toUpperCase());
  }

  function advanceWord() {
    setHintUsed(false);
    setHintLetter('');
    setInputVal('');
    setInputState('');
    setCurIdx(i => {
      const next = i + 1;
      if (next >= words.length) {
        const reshuffled = shuffle([...wordsRef.current]);
        setWords(reshuffled);
        return 0;
      }
      return next;
    });
    inputRef.current?.focus();
  }

  const currentWord = words.length ? words[curIdx % words.length] : null;
  const progress = words.length ? (answeredSet.size / words.length) * 100 : 0;

  async function submitAnswer() {
    if (!currentWord || !inputVal.trim()) return;
    const ans = inputVal.trim().toLowerCase();
    const isCorrect = ans === currentWord.english.toLowerCase();

    try {
      const res = await fetch(`${API}/user/${encodeURIComponent(username)}/answer/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word_id: currentWord.id, correct: isCorrect, hint_used: hintUsed }),
      });
      const user = await res.json();
      setNavPoints(user.points);
      setTotalCorrect(user.correct);
      setTotalWrong(user.wrong);
    } catch {}

    if (isCorrect) {
      setCombo(c => c + 1);
      setAnsweredSet(prev => new Set([...prev, currentWord.chinese]));
      saveVocabLog(currentWord, true);
      setInputState('correct');
      const pts = hintUsed ? '+1 點' : '+2 點';
      setFeedbackMsg(`✅ 正確！${pts}`, 'ok');
      setTimeout(advanceWord, 900);
    } else {
      setCombo(0);
      saveVocabLog(currentWord, false);
      setInputState('wrong');
      setFeedbackMsg(`❌ 答錯了！答案是：${currentWord.english}`, 'bad');
      setTimeout(advanceWord, 1500);
    }
  }

  function skipWord() {
    setCombo(0);
    advanceWord();
  }

  return (
    <>
      <Nav points={navPoints} />
      <main>
        <div id="quiz-section">
          <div className="panel">
            <div className="quiz-progress">
              <div className="quiz-progress-bar" style={{ width: `${progress}%` }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              {combo > 1 && (
                <div className="combo-badge">🔥 <span>{combo}</span> 連擊！</div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div className="quiz-group-tag" style={{ marginBottom: 0 }}>詞彙練習</div>
              <button
                className="btn-hint"
                onClick={useHint}
                disabled={hintUsed || !loaded}
                title={hintUsed ? '已使用提示' : '顯示首字母（-1 點）'}
              >💡</button>
            </div>
            <div className="quiz-word">
              {loaded ? (
                currentWord ? (
                  <>
                    {currentWord.part_of_speech && (
                      <span style={{ fontSize: '2rem', color: 'var(--text)', fontWeight: 500, marginRight: '.2rem', letterSpacing: 0 }}>
                        {currentWord.part_of_speech}
                      </span>
                    )}
                    {currentWord.chinese}
                  </>
                ) : '—'
              ) : '載入中...'}
            </div>
            <div className="quiz-hint" style={{ minHeight: '2.4rem' }}>
              {loaded && currentWord ? (
                <>
                  提示：{currentWord.english.length} 個字母
                  {hintLetter && (
                    <span className="hint-letter" style={{ marginLeft: '.6rem' }}>
                      首字母：{hintLetter}
                    </span>
                  )}
                </>
              ) : '輸入對應的英文單字'}
            </div>
            <input
              ref={inputRef}
              className={`quiz-input${inputState ? ' ' + inputState : ''}`}
              type="text"
              placeholder="輸入英文..."
              autoComplete="off"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitAnswer()}
            />
            <div className={`feedback-msg${feedback.type ? ' ' + feedback.type : ''}`}>{feedback.msg}</div>
            <div className="quiz-actions">
              <button className="btn btn-secondary" onClick={skipWord}>跳過</button>
              <button className="btn btn-primary" onClick={submitAnswer}>確認 ↵</button>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '.85rem', color: 'var(--muted)' }}>
            <span>答對 <b style={{ color: 'var(--green)' }}>{totalCorrect}</b></span>
            <span>答錯 <b style={{ color: 'var(--red)' }}>{totalWrong}</b></span>
            <span>已解鎖 <b style={{ color: 'var(--accent)' }}>{answeredSet.size}</b> 個</span>
          </div>
        </div>
      </main>
      <Toast message={toast.message} type={toast.type} />
    </>
  );
}
