import { useState, useEffect, useCallback } from "react";
import { P, LS_SONGS, LS_PROGRESS, LS_SESSION, LS_SEMIS } from "./lib/constants";
import { ls } from "./lib/ls";
import { useWindowWidth } from "./hooks/useWindowWidth";
import { useMetronome } from "./hooks/useMetronome";
import { BUILTIN_SONGS } from "./songs/layla";
import { ContinueBanner, SongHeader, ProgressHero, CollapsibleRefs } from "./components/song/SongPanels";
import { RunThrough, SectionDetail, SectionCard } from "./components/song/SongComponents";
import { SongLibrary } from "./components/library/LibraryComponents";

export default function Woodshed() {
  const [customSongs,  setCustomSongs]  = useState(() => ls.load(LS_SONGS, []));
  const [allProgress,  setAllProgress]  = useState(() => ls.load(LS_PROGRESS, {}));
  const [allSemitones, setAllSemitones] = useState(() => ls.load(LS_SEMIS, {}));
  const [session,      setSession]      = useState(() => ls.load(LS_SESSION, null));
  const [activeSong,   setActiveSong]   = useState(null);
  const [view,         setView]         = useState("library");
  const [showDetail,   setShowDetail]   = useState(false);
  const [activeSecId,  setActiveSecId]  = useState(null);
  const [runThrough,   setRunThrough]   = useState(false);

  const allSongs = [...BUILTIN_SONGS, ...customSongs];
  const w        = useWindowWidth();
  const isMobile = w < 700;
  const px       = isMobile ? 12 : 28;

  const semitones    = activeSong ? (allSemitones[activeSong.id] ?? 0) : 0;
  const setSemitones = v => {
    if (!activeSong) return;
    const next = { ...allSemitones, [activeSong.id]: v };
    setAllSemitones(next); ls.save(LS_SEMIS, next);
  };

  const metro = useMetronome(activeSong?.bpm || 116, activeSong?.timeSignature || "4/4");

  // Merge saved progress into section objects
  const sections = (activeSong?.sections || []).map((s, i) => ({
    ...s,
    status: (allProgress[activeSong?.id] || {})[s.id] || s.status || (i === 0 ? "in-progress" : "not-started"),
  }));
  const current = sections.find(s => s.id === activeSecId);

  // Persist session on section change
  useEffect(() => {
    if (!activeSong || !activeSecId) return;
    const s = { songId:activeSong.id, secId:activeSecId, ts:Date.now() };
    setSession(s); ls.save(LS_SESSION, s);
  }, [activeSong?.id, activeSecId]); // eslint-disable-line

  // ── Actions ─────────────────────────────────────────────────────────────────
  const openSong = (song, isNew = false, jumpToSecId = null) => {
    if (isNew) {
      const up = [...customSongs.filter(s => s.id !== song.id), song];
      setCustomSongs(up); ls.save(LS_SONGS, up);
    }
    setActiveSong(song);
    const resumeSec = jumpToSecId
      || (session?.songId === song.id ? session?.secId : null)
      || song.sections?.[0]?.id || 1;
    setActiveSecId(resumeSec);
    setView("song"); setShowDetail(false); setRunThrough(false);
  };

  const deleteSong = id => {
    const up = customSongs.filter(s => s.id !== id);
    setCustomSongs(up); ls.save(LS_SONGS, up);
  };

  const markMastered = useCallback(secId => {
    if (!activeSong) return;
    setAllProgress(prev => {
      const sp = { ...(prev[activeSong.id] || {}) };
      sp[secId] = "mastered";
      const ns = activeSong.sections.find(s => s.id === secId + 1);
      if (ns && !sp[ns.id]) sp[ns.id] = "in-progress";
      const next = { ...prev, [activeSong.id]: sp };
      ls.save(LS_PROGRESS, next); return next;
    });
  }, [activeSong]);

  const handleResume = secId => {
    setActiveSecId(secId);
    if (isMobile) setShowDetail(true);
  };

  const handleStart = useCallback(section => {
    if (section.status === "not-started" && activeSong) {
      setAllProgress(prev => {
        const sp = { ...(prev[activeSong.id] || {}) };
        if (!sp[section.id]) sp[section.id] = "in-progress";
        const next = { ...prev, [activeSong.id]: sp };
        ls.save(LS_PROGRESS, next); return next;
      });
    }
    // Set practice tempo to 50% but do NOT auto-start — user starts metronome manually
    const practiceBpm = Math.round((activeSong?.bpm || 116) * 0.5);
    metro.setTempo(practiceBpm);
    setActiveSecId(section.id);
    if (isMobile) setShowDetail(true);
  }, [activeSong, metro, isMobile]);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ background:P.bg, minHeight:"100vh",
      fontFamily:"'Georgia','Times New Roman',serif", color:P.text }}>

      {/* ── Header ── */}
      <div style={{ background:P.surface, borderBottom:`1px solid ${P.border}`,
        padding:`0 ${px}px`, position:"sticky", top:0, zIndex:100 }}>
        <div style={{ maxWidth:1140, margin:"0 auto", display:"flex", alignItems:"center",
          justifyContent:"space-between", height:52 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0, flex:1, overflow:"hidden" }}>
            <span style={{ color:P.accent, fontSize:20, flexShrink:0 }}>🪵</span>
            <button onClick={() => { setView("library"); setRunThrough(false); }}
              style={{ fontWeight:800, fontSize:14, background:"none", border:"none",
                color:P.text, cursor:"pointer", padding:0, flexShrink:0 }}>Woodshed</button>
            {activeSong && !isMobile && (
              <>
                <span style={{ color:P.border, flexShrink:0 }}>|</span>
                <span style={{ color:P.textSoft, fontSize:13, overflow:"hidden",
                  textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {activeSong.title} — {activeSong.artist}
                </span>
              </>
            )}
          </div>
          <div style={{ display:"flex", gap:4, flexShrink:0, alignItems:"center" }}>
            {metro.running && (
              <div style={{ display:"flex", gap:3, marginRight:6 }}>
                {Array.from({ length:metro.bpb }).map((_, i) => (
                  <div key={i} style={{ width:7, height:7, borderRadius:"50%",
                    background: metro.beat === i ? (i === 0 ? P.accent : P.teal) : P.border,
                    transition:"background 0.05s" }} />
                ))}
              </div>
            )}
            {[["library","Library"],["framework","Framework"]].map(([v, l]) => (
              <button key={v} onClick={() => setView(v)}
                style={{ background:view===v?P.accentDim:"transparent",
                  border:`1px solid ${view===v?P.accent+"66":"transparent"}`,
                  color:view===v?P.accent:P.muted,
                  borderRadius:6, padding:"5px 10px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
                {l}
              </button>
            ))}
            {activeSong && (
              <button onClick={() => setView("song")}
                style={{ background:view==="song"?P.accentDim:"transparent",
                  border:`1px solid ${view==="song"?P.accent+"66":"transparent"}`,
                  color:view==="song"?P.accent:P.muted,
                  borderRadius:6, padding:"5px 10px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
                Song
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1140, margin:"0 auto", padding:`${isMobile?14:24}px ${px}px` }}>

        {/* ── Library ── */}
        {view === "library" && (
          <div>
            <ContinueBanner session={session} allSongs={allSongs}
              onResume={(song, secId) => openSong(song, false, secId)} />
            <SongLibrary allSongs={allSongs} onSelect={openSong}
              onDelete={deleteSong} isMobile={isMobile} allProgress={allProgress} />
          </div>
        )}

        {/* ── Song ── */}
        {view === "song" && activeSong && (
          <div>
            {!(isMobile && showDetail) && (
              <SongHeader song={activeSong} semitones={semitones}
                setSemitones={setSemitones} isMobile={isMobile}
                onBack={() => setView("library")} />
            )}
            {runThrough && !(isMobile && showDetail) && (
              <RunThrough sections={sections} song={activeSong} metro={metro}
                onExit={() => setRunThrough(false)}
                onSectionChange={secId => { setActiveSecId(secId); if (isMobile) setShowDetail(true); }}
                semitones={semitones} />
            )}
            {!runThrough && !(isMobile && showDetail) && (
              <ProgressHero sections={sections} songTitle={activeSong.title}
                onResume={handleResume}
                onSectionClick={secId => { setActiveSecId(secId); if (isMobile) setShowDetail(true); }}
                isMobile={isMobile} onRunThrough={() => setRunThrough(true)} />
            )}
            {!(isMobile && showDetail) && (
              <CollapsibleRefs references={activeSong.references} />
            )}
            {isMobile && showDetail && (
              <button onClick={() => setShowDetail(false)}
                style={{ display:"flex", alignItems:"center", gap:6, background:"none",
                  border:"none", color:P.textSoft, fontSize:14, cursor:"pointer",
                  marginBottom:12, padding:0 }}>
                <span style={{ fontSize:20 }}>‹</span> All sections
              </button>
            )}

            {/* Sections list / detail */}
            {isMobile ? (
              showDetail ? (
                <div>
                  {current && (
                    <SectionDetail section={current} onMarkMastered={markMastered}
                      isMobile metro={metro} semitones={semitones} song={activeSong} />
                  )}
                </div>
              ) : (
                <div>
                  <div style={{ color:P.muted, fontSize:10, fontWeight:700,
                    letterSpacing:"0.1em", marginBottom:10 }}>SECTIONS — tap to open</div>
                  {sections.map(s => (
                    <SectionCard key={s.id} section={s} isActive={activeSecId === s.id}
                      onClick={() => { setActiveSecId(s.id); setShowDetail(true); }}
                      onStart={handleStart} isMobile semitones={semitones} />
                  ))}
                </div>
              )
            ) : (
              <div style={{ display:"flex", gap:18, alignItems:"flex-start" }}>
                <div style={{ flex:"0 0 265px" }}>
                  <div style={{ color:P.muted, fontSize:11, fontWeight:700,
                    letterSpacing:"0.1em", marginBottom:11 }}>SECTIONS</div>
                  {sections.map(s => (
                    <SectionCard key={s.id} section={s} isActive={activeSecId === s.id}
                      onClick={() => setActiveSecId(s.id)}
                      onStart={handleStart} isMobile={false} semitones={semitones} />
                  ))}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ color:P.muted, fontSize:11, fontWeight:700,
                    letterSpacing:"0.1em", marginBottom:11 }}>SECTION DETAIL</div>
                  {current && (
                    <SectionDetail section={current} onMarkMastered={markMastered}
                      isMobile={false} metro={metro} semitones={semitones} song={activeSong} />
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Framework ── */}
        {view === "framework" && (
          <div>
            <div style={{ marginBottom:20 }}>
              <div style={{ color:P.muted, fontSize:11, letterSpacing:"0.1em", marginBottom:5 }}>REPLICABLE PROCESS</div>
              <h2 style={{ margin:0, fontSize:isMobile?20:24, fontWeight:800, letterSpacing:"-0.02em" }}>The 4-Phase Learning Framework</h2>
              <p style={{ color:P.textSoft, fontSize:13, lineHeight:1.7, marginTop:8 }}>
                Applies to any song, instrument, or skill. Complexity is never learned whole — deconstructed, isolated, layered, integrated.
              </p>
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
              {[
                { phase:"01", title:"Deconstruct", icon:"⬡", color:P.teal,
                  steps:["Identify all sections and riffs","Map chord progressions","Isolate each riff's feel","Transcribe the melody","Mark key, time signature, tempo"] },
                { phase:"02", title:"Isolate", icon:"◈", color:P.accent,
                  steps:["Practice each riff at 50% bpm","Separate guitar from vocal","Loop hardest passages","Practice chord transitions","Add voice once guitar is automatic"] },
                { phase:"03", title:"Layer", icon:"⬗", color:P.gold,
                  steps:["Add embellishments one at a time","Connect sections at joins","Build verse to chorus dynamics","Plan every breath point","Record yourself"] },
                { phase:"04", title:"Integrate", icon:"⬟", color:P.purple,
                  steps:["Full song run-through at 80% tempo","Increase to 100% once clean","Perform for someone — nerves reveal gaps","Iterate on weak sections","Document your adaptations"] },
              ].map(p => (
                <div key={p.phase} style={{ background:P.card, border:`1px solid ${P.border}`,
                  borderTop:`3px solid ${p.color}`, borderRadius:12, padding:18, flex:"1 1 200px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                    <span style={{ color:p.color, fontSize:18 }}>{p.icon}</span>
                    <div>
                      <div style={{ color:p.color, fontSize:10, fontWeight:700, letterSpacing:"0.1em" }}>PHASE {p.phase}</div>
                      <div style={{ color:P.text, fontSize:15, fontWeight:700 }}>{p.title}</div>
                    </div>
                  </div>
                  <ol style={{ paddingLeft:16, margin:0 }}>
                    {p.steps.map((s, i) => (
                      <li key={i} style={{ color:P.textSoft, fontSize:12, lineHeight:1.8 }}>{s}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
