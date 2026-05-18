import { useState, useEffect, useRef, useCallback } from "react";
import { getCtx, scheduleClick } from "../audio/index";

// ── Lookahead metronome — audio-clock-locked, no JS event loop drift ──────────
// DO NOT replace the scheduler with setInterval — it will drift on busy renders.
// The 25ms / 120ms lookahead pattern is correct and must be preserved.
export function useMetronome(songBpm, timeSig) {
  const [running,  setRunning]  = useState(false);
  const [beat,     setBeat]     = useState(0);
  const [tempo,    setTempo]    = useState(songBpm);
  const [mult,     setMult]     = useState(1);
  const timerRef  = useRef(null);
  const nextRef   = useRef(0);
  const beatRef   = useRef(0);
  const bpb = parseInt(timeSig.split("/")[0]);

  // Refs stay in sync with state so the scheduler closure always reads fresh values
  const tempoRef = useRef(tempo);
  const multRef  = useRef(mult);
  useEffect(() => { tempoRef.current = tempo; }, [tempo]);
  useEffect(() => { multRef.current = mult;   }, [mult]);

  const scheduler = useCallback(() => {
    const ctx = getCtx();
    const lookAhead = 0.12;
    const interval  = 60 / (tempoRef.current * multRef.current);
    while (nextRef.current < ctx.currentTime + lookAhead) {
      const b = beatRef.current % bpb;
      scheduleClick(ctx, nextRef.current, b === 0);
      const delay = Math.max(0, (nextRef.current - ctx.currentTime) * 1000);
      const capturedB = b;
      setTimeout(() => setBeat(capturedB), delay);
      nextRef.current += interval;
      beatRef.current++;
    }
    timerRef.current = setTimeout(scheduler, 25);
  }, [bpb]);

  const stop = useCallback(() => {
    clearTimeout(timerRef.current);
    setRunning(false); setBeat(0);
    beatRef.current = 0; nextRef.current = 0;
  }, []);

  const start = useCallback(() => {
    const ctx = getCtx();
    if (ctx.state === "suspended") ctx.resume();
    beatRef.current = 0;
    nextRef.current = ctx.currentTime + 0.05;
    setRunning(true);
    scheduler();
  }, [scheduler]);

  // Restart cleanly on tempo/mult change — debounced with a locked ref to
  // prevent double-starts when the slider fires multiple events rapidly
  const restartGuard = useRef(false);
  useEffect(() => {
    if (!running) return;
    if (restartGuard.current) return;
    restartGuard.current = true;
    stop();
    const id = setTimeout(() => { start(); restartGuard.current = false; }, 30);
    return () => clearTimeout(id);
  }, [tempo, mult]); // eslint-disable-line

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return { running, beat, tempo, setTempo, mult, setMult, start, stop, bpb };
}
