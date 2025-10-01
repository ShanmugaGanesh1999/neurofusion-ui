// Gaze adapter that prefers WebGazer if present; falls back to a simulated cursor.

let raf = null;
let cursorEl = null;
let enabled = false;
let simulated = true;
let dwellStart = 0;
const DWELL_MS = 800;
let lastTarget = null;

export async function start(cursor) {
  cursorEl = cursor;
  enabled = true;
  if (window.webgazer) {
    simulated = false;
    // WebGazer needs a video feed; configuration kept minimal.
    await window.webgazer.setRegression('ridge').setGazeListener(onGaze).begin();
    window.webgazer.showVideo(false).showFaceOverlay(false).showFaceFeedbackBox(false);
  } else {
    simulated = true;
    // Use mousemove as "gaze" proxy
    window.addEventListener('mousemove', onMouseMove);
  }
  cursorEl.hidden = false;
  loop();
  return true;
}

export function stop() {
  enabled = false;
  cancelAnimationFrame(raf);
  try { window.webgazer && window.webgazer.end(); } catch {}
  window.removeEventListener('mousemove', onMouseMove);
  if (cursorEl) cursorEl.hidden = true;
}

export function toggleSimulatedCursor() {
  if (!cursorEl) return;
  cursorEl.hidden = !cursorEl.hidden;
}

function onGaze(data, timestamp) {
  if (!data) return;
  updateCursor(data.x, data.y);
}

function onMouseMove(e) { updateCursor(e.clientX, e.clientY); }

function updateCursor(x, y) {
  if (!cursorEl) return;
  cursorEl.style.left = x + 'px';
  cursorEl.style.top = y + 'px';

  const target = document.elementFromPoint(x, y);
  handleDwell(target);
}

function handleDwell(target) {
  if (!target) return;
  const selectable = target.closest('[data-gaze-selectable]');
  if (!selectable) { lastTarget = null; dwellStart = 0; return; }
  if (lastTarget !== selectable) { lastTarget = selectable; dwellStart = performance.now(); return; }
  const elapsed = performance.now() - dwellStart;
  if (elapsed > DWELL_MS) {
    selectable.click();
    dwellStart = performance.now() + 999999; // avoid re-trigger
  }
}

function loop() {
  if (!enabled) return;
  raf = requestAnimationFrame(loop);
}
