import { useState, useEffect, useRef, useCallback } from "react";
import { P } from "../../lib/constants";
import { getCtx, detectPitch, freqToNote, scorePitch } from "../../audio/index";

// ── MetronomePanel ────────────────────────────────────────────────────────────
export function MetronomePanel({ metro }) {
  const { running, beat, tempo, setTempo, mult, setMult, start, stop, bpb } = metro;
  return (
    <div style={{ background:P.surface, border:`1px solid ${P.border}`, borderRadius:12, padding:20 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <div style={{ color:P.muted, fontSize:11, fontWeight:700, letterSpacing:"0.1em" }}>METRONOME</div>
        <div style={{ display:"flex", gap:7 }}>
          {Array.from({ length:bpb }).map((_, i) => (
            <div key={i} style={{ width:i===0?15:11, height:i===0?15:11, borderRadius:"50%",
              background: running && beat === i ? (i === 0 ? P.accent : P.teal) : P.border,
              transition:"background 0.05s",
              boxShadow: running && beat === i ? `0 0 8px ${i===0?P.accent:P.teal}` : "none" }} />
          ))}
        </div>
      </div>
      <div style={{ textAlign:"center", marginBottom:14 }}>
        <div style={{ fontSize:50, fontWeight:800, color:running?P.accent:P.text,
          letterSpacing:"-0.04em", lineHeight:1, transition:"color 0.2s" }}>
          {Math.round(tempo * mult)}
        </div>
        <div style={{ color:P.muted, fontSize:12, marginTop:2 }}>BPM · audio-clock locked</div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
        <span style={{ color:P.muted, fontSize:11 }}>40</span>
        <input type="range" min={40} max={200} value={tempo}
          onChange={e => setTempo(+e.target.value)}
          aria-label="Metronome tempo"
          style={{ flex:1, accentColor:P.accent }} />
        <span style={{ color:P.muted, fontSize:11 }}>200</span>
      </div>
      <div style={{ display:"flex", gap:5, marginBottom:14 }}>
        {[0.5, 0.65, 0.8, 1].map(m => (
          <button key={m} onClick={() => setMult(m)} style={{ flex:1, padding:"6px 0",
            borderRadius:6, fontSize:12, fontWeight:700,
            border:`1px solid ${mult === m ? P.accent : P.border}`,
            background: mult === m ? P.accentDim : "transparent",
            color: mult === m ? P.accent : P.muted, cursor:"pointer" }}>
            {m === 1 ? "Full" : `${m * 100}%`}
          </button>
        ))}
      </div>
      <button onClick={running ? stop : start}
        aria-label={running ? "Stop metronome" : "Start metronome"}
        style={{ width:"100%", padding:"11px 0", borderRadius:8, fontWeight:800,
          fontSize:13, border:"none", cursor:"pointer",
          background: running ? P.red+"cc" : P.teal,
          color: running ? "#fff" : "#0a0a0f", transition:"background 0.2s" }}>
        {running ? "■ STOP" : "▶ START"}
      </button>
    </div>
  );
}

// ── MiniMetro ─────────────────────────────────────────────────────────────────
export function MiniMetro({ metro, onGoTo }) {
  const { running, beat, tempo, mult, stop, bpb } = metro;
  if (!running) return (
    <button onClick={onGoTo} style={{ display:"flex", alignItems:"center", gap:6,
      background:P.surface, border:`1px solid ${P.border}`, borderRadius:20,
      padding:"5px 12px", cursor:"pointer", color:P.muted, fontSize:11, fontWeight:700, marginBottom:12 }}>
      Start metronome
    </button>
  );
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, background:P.accentDim,
      border:`1px solid ${P.accent}44`, borderRadius:20, padding:"5px 14px", marginBottom:12 }}>
      <div style={{ display:"flex", gap:3 }}>
        {Array.from({ length:bpb }).map((_, i) => (
          <div key={i} style={{ width:i===0?9:7, height:i===0?9:7, borderRadius:"50%",
            background: beat === i ? (i === 0 ? P.accent : P.teal) : P.border,
            transition:"background 0.05s" }} />
        ))}
      </div>
      <span style={{ color:P.accent, fontSize:11, fontWeight:700 }}>{Math.round(tempo * mult)} bpm</span>
      <button onClick={stop} aria-label="Stop metronome"
        style={{ background:"none", border:"none", color:P.muted, cursor:"pointer", fontSize:11, padding:"0 2px" }}>■</button>
    </div>
  );
}

// ── PitchDetector ─────────────────────────────────────────────────────────────
export function PitchDetector({ referenceNotes }) {
  const [listening,  setListening] = useState(false);
  const [pitch,      setPitch]     = useState(null);
  const [noteName,   setNoteName]  = useState(null);
  const [score,      setScore]     = useState(null);
  const [history,    setHistory]   = useState([]);
  const [error,      setError]     = useState(null);
  // Pitch detector uses its OWN AudioContext — it requires a MediaStreamSource
  // which cannot share a context with the main audio output on all browsers.
  const ctxRef    = useRef(null);
  const streamRef = useRef(null);
  const rafRef    = useRef(null);

  const stopListen = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (ctxRef.current) { ctxRef.current.close(); ctxRef.current = null; }
    streamRef.current = null; setListening(false);
  }, []);

  const startListen = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio:true });
      streamRef.current = stream;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      ctxRef.current = ctx;
      const analyser = ctx.createAnalyser(); analyser.fftSize = 2048;
      ctx.createMediaStreamSource(stream).connect(analyser);
      setListening(true);
      const buf = new Float32Array(analyser.fftSize);
      const loop = () => {
        analyser.getFloatTimeDomainData(buf);
        const f = detectPitch(buf, ctx.sampleRate);
        if (f && f > 60 && f < 1400) {
          const n = freqToNote(f), s = scorePitch(f, referenceNotes);
          setPitch(Math.round(f)); setNoteName(n); setScore(s);
          setHistory(prev => [...prev.slice(-11), { f:Math.round(f), n, s }]);
        }
        rafRef.current = requestAnimationFrame(loop);
      };
      loop();
    } catch { setError("Microphone access denied."); setListening(false); }
  }, [referenceNotes]);

  useEffect(() => () => stopListen(), [stopListen]);

  const avg = history.length > 0
    ? Math.round(history.filter(h => h.s).reduce((a, h) => a + h.s.score, 0) / Math.max(1, history.filter(h => h.s).length))
    : null;

  return (
    <div style={{ background:P.surface, border:`1px solid ${P.border}`, borderRadius:12, padding:18 }}>
      <div style={{ color:P.muted, fontSize:11, fontWeight:700, letterSpacing:"0.1em", marginBottom:12 }}>PITCH DETECTOR</div>
      {error && <div style={{ color:P.red, fontSize:12, marginBottom:10, padding:"8px 12px",
        background:P.red+"22", borderRadius:8 }}>{error}</div>}
      {listening && (
        <div style={{ marginBottom:12 }}>
          <div style={{ display:"flex", gap:8, marginBottom:10 }}>
            {[["NOTE",noteName||"—",P.teal],["HZ",pitch?`${pitch}`:"…",P.teal],
              score?["ACC",`${score.score}%`,score.color]:null,
              avg?["AVG",`${avg}%`,P.accent]:null].filter(Boolean).map(([l,v,c]) => (
              <div key={l} style={{ flex:1, background:P.card, borderRadius:8,
                padding:"8px 6px", textAlign:"center" }}>
                <div style={{ color:P.muted, fontSize:9, letterSpacing:"0.1em" }}>{l}</div>
                <div style={{ color:c, fontSize:16, fontWeight:800 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:3, height:28, alignItems:"flex-end" }}>
            {Array.from({ length:12 }).map((_, i) => {
              const h = history[history.length - 12 + i];
              return <div key={i} style={{ flex:1, borderRadius:2,
                background: h?.s ? h.s.color+"99" : P.border,
                height: h?.s ? `${h.s.score}%` : "8%",
                transition:"height 0.1s" }} />;
            })}
          </div>
        </div>
      )}
      <button onClick={listening ? stopListen : startListen}
        aria-label={listening ? "Stop pitch detection" : "Start pitch detection"}
        style={{ width:"100%", padding:"9px 0", borderRadius:8, fontWeight:800, fontSize:13,
          border:"none", cursor:"pointer",
          background: listening ? P.red+"cc" : P.accent,
          color:"#0a0a0f", transition:"background 0.2s" }}>
        {listening ? "■ STOP" : "⏺ PITCH DETECTION"}
      </button>
      {!listening && avg && (
        <div style={{ marginTop:9, padding:"7px 12px", background:P.card,
          borderRadius:8, border:`1px solid ${P.border}` }}>
          <span style={{ color:avg>75?P.teal:avg>50?P.accent:P.red, fontWeight:700, fontSize:13 }}>{avg}%</span>
          <span style={{ color:P.textSoft, fontSize:12 }}>
            {avg > 75 ? " — Excellent!" : avg > 50 ? " — Keep going." : " — Slow it down."}
          </span>
        </div>
      )}
    </div>
  );
}

// ── LyricsCoach ───────────────────────────────────────────────────────────────
export function LyricsCoach({ lyrics, color, semitones, metro }) {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(null), rafRef = useRef(null);
  const total = lyrics ? Math.max(...lyrics.lines.flatMap(l => l.timings)) + 2 : 0;

  const stopPlay = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setPlaying(false); setElapsed(0);
    startRef.current = null;
  }, []);

  const startPlay = () => {
    startRef.current = performance.now(); setPlaying(true);
    const tick = () => {
      const e = (performance.now() - startRef.current) / 1000;
      setElapsed(e);
      if (e < total) rafRef.current = requestAnimationFrame(tick); else stopPlay();
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  if (!lyrics) return (
    <div style={{ background:P.surface, borderRadius:12, padding:20,
      border:`1px solid ${P.border}`, textAlign:"center" }}>
      <div style={{ fontSize:28, marginBottom:8 }}>🎤</div>
      <div style={{ color:P.textSoft, fontSize:13 }}>No lyrics data for this section.</div>
    </div>
  );

  const getWS = (li, wi) => {
    const t = lyrics.lines[li]?.timings?.[wi];
    if (t === undefined) return "default";
    const next = lyrics.lines[li]?.timings?.[wi + 1] ?? (lyrics.lines[li + 1]?.timings?.[0] ?? Infinity);
    if (!playing) return "default";
    if (elapsed >= t && elapsed < next) return "active";
    if (elapsed >= next) return "sung";
    return "upcoming";
  };

  return (
    <div style={{ background:P.surface, border:`1px solid ${P.border}`, borderRadius:12, padding:18, marginBottom:14 }}>
      <div style={{ color:P.muted, fontSize:11, fontWeight:700, letterSpacing:"0.1em", marginBottom:12 }}>LYRICS COACH</div>

      {/* Lyrics lines */}
      <div style={{ marginBottom:14 }}>
        {lyrics.lines.map((line, li) => (
          <div key={li} style={{ marginBottom:10, lineHeight:2, display:"flex", flexWrap:"wrap", gap:4 }}>
            {line.words.map((word, wi) => {
              const st = getWS(li, wi);
              return (
                <span key={wi} style={{ fontSize:17, fontWeight:st==="active"?800:500,
                  color: st==="active"?color:st==="sung"?P.muted:P.text,
                  transition:"color 0.1s",
                  textShadow: st==="active"?`0 0 10px ${color}88`:"none",
                  display:"inline-block",
                  borderBottom: st==="active"?`2px solid ${color}`:"2px solid transparent",
                  transform: st==="active"?"scale(1.05)":"scale(1)" }}>
                  {word}
                </span>
              );
            })}
          </div>
        ))}
      </div>
      <div style={{ background:P.card, borderRadius:8, padding:"9px 13px",
        border:`1px solid ${P.border}`, marginBottom:12 }}>
        <span style={{ color:P.accent, fontSize:11, fontWeight:700 }}>TIP  </span>
        <span style={{ color:P.textSoft, fontSize:12 }}>{lyrics.tip}</span>
      </div>
      <button onClick={playing ? stopPlay : startPlay}
        aria-label={playing ? "Stop lyrics coach" : "Start lyrics coach timing"}
        style={{ width:"100%", padding:"10px 0", borderRadius:8, fontWeight:800, fontSize:13,
          border:"none", cursor:"pointer",
          background: playing ? P.red+"cc" : color,
          color:"#0a0a0f", transition:"background 0.2s" }}>
        {playing ? "■ STOP" : "▶ SING ALONG — START TIMING"}
      </button>
    </div>
  );
}
