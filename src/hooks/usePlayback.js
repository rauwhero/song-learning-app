import { useState, useEffect, useRef, useCallback } from "react";
import { getCtx, playChord, midiToFreq } from "../audio/index";
import { chordMidi } from "../theory/index";

// ── Section chord playback ────────────────────────────────────────────────────
// NEW: accepts a `loop` flag — when true, the sequence auto-restarts on finish.
export function useSectionPlayback(chords, bpm) {
  const [playing,   setPlaying]  = useState(false);
  const [looping,   setLooping]  = useState(false);
  const [activeIdx, setActive]   = useState(-1);
  const timerRef  = useRef([]);
  const loopRef   = useRef(false);  // ref so the end-timer closure reads latest

  // Keep loopRef in sync with looping state
  useEffect(() => { loopRef.current = looping; }, [looping]);

  const stop = useCallback(() => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
    setPlaying(false); setActive(-1);
  }, []);

  const _schedule = useCallback((chords_, bpm_) => {
    const ctx = getCtx();
    if (ctx.state === "suspended") ctx.resume();
    const beatMs = (60 / bpm_) * 1000 * 2;
    setPlaying(true);

    chords_.forEach((ch, i) => {
      const t = setTimeout(() => {
        setActive(i);
        playChord(ctx, chordMidi(ch), (beatMs / 1000) * 0.9);
      }, i * beatMs);
      timerRef.current.push(t);
    });

    const tEnd = setTimeout(() => {
      setActive(-1);
      if (loopRef.current) {
        // Loop: clear timers and reschedule
        timerRef.current = [];
        _schedule(chords_, bpm_);
      } else {
        setPlaying(false);
      }
    }, chords_.length * beatMs + 200);
    timerRef.current.push(tEnd);
  }, []);

  const play = useCallback(() => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
    _schedule(chords, bpm);
  }, [chords, bpm, _schedule]);

  const toggleLoop = useCallback(() => {
    setLooping(v => {
      loopRef.current = !v;
      return !v;
    });
  }, []);

  useEffect(() => () => stop(), [stop]);
  return { playing, looping, activeIdx, play, stop, toggleLoop };
}

// ── Riff note playback ────────────────────────────────────────────────────────
const STRING_BASE_MIDI = {6:40, 5:45, 4:50, 3:55, 2:59, 1:64};
const noteToMidi = (s, f) => (STRING_BASE_MIDI[s] || 40) + f;

export function useRiffPlayback(notes, bpmGuide) {
  const [playing,    setPlaying] = useState(false);
  const [activeNote, setNote]    = useState(-1);
  const timerRef = useRef([]);

  const stop = useCallback(() => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
    setPlaying(false); setNote(-1);
  }, []);

  const play = useCallback(() => {
    if (!notes?.length) return;
    const ctx = getCtx();
    if (ctx.state === "suspended") ctx.resume();
    stop();
    const beatMs = (60 / bpmGuide) * 1000;
    let offset = 0;
    setPlaying(true);
    notes.forEach((n, i) => {
      const dur = n.d * beatMs;
      const capturedOffset = offset;
      const t = setTimeout(() => {
        setNote(i);
        const midi = noteToMidi(n.s, n.f);
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = "triangle"; o.frequency.value = midiToFreq(midi);
        g.gain.setValueAtTime(0.25, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (dur / 1000) * 0.85);
        o.start(ctx.currentTime); o.stop(ctx.currentTime + dur / 1000);
      }, capturedOffset);
      timerRef.current.push(t);
      offset += dur;
    });
    const tEnd = setTimeout(() => { setPlaying(false); setNote(-1); }, offset + 200);
    timerRef.current.push(tEnd);
  }, [notes, bpmGuide, stop]);

  useEffect(() => () => stop(), [stop]);
  return { playing, activeNote, play, stop };
}
