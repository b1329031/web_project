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

  // 控制連擊加分小視窗的狀態
  const [showComboAward, setShowComboAward] = useState(false);
  const [bonusPoints, setBonusPoints] = useState(0);

  const wordsRef = useRef([]);
  const feedbackTimer = useRef(null);
  const toastTimer = useRef(null);
  const inputRef = useRef(null);

  // 音效 Ref 控制器
  const audioComboRun = useRef(null);
  const audioComboAward = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!username) { navigate('/'); return; }

    // 初始化音效物件
    audioComboRun.current = new Audio('/combo_run.mp3');
    audioComboAward.current = new Audio('/combo_award.mp3');
    audioComboRun.current.loop = true;

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

    return () => {
      if (audioComboRun.current) audioComboRun.current.pause();
      if (audioComboAward.current) audioComboAward.current.pause();
    };
  }, []);

  // 🎵 精準音效排程大腦
  useEffect(() => {
    if (!audioComboRun.current || !audioComboAward.current) return;

    // 狀況 A：正在顯示大額外加分畫面 ➔ 暫停連擊音效，播放大加分特效音
    if (showComboAward) {
      audioComboRun.current.pause();
      audioComboAward.current.currentTime = 0;
      audioComboAward.current.play().catch(() => {});
    } 
    // 狀況 B：沒有加分畫面，且【連擊次數達到 3 次以上】➔ 啟動或恢復連擊循環音效
    else if (combo >= 3) {
      audioComboRun.current.play().catch(() => {});
    } 
    // 狀況 C：完全沒有連擊，或是連擊小於 3 次 ➔ 保持靜音、音效立馬停止
    else {
      audioComboRun.current.pause();
      audioComboRun.current.currentTime = 0;
    }
  }, [combo, showComboAward]);

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

    // 計算最新連擊次數
    const nextCombo = isCorrect ? combo + 1 : 0;

    // 🏆 【全新邏輯】只有指定的里程碑數字（3, 5, 8, 10, 15, 20）才有對應的額外加分
    let extraPoints = 0;
    if (isCorrect) {
      if (nextCombo === 3) extraPoints = 3;
      else if (nextCombo === 5) extraPoints = 5;
      else if (nextCombo === 8) extraPoints = 8;
      else if (nextCombo === 10) extraPoints = 10;
      else if (nextCombo === 15) extraPoints = 15;
      else if (nextCombo === 20) extraPoints = 20;
    }

    try {
      const res = await fetch(`${API}/user/${encodeURIComponent(username)}/answer/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          word_id: currentWord.id, 
          correct: isCorrect, 
          hint_used: hintUsed,
          combo_bonus: extraPoints 
        }),
      });
      const user = await res.json();
      
      // 前端搶先累計總分（基礎分 + 里程碑獎勵分）
      setNavPoints(user.points + extraPoints); 
      setTotalCorrect(user.correct);
      setTotalWrong(user.wrong);
    } catch {}

    if (isCorrect) {
      setCombo(nextCombo);
      setAnsweredSet(prev => new Set([...prev, currentWord.chinese]));
      saveVocabLog(currentWord, true);
      setInputState('correct');
      
      const basePts = hintUsed ? 1 : 2;
      
      // 🏆 只有在「真正獲得額外加分（extraPoints > 0）」時，才彈出全螢幕大視窗
      if (extraPoints > 0) {
        setBonusPoints(extraPoints);
        setShowComboAward(true);
        setFeedbackMsg(`🔥 里程碑達成！額外獲得 +${extraPoints} 點！`, 'ok');
        setTimeout(() => {
          setShowComboAward(false);
          advanceWord();
        }, 1500); 
      } else {
        // 其他連擊數字（例如 4, 6, 7 連擊）只更新上方火焰數字，不打斷遊戲體驗！
        setFeedbackMsg(`✅ 正確！+${basePts} 點`, 'ok');
        setTimeout(advanceWord, 900);
      }
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
          <div className={`panel quiz-panel ${combo >= 3 ? 'frenzy-glow-border' : ''}`}>
            
            <div className="quiz-progress">
              <div className="quiz-progress-bar" style={{ width: `${progress}%` }} />
            </div>
            
            <div style={{ textAlign: 'center', minHeight: '45px', marginBottom: '0.5rem' }}>
              {combo > 0 && (
                <div className={`combo-badge ${combo >= 3 ? 'combo-heartbeat' : ''}`}>
                  🔥 <span>{combo}</span> 連擊！
                </div>
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

            {/* 全螢幕里程碑大加分浮現視窗 */}
            {showComboAward && (
              <div className="combo-award-overlay">
                <div className="combo-award-box">
                  <div className="award-fire">🔥🔥🔥</div>
                  <div className="award-title">{combo} STREAK!</div>
                  <div className="award-bonus">解鎖里程碑 <span>連擊獎勵 +{bonusPoints} 點！✦</span></div>
                </div>
              </div>
            )}

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