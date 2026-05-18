import { useState } from "react";
import { P, REF_TYPES } from "../../lib/constants";
import { tChord, tKey, suggestions } from "../../theory/index";

// ── SongHeader ────────────────────────────────────────────────────────────────
export function SongHeader({ song, semitones, setSemitones, isMobile, onBack }) {
  const [open, setOpen] = useState(false);
  const capo = ((semitones % 12) + 12) % 12;
  return (
    <div style={{ background:P.surface, border:`1px solid ${P.border}`,
      borderRadius:14, padding:isMobile?14:18, marginBottom:14 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
          <button onClick={onBack} aria-label="Back to library"
            style={{ background:"none", border:"none", color:P.muted, cursor:"pointer",
              fontSize:22, padding:"0 4px 0 0", flexShrink:0, lineHeight:1 }}>‹</button>
          <div style={{ minWidth:0 }}>
            <div style={{ color:P.text, fontSize:isMobile?17:20, fontWeight:800,
              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{song.title}</div>
            <div style={{ color:P.textSoft, fontSize:12 }}>{song.artist}</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:6, flexShrink:0, alignItems:"center" }}>
          {[["Key",tKey(song.key,semitones)],["BPM",song.bpm],["Capo",capo===0?"None":`${capo}`]].map(([k,v])=>(
            <div key={k} style={{ background:P.card, border:`1px solid ${P.border}`,
              borderRadius:7, padding:"4px 9px", textAlign:"center" }}>
              <div style={{ color:P.muted, fontSize:9, fontWeight:700 }}>{k}</div>
              <div style={{ color:P.text, fontSize:11, fontWeight:700 }}>{v}</div>
            </div>
          ))}
          <button onClick={() => setOpen(v => !v)}
            aria-label="Song details and transpose"
            style={{ background:open?P.accentDim:"transparent",
              border:`1px solid ${open?P.accent:P.border}`,
              color:open?P.accent:P.muted, borderRadius:8, padding:"6px 10px",
              cursor:"pointer", fontSize:12, fontWeight:700 }}>
            {open ? "▲" : "▼"} Details
          </button>
        </div>
      </div>
      {open && (
        <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${P.border}` }}>
          <div style={{ color:P.muted, fontSize:10, fontWeight:700, letterSpacing:"0.1em", marginBottom:8 }}>TRANSPOSE</div>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:10 }}>
            {[-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6].map(s => (
              <button key={s} onClick={() => setSemitones(s)}
                style={{ padding:"4px 10px", borderRadius:6, fontSize:12, fontWeight:700,
                  border:`1px solid ${semitones===s?P.accent:P.border}`,
                  background:semitones===s?P.accentDim:"transparent",
                  color:semitones===s?P.accent:P.muted, cursor:"pointer" }}>
                {s > 0 ? `+${s}` : s}
              </button>
            ))}
          </div>
          <div style={{ display:"flex", gap:10, fontSize:11, color:P.textSoft }}>
            <span>Key: <strong style={{ color:P.text }}>{tKey(song.key, semitones)}</strong></span>
            {capo > 0 && <span>Capo: <strong style={{ color:P.text }}>{capo}</strong></span>}
            <span>Genre: <strong style={{ color:P.text }}>{(song.genre || []).join(", ")}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ProgressHero ──────────────────────────────────────────────────────────────
export function ProgressHero({ sections, songTitle, onResume, onSectionClick, isMobile, onRunThrough }) {
  const [showSugg, setShowSugg] = useState(true);
  const mastered = sections.filter(s => s.status === "mastered");
  const inProg   = sections.filter(s => s.status === "in-progress");
  const pct      = sections.length ? Math.round((mastered.length / sections.length) * 100) : 0;
  const nextSec  = inProg[0] || sections.find(s => s.status !== "mastered");
  const suggs    = suggestions(sections, songTitle);

  return (
    <div style={{ background:P.surface, border:`1px solid ${P.border}`,
      borderRadius:14, padding:isMobile?14:18, marginBottom:14 }}>
      <div style={{ display:"flex", gap:14, flexWrap:"wrap", alignItems:"flex-start", marginBottom:16 }}>
        <div style={{ textAlign:"center", flexShrink:0, minWidth:60 }}>
          <div style={{ fontSize:36, fontWeight:800, lineHeight:1,
            color:pct===100?P.teal:P.accent }}>{pct}%</div>
          <div style={{ color:P.muted, fontSize:11, marginTop:2, letterSpacing:"0.05em" }}>COMPLETE</div>
        </div>
        <div style={{ flex:"1 1 180px", minWidth:0 }}>
          <div style={{ background:P.border, borderRadius:6, height:8, marginBottom:10, overflow:"hidden" }}>
            <div style={{ background:pct===100?P.teal:`linear-gradient(90deg,${P.teal},${P.accent})`,
              width:`${pct}%`, height:"100%", borderRadius:6, transition:"width 0.7s ease",
              boxShadow:pct>0?`0 0 10px ${P.accent}55`:"none" }} />
          </div>
          <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:10 }}>
            {sections.map(s => (
              <div key={s.id} onClick={() => onSectionClick(s.id)} title={s.name}
                style={{ cursor:"pointer", flex:"1 1 auto", maxWidth:28, height:6, borderRadius:3,
                  background: s.status==="mastered"?P.teal:s.status==="in-progress"?P.accent:P.border,
                  transition:"background 0.3s",
                  boxShadow:s.status==="in-progress"?`0 0 6px ${P.accent}88`:"none" }} />
            ))}
          </div>
          <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
            <span style={{ color:P.teal, fontSize:11, fontWeight:700 }}>● {mastered.length} Mastered</span>
            <span style={{ color:P.accent, fontSize:11, fontWeight:700 }}>◐ {inProg.length} In Progress</span>
            <span style={{ color:P.muted, fontSize:11 }}>○ {sections.length-mastered.length-inProg.length} To Go</span>
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8, flexShrink:0 }}>
          {pct < 100 && nextSec && (
            <button onClick={() => onResume(nextSec.id)}
              style={{ padding:"10px 20px", borderRadius:10, border:"none", cursor:"pointer",
                fontWeight:800, fontSize:13, background:P.accent, color:"#0a0a0f",
                boxShadow:`0 0 20px ${P.accent}44`, minWidth:120, textAlign:"center" }}>
              {mastered.length === 0 ? "▶ Start" : "▶ Resume"}
              <div style={{ fontSize:10, fontWeight:600, marginTop:2, opacity:0.75 }}>{nextSec.name}</div>
            </button>
          )}
          <button onClick={onRunThrough}
            style={{ padding:"8px 20px", borderRadius:10, border:`1px solid ${P.teal}`,
              cursor:"pointer", fontWeight:700, fontSize:12,
              background:P.tealDim, color:P.teal, textAlign:"center" }}>
            ▶▶ Run Through
          </button>
        </div>
      </div>
      {suggs.length > 0 && (
        <div style={{ background:P.card, border:`1px solid ${P.border}`, borderRadius:12, overflow:"hidden" }}>
          <div onClick={() => setShowSugg(v => !v)}
            style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"12px 16px", cursor:"pointer",
              borderBottom:showSugg?`1px solid ${P.border}`:"none" }}>
            <div style={{ color:P.muted, fontSize:11, fontWeight:700, letterSpacing:"0.1em" }}>PRACTICE SUGGESTIONS</div>
            <span style={{ color:P.muted, fontSize:14 }}>{showSugg ? "▲" : "▼"}</span>
          </div>
          {showSugg && (
            <div style={{ padding:"12px 16px", display:"flex", flexDirection:"column", gap:10 }}>
              {suggs.map((s, i) => (
                <div key={i}
                  onClick={s.sectionId ? () => onSectionClick(s.sectionId) : undefined}
                  style={{ display:"flex", gap:12, alignItems:"flex-start", background:P.surface,
                    borderRadius:10, padding:"12px 14px", border:`1px solid ${s.color}33`,
                    cursor:s.sectionId?"pointer":"default" }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:s.color+"22",
                    border:`1px solid ${s.color}44`, display:"flex", alignItems:"center",
                    justifyContent:"center", fontSize:16, color:s.color, flexShrink:0 }}>{s.icon}</div>
                  <div style={{ minWidth:0, flex:1 }}>
                    <div style={{ color:s.color, fontSize:12, fontWeight:700, marginBottom:3 }}>{s.title}</div>
                    <div style={{ color:P.textSoft, fontSize:12, lineHeight:1.6 }}>{s.body}</div>
                  </div>
                  {s.sectionId && <span style={{ color:s.color, fontSize:16, flexShrink:0, alignSelf:"center" }}>→</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── CollapsibleRefs ───────────────────────────────────────────────────────────
export function CollapsibleRefs({ references }) {
  const [open, setOpen] = useState(false);
  if (!references?.length) return null;
  return (
    <div style={{ background:P.surface, border:`1px solid ${P.border}`,
      borderRadius:12, marginBottom:14, overflow:"hidden" }}>
      <div onClick={() => setOpen(v => !v)}
        style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"12px 16px", cursor:"pointer" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ color:P.muted, fontSize:11, fontWeight:700, letterSpacing:"0.1em" }}>REFERENCES</div>
          <span style={{ background:P.teal+"22", color:P.teal, fontSize:10,
            fontWeight:700, padding:"1px 7px", borderRadius:8 }}>{references.length}</span>
        </div>
        <span style={{ color:P.muted, fontSize:14 }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div style={{ padding:"0 16px 14px", display:"flex", flexDirection:"column", gap:8 }}>
          {references.map((ref, i) => {
            const rt = REF_TYPES[ref.type] || REF_TYPES.tutorial;
            return (
              <a key={i} href={ref.url} target="_blank" rel="noopener noreferrer"
                style={{ display:"flex", alignItems:"flex-start", gap:10, background:P.card,
                  border:`1px solid ${rt.color}33`, borderRadius:10, padding:"11px 13px",
                  textDecoration:"none" }}>
                <span style={{ color:rt.color, fontSize:16, flexShrink:0, marginTop:1 }}>{rt.icon}</span>
                <div style={{ minWidth:0, flex:1 }}>
                  <div style={{ display:"flex", gap:6, marginBottom:2 }}>
                    <span style={{ color:rt.color, fontSize:10, fontWeight:700,
                      letterSpacing:"0.06em", background:rt.color+"22",
                      padding:"1px 6px", borderRadius:6 }}>{rt.label.toUpperCase()}</span>
                  </div>
                  <div style={{ color:P.text, fontSize:13, fontWeight:600, marginBottom:ref.note?3:0,
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{ref.label}</div>
                  {ref.note && <div style={{ color:P.muted, fontSize:11, lineHeight:1.5 }}>{ref.note}</div>}
                </div>
                <span style={{ color:rt.color, fontSize:16, flexShrink:0, alignSelf:"center" }}>→</span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── ContinueBanner ────────────────────────────────────────────────────────────
export function ContinueBanner({ session, allSongs, onResume }) {
  if (!session) return null;
  const song = allSongs.find(s => s.id === session.songId);
  if (!song) return null;
  const sec = song.sections?.find(s => s.id === session.secId);
  if (!sec) return null;
  const e = Date.now() - session.ts;
  const t = e<60000?"just now":e<3600000?`${Math.round(e/60000)}m ago`:e<86400000?`${Math.round(e/3600000)}h ago`:`${Math.round(e/86400000)}d ago`;
  return (
    <div style={{ background:P.card, border:`1px solid ${P.accent}44`, borderRadius:14,
      padding:18, marginBottom:20, display:"flex", flexWrap:"wrap", gap:14,
      alignItems:"center", boxShadow:`0 0 24px ${P.accent}18` }}>
      <div style={{ flex:"1 1 180px", minWidth:0 }}>
        <div style={{ color:P.muted, fontSize:10, fontWeight:700,
          letterSpacing:"0.1em", marginBottom:4 }}>CONTINUE · {t.toUpperCase()}</div>
        <div style={{ color:P.text, fontSize:17, fontWeight:800, marginBottom:2,
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{song.title}</div>
        <div style={{ color:P.textSoft, fontSize:13 }}>{song.artist} · {sec.name}</div>
      </div>
      <button onClick={() => onResume(song, session.secId)}
        style={{ flexShrink:0, padding:"10px 22px", borderRadius:10, border:"none",
          cursor:"pointer", fontWeight:800, fontSize:13, background:P.accent,
          color:"#0a0a0f", boxShadow:`0 0 16px ${P.accent}44` }}>▶ Resume</button>
    </div>
  );
}
