import { useState } from "react";
import { P } from "../../lib/constants";
import { chordTones, parseChord, chordMeta } from "../../theory/index";

export function ChordTones({ chordName }) {
  const [open, setOpen] = useState(false);
  const tones = chordTones(chordName);
  const p     = parseChord(chordName);
  const meta  = p ? chordMeta(p.quality) : { type:"", color:P.teal };
  if (!tones.length) return null;
  return (
    <div style={{ marginTop:12, borderRadius:10,
      border:`1px solid ${open ? meta.color+"44" : P.border}`,
      overflow:"hidden", transition:"border-color 0.2s" }}>
      <button onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        style={{ width:"100%", display:"flex", alignItems:"center",
          justifyContent:"space-between", padding:"10px 14px",
          background: open ? meta.color+"12" : P.surface,
          border:"none", cursor:"pointer" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ color:P.muted, fontSize:10, fontWeight:700, letterSpacing:"0.1em" }}>CHORD TONES</span>
          <span style={{ background:meta.color+"22", color:meta.color, fontSize:10, fontWeight:700,
            padding:"2px 8px", borderRadius:10, border:`1px solid ${meta.color}44` }}>{meta.type}</span>
        </div>
        <span style={{ color:P.muted, fontSize:13 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{ padding:"12px 14px", background:P.surface, borderTop:`1px solid ${P.border}` }}>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {tones.map((t, i) => (
              <div key={i} style={{ flex:"1 1 52px", background:P.card,
                border:`2px solid ${t.isRoot ? meta.color : meta.color+"44"}`,
                borderRadius:10, padding:"10px 8px", textAlign:"center",
                boxShadow: t.isRoot ? `0 0 12px ${meta.color}33` : "none" }}>
                <div style={{ color:meta.color, fontSize:t.isRoot ? 22 : 18,
                  fontWeight:800, lineHeight:1 }}>{t.note}</div>
                <div style={{ marginTop:5,
                  background: t.isRoot ? meta.color : meta.color+"22",
                  color: t.isRoot ? "#0a0a0f" : meta.color,
                  borderRadius:6, padding:"3px 0", fontSize:13, fontWeight:800 }}>{t.deg}</div>
                <div style={{ color:P.muted, fontSize:9, marginTop:4, lineHeight:1.3 }}>{t.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
