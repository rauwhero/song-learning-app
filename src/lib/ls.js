// Centralised localStorage access — all reads/writes go through here
export const ls = {
  load: (k, def) => {
    try { return JSON.parse(localStorage.getItem(k) ?? "null") ?? def; }
    catch { return def; }
  },
  save: (k, v) => {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
  },
};
