import { useState, useEffect, useCallback, useRef } from "react";

// ── Palette & Fonts ──────────────────────────────────────────────────────────
const G = {
  bg: "#F8F6F1",
  card: "#FFFFFF",
  border: "#E8E2D9",
  ink: "#1C1917",
  muted: "#78716C",
  accent: "#D97706",
  accentLight: "#FEF3C7",
  accentDark: "#92400E",
  green: "#059669",
  greenLight: "#D1FAE5",
  red: "#DC2626",
  redLight: "#FEE2E2",
  blue: "#2563EB",
  blueLight: "#DBEAFE",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Source+Serif+4:ital,wght@0,300;0,400;1,300&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${G.bg}; font-family: 'Source Serif 4', Georgia, serif; color: ${G.ink}; }

  .app { min-height: 100vh; display: flex; flex-direction: column; }

  /* Header */
  .header {
    background: ${G.card};
    border-bottom: 1.5px solid ${G.border};
    padding: 18px 32px;
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 10;
  }
  .logo { font-family: 'Playfair Display', serif; font-size: 1.6rem; color: ${G.ink}; letter-spacing: -0.5px; }
  .logo span { color: ${G.accent}; }
  .score-bar { display: flex; gap: 20px; align-items: center; }
  .score-chip {
    background: ${G.accentLight}; border: 1.5px solid #FCD34D;
    border-radius: 999px; padding: 4px 16px; font-size: 0.85rem;
    color: ${G.accentDark}; font-weight: 600; letter-spacing: 0.3px;
  }

  /* Hub */
  .hub { max-width: 820px; margin: 0 auto; padding: 48px 24px; width: 100%; }
  .hub-title { font-family: 'Playfair Display', serif; font-size: 2rem; margin-bottom: 8px; }
  .hub-sub { color: ${G.muted}; font-size: 1rem; margin-bottom: 40px; font-style: italic; }

  .game-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }
  .game-card {
    background: ${G.card}; border: 1.5px solid ${G.border}; border-radius: 14px;
    padding: 28px 24px; cursor: pointer; transition: all 0.18s ease;
    position: relative; overflow: hidden;
  }
  .game-card:hover { border-color: ${G.accent}; transform: translateY(-3px); box-shadow: 0 8px 28px rgba(0,0,0,0.08); }
  .game-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: ${G.accent}; opacity: 0; transition: opacity 0.18s; }
  .game-card:hover::before { opacity: 1; }
  .card-icon { font-size: 2.2rem; margin-bottom: 14px; }
  .card-name { font-family: 'Playfair Display', serif; font-size: 1.15rem; margin-bottom: 6px; }
  .card-desc { color: ${G.muted}; font-size: 0.85rem; line-height: 1.5; }
  .card-best { margin-top: 12px; font-size: 0.78rem; color: ${G.accent}; font-weight: 600; }

  /* Game container */
  .game-wrap { max-width: 640px; margin: 0 auto; padding: 40px 24px; width: 100%; }
  .back-btn {
    background: none; border: 1.5px solid ${G.border}; border-radius: 8px;
    padding: 8px 18px; cursor: pointer; font-family: 'Source Serif 4', serif;
    font-size: 0.9rem; color: ${G.muted}; margin-bottom: 32px;
    display: inline-flex; align-items: center; gap: 6px; transition: all 0.15s;
  }
  .back-btn:hover { border-color: ${G.accent}; color: ${G.accent}; }

  .game-header { margin-bottom: 32px; }
  .game-title { font-family: 'Playfair Display', serif; font-size: 1.8rem; margin-bottom: 4px; }
  .game-meta { color: ${G.muted}; font-size: 0.9rem; display: flex; gap: 16px; align-items: center; }

  /* Timer bar */
  .timer-track { height: 5px; background: ${G.border}; border-radius: 99px; margin-bottom: 28px; overflow: hidden; }
  .timer-fill { height: 100%; background: ${G.accent}; border-radius: 99px; transition: width 0.9s linear; }
  .timer-fill.urgent { background: ${G.red}; }

  /* Question card */
  .q-card {
    background: ${G.card}; border: 1.5px solid ${G.border}; border-radius: 16px;
    padding: 36px 32px; margin-bottom: 24px; text-align: center;
  }
  .q-label { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1.5px; color: ${G.muted}; margin-bottom: 16px; }
  .q-text { font-family: 'Playfair Display', serif; font-size: 2rem; line-height: 1.3; }
  .q-sub { color: ${G.muted}; font-size: 0.9rem; margin-top: 10px; font-style: italic; }

  /* Options */
  .options { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
  .opt-btn {
    background: ${G.card}; border: 1.5px solid ${G.border}; border-radius: 10px;
    padding: 16px; cursor: pointer; font-family: 'Source Serif 4', serif;
    font-size: 1.05rem; color: ${G.ink}; transition: all 0.15s; line-height: 1.4;
  }
  .opt-btn:hover:not(:disabled) { border-color: ${G.accent}; background: ${G.accentLight}; }
  .opt-btn.correct { background: ${G.greenLight}; border-color: ${G.green}; color: ${G.green}; }
  .opt-btn.wrong { background: ${G.redLight}; border-color: ${G.red}; color: ${G.red}; }
  .opt-btn:disabled { cursor: default; }

  /* Text input */
  .text-input-wrap { display: flex; gap: 10px; margin-bottom: 24px; }
  .text-input {
    flex: 1; border: 1.5px solid ${G.border}; border-radius: 10px;
    padding: 14px 18px; font-family: 'Source Serif 4', serif; font-size: 1.1rem;
    background: ${G.card}; color: ${G.ink}; outline: none; transition: border 0.15s;
    text-align: center; letter-spacing: 2px;
  }
  .text-input:focus { border-color: ${G.accent}; }
  .submit-btn {
    background: ${G.accent}; color: white; border: none; border-radius: 10px;
    padding: 14px 24px; cursor: pointer; font-family: 'Source Serif 4', serif;
    font-size: 1rem; font-weight: 600; transition: background 0.15s;
  }
  .submit-btn:hover { background: ${G.accentDark}; }

  /* Feedback */
  .feedback {
    text-align: center; padding: 14px; border-radius: 10px; margin-bottom: 20px;
    font-size: 1rem; font-weight: 600;
  }
  .feedback.correct { background: ${G.greenLight}; color: ${G.green}; }
  .feedback.wrong { background: ${G.redLight}; color: ${G.red}; }

  /* Progress */
  .progress-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: ${G.muted}; }
  .pip-row { display: flex; gap: 6px; }
  .pip { width: 28px; height: 6px; border-radius: 99px; background: ${G.border}; }
  .pip.done-correct { background: ${G.green}; }
  .pip.done-wrong { background: ${G.red}; }
  .pip.current { background: ${G.accent}; }

  /* Results */
  .results-card {
    background: ${G.card}; border: 1.5px solid ${G.border}; border-radius: 18px;
    padding: 48px 40px; text-align: center;
  }
  .results-icon { font-size: 3.5rem; margin-bottom: 16px; }
  .results-title { font-family: 'Playfair Display', serif; font-size: 2rem; margin-bottom: 8px; }
  .results-score { font-size: 3.5rem; font-family: 'Playfair Display', serif; color: ${G.accent}; margin: 20px 0 6px; }
  .results-sub { color: ${G.muted}; font-size: 1rem; margin-bottom: 32px; font-style: italic; }
  .results-row { display: flex; justify-content: center; gap: 40px; margin-bottom: 36px; }
  .results-stat { }
  .results-stat-val { font-size: 1.6rem; font-family: 'Playfair Display', serif; }
  .results-stat-lbl { font-size: 0.8rem; color: ${G.muted}; text-transform: uppercase; letter-spacing: 1px; }
  .play-again {
    background: ${G.accent}; color: white; border: none; border-radius: 10px;
    padding: 14px 36px; cursor: pointer; font-family: 'Source Serif 4', serif;
    font-size: 1.05rem; font-weight: 600; margin-right: 12px; transition: background 0.15s;
  }
  .play-again:hover { background: ${G.accentDark}; }
  .go-home {
    background: none; border: 1.5px solid ${G.border}; border-radius: 10px;
    padding: 14px 24px; cursor: pointer; font-family: 'Source Serif 4', serif;
    font-size: 1.05rem; color: ${G.muted}; transition: all 0.15s;
  }
  .go-home:hover { border-color: ${G.accent}; color: ${G.accent}; }

  /* Anagram tiles */
  .tile-row { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin: 20px 0; }
  .tile {
    width: 46px; height: 52px; background: ${G.card}; border: 1.5px solid ${G.border};
    border-radius: 8px; display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif; font-size: 1.3rem; cursor: pointer;
    transition: all 0.12s; user-select: none;
    box-shadow: 0 2px 6px rgba(0,0,0,0.06);
  }
  .tile:hover { border-color: ${G.accent}; transform: translateY(-2px); }
  .tile.used { opacity: 0.25; cursor: default; transform: none; }
  .tile.selected { background: ${G.accentLight}; border-color: ${G.accent}; }
  .answer-slots { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-bottom: 20px; min-height: 60px; }
  .slot {
    width: 46px; height: 52px; border: 1.5px dashed ${G.border}; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif; font-size: 1.3rem; cursor: pointer;
    background: ${G.bg}; transition: border-color 0.12s;
  }
  .slot.filled { background: ${G.card}; border-style: solid; border-color: ${G.border}; }
  .slot.filled:hover { border-color: ${G.red}; }
  .hint-text { color: ${G.muted}; font-style: italic; font-size: 0.9rem; margin-bottom: 12px; }
`;

// ── Data ─────────────────────────────────────────────────────────────────────

function genArithmetic() {
  const ops = ["+", "-", "×", "÷"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a, b, answer, question;
  if (op === "+") { a = rand(10,99); b = rand(10,99); answer = a+b; question = `${a} + ${b}`; }
  else if (op === "-") { a = rand(20,99); b = rand(10,a); answer = a-b; question = `${a} − ${b}`; }
  else if (op === "×") { a = rand(2,12); b = rand(2,12); answer = a*b; question = `${a} × ${b}`; }
  else { a = rand(2,12); b = rand(2,12); answer = a; question = `${a*b} ÷ ${b}`; a = a*b; }
  const choices = shuffle([answer, answer+rand(1,8), answer-rand(1,8), answer+rand(9,15)]).map(Math.abs);
  return { question, answer: String(answer), choices: [...new Set(choices)].slice(0,4).map(String), type: "mcq" };
}

function rand(min, max) { return Math.floor(Math.random()*(max-min+1))+min; }
function shuffle(a) { const b=[...a]; for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b; }

const SEQUENCES = [
  { q:"2, 4, 6, 8, ?", a:"10", hint:"Even numbers" },
  { q:"1, 4, 9, 16, ?", a:"25", hint:"Perfect squares" },
  { q:"1, 1, 2, 3, 5, ?", a:"8", hint:"Fibonacci sequence" },
  { q:"3, 6, 12, 24, ?", a:"48", hint:"Multiply by 2" },
  { q:"100, 90, 81, 73, ?", a:"66", hint:"Decreasing differences" },
  { q:"2, 3, 5, 7, 11, ?", a:"13", hint:"Prime numbers" },
  { q:"5, 10, 20, 40, ?", a:"80", hint:"Multiply by 2" },
  { q:"1, 8, 27, 64, ?", a:"125", hint:"Cubed numbers" },
  { q:"0, 1, 3, 6, 10, ?", a:"15", hint:"Triangular numbers" },
  { q:"7, 14, 21, 28, ?", a:"35", hint:"Multiples of 7" },
];

const ANAGRAMS = [
  { word:"PLANET", hint:"Orbits the sun" },
  { word:"MASTER", hint:"Expert or teacher" },
  { word:"GARDEN", hint:"Outdoor growing space" },
  { word:"BRIDGE", hint:"Connects two sides" },
  { word:"CANDLE", hint:"Gives off light when lit" },
  { word:"FRIEND", hint:"A close companion" },
  { word:"PURPLE", hint:"A royal colour" },
  { word:"CASTLE", hint:"A medieval fortress" },
  { word:"JUNGLE", hint:"Dense tropical forest" },
  { word:"BOTTLE", hint:"Glass container for liquids" },
  { word:"FROZEN", hint:"Turned to ice" },
  { word:"SILVER", hint:"Precious grey metal" },
];

const SYNONYMS = [
  { word:"HAPPY", choices:["Joyful","Miserable","Angry","Bored"], answer:"Joyful" },
  { word:"DIFFICULT", choices:["Easy","Arduous","Simple","Brief"], answer:"Arduous" },
  { word:"BRAVE", choices:["Fearful","Shy","Valiant","Lazy"], answer:"Valiant" },
  { word:"ANCIENT", choices:["Modern","Archaic","Fresh","New"], answer:"Archaic" },
  { word:"SMART", choices:["Foolish","Astute","Dull","Weak"], answer:"Astute" },
  { word:"MYSTERIOUS", choices:["Clear","Obvious","Enigmatic","Plain"], answer:"Enigmatic" },
  { word:"HUGE", choices:["Tiny","Small","Minute","Colossal"], answer:"Colossal" },
  { word:"CALM", choices:["Agitated","Serene","Frantic","Wild"], answer:"Serene" },
  { word:"WEAK", choices:["Strong","Robust","Feeble","Mighty"], answer:"Feeble" },
  { word:"SPEAK", choices:["Listen","Utter","Hear","Silence"], answer:"Utter" },
];

const ODD_ONE_OUT = [
  { items:["Apple","Banana","Carrot","Grape"], answer:"Carrot", reason:"It's a vegetable" },
  { items:["Paris","London","Rome","Amazon"], answer:"Amazon", reason:"It's a river, not a European capital" },
  { items:["Piano","Violin","Flute","Hammer"], answer:"Hammer", reason:"Not a musical instrument" },
  { items:["Triangle","Square","Sphere","Rectangle"], answer:"Sphere", reason:"It's 3D, the others are 2D shapes" },
  { items:["January","March","July","September"], answer:"September", reason:"It has 30 days; the others have 31" },
  { items:["Dog","Cat","Eagle","Rabbit"], answer:"Eagle", reason:"The only bird" },
  { items:["Red","Blue","Green","Loud"], answer:"Loud", reason:"Not a colour" },
  { items:["Mercury","Venus","Moon","Mars"], answer:"Moon", reason:"Not a planet" },
  { items:["2","4","7","8"], answer:"7", reason:"The only odd number" },
  { items:["Noun","Verb","Adjective","Comma"], answer:"Comma", reason:"Not a part of speech" },
];

// ── Games config ─────────────────────────────────────────────────────────────

const GAMES = [
  { id:"arithmetic", icon:"➕", name:"Mental Maths", desc:"Quick-fire arithmetic across all four operations.", color: G.accentLight },
  { id:"sequences", icon:"🔢", name:"Number Sequences", desc:"Complete the pattern — logic and lateral thinking.", color: G.blueLight },
  { id:"anagram", icon:"🔤", name:"Anagram Solver", desc:"Unscramble the letters to find the hidden word.", color: G.greenLight },
  { id:"synonyms", icon:"📖", name:"Word Match", desc:"Find the closest synonym for each word.", color: "#F3E8FF" },
  { id:"oddoneout", icon:"🔍", name:"Odd One Out", desc:"Spot the item that doesn't belong in the group.", color: "#FCE7F3" },
];

const ROUND_SIZE = 8;
const TIMER_SECS = 20;

// ── ScoreStore ────────────────────────────────────────────────────────────────

function useScores() {
  const [scores, setScores] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ms_scores") || "{}"); } catch { return {}; }
  });
  const save = (id, val) => {
    setScores(prev => {
      const next = { ...prev, [id]: Math.max(prev[id]||0, val) };
      try { localStorage.setItem("ms_scores", JSON.stringify(next)); } catch {}
      return next;
    });
  };
  return [scores, save];
}

// ── Components ────────────────────────────────────────────────────────────────

function TimerBar({ secs, total }) {
  const pct = (secs / total) * 100;
  return (
    <div className="timer-track">
      <div className="timer-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

function PipRow({ total, results, current }) {
  return (
    <div className="pip-row">
      {Array.from({ length: total }).map((_, i) => {
        let cls = "pip";
        if (i < results.length) cls += results[i] ? " done-correct" : " done-wrong";
        else if (i === current) cls += " current";
        return <div key={i} className={cls} />;
      })}
    </div>
  );
}

// ── Arithmetic Game ───────────────────────────────────────────────────────────

function ArithmeticGame({ onDone }) {
  const [questions] = useState(() => Array.from({length:ROUND_SIZE}, genArithmetic));
  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState([]);
  const [chosen, setChosen] = useState(null);
  const [secs, setSecs] = useState(TIMER_SECS);

  const q = questions[idx];

  useEffect(() => {
    if (chosen !== null) return;
    setSecs(TIMER_SECS);
    const iv = setInterval(() => setSecs(s => {
      if (s <= 1) { clearInterval(iv); handleAnswer(null); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(iv);
  }, [idx, chosen]);

  const handleAnswer = (c) => {
    if (chosen !== null) return;
    setChosen(c);
    const correct = c === q.answer;
    setTimeout(() => {
      const next = [...results, correct];
      if (idx + 1 >= ROUND_SIZE) { onDone(next); }
      else { setResults(next); setIdx(i => i+1); setChosen(null); }
    }, 900);
  };

  return (
    <div>
      <TimerBar secs={secs} total={TIMER_SECS} />
      <div className="q-card">
        <div className="q-label">Question {idx+1} of {ROUND_SIZE}</div>
        <div className="q-text">{q.question} = ?</div>
      </div>
      <div className="options">
        {q.choices.map(c => {
          let cls = "opt-btn";
          if (chosen !== null) {
            if (c === q.answer) cls += " correct";
            else if (c === chosen) cls += " wrong";
          }
          return <button key={c} className={cls} onClick={() => handleAnswer(c)} disabled={chosen!==null}>{c}</button>;
        })}
      </div>
      <div className="progress-row">
        <PipRow total={ROUND_SIZE} results={results} current={idx} />
        <span>⏱ {secs}s</span>
      </div>
    </div>
  );
}

// ── Sequences Game ────────────────────────────────────────────────────────────

function SequencesGame({ onDone }) {
  const [questions] = useState(() => shuffle(SEQUENCES).slice(0, ROUND_SIZE));
  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState([]);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [secs, setSecs] = useState(TIMER_SECS);
  const inputRef = useRef();

  const q = questions[idx];

  useEffect(() => {
    setInput(""); setFeedback(null); setShowHint(false); setSecs(TIMER_SECS);
    inputRef.current?.focus();
    const iv = setInterval(() => setSecs(s => {
      if (s <= 1) { clearInterval(iv); advance(false); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(iv);
  }, [idx]);

  const advance = (correct) => {
    const next = [...results, correct];
    setTimeout(() => {
      if (idx + 1 >= ROUND_SIZE) onDone(next);
      else { setResults(next); setIdx(i => i+1); }
    }, 1000);
  };

  const submit = () => {
    if (feedback) return;
    const correct = input.trim() === q.a;
    setFeedback(correct ? "correct" : "wrong");
    advance(correct);
  };

  return (
    <div>
      <TimerBar secs={secs} total={TIMER_SECS} />
      <div className="q-card">
        <div className="q-label">Complete the sequence</div>
        <div className="q-text">{q.q}</div>
        {showHint && <div className="q-sub">💡 {q.hint}</div>}
      </div>
      {!showHint && <p style={{textAlign:"center", marginBottom:12}}><button onClick={()=>setShowHint(true)} style={{background:"none",border:`1px solid ${G.border}`,borderRadius:6,padding:"4px 14px",cursor:"pointer",color:G.muted,fontSize:"0.85rem"}}>Show hint</button></p>}
      {feedback && <div className={`feedback ${feedback}`}>{feedback==="correct" ? "✓ Correct!" : `✗ The answer was ${q.a}`}</div>}
      <div className="text-input-wrap">
        <input ref={inputRef} className="text-input" value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="Your answer" disabled={!!feedback} />
        <button className="submit-btn" onClick={submit} disabled={!!feedback}>Check</button>
      </div>
      <div className="progress-row">
        <PipRow total={ROUND_SIZE} results={results} current={idx} />
        <span>⏱ {secs}s</span>
      </div>
    </div>
  );
}

// ── Anagram Game ──────────────────────────────────────────────────────────────

function AnagramGame({ onDone }) {
  const [questions] = useState(() => shuffle(ANAGRAMS).slice(0, ROUND_SIZE));
  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const q = questions[idx];
  const [tiles, setTiles] = useState(() => shuffle(q.word.split("")));
  const [answer, setAnswer] = useState([]);

  useEffect(() => {
    const q2 = questions[idx];
    setTiles(shuffle(q2.word.split("")));
    setAnswer([]); setFeedback(null);
  }, [idx]);

  const pickTile = (i) => {
    if (feedback) return;
    if (answer.includes(i)) return;
    const next = [...answer, i];
    setAnswer(next);
    if (next.length === q.word.length) {
      const formed = next.map(j => tiles[j]).join("");
      const correct = formed === q.word;
      setFeedback(correct ? "correct" : "wrong");
      setTimeout(() => {
        const res = [...results, correct];
        if (idx + 1 >= ROUND_SIZE) onDone(res);
        else { setResults(res); setIdx(i => i+1); }
      }, 1100);
    }
  };

  const removeSlot = (pos) => {
    if (feedback) return;
    setAnswer(a => a.filter((_, i) => i !== pos));
  };

  return (
    <div>
      <div className="q-card">
        <div className="q-label">Unscramble the word</div>
        <div className="q-text" style={{fontSize:"1rem", fontStyle:"italic", color: G.muted}}>{q.hint}</div>
      </div>
      <div className="answer-slots">
        {Array.from({length: q.word.length}).map((_, i) => {
          const tileIdx = answer[i];
          const letter = tileIdx !== undefined ? tiles[tileIdx] : null;
          return (
            <div key={i} className={`slot${letter ? " filled" : ""}`} onClick={() => letter && removeSlot(i)}>
              {letter || ""}
            </div>
          );
        })}
      </div>
      <div className="tile-row">
        {tiles.map((letter, i) => (
          <div key={i} className={`tile${answer.includes(i) ? " used" : ""}`} onClick={() => pickTile(i)}>
            {letter}
          </div>
        ))}
      </div>
      {feedback && <div className={`feedback ${feedback}`}>{feedback==="correct" ? "✓ Correct!" : `✗ The word was ${q.word}`}</div>}
      <div className="progress-row" style={{marginTop:16}}>
        <PipRow total={ROUND_SIZE} results={results} current={idx} />
        <button onClick={()=>{setAnswer([]);}} style={{background:"none",border:`1px solid ${G.border}`,borderRadius:6,padding:"4px 14px",cursor:"pointer",color:G.muted,fontSize:"0.82rem"}}>Clear</button>
      </div>
    </div>
  );
}

// ── Synonyms Game ─────────────────────────────────────────────────────────────

function SynonymsGame({ onDone }) {
  const [questions] = useState(() => shuffle(SYNONYMS).slice(0, ROUND_SIZE));
  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState([]);
  const [chosen, setChosen] = useState(null);
  const [secs, setSecs] = useState(TIMER_SECS);

  const q = questions[idx];

  useEffect(() => {
    if (chosen !== null) return;
    setSecs(TIMER_SECS);
    const iv = setInterval(() => setSecs(s => {
      if (s <= 1) { clearInterval(iv); handleAnswer(null); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(iv);
  }, [idx, chosen]);

  const handleAnswer = (c) => {
    if (chosen !== null) return;
    setChosen(c);
    const correct = c === q.answer;
    setTimeout(() => {
      const next = [...results, correct];
      if (idx + 1 >= ROUND_SIZE) onDone(next);
      else { setResults(next); setIdx(i => i+1); setChosen(null); }
    }, 900);
  };

  return (
    <div>
      <TimerBar secs={secs} total={TIMER_SECS} />
      <div className="q-card">
        <div className="q-label">Find the synonym</div>
        <div className="q-text">{q.word}</div>
        <div className="q-sub">Which word means the same?</div>
      </div>
      <div className="options">
        {shuffle(q.choices).map(c => {
          let cls = "opt-btn";
          if (chosen !== null) {
            if (c === q.answer) cls += " correct";
            else if (c === chosen) cls += " wrong";
          }
          return <button key={c} className={cls} onClick={() => handleAnswer(c)} disabled={chosen!==null}>{c}</button>;
        })}
      </div>
      <div className="progress-row">
        <PipRow total={ROUND_SIZE} results={results} current={idx} />
        <span>⏱ {secs}s</span>
      </div>
    </div>
  );
}

// ── Odd One Out Game ──────────────────────────────────────────────────────────

function OddOneOutGame({ onDone }) {
  const [questions] = useState(() => shuffle(ODD_ONE_OUT).slice(0, ROUND_SIZE));
  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState([]);
  const [chosen, setChosen] = useState(null);
  const [secs, setSecs] = useState(TIMER_SECS);

  const q = questions[idx];

  useEffect(() => {
    if (chosen !== null) return;
    setSecs(TIMER_SECS);
    const iv = setInterval(() => setSecs(s => {
      if (s <= 1) { clearInterval(iv); handleAnswer(null); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(iv);
  }, [idx, chosen]);

  const handleAnswer = (c) => {
    if (chosen !== null) return;
    setChosen(c);
    const correct = c === q.answer;
    setTimeout(() => {
      const next = [...results, correct];
      if (idx + 1 >= ROUND_SIZE) onDone(next);
      else { setResults(next); setIdx(i => i+1); setChosen(null); }
    }, 1100);
  };

  return (
    <div>
      <TimerBar secs={secs} total={TIMER_SECS} />
      <div className="q-card">
        <div className="q-label">Spot the odd one out</div>
        <div className="q-text" style={{fontSize:"1.2rem"}}>{q.items.join("  ·  ")}</div>
      </div>
      {chosen && <div className={`feedback ${chosen===q.answer?"correct":"wrong"}`}>
        {chosen===q.answer ? `✓ Correct! ${q.reason}` : `✗ It was ${q.answer} — ${q.reason}`}
      </div>}
      <div className="options">
        {q.items.map(c => {
          let cls = "opt-btn";
          if (chosen !== null) {
            if (c === q.answer) cls += " correct";
            else if (c === chosen) cls += " wrong";
          }
          return <button key={c} className={cls} onClick={() => handleAnswer(c)} disabled={chosen!==null}>{c}</button>;
        })}
      </div>
      <div className="progress-row">
        <PipRow total={ROUND_SIZE} results={results} current={idx} />
        <span>⏱ {secs}s</span>
      </div>
    </div>
  );
}

// ── Results Screen ────────────────────────────────────────────────────────────

function Results({ results, gameName, onReplay, onHome }) {
  const correct = results.filter(Boolean).length;
  const pct = Math.round((correct / results.length) * 100);
  const emoji = pct >= 90 ? "🏆" : pct >= 70 ? "⭐" : pct >= 50 ? "👍" : "💪";
  const msg = pct >= 90 ? "Exceptional!" : pct >= 70 ? "Well done!" : pct >= 50 ? "Good effort!" : "Keep practising!";
  return (
    <div className="results-card">
      <div className="results-icon">{emoji}</div>
      <div className="results-title">{msg}</div>
      <div className="results-score">{pct}%</div>
      <div className="results-sub">{gameName}</div>
      <div className="results-row">
        <div className="results-stat">
          <div className="results-stat-val" style={{color:G.green}}>{correct}</div>
          <div className="results-stat-lbl">Correct</div>
        </div>
        <div className="results-stat">
          <div className="results-stat-val" style={{color:G.red}}>{results.length - correct}</div>
          <div className="results-stat-lbl">Wrong</div>
        </div>
        <div className="results-stat">
          <div className="results-stat-val">{results.length}</div>
          <div className="results-stat-lbl">Total</div>
        </div>
      </div>
      <button className="play-again" onClick={onReplay}>Play Again</button>
      <button className="go-home" onClick={onHome}>All Games</button>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [scores, saveScore] = useScores();
  const [screen, setScreen] = useState("hub"); // hub | playing | results
  const [gameId, setGameId] = useState(null);
  const [gameKey, setGameKey] = useState(0);
  const [lastResults, setLastResults] = useState(null);

  const totalPlayed = Object.values(scores).reduce((a,b) => a+b, 0);

  const startGame = (id) => { setGameId(id); setScreen("playing"); setGameKey(k => k+1); };

  const handleDone = (results) => {
    const correct = results.filter(Boolean).length;
    const pct = Math.round((correct / results.length) * 100);
    saveScore(gameId, pct);
    setLastResults(results);
    setScreen("results");
  };

  const gameInfo = GAMES.find(g => g.id === gameId);

  const GameComponent = { arithmetic: ArithmeticGame, sequences: SequencesGame, anagram: AnagramGame, synonyms: SynonymsGame, oddoneout: OddOneOutGame }[gameId];

  return (
    <div className="app">
      <style>{css}</style>
      <header className="header">
        <div className="logo">Mind<span>Spark</span></div>
        <div className="score-bar">
          {gameInfo && screen !== "hub" && (
            <span style={{color: G.muted, fontSize:"0.9rem"}}>{gameInfo.icon} {gameInfo.name}</span>
          )}
          {Object.keys(scores).length > 0 && (
            <div className="score-chip">Best scores: {Object.values(scores).map(s=>s+"%").join(" · ")}</div>
          )}
        </div>
      </header>

      {screen === "hub" && (
        <div className="hub">
          <h1 className="hub-title">Choose your challenge</h1>
          <p className="hub-sub">Eight questions per round — how sharp is your mind today?</p>
          <div className="game-grid">
            {GAMES.map(g => (
              <div key={g.id} className="game-card" style={{background: g.color}} onClick={() => startGame(g.id)}>
                <div className="card-icon">{g.icon}</div>
                <div className="card-name">{g.name}</div>
                <div className="card-desc">{g.desc}</div>
                {scores[g.id] && <div className="card-best">Best: {scores[g.id]}%</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {screen === "playing" && GameComponent && (
        <div className="game-wrap">
          <button className="back-btn" onClick={() => setScreen("hub")}>← All Games</button>
          <div className="game-header">
            <div className="game-title">{gameInfo.icon} {gameInfo.name}</div>
            <div className="game-meta">
              <span>{ROUND_SIZE} questions</span>
              {scores[gameId] && <span>Best: {scores[gameId]}%</span>}
            </div>
          </div>
          <GameComponent key={gameKey} onDone={handleDone} />
        </div>
      )}

      {screen === "results" && lastResults && (
        <div className="game-wrap">
          <Results
            results={lastResults}
            gameName={gameInfo.name}
            onReplay={() => startGame(gameId)}
            onHome={() => setScreen("hub")}
          />
        </div>
      )}
    </div>
  );
}