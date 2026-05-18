// ── Shared AudioContext singleton ─────────────────────────────────────────────
// All audio in the app shares ONE AudioContext to prevent the browser's
// 6-context limit and to avoid memory leaks from unreleased contexts.
let _ctx = null;

export function getCtx() {
  if (!_ctx || _ctx.state === "closed") {
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return _ctx;
}

export function resumeCtx() {
  const ctx = getCtx();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

// ── Frequency helpers ─────────────────────────────────────────────────────────
export function midiToFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); }

// ── Metronome click (audio-thread scheduled — do not replace with setInterval) ─
export function scheduleClick(ctx, time, accent) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.frequency.value = accent ? 1200 : 800; o.type = "square";
  g.gain.setValueAtTime(accent ? 0.28 : 0.14, time);
  g.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);
  o.start(time); o.stop(time + 0.05);
}

// ── Chord playback (triangle oscillator strum) ────────────────────────────────
export function playChord(ctx, notes, dur = 1.8) {
  notes.forEach((midi, i) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = "triangle"; o.frequency.value = midiToFreq(midi);
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.14 / notes.length, ctx.currentTime + 0.01 + i * 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.start(ctx.currentTime + i * 0.03); o.stop(ctx.currentTime + dur + 0.1);
  });
}

// ── Pitch detection (autocorrelation) ────────────────────────────────────────
export function detectPitch(buf, sr) {
  const SIZE = buf.length, MAX = Math.floor(SIZE / 2);
  let best = -1, bestC = 0, rms = 0;
  for (let i = 0; i < SIZE; i++) rms += buf[i] * buf[i];
  if (Math.sqrt(rms / SIZE) < 0.01) return null;
  let last = 1, found = false;
  for (let off = 8; off < MAX; off++) {
    let c = 0; for (let i = 0; i < MAX; i++) c += Math.abs(buf[i] - buf[i + off]);
    c = 1 - c / MAX;
    if (c > 0.9 && c > last) { found = true; if (c > bestC) { bestC = c; best = off; } }
    else if (found) break;
    last = c;
  }
  return best === -1 ? null : sr / best;
}

export function freqToNote(f) {
  if (!f || f < 60) return null;
  const N = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
  const m = Math.round(12 * Math.log2(f / 440) + 69);
  return N[m % 12] + Math.floor(m / 12 - 1);
}

export function scorePitch(det, ref) {
  if (!det || !ref?.length) return null;
  const dm  = Math.round(12 * Math.log2(det / 440) + 69);
  const min = Math.min(...ref.map(r => Math.abs(dm - Math.round(12 * Math.log2(r / 440) + 69))));
  if (min === 0) return { score:100, label:"Perfect",    color:"#3dd6c8" };
  if (min === 1) return { score:85,  label:"Very Close", color:"#4ecb71" };
  if (min === 2) return { score:65,  label:"Close",      color:"#f0a500" };
  if (min <= 4)  return { score:40,  label:"Off Pitch",  color:"#d4875a" };
  return              { score:15,  label:"Way Off",    color:"#e05c5c" };
}