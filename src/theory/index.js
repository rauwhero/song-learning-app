import { P } from "../lib/constants";

// ── Chromatic scale & enharmonics ─────────────────────────────────────────────
export const CHROMATIC  = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
export const ENHARMONIC = {"Db":"C#","Eb":"D#","Gb":"F#","Ab":"G#","Bb":"A#","Cb":"B","Fb":"E"};

export const DEGREE_SHORT = { 0:"1",1:"b2",2:"2",3:"b3",4:"3",5:"4",6:"b5",7:"5",8:"b6",9:"6",10:"b7",11:"7" };
export const DEGREE_LABEL = { 0:"1 (Root)",1:"b2",2:"2",3:"b3",4:"3 (Maj)",5:"4",6:"b5",7:"5 (5th)",8:"b6",9:"6",10:"b7",11:"7 (Maj)" };

// ── Chord intervals ───────────────────────────────────────────────────────────
export const CHORD_INTERVALS = {
  "":[0,4,7], "m":[0,3,7], "7":[0,4,7,10], "m7":[0,3,7,10],
  "maj7":[0,4,7,11], "m7b5":[0,3,6,10], "dim":[0,3,6],
  "sus2":[0,2,7], "sus4":[0,5,7], "6":[0,4,7,9], "m6":[0,3,7,9],
  "add9":[0,4,7,14], "9":[0,4,7,10,14], "5":[0,7],
  "7sus2":[0,2,7,10], "7sus4":[0,5,7,10],
};

// ── Core theory functions ─────────────────────────────────────────────────────
export function parseChord(ch) {
  if (!ch) return null;
  const c = ENHARMONIC[ch] || ch;
  const m = c.match(/^([A-G]#?)(.*)(?:\/([A-G]#?))?$/);
  if (!m) return null;
  return { root:m[1], quality:m[2].replace(/\/[A-G]#?$/,""), bass:m[3]?(ENHARMONIC[m[3]]||m[3]):null };
}

export function tRoot(root, s) {
  const i = CHROMATIC.indexOf(root);
  return i < 0 ? root : CHROMATIC[(i + s + 12) % 12];
}

export function tChord(ch, s) {
  if (!ch || s === 0) return ch;
  const p = parseChord(ch); if (!p) return ch;
  return tRoot(p.root, s) + p.quality + (p.bass ? "/" + tRoot(p.bass, s) : "");
}

export function tKey(key, s) {
  if (!key || s === 0) return key;
  const pts = key.split(" ");
  return [tRoot(ENHARMONIC[pts[0]] || pts[0], s), ...pts.slice(1)].join(" ");
}

export function chordTones(ch) {
  const p = parseChord(ch); if (!p) return [];
  const ri = CHROMATIC.indexOf(p.root); if (ri < 0) return [];
  const ivs = CHORD_INTERVALS[p.quality] || CHORD_INTERVALS[""];
  return ivs.map(i => ({
    note:   CHROMATIC[(ri + i) % 12],
    deg:    DEGREE_SHORT[i % 12] || String(i),
    label:  DEGREE_LABEL[i % 12] || String(i),
    isRoot: i === 0,
  }));
}

export function chordMeta(q) {
  const m = {
    "":["Major",P.teal], "m":["Minor",P.purple], "7":["Dom 7",P.gold], "m7":["Minor 7",P.purple],
    "maj7":["Major 7",P.teal], "dim":["Diminished",P.red], "sus2":["Sus 2",P.textSoft],
    "sus4":["Sus 4",P.textSoft], "6":["Major 6",P.teal], "m6":["Minor 6",P.purple],
    "5":["Power Chord",P.muted], "7sus2":["Dom 7 Sus2",P.gold], "9":["9th",P.gold],
  };
  const v = m[q] || [q || "Major", P.teal];
  return { type:v[0], color:v[1] };
}

export function chordMidi(ch) {
  const p = parseChord(ch); if (!p) return [55,59,62,67];
  const ri = CHROMATIC.indexOf(p.root); if (ri < 0) return [55,59,62,67];
  const base = 48 + ri, ivs = CHORD_INTERVALS[p.quality] || CHORD_INTERVALS[""];
  const ns = ivs.map(i => base + 12 + i);
  // FIX: guard against invalid bass note (CHROMATIC.indexOf returns -1)
  const bassIdx = p.bass ? CHROMATIC.indexOf(p.bass) : -1;
  ns.unshift(bassIdx >= 0 ? 36 + bassIdx : base);
  return ns;
}

// ════════════════════════════════════════════════════════════════════════════════
// CAGED SHAPE LIBRARY (verified from FaChords, GuitarHabits, Ultimate Guitar Chart)
// String numbers: 6=low E, 5=A, 4=D, 3=G, 2=B, 1=high e
// DO NOT auto-generate shapes — hand-verified only
// ════════════════════════════════════════════════════════════════════════════════
export const CAGED = {
  // ─── Major open chords ────────────────────────────────────────────────────
  G:[
    {shape:"G",label:"Open G",fret:1,barre:false,dots:[{s:6,f:3},{s:5,f:2},{s:1,f:3}],mute:[],open:[4,3,2]},
    {shape:"E",label:"E-shape III",fret:3,barre:true,barreString:6,dots:[{s:4,f:5},{s:3,f:5},{s:2,f:4}],mute:[],open:[]},
    {shape:"D",label:"D-shape VII",fret:7,barre:true,barreString:4,dots:[{s:3,f:9},{s:2,f:8}],mute:[6,5],open:[]},
    {shape:"C",label:"C-shape VIII",fret:8,barre:false,dots:[{s:5,f:10},{s:4,f:9},{s:2,f:8},{s:1,f:8}],mute:[6],open:[3]},
    {shape:"A",label:"A-shape X",fret:10,barre:true,barreString:5,dots:[{s:4,f:12},{s:3,f:12},{s:2,f:12},{s:1,f:12}],mute:[6],open:[]},
  ],
  C:[
    {shape:"C",label:"Open C",fret:1,barre:false,dots:[{s:5,f:3},{s:4,f:2},{s:2,f:1}],mute:[6],open:[3,1]},
    {shape:"A",label:"A-shape III",fret:3,barre:true,barreString:5,dots:[{s:4,f:5},{s:3,f:5},{s:2,f:5},{s:1,f:5}],mute:[6],open:[]},
    {shape:"G",label:"G-shape VIII",fret:8,barre:true,barreString:6,dots:[{s:5,f:10},{s:4,f:10}],mute:[],open:[]},
  ],
  A:[
    {shape:"A",label:"Open A",fret:1,barre:false,dots:[{s:4,f:2},{s:3,f:2},{s:2,f:2}],mute:[6],open:[5,1]},
    {shape:"E",label:"E-shape V",fret:5,barre:true,barreString:6,dots:[{s:4,f:7},{s:3,f:6},{s:2,f:6}],mute:[],open:[]},
  ],
  E:[
    {shape:"E",label:"Open E",fret:1,barre:false,dots:[{s:5,f:2},{s:4,f:2},{s:3,f:1}],mute:[],open:[6,2,1]},
    {shape:"C",label:"C-shape VII",fret:7,barre:true,barreString:6,dots:[{s:4,f:9},{s:3,f:9},{s:2,f:8}],mute:[],open:[]},
  ],
  D:[
    {shape:"D",label:"Open D",fret:1,barre:false,dots:[{s:3,f:2},{s:2,f:3},{s:1,f:2}],mute:[6,5],open:[4]},
    {shape:"A",label:"A-shape V",fret:5,barre:true,barreString:5,dots:[{s:4,f:7},{s:3,f:7},{s:2,f:7},{s:1,f:7}],mute:[6],open:[]},
    {shape:"E",label:"E-shape X",fret:10,barre:true,barreString:6,dots:[{s:4,f:12},{s:3,f:11},{s:2,f:11}],mute:[],open:[]},
  ],
  F:[
    {shape:"E",label:"E-barre I",fret:1,barre:true,barreString:6,dots:[{s:5,f:3},{s:4,f:3},{s:3,f:2}],mute:[],open:[]},
    {shape:"C",label:"C-shape VIII",fret:8,barre:false,dots:[{s:5,f:8},{s:4,f:10},{s:3,f:10},{s:2,f:10}],mute:[6],open:[1]},
  ],
  B:[
    {shape:"A",label:"A-shape II",fret:2,barre:true,barreString:5,dots:[{s:4,f:4},{s:3,f:4},{s:2,f:4},{s:1,f:4}],mute:[6],open:[]},
    {shape:"E",label:"E-shape VII",fret:7,barre:true,barreString:6,dots:[{s:4,f:9},{s:3,f:9},{s:2,f:8}],mute:[],open:[]},
  ],
  // ─── Minor open chords ────────────────────────────────────────────────────
  Am:[
    {shape:"Am",label:"Open Am",fret:1,barre:false,dots:[{s:4,f:2},{s:3,f:2},{s:2,f:1}],mute:[6],open:[5,1]},
    {shape:"E",label:"E-shape V",fret:5,barre:true,barreString:6,dots:[{s:4,f:7},{s:3,f:7}],mute:[],open:[]},
  ],
  Dm:[
    {shape:"D",label:"Open Dm",fret:1,barre:false,dots:[{s:3,f:2},{s:2,f:3},{s:1,f:1}],mute:[6,5],open:[4]},
    {shape:"A",label:"A-shape V",fret:5,barre:true,barreString:5,dots:[{s:4,f:7},{s:3,f:7},{s:2,f:6}],mute:[6],open:[]},
  ],
  Em:[
    {shape:"Em",label:"Open Em",fret:1,barre:false,dots:[{s:5,f:2},{s:4,f:2}],mute:[],open:[6,3,2,1]},
    {shape:"E",label:"E-shape VII",fret:7,barre:true,barreString:6,dots:[{s:5,f:9},{s:4,f:9}],mute:[],open:[]},
  ],
  Bm:[
    {shape:"A",label:"A-shape II",fret:2,barre:true,barreString:5,dots:[{s:4,f:4},{s:3,f:4},{s:2,f:3}],mute:[6],open:[]},
    {shape:"E",label:"E-shape VII",fret:7,barre:true,barreString:6,dots:[{s:5,f:9},{s:4,f:9}],mute:[],open:[]},
  ],
  Cm:[
    {shape:"E",label:"E-shape VIII",fret:8,barre:true,barreString:6,dots:[{s:5,f:10},{s:4,f:10}],mute:[],open:[]},
  ],
  // ─── Seventh chords ───────────────────────────────────────────────────────
  E7:[
    {shape:"E7",label:"Open E7",fret:1,barre:false,dots:[{s:5,f:2},{s:3,f:1}],mute:[],open:[6,4,2,1]},
    {shape:"E7",label:"E7-shape VII",fret:7,barre:true,barreString:6,dots:[{s:5,f:9},{s:3,f:8}],mute:[],open:[]},
  ],
  "G#7":[
    {shape:"E7",label:"E7-shape IV",fret:4,barre:true,barreString:6,dots:[{s:5,f:6},{s:3,f:5}],mute:[],open:[]},
  ],
  // ─── Minor 7th chords ─────────────────────────────────────────────────────
  Am7:[
    {shape:"Am7",label:"Open Am7",fret:1,barre:false,dots:[{s:4,f:2},{s:2,f:1}],mute:[6],open:[5,3,1]},
    {shape:"E",label:"E-shape V",fret:5,barre:true,barreString:6,dots:[{s:4,f:7}],mute:[],open:[]},
  ],
  Em7:[
    {shape:"Em7",label:"Open Em7 v1",fret:1,barre:false,dots:[{s:5,f:2}],mute:[],open:[6,4,3,2,1]},
    {shape:"Em7",label:"Open Em7 v2",fret:1,barre:false,dots:[{s:5,f:2},{s:3,f:2},{s:2,f:3}],mute:[6],open:[4,1]},
  ],
  Dm7:[
    {shape:"Dm7",label:"Open Dm7",fret:1,barre:false,dots:[{s:3,f:2},{s:2,f:1},{s:1,f:1}],mute:[6,5],open:[4]},
  ],
  "C#m7":[
    {shape:"A",label:"A-shape IV",fret:4,barre:true,barreString:5,dots:[{s:4,f:6},{s:3,f:6},{s:2,f:5}],mute:[6],open:[]},
    {shape:"E",label:"E-shape IX",fret:9,barre:true,barreString:6,dots:[{s:5,f:11},{s:4,f:11}],mute:[],open:[]},
  ],
  // ─── Slash / bass note chords ─────────────────────────────────────────────
  "G/B":[
    {shape:"G/B",label:"G/B open",fret:1,barre:false,dots:[{s:5,f:2},{s:1,f:3}],mute:[6],open:[4,3,2]},
  ],
  "C/E":[
    {shape:"C/E",label:"C/E open",fret:1,barre:false,dots:[{s:5,f:3},{s:4,f:2},{s:2,f:1}],mute:[],open:[6,3,1]},
  ],
  "Am/G":[
    {shape:"Am/G",label:"Am/G open",fret:1,barre:false,dots:[{s:6,f:3},{s:4,f:2},{s:3,f:2},{s:2,f:1}],mute:[],open:[5,1]},
  ],
  "D7/F#":[
    {shape:"D7/F#",label:"D7/F# open",fret:1,barre:false,dots:[{s:6,f:2},{s:3,f:2},{s:2,f:1}],mute:[5],open:[4,1]},
  ],
  // ─── Extended / sus chords ────────────────────────────────────────────────
  Bb6:[
    {shape:"Bb6",label:"Bb6 barre I",fret:1,barre:true,barreString:2,dots:[{s:5,f:1},{s:4,f:3},{s:3,f:3},{s:2,f:3}],mute:[6],open:[]},
  ],
  Dsus4:[
    {shape:"Dsus4",label:"Open Dsus4",fret:1,barre:false,dots:[{s:3,f:2},{s:2,f:3},{s:1,f:3}],mute:[6,5],open:[4]},
  ],
  A7sus4:[
    {shape:"A7sus4",label:"Open A7sus4",fret:1,barre:false,dots:[{s:4,f:2}],mute:[6],open:[5,3,2,1]},
  ],
  D7sus2:[
    {shape:"D7sus2",label:"Open D7sus2",fret:1,barre:false,dots:[{s:3,f:2},{s:2,f:1}],mute:[6,5],open:[4,1]},
  ],
  // ─── Power chords (5th dyads) ─────────────────────────────────────────────
  D5:[
    {shape:"D5",label:"A-string position",fret:5,barre:false,dots:[{s:5,f:5},{s:4,f:7}],mute:[6,3,2,1],open:[]},
    {shape:"D5",label:"Open D5",fret:1,barre:false,dots:[{s:3,f:2}],mute:[6,5,2,1],open:[4]},
  ],
  C5:[
    {shape:"C5",label:"A-string position",fret:3,barre:false,dots:[{s:5,f:3},{s:4,f:5}],mute:[6,3,2,1],open:[]},
  ],
  Bb5:[
    {shape:"Bb5",label:"A-string position",fret:1,barre:false,dots:[{s:5,f:1},{s:4,f:3}],mute:[6,3,2,1],open:[]},
  ],
  A5:[
    {shape:"A5",label:"Open A5",fret:1,barre:false,dots:[{s:4,f:2}],mute:[6,3,2,1],open:[5]},
  ],
  "F#m":[
    {shape:"E",label:"E-shape II",fret:2,barre:true,barreString:6,dots:[{s:4,f:4}],mute:[],open:[]},
    {shape:"A",label:"A-shape IX",fret:9,barre:true,barreString:5,dots:[{s:4,f:11},{s:3,f:11},{s:2,f:10}],mute:[6],open:[]},
  ],
};

export function getCAGED(ch) {
  if (CAGED[ch]) return CAGED[ch];
  const p = parseChord(ch); if (!p) return [];
  const baseKey = p.root + p.quality;
  if (CAGED[baseKey]) return CAGED[baseKey];
  const simpleBase = p.root + (p.quality.startsWith("m") && !p.quality.startsWith("maj") ? "m" : "");
  if (CAGED[simpleBase]) return CAGED[simpleBase];
  return [];
}

// ── Progress suggestions ──────────────────────────────────────────────────────
export function suggestions(sections, songTitle) {
  const mastered = sections.filter(s => s.status === "mastered");
  const inProg   = sections.filter(s => s.status === "in-progress");
  const pct      = sections.length ? Math.round((mastered.length / sections.length) * 100) : 0;
  const out      = [];

  if (inProg.length > 0) {
    const sec = inProg[0];
    out.push({ type:"resume", priority:"high", color:P.accent, icon:"▶",
      title:`Continue: ${sec.name}`,
      body:`${sec.riffs?.length > 0 ? `Focus on the ${sec.riffs[0].name} riff at ${sec.riffs[0].bpm_guide} bpm.` : "Work through the chord transitions at 50% tempo."} Don't move on until 3 clean passes.`,
      sectionId: sec.id });
  }
  if (mastered.length >= 2 && inProg.length > 0) {
    const last = mastered[mastered.length - 1], next = inProg[0];
    out.push({ type:"join", priority:"medium", color:P.teal, icon:"⟷",
      title:`Practise the ${last.name} → ${next.name} join`,
      body:"Section joins are where songs fall apart in performance. Once both sections are clean individually, connect them end-to-end 5 times.",
      sectionId: next.id });
  }
  if (inProg.length > 0 && inProg[0].riffs?.length > 0) {
    const r = inProg[0].riffs[0];
    out.push({ type:"tempo", priority:"medium", color:P.purple, icon:"♩",
      title:`Tempo check on ${r.name}`,
      body:`3 clean passes at ${r.bpm_guide} bpm → step up to ${Math.round(r.bpm_guide * 1.15)} bpm. Never increase tempo before the current speed is effortless.`,
      sectionId: inProg[0].id });
  }
  if (pct === 100) {
    out.push({ type:"complete", priority:"high", color:P.teal, icon:"✓",
      title:`${songTitle} — Complete`,
      body:"You've mastered all sections. Now play the full song without stopping — one unbroken performance. Record it.",
      sectionId: null });
  } else if (pct >= 50) {
    out.push({ type:"milestone", priority:"low", color:P.gold, icon:"◆",
      title:"Over halfway — start connecting the song",
      body:`${mastered.length} of ${sections.length} sections mastered. Start playing from the beginning and go as far as you can before stopping.`,
      sectionId: mastered[0]?.id });
  }
  if (mastered.length === 0 && inProg.length === 0 && sections.length > 0) {
    out.push({ type:"start", priority:"high", color:P.teal, icon:"→",
      title:"Start with the first section",
      body:`Open the first section, set metronome to 50% of ${songTitle}'s tempo, and work through the technique notes slowly.`,
      sectionId: sections[0]?.id });
  }
  return out.slice(0, 3);
}
