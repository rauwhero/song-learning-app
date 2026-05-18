import { P, SOURCE_QUALITY } from "../../lib/constants";

export function StatusBadge({ status }) {
  const C = {
    mastered:     { l:"Mastered",     c:P.teal,   d:"●" },
    "in-progress":{ l:"In Progress",  c:P.accent, d:"◐" },
    "not-started":{ l:"Not Started",  c:P.muted,  d:"○" },
  }[status] || { l:status, c:P.muted, d:"○" };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4,
      padding:"3px 9px", borderRadius:20, fontSize:10, fontWeight:700,
      letterSpacing:"0.07em", background:C.c+"22", color:C.c,
      border:`1px solid ${C.c}44` }}>
      {C.d} {C.l.toUpperCase()}
    </span>
  );
}

export function QualityBadge({ quality, compact = false }) {
  const q = SOURCE_QUALITY[quality] || SOURCE_QUALITY.builtin;
  if (compact) return (
    <span title={q.desc} style={{ display:"inline-flex", alignItems:"center", gap:3,
      padding:"2px 7px", borderRadius:8, fontSize:10, fontWeight:700,
      background:q.color+"22", color:q.color, border:`1px solid ${q.color}44`, cursor:"help" }}>
      {q.icon} {q.label}
    </span>
  );
  return (
    <div style={{ display:"flex", alignItems:"flex-start", gap:8,
      background:q.color+"15", border:`1px solid ${q.color}33`,
      borderRadius:8, padding:"8px 12px" }}>
      <span style={{ color:q.color, fontSize:16, flexShrink:0 }}>{q.icon}</span>
      <div>
        <div style={{ color:q.color, fontSize:11, fontWeight:700 }}>{q.label}</div>
        <div style={{ color:P.textSoft, fontSize:11, marginTop:2 }}>{q.desc}</div>
      </div>
    </div>
  );
}
