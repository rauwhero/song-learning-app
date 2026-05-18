// ── Backing Band — Tone.js powered ───────────────────────────────────────────
// Reads existing song schema (chords, bpm, genre) — no extra data required.
// Import Tone.js lazily to avoid loading ~200kb until the band is actually used.

let Tone  = null;
let band  = null;
let parts = [];

async function loadTone() {
  if (Tone) return Tone;
  Tone = await import("tone");
  return Tone;
}

// ── Drum patterns (8 steps per bar, 8th-note grid) ──────────────────────────
const PATTERNS = {
  rock:  { kick:[1,0,0,0,1,0,0,0], snare:[0,0,1,0,0,0,1,0], hat:[1,1,1,1,1,1,1,1] },
  folk:  { kick:[1,0,0,0,0,0,0,0], snare:[0,0,1,0,0,0,1,0], hat:[1,0,1,0,1,0,1,0] },
  blues: { kick:[1,0,0,1,1,0,0,0], snare:[0,0,1,0,0,0,1,0], hat:[1,0,1,0,1,0,1,0] },
  ballad:{ kick:[1,0,0,0,0,0,1,0], snare:[0,0,0,0,1,0,0,0], hat:[1,0,1,0,1,0,1,0] },
};

export const STYLES = Object.keys(PATTERNS);

// Default levels (dB) per instrument
const DEFAULT_LEVELS = { piano:-12, bass:-10, kick:-8, snare:-14, hat:-22 };

async function initBand() {
  if (band) return band;
  const T = await loadTone();
  await T.start();

  const piano = new T.PolySynth(T.Synth, {
    oscillator: { type: "triangle" },
    envelope: { attack:0.02, decay:0.3, sustain:0.4, release:1.8 },
  }).toDestination();

  const bass = new T.MonoSynth({
    oscillator: { type: "sine" },
    envelope: { attack:0.01, decay:0.3, sustain:0.4, release:0.5 },
  }).toDestination();

  const kick  = new T.MembraneSynth({ pitchDecay:0.05, octaves:6 }).toDestination();
  const snare = new T.NoiseSynth({ noise:{ type:"white" }, envelope:{ attack:0.001, decay:0.2, sustain:0 } }).toDestination();
  const hat   = new T.MetalSynth({ envelope:{ attack:0.001, decay:0.04 }, harmonicity:5.1, modulationIndex:32, resonance:4000, octaves:1.5 }).toDestination();

  // Apply default volumes
  piano.volume.value = DEFAULT_LEVELS.piano;
  bass.volume.value  = DEFAULT_LEVELS.bass;
  kick.volume.value  = DEFAULT_LEVELS.kick;
  snare.volume.value = DEFAULT_LEVELS.snare;
  hat.volume.value   = DEFAULT_LEVELS.hat;

  band = { piano, bass, kick, snare, hat };
  return band;
}

// ── Convert MIDI number to Tone note string (e.g. 60 → "C4") ─────────────────
function midiToTone(midi) {
  const T = Tone;
  return T.Frequency(midi, "midi").toNote();
}

// ── Schedule chord events for all sections ───────────────────────────────────
function scheduleSections(T, b, sections, bpm, semitones, tChordFn, chordMidiFn) {
  let timeOffset = 0;
  const beatsPerChord = 2;
  const secPerBeat = 60 / bpm;

  sections.forEach(section => {
    section.chords.forEach(chord => {
      const transposed = tChordFn(chord, semitones);
      const notes      = chordMidiFn(transposed);
      const toneNotes  = notes.slice(1).map(midiToTone);  // chord tones (no bass)
      const bassNote   = midiToTone(notes[0]);              // root/bass note
      const duration   = `${beatsPerChord * secPerBeat}s`;
      const when       = `+${timeOffset}`;

      T.Transport.scheduleOnce(t => {
        b.piano.triggerAttackRelease(toneNotes, duration, t);
        b.bass.triggerAttackRelease(bassNote,   duration, t);
      }, when);

      timeOffset += beatsPerChord * secPerBeat;
    });
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Start the backing band.
 * @param {object}   song      - Song schema (bpm, sections, genre)
 * @param {number}   semitones - Transpose offset
 * @param {string}   style     - "rock" | "folk" | "blues" | "ballad"
 * @param {Function} tChordFn  - tChord from theory module
 * @param {Function} chordMidiFn - chordMidi from theory module
 */
export async function startBand(song, semitones, style, tChordFn, chordMidiFn) {
  const T = await loadTone();
  const b = await initBand();

  // Stop any previous transport
  T.Transport.stop();
  T.Transport.cancel();
  parts.forEach(p => { try { p.dispose(); } catch {} });
  parts = [];

  T.Transport.bpm.value = song.bpm;

  // Drum loop
  const pat = PATTERNS[style] || PATTERNS.rock;
  const drumPart = new T.Sequence((time, step) => {
    if (pat.kick[step])  b.kick.triggerAttackRelease("C1", "8n", time);
    if (pat.snare[step]) b.snare.triggerAttackRelease("8n", time);
    if (pat.hat[step])   b.hat.triggerAttackRelease("C5", "16n", time);
  }, [0,1,2,3,4,5,6,7], "8n");

  drumPart.start(0);
  parts.push(drumPart);

  // Chord + bass events
  scheduleSections(T, b, song.sections, song.bpm, semitones, tChordFn, chordMidiFn);

  T.Transport.start();
}

export async function stopBand() {
  if (!Tone) return;
  Tone.Transport.stop();
  Tone.Transport.cancel();
  parts.forEach(p => { try { p.dispose(); } catch {} });
  parts = [];
}

export async function setInstrumentLevel(instrument, db) {
  if (!band || !band[instrument]) return;
  band[instrument].volume.value = db;
}

export async function isToneReady() {
  return !!band;
}
