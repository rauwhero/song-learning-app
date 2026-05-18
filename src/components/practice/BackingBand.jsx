import { useState, useEffect, useCallback } from "react";
import { P } from "../../lib/constants";
import { startBand, stopBand, setInstrumentLevel, STYLES } from "../../audio/backingBand";
import { tChord, chordMidi } from "../../theory/index";

const DEFAULT_LEVELS = { piano:-12, bass:-10, drums:-10 };

const INSTRUMENTS = [
  { key:"piano", emoji:"🎹", label:"Piano" },
  { key:"bass",  emoji:"🎸", label:"Bass"  },
  { key:"drums", emoji:"🥁", label:"Drums" },
];

export function BackingBand({ song, semitones = 0 }) {
  const [playing, setPlaying] = useState(false);
  const [style,   setStyle]   = useState(() => {
    // Auto-detect style from genre tag
    const g = (song.genre?.[0] || "").toLowerCase();
    if (g.includes("blues")) return "blues";
    if (g.includes("folk") || g.includes("country")) return "folk";
    if (g.includes("ballad")) return "ballad";
    return "rock";
  });
  const [levels,  setLevels]  = useState(DEFAULT_LEVELS);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // Stop band when component unmounts or song changes
  useEffect(() => () => { stopBand(); }, []);
  useEffect(() => {
    if (playing) { stopBand(); setPlaying(false); }
  }, [song.id, semitones]); // eslint-disable-line

  const toggle = useCallback(async () => {
    setError(null);
    if (playing) {
      await stopBand();
      setPlaying(false);
    } else {
      setLoading(true);
      try {
        await startBand(song, semitones, style, tChord, chordMidi);
        setPlaying(true);
      } catch (e) {
        setError(`Couldn't start band: ${e.message}. Make sure Tone.js is installed (npm install tone).`);
      } finally {
        setLoading(false);
      }
    }
  }, [playing, song, semitones, style]);

  const handleLevel = useCallback((key, db) => {
    setLevels(l => ({ ...l, [key]:db }));
    // Map "drums" to the three drum instruments
    if (key === "drums") {
      setInstrumentLevel("kick",  db);
      setInstrumentLevel("snare", db + 6);
      setInstrumentLevel("hat",   db - 4);
    } else {
      setInstrumentLevel(key, db);
    }
  }, []);

  const handleStyleChange = useCallback(async (s) => {
    setStyle(s);
    if (playing) {
      await stopBand();
      setLoading(true);
      try {
        await startBand(song, semitones, s, tChord, chordMidi);
      } catch {} finally { setLoading(false); }
    }
  }, [playing, song, semitones]);

  return (
    <div style={{ background:P.surface, border:`1px solid ${playing ? P.teal+"66" : P.border}`,
      borderRadius:12, padding:18, marginBottom:16,
      transition:"border-color 0.3s",
      boxShadow: playing ? `0 0 24px ${P.teal}18` : "none" }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
        <div>
          <div style={{ color:P.muted, fontSize:11, fontWeight:700, letterSpacing:"0.1em", marginBottom:2 }}>
            BACKING BAND
          </div>
          <div style={{ color:P.textSoft, fontSize:11 }}>
            Auto-arranged from song chords · {song.bpm} bpm
          </div>
        </div>
        <button onClick={toggle} disabled={loading}
          aria-label={playing ? "Stop backing band" : "Start backing band"}
          style={{ padding:"8px 20px", borderRadius:20, border:"none",
            cursor: loading ? "wait" : "pointer", fontWeight:800, fontSize:12,
            background: loading ? P.border : playing ? P.red+"cc" : P.teal,
            color: playing ? "#fff" : "#0a0a0f",
            transition:"background 0.2s", minWidth:80 }}>
          {loading ? "Loading…" : playing ? "■ Stop" : "▶ Play"}
        </button>
      </div>

      {error && (
        <div style={{ color:P.red, fontSize:11, padding:"8px 12px",
          background:P.red+"18", borderRadius:8, marginBottom:12, lineHeight:1.5 }}>
          {error}
        </div>
      )}

      {/* Instrument levels */}
      <div style={{ marginBottom:14 }}>
        {INSTRUMENTS.map(({ key, emoji, label }) => (
          <div key={key} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
            <span style={{ fontSize:14, width:20, flexShrink:0 }}>{emoji}</span>
            <span style={{ color:P.textSoft, fontSize:12, flex:"0 0 50px" }}>{label}</span>
            <input type="range" min={-40} max={0} value={levels[key]}
              onChange={e => handleLevel(key, +e.target.value)}
              aria-label={`${label} volume`}
              style={{ flex:1, accentColor:P.teal }} />
            <span style={{ color:P.muted, fontSize:10, width:32, textAlign:"right", fontFamily:"monospace" }}>
              {levels[key]}dB
            </span>
            <button
              onClick={() => handleLevel(key, levels[key] === -40 ? DEFAULT_LEVELS[key] : -40)}
              aria-label={levels[key] === -40 ? `Unmute ${label}` : `Mute ${label}`}
              style={{ width:28, height:22, borderRadius:5, border:`1px solid ${P.border}`,
                background: levels[key] === -40 ? P.red+"44" : "transparent",
                color: levels[key] === -40 ? P.red : P.muted,
                cursor:"pointer", fontSize:9, fontWeight:700 }}>
              {levels[key] === -40 ? "OFF" : "M"}
            </button>
          </div>
        ))}
      </div>

      {/* Style picker */}
      <div>
        <div style={{ color:P.muted, fontSize:10, fontWeight:700,
          letterSpacing:"0.1em", marginBottom:7 }}>STYLE</div>
        <div style={{ display:"flex", gap:6 }}>
          {STYLES.map(s => (
            <button key={s} onClick={() => handleStyleChange(s)}
              style={{ flex:1, padding:"5px 0", borderRadius:8, fontSize:11, fontWeight:700,
                border:`1px solid ${style === s ? P.teal : P.border}`,
                background: style === s ? P.tealDim : "transparent",
                color: style === s ? P.teal : P.muted,
                cursor:"pointer", textTransform:"capitalize", transition:"all 0.15s" }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Live indicator */}
      {playing && (
        <div style={{ marginTop:12, display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:P.teal,
            animation:"pulse 1s infinite", boxShadow:`0 0 6px ${P.teal}` }} />
          <span style={{ color:P.teal, fontSize:10, fontWeight:700 }}>LIVE — {style.toUpperCase()}</span>
          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
        </div>
      )}
    </div>
  );
}
