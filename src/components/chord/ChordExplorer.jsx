import { useState, useEffect, useRef } from "react";
import { P } from "../../lib/constants";
import { tChord, getCAGED } from "../../theory/index";
import { getCtx, playChord } from "../../audio/index";
import { chordMidi } from "../../theory/index";
import { useSectionPlayback } from "../../hooks/usePlayback";
import { ChordDiagram } from "./ChordDiagram";
import { ChordTones } from "./ChordTones";

export function ChordExplorer({ chords, semitones = 0, bpm = 116 }) {
  const trans = chords.map(c => tChord(c, semitones));
  const [selIdx,   setSelIdx]   = useState(0);
  const [shapeIdx, setShapeIdx] = useState(0);
  const [ringing,  setRinging]  = useState(false);
  const ctxRef = useRef(null);
  const pb     = useSectionPlayback(trans, bpm);

  useEffect(() => setShapeIdx(0), [selIdx, semitones]);

  const sel    = trans[selIdx] || trans[0];
  const shapes = getCAGED(sel);

  const playSingle = () => {
    const ctx = getCtx();
    if (ctx.state === "suspended") ctx.resume();
    playChord(ctx, chordMidi(sel));
    setRinging(true); setTimeout(() => setRinging(false), 1800);
  };

  return (
    <div style={{ background:P.surface, border:`1px solid ${P.border}`,
      borderRadius:12, padding:18, marginBottom:16 }}>
      <div style={{ color:P.muted, fontSize:11, fontWeight:700,
        letterSpacing:"0.1em", marginBottom:12 }}>CHORD EXPLORER</div>

      {/* Chord selector */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:10 }}>
        {trans.map((c, i) => (
          <button key={i} onClick={() => setSelIdx(i)} style={{
            padding:"5px 13px", borderRadius:8, fontSize:13, fontWeight:700,
            border:`1px solid ${selIdx === i ? P.accent : pb.activeIdx === i ? P.teal : P.border}`,
            background: selIdx === i ? P.accentDim : pb.activeIdx === i ? P.tealDim : "transparent",
            color: selIdx === i ? P.accent : pb.activeIdx === i ? P.teal : P.textSoft,
            cursor:"pointer", transition:"all 0.15s",
          }}>{c}</button>
        ))}
      </div>

      {/* Playback controls + loop toggle */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14, flexWrap:"wrap" }}>
        <button onClick={pb.playing ? pb.stop : pb.play}
          aria-label={pb.playing ? "Stop section playback" : "Play section"}
          style={{ padding:"5px 14px", borderRadius:20, border:"none", cursor:"pointer",
            background: pb.playing ? P.red+"cc" : P.teal,
            color: pb.playing ? "#fff" : "#0a0a0f",
            fontWeight:800, fontSize:11, transition:"background 0.2s" }}>
          {pb.playing ? "■ Stop" : "▶ Play Section"}
        </button>

        {/* Loop toggle — NEW */}
        <button onClick={pb.toggleLoop}
          aria-label={pb.looping ? "Disable loop" : "Enable loop"}
          title={pb.looping ? "Loop ON — click to disable" : "Loop OFF — click to enable"}
          style={{ padding:"5px 12px", borderRadius:20, cursor:"pointer",
            border:`1px solid ${pb.looping ? P.accent : P.border}`,
            background: pb.looping ? P.accentDim : "transparent",
            color: pb.looping ? P.accent : P.muted,
            fontWeight:800, fontSize:11, transition:"all 0.2s" }}>
          ↺ {pb.looping ? "Looping" : "Loop"}
        </button>

        <div style={{ color:P.muted, fontSize:11, fontWeight:700, letterSpacing:"0.1em" }}>
          CAGED — {sel}
        </div>
        <button onClick={playSingle}
          aria-label={`Play ${sel} chord`}
          style={{ marginLeft:"auto", padding:"5px 14px", borderRadius:20,
            border:"none", cursor:"pointer",
            background: ringing ? P.teal : P.accent,
            color:"#0a0a0f", fontWeight:800, fontSize:11, transition:"background 0.2s" }}>
          {ringing ? "♪ Ringing…" : "▶ Play"}
        </button>
      </div>

      {/* Chord diagrams */}
      {shapes.length > 0 ? (
        <div style={{ display:"flex", gap:10, overflowX:"auto", paddingBottom:8,
          scrollbarWidth:"thin", scrollbarColor:`${P.border} transparent` }}>
          {shapes.map((sh, i) => (
            <div key={i} onClick={() => setShapeIdx(i)}
              style={{ flexShrink:0, cursor:"pointer",
                background: shapeIdx === i ? P.card : P.bg,
                border:`2px solid ${shapeIdx === i ? P.accent : P.border}`,
                borderRadius:10, padding:"10px 12px", transition:"all 0.15s",
                boxShadow: shapeIdx === i ? `0 0 14px ${P.accent}33` : "none" }}>
              <div style={{ textAlign:"center", marginBottom:4 }}>
                <span style={{ display:"inline-block", padding:"2px 8px", borderRadius:10,
                  background: shapeIdx === i ? P.accent+"33" : P.border+"55",
                  color: shapeIdx === i ? P.accent : P.muted,
                  fontSize:10, fontWeight:800 }}>
                  {sh.shape.length === 1 ? `${sh.shape}-shape` : sh.shape}
                </span>
              </div>
              <ChordDiagram chordName={sel} shape={sh} />
              <div style={{ textAlign:"center", marginTop:4 }}>
                <span style={{ color:P.muted, fontSize:9 }}>
                  {sh.fret > 1 ? `fret ${sh.fret}${sh.barre ? " · barre" : ""}` : "open"}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background:P.card, borderRadius:10, padding:"14px 16px",
          border:`1px solid ${P.border}`, marginBottom:8, textAlign:"center" }}>
          <div style={{ color:P.muted, fontSize:13, marginBottom:4 }}>
            No diagram yet for <strong style={{ color:P.text }}>{sel}</strong>
          </div>
          <div style={{ color:P.muted, fontSize:11 }}>
            Shape will be added in a future update. Check the References tab for a tutorial.
          </div>
        </div>
      )}

      <ChordTones chordName={sel} />
    </div>
  );
}
