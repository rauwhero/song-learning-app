import { useState } from "react";
import { P, EMBELLISHMENT_TYPES, FEEL_INFO } from "../../lib/constants";
import { claudeCall, extractJsonArray } from "../../lib/claudeApi";
import { useRiffPlayback } from "../../hooks/usePlayback";
import { QualityBadge } from "../shared/Badges";

export function RiffCard({ riff, onSetMetro }) {
  const [open,    setOpen]    = useState(false);
  const [aiLoad,  setAiLoad]  = useState(false);
  const [aiResp,  setAiResp]  = useState(riff.aiSuggestions || []);
  const fi    = FEEL_INFO[riff.feel] || FEEL_INFO.straight;
  const isAI  = riff.dataQuality === "ai_assisted";
  const riffPb = useRiffPlayback(riff.notes, riff.bpm_guide);

  const askAI = async () => {
    setAiLoad(true);
    try {
      const text = await claudeCall([{ role:"user", content:
        `Guitar teacher: for the riff "${riff.name}" (${riff.type}, ${riff.feel} feel, ${riff.difficulty}), suggest 3 specific embellishments. Mention exact strings, frets, technique names. 1-2 sentences each. Return JSON array of strings only.`
      }], 400);
      const arr = JSON.parse(extractJsonArray(text) || "[]");
      setAiResp(arr.length ? arr : ["Suggestion unavailable."]);
    } catch { setAiResp([...aiResp, "Claude unavailable — check API access."]); }
    finally { setAiLoad(false); }
  };

  return (
    <div style={{ background:P.surface, border:`1px solid ${P.border}`,
      borderRadius:12, marginBottom:12, overflow:"hidden" }}>
      <div onClick={() => setOpen(e => !e)}
        style={{ padding:"14px 16px", cursor:"pointer", display:"flex",
          justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:4, flexWrap:"wrap" }}>
            <span style={{ background:P.accent+"22", color:P.accent, fontSize:10, fontWeight:700,
              padding:"2px 8px", borderRadius:8 }}>{riff.type.toUpperCase()}</span>
            {isAI && <QualityBadge quality="ai_assisted" compact />}
            <span style={{ color:P.text, fontWeight:700, fontSize:14 }}>{riff.name}</span>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
            <span style={{ background:fi.color+"22", color:fi.color, fontSize:10, fontWeight:700,
              padding:"2px 7px", borderRadius:6 }}>{fi.label}</span>
            <span style={{ color:P.muted, fontSize:11 }}>{riff.difficulty} · {riff.bpm_guide} bpm start</span>
          </div>
        </div>
        <span style={{ color:P.muted, fontSize:18, flexShrink:0, marginLeft:8 }}>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div style={{ padding:"0 16px 16px" }}>
          {isAI && <div style={{ marginBottom:12 }}><QualityBadge quality="ai_assisted" /></div>}

          {/* Riff playback */}
          {riff.notes?.length > 0 && (
            <div style={{ marginBottom:14, display:"flex", alignItems:"center", gap:10,
              background:P.card, borderRadius:8, padding:"10px 14px",
              border:`1px solid ${riffPb.playing ? P.teal+"66" : P.border}` }}>
              <button onClick={riffPb.playing ? riffPb.stop : riffPb.play}
                aria-label={riffPb.playing ? "Stop riff" : "Play riff"}
                style={{ padding:"6px 16px", borderRadius:20, border:"none", cursor:"pointer",
                  background: riffPb.playing ? P.red+"cc" : P.teal,
                  color: riffPb.playing ? "#fff" : "#0a0a0f", fontWeight:800, fontSize:11 }}>
                {riffPb.playing ? "■ Stop" : "▶ Play Riff"}
              </button>
              <span style={{ color:P.muted, fontSize:11 }}>at {riff.bpm_guide} bpm · {riff.notes.length} notes</span>
              {riffPb.playing && (
                <div style={{ display:"flex", gap:3, marginLeft:"auto" }}>
                  {riff.notes.map((_, i) => (
                    <div key={i} style={{ width:6, height:6, borderRadius:"50%",
                      background: riffPb.activeNote === i ? P.teal : P.border,
                      transition:"background 0.05s" }} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab */}
          <div style={{ marginBottom:14 }}>
            <div style={{ color:P.muted, fontSize:10, fontWeight:700, letterSpacing:"0.1em", marginBottom:7 }}>TABLATURE</div>
            <div style={{ background:"#07070f", border:`1px solid ${P.border}`, borderRadius:8,
              padding:"12px 14px", fontFamily:"'Courier New',monospace",
              fontSize:11, lineHeight:1.9, color:P.teal, overflowX:"auto" }}>
              {riff.tab.map((l, i) => <div key={i}>{l}</div>)}
            </div>
          </div>

          {/* Embellishments */}
          <div style={{ marginBottom:14 }}>
            <div style={{ color:P.muted, fontSize:10, fontWeight:700, letterSpacing:"0.1em", marginBottom:8 }}>EMBELLISHMENTS</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:8 }}>
              {Object.entries(EMBELLISHMENT_TYPES).map(([k, e]) => (
                <div key={k} title={e.desc}
                  style={{ display:"flex", alignItems:"center", gap:4, background:e.color+"18",
                    border:`1px solid ${e.color}44`, borderRadius:7, padding:"4px 10px", cursor:"help" }}>
                  <span style={{ color:e.color, fontWeight:800, fontSize:13, fontFamily:"monospace" }}>[{e.label}]</span>
                  <span style={{ color:P.muted, fontSize:10 }}>{k}</span>
                </div>
              ))}
            </div>
            <div style={{ background:fi.color+"15", border:`1px solid ${fi.color}33`,
              borderRadius:8, padding:"8px 12px" }}>
              <span style={{ color:fi.color, fontSize:11, fontWeight:700 }}>{fi.label}  </span>
              <span style={{ color:P.textSoft, fontSize:12 }}>{fi.desc}</span>
            </div>
          </div>

          {/* Annotations */}
          {riff.annotations?.length > 0 && (
            <div style={{ marginBottom:14 }}>
              <div style={{ color:P.muted, fontSize:10, fontWeight:700, letterSpacing:"0.1em", marginBottom:8 }}>BEAT NOTES</div>
              {riff.annotations.map((a, i) => (
                <div key={i} style={{ display:"flex", gap:10, marginBottom:6, alignItems:"flex-start" }}>
                  <span style={{ background:P.accent+"33", color:P.accent, fontSize:10,
                    fontWeight:800, padding:"2px 7px", borderRadius:5, flexShrink:0, marginTop:1 }}>#{i+1}</span>
                  <span style={{ color:P.textSoft, fontSize:12, lineHeight:1.5 }}>{a}</span>
                </div>
              ))}
            </div>
          )}

          {/* Technique steps */}
          {riff.techniqueSteps?.length > 0 && (
            <div style={{ marginBottom:14 }}>
              <div style={{ color:P.muted, fontSize:10, fontWeight:700, letterSpacing:"0.1em", marginBottom:8 }}>TECHNIQUE STEPS</div>
              {riff.techniqueSteps.map((s, i) => (
                <div key={i} style={{ display:"flex", gap:10, marginBottom:7, alignItems:"flex-start" }}>
                  <span style={{ width:20, height:20, borderRadius:"50%", background:P.teal+"33",
                    color:P.teal, fontSize:10, fontWeight:800, display:"flex",
                    alignItems:"center", justifyContent:"center", flexShrink:0 }}>{i+1}</span>
                  <span style={{ color:P.textSoft, fontSize:12, lineHeight:1.5 }}>{s}</span>
                </div>
              ))}
            </div>
          )}

          <button onClick={() => onSetMetro(riff.bpm_guide)}
            style={{ width:"100%", padding:"9px 0", borderRadius:8, fontWeight:700, fontSize:12,
              border:`1px solid ${P.teal}`, background:P.tealDim, color:P.teal,
              cursor:"pointer", marginBottom:14 }}>
            Set metronome to {riff.bpm_guide} bpm (practice speed)
          </button>

          {/* AI suggestions */}
          <div style={{ background:P.card, borderRadius:10, padding:"12px 14px",
            border:`1px solid ${P.purple}33` }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
              <div style={{ color:P.muted, fontSize:10, fontWeight:700, letterSpacing:"0.1em" }}>SUGGESTIONS</div>
              <button onClick={askAI} disabled={aiLoad}
                style={{ padding:"4px 12px", borderRadius:8, border:`1px solid ${P.purple}`,
                  background:P.purple+"22", color:P.purple, fontSize:11, fontWeight:700,
                  cursor: aiLoad ? "wait" : "pointer" }}>
                {aiLoad ? "…" : "✦ Ask Claude"}
              </button>
            </div>
            {aiResp.map((s, i) => (
              <div key={i} style={{ display:"flex", gap:8, marginBottom:8, alignItems:"flex-start" }}>
                <span style={{ color:P.purple, fontSize:14, flexShrink:0 }}>✦</span>
                <span style={{ color:P.textSoft, fontSize:12, lineHeight:1.6 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
