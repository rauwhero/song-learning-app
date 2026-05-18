import { P } from "../../lib/constants";

export function ChordDiagram({ chordName, shape }) {
  if (!shape) return null;
  const FRETS = 5, W = 112, H = 124, L = 18, R = W - 8, T = 26, B = H - 14;
  const sx = s => L + ((6 - s) / 5) * (R - L);
  const fy = f => T + ((f - shape.fret) / (FRETS - 1)) * (B - T);
  const isOpen = shape.fret === 1;
  return (
    <div role="img" aria-label={`Chord diagram for ${chordName} — ${shape.label}`}
      style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
      <div style={{ color:P.accent, fontSize:13, fontWeight:800, marginBottom:2 }}>{chordName}</div>
      <div style={{ color:P.muted, fontSize:9, marginBottom:4 }}>{shape.label}</div>
      <svg width={W} height={H} style={{ overflow:"visible" }}>
        {shape.fret > 1 && (
          <text x={L - 3} y={fy(shape.fret) + 4} textAnchor="end" fill={P.muted} fontSize={9}>
            {shape.fret}fr
          </text>
        )}
        {isOpen && <rect x={L - 2} y={T - 5} width={R - L + 4} height={5} rx={2} fill={P.textSoft} />}
        {Array.from({ length:FRETS }).map((_, i) => (
          <line key={i} x1={L} x2={R}
            y1={fy(shape.fret + i)} y2={fy(shape.fret + i)}
            stroke={P.border} strokeWidth={i === 0 && !isOpen ? 2.5 : 1} />
        ))}
        {[1,2,3,4,5,6].map(s => (
          <line key={s} x1={sx(s)} x2={sx(s)} y1={isOpen ? T - 5 : T} y2={B}
            stroke={(shape.mute || []).includes(s) ? "transparent" : P.border} strokeWidth={1} />
        ))}
        {shape.barre && (
          <rect x={sx(shape.barreString) - 1} y={fy(shape.fret) - 7}
            width={sx(1) - sx(shape.barreString) + 2} height={14} rx={7}
            fill={P.accent} opacity={0.88} />
        )}
        {(shape.dots || []).filter(d => d.f > 0).map((d, i) => (
          <circle key={i} cx={sx(d.s)} cy={fy(d.f)} r={7} fill={P.accent} />
        ))}
        {(shape.open || []).map((s, i) => (
          <circle key={i} cx={sx(s)} cy={T - 10} r={5}
            fill="none" stroke={P.teal} strokeWidth={1.5} />
        ))}
        {(shape.mute || []).map((s, i) => (
          <text key={i} x={sx(s)} y={T - 7} textAnchor="middle"
            fill={P.red} fontSize={10} fontWeight="bold">x</text>
        ))}
        {[{s:6,n:"E"},{s:5,n:"A"},{s:4,n:"D"},{s:3,n:"G"},{s:2,n:"B"},{s:1,n:"e"}].map(({ s, n }) => (
          <text key={s} x={sx(s)} y={H - 1} textAnchor="middle" fill={P.muted} fontSize={8}>{n}</text>
        ))}
      </svg>
    </div>
  );
}
