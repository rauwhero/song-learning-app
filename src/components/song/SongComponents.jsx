import { useState, useEffect } from "react";
import { P } from "../../lib/constants";
import { tChord } from "../../theory/index";
import { StatusBadge, QualityBadge } from "../shared/Badges";
import { ChordExplorer } from "../chord/ChordExplorer";
import { MetronomePanel, MiniMetro, LyricsCoach, PitchDetector } from "../practice/PracticeComponents";
import { BackingBand } from "../practice/BackingBand";
import { RiffCard } from "../practice/RiffCard";

// ── RunThrough ────────────────────────────────────────────────────────────────
export function RunThrough({ sections, song, metro, onExit, onSectionChange, semitones }) {
  const [idx,   setIdx]   = useState(0);
  const [phase, setPhase] = useState("playing");
  const sec        = sections[idx] || sections[0];
  const isUnstarted = sec?.status === "not-started";

  const next = () => {
    if (idx < sections.length - 1) { setIdx(i => i + 1); onSectionChange(sections[idx + 1]?.id); }
    else setPhase("complete");
  };
  const prev = () => { if (idx > 0) { setIdx(i => i - 1); onSectionChange(sections[idx - 1]?.id); } };

  useEffect(() => {
    if (sec) onSectionChange(sec.id);
    if (isUnstarted) setPhase("paused_unstarted"); else setPhase("playing");
  }, [idx]); // eslint-disable-line

  return (
    <div style={{ background:P.card, border:`1px solid ${P.accent}44`, borderRadius:14,
      padding:20, marginBottom:16, boxShadow:`0 0 30px ${P.accent}18` }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:10, height:10, borderRadius:"50%", background:P.accent,
            boxShadow:`0 0 8px ${P.accent}` }} />
          <div style={{ color:P.accent, fontSize:12, fontWeight:700, letterSpacing:"0.08em" }}>RUN-THROUGH MODE</div>
        </div>
        <button onClick={onExit} style={{ background:"none", border:`1px solid ${P.border}`,
          color:P.muted, borderRadius:8, padding:"4px 12px", cursor:"pointer", fontSize:12 }}>Exit</button>
      </div>
      <div style={{ display:"flex", gap:3, marginBottom:16 }}>
        {sections.map((s, i) => (
          <div key={s.id} onClick={() => setIdx(i)} title={s.name}
            style={{ flex:1, height:6, borderRadius:3, cursor:"pointer",
              background: i < idx ? P.teal : i === idx ? P.accent : P.border,
              transition:"background 0.3s" }} />
        ))}
      </div>
      <div style={{ background:P.surface, borderRadius:10, padding:"14px 16px",
        marginBottom:14, border:`1px solid ${sec?.color || P.border}44` }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
          <span style={{ color:P.muted, fontSize:11 }}>{idx+1} of {sections.length}</span>
          <span style={{ color:sec?.color || P.text, fontSize:16, fontWeight:800 }}>{sec?.name}</span>
          <StatusBadge status={sec?.status || "not-started"} />
        </div>
        <div style={{ color:P.muted, fontSize:12 }}>{sec?.type} · {sec?.duration}</div>
        {sec?.technique && <div style={{ color:P.textSoft, fontSize:12, marginTop:8, lineHeight:1.6 }}>{sec.technique}</div>}
      </div>
      {phase === "paused_unstarted" && (
        <div style={{ background:P.gold+"18", border:`1px solid ${P.gold}44`,
          borderRadius:10, padding:"14px 16px", marginBottom:14 }}>
          <div style={{ color:P.gold, fontSize:13, fontWeight:700, marginBottom:6 }}>Section not yet started</div>
          <div style={{ color:P.textSoft, fontSize:12, lineHeight:1.6 }}>
            Work through <strong style={{ color:P.text }}>{sec?.name}</strong> in the section detail panel before continuing.
            {sec?.riffs?.length > 0 && <> Start with the <strong style={{ color:P.text }}>{sec.riffs[0].name}</strong> riff at {sec.riffs[0].bpm_guide} bpm.</>}
          </div>
          <button onClick={() => setPhase("playing")}
            style={{ marginTop:10, padding:"7px 16px", borderRadius:8, border:`1px solid ${P.gold}`,
              background:P.gold+"22", color:P.gold, fontWeight:700, fontSize:12, cursor:"pointer" }}>
            Continue anyway
          </button>
        </div>
      )}
      {phase === "complete" && (
        <div style={{ background:P.tealDim, border:`1px solid ${P.teal}`,
          borderRadius:10, padding:16, marginBottom:14, textAlign:"center" }}>
          <div style={{ color:P.teal, fontSize:24, marginBottom:6 }}>✓</div>
          <div style={{ color:P.teal, fontSize:16, fontWeight:800, marginBottom:4 }}>Full Song Complete</div>
          <div style={{ color:P.textSoft, fontSize:13 }}>
            You've played through all {sections.length} sections. Record yourself next — nerves reveal gaps that practice hides.
          </div>
        </div>
      )}
      <div style={{ background:P.surface, borderRadius:8, padding:"10px 14px",
        marginBottom:14, display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ display:"flex", gap:4 }}>
          {Array.from({ length:metro.bpb }).map((_, i) => (
            <div key={i} style={{ width:i===0?12:9, height:i===0?12:9, borderRadius:"50%",
              background: metro.running && metro.beat === i ? (i===0?P.accent:P.teal) : P.border,
              transition:"background 0.05s" }} />
          ))}
        </div>
        <span style={{ color:metro.running?P.accent:P.muted, fontSize:12, fontWeight:700 }}>
          {Math.round(metro.tempo * metro.mult)} bpm
        </span>
        <button onClick={metro.running ? metro.stop : metro.start}
          style={{ marginLeft:"auto", padding:"5px 14px", borderRadius:8,
            border:`1px solid ${metro.running ? P.red : P.teal}`,
            background: metro.running ? P.red+"22" : P.tealDim,
            color: metro.running ? P.red : P.teal, fontSize:11, fontWeight:700, cursor:"pointer" }}>
          {metro.running ? "■ Stop" : "▶ Start"}
        </button>
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={prev} disabled={idx === 0}
          style={{ flex:1, padding:"10px 0", borderRadius:8, border:`1px solid ${P.border}`,
            background:"transparent", color:idx===0?P.muted:P.text,
            cursor:idx===0?"not-allowed":"pointer", fontWeight:700, fontSize:13 }}>
          ← Prev
        </button>
        {phase === "complete" ? (
          <button onClick={onExit}
            style={{ flex:2, padding:"10px 0", borderRadius:8, border:"none",
              background:P.teal, color:"#0a0a0f", fontWeight:800, fontSize:13, cursor:"pointer" }}>
            Back to Song
          </button>
        ) : (
          <button onClick={next}
            style={{ flex:2, padding:"10px 0", borderRadius:8, border:"none",
              background:P.accent, color:"#0a0a0f", fontWeight:800, fontSize:13, cursor:"pointer" }}>
            Next: {sections[idx + 1]?.name || "Finish"} →
          </button>
        )}
      </div>
    </div>
  );
}

// ── SectionDetail ─────────────────────────────────────────────────────────────
export function SectionDetail({ section, onMarkMastered, isMobile, metro, semitones, song }) {
  const [tab, setTab] = useState("guitar");
  return (
    <div style={{ background:P.card, border:`1px solid ${section.color}44`,
      borderRadius:14, padding:isMobile?14:22, boxShadow:`0 0 40px ${section.color}15` }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
        marginBottom:14, gap:10 }}>
        <div style={{ minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
            <span style={{ fontSize:isMobile?17:21, fontWeight:700, color:section.color }}>{section.name}</span>
            <StatusBadge status={section.status} />
            {section.dataQuality === "ai_assisted" && <QualityBadge quality="ai_assisted" compact />}
          </div>
          <div style={{ color:P.muted, fontSize:12 }}>Bars {section.bars} · {section.duration} · {section.type}</div>
          {semitones !== 0 && (
            <div style={{ marginTop:4, display:"flex", gap:5, flexWrap:"wrap" }}>
              {section.chords.map((c, i) => (
                <span key={i} style={{ background:P.accentDim, color:P.accent, fontSize:11,
                  fontWeight:700, padding:"2px 7px", borderRadius:4 }}>{tChord(c, semitones)}</span>
              ))}
            </div>
          )}
        </div>
        {section.status !== "mastered" && (
          <button onClick={() => onMarkMastered(section.id)}
            style={{ flexShrink:0, padding:"6px 11px", borderRadius:7,
              border:`1px solid ${P.teal}`, background:P.tealDim, color:P.teal,
              fontWeight:700, fontSize:11, cursor:"pointer", whiteSpace:"nowrap" }}>
            Mastered ✓
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:0, marginBottom:16,
        borderBottom:`1px solid ${P.border}`, overflowX:"auto" }}>
        {["guitar","band","riffs","vocals","metronome"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ background:"none", border:"none",
              padding:isMobile?"7px 10px":"8px 14px", cursor:"pointer",
              fontSize:isMobile?10:11, fontWeight:700, letterSpacing:"0.04em",
              textTransform:"uppercase", whiteSpace:"nowrap", flexShrink:0,
              position:"relative",
              color: tab === t ? section.color : (t === "metronome" && metro.running) ? P.accent : P.muted,
              borderBottom:`2px solid ${tab === t ? section.color : "transparent"}`,
              marginBottom:-1, transition:"all 0.2s" }}>
            {t === "metronome" && metro.running && tab !== "metronome" && (
              <span style={{ position:"absolute", top:4, right:4, width:6, height:6,
                borderRadius:"50%", background:P.accent }} />
            )}
            {t === "riffs" && section.riffs?.length > 0 && (
              <span style={{ marginLeft:5, background:P.purple+"33", color:P.purple,
                fontSize:9, fontWeight:800, padding:"1px 5px", borderRadius:8 }}>
                {section.riffs.length}
              </span>
            )}
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "guitar" && (
        <div>
          <MiniMetro metro={metro} onGoTo={() => setTab("metronome")} />
          <p style={{ color:P.textSoft, fontSize:13, lineHeight:1.7, marginBottom:14 }}>{section.technique}</p>
          <ChordExplorer chords={section.chords} semitones={semitones} bpm={metro.tempo} />
        </div>
      )}
      {tab === "band" && song && (
        <div>
          <MiniMetro metro={metro} onGoTo={() => setTab("metronome")} />
          <BackingBand song={song} semitones={semitones} />
        </div>
      )}
      {tab === "riffs" && (
        <div>
          <MiniMetro metro={metro} onGoTo={() => setTab("metronome")} />
          {section.riffs?.length > 0 ? (
            section.riffs.map(r => (
              <RiffCard key={r.id} riff={r}
                onSetMetro={bpm => { metro.setTempo(bpm); if (!metro.running) metro.start(); }} />
            ))
          ) : (
            <div style={{ background:P.surface, borderRadius:12, padding:20,
              border:`1px solid ${P.border}`, textAlign:"center" }}>
              <div style={{ fontSize:28, marginBottom:8 }}>🎸</div>
              <div style={{ color:P.textSoft, fontSize:13 }}>No riffs for this section yet.</div>
            </div>
          )}
        </div>
      )}
      {tab === "vocals" && (
        <div>
          <MiniMetro metro={metro} onGoTo={() => setTab("metronome")} />
          <LyricsCoach lyrics={section.lyrics} color={section.color} semitones={semitones} metro={metro} />
          <PitchDetector referenceNotes={section.referenceNotes} />
        </div>
      )}
      {tab === "metronome" && <MetronomePanel metro={metro} />}
    </div>
  );
}

// ── SectionCard ───────────────────────────────────────────────────────────────
export function SectionCard({ section, isActive, onClick, onStart, isMobile, semitones }) {
  const tc = section.chords.map(c => tChord(c, semitones));
  return (
    <div style={{ background:isActive?P.card:P.surface,
      border:`1px solid ${isActive?section.color+"66":P.border}`,
      borderLeft:`3px solid ${isActive?section.color:P.border}`,
      borderRadius:10, padding:isMobile?"11px 13px":"13px 15px", marginBottom:7,
      transition:"all 0.2s", boxShadow:isActive?`0 0 18px ${section.color}20`:"none" }}>
      <div onClick={onClick} style={{ cursor:"pointer" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
          marginBottom:3, gap:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:9, minWidth:0 }}>
            <span style={{ width:20, height:20, borderRadius:"50%",
              background:section.color+"33", border:`1px solid ${section.color}88`,
              color:section.color, fontSize:10, fontWeight:800,
              display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              {section.id}
            </span>
            <span style={{ color:P.text, fontWeight:700, fontSize:13,
              whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{section.name}</span>
          </div>
          <div style={{ flexShrink:0 }}><StatusBadge status={section.status} /></div>
        </div>
        <div style={{ display:"flex", gap:8, paddingLeft:29, flexWrap:"wrap", alignItems:"center" }}>
          <span style={{ color:P.muted, fontSize:11 }}>{section.type}</span>
          <span style={{ color:section.color, fontSize:11, fontWeight:600 }}>
            {tc.slice(0, 3).join(" · ")}{tc.length > 3 ? " …" : ""}
          </span>
          {section.riffs?.length > 0 && (
            <span style={{ background:P.purple+"22", color:P.purple, fontSize:9, fontWeight:700,
              padding:"1px 6px", borderRadius:8 }}>
              {section.riffs.length} riff{section.riffs.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
      {(isActive || section.status === "not-started") && section.status !== "mastered" && (
        <div style={{ marginTop:10, paddingTop:10, borderTop:`1px solid ${P.border}44` }}>
          <button onClick={e => { e.stopPropagation(); onStart(section); }}
            style={{ width:"100%", padding:"8px 0", borderRadius:8, border:"none",
              cursor:"pointer", fontWeight:800, fontSize:12,
              background: section.status === "not-started" ? section.color : P.accent,
              color:"#0a0a0f", transition:"background 0.2s" }}>
            {section.status === "not-started" ? `▶ Start ${section.name}` : `▶ Continue ${section.name}`}
          </button>
        </div>
      )}
    </div>
  );
}
