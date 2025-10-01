// Optional gesture layer using handtrack.js if present; otherwise keyboard/mouse fallback.
// Emits: { type: 'swipe-left' | 'swipe-right' | 'hand-present' }

let model = null;
let video = null;
let raf = null;
let enabled = false;
let lastX = null;

export async function start(onEvent) {
  enabled = true;
  if (!window.handTrack) {
    // No library: return false to let caller show a toast.
    return false;
  }
  const opts = { flipHorizontal: true, maxNumBoxes: 1, scoreThreshold: 0.6 };
  model = await window.handTrack.load(opts);
  video = document.createElement('video');
  video.setAttribute('playsinline', 'true');
  document.body.appendChild(video);
  try {
    await window.handTrack.startVideo(video);
  } catch {
    return false;
  }
  loop(onEvent);
  return true;
}

export function stop() {
  enabled = false;
  cancelAnimationFrame(raf);
  try { window.handTrack.stopVideo(video); } catch {}
  if (video) { video.remove(); video = null; }
}

function loop(onEvent) {
  if (!enabled) return;
  raf = requestAnimationFrame(() => loop(onEvent));
  if (!model || !video) return;
  model.detect(video).then(preds => {
    if (!preds.length) { lastX = null; return; }
    const p = preds[0].bbox; // [x, y, width, height]
    const x = p[0];
    if (lastX !== null) {
      const dx = x - lastX;
      if (Math.abs(dx) > 20) {
        onEvent({ type: dx > 0 ? 'swipe-right' : 'swipe-left' });
      } else {
        onEvent({ type: 'hand-present' });
      }
    }
    lastX = x;
  }).catch(()=>{});
}
