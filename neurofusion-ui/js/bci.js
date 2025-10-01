// Mock BCI adapter with a minimal interface.
// Replace with real device events later.

const subs = new Set();
const state = {
  focus: 0.35,
  stress: 0.20,
  serendipity: 0.25,
  intent: null,
  _timer: null,
  _manual: true,
};

export function subscribe(cb) { subs.add(cb); }
export function unsubscribe(cb) { subs.delete(cb); }

export function start() {
  if (state._timer) return;
  state._timer = setInterval(() => {
    if (!state._manual) {
      // drift naturally
      state.focus = clamp(state.focus + (Math.random()-0.5)*0.02, 0, 1);
      state.stress = clamp(state.stress + (Math.random()-0.5)*0.02, 0, 1);
    }
    broadcast();
  }, 250);
}

export function stop() { clearInterval(state._timer); state._timer = null; }

export function getState() { return { ...state }; }

export function setManual(next) {
  state._manual = true;
  Object.assign(state, next);
  broadcast();
}

export function emitIntent(name) {
  state.intent = name;
  broadcast();
  // clear intent quickly so it acts like an impulse
  setTimeout(() => { state.intent = null; broadcast(); }, 200);
}

function broadcast() { subs.forEach(cb => cb(getState())); }
function clamp(v,min,max){ return Math.min(max, Math.max(min, v)); }
