# NeuroFusion UI — Multimodal HCI Demo

A zero-backend, browser-based demo that fuses **(simulated) BCI intent**, **voice**, **gaze** (optional), and **gesture** (optional) to adapt the interface in real time. It’s designed to be a credible portfolio artifact you can deploy with GitHub Pages.

> BCI is mocked but pluggable: swap `js/bci.js` with a real device adapter (e.g., OpenBCI) without touching the rest of the app.

## Why this project?
Hiring teams often want to *see* HCI thinking. This shows:
- **Multimodality**: intent from “neural” state + voice + gaze + gestures.
- **Adaptive UI**: calm/focus modes, dwell-to-click, intent-to-action.
- **Privacy-by-default**: all on-device; permissions opt-in and revocable.

## Live demo (after you upload)
1. Push this repo to GitHub.
2. Enable **GitHub Pages** → Source: `main` (or `docs`) → Save.
3. Open the Pages URL on **HTTPS** so the browser permits mic/camera.

## Quick start (local)
- Double-click `index.html` (works without a server).  
- For mic/camera-based features (voice, gaze, gesture), prefer HTTPS or `python -m http.server` and visit `http://localhost:8000` (browsers restrict some APIs on `file://`).

## Features
- **BCI Mock → Real-Device Ready**  
  Sliders simulate `focus` and `stress`. The adapter exposes a `subscribe()` API. Replace with real device events later.
- **Voice Commands** (Web Speech API)  
  Examples: “focus mode”, “calm mode”, “open palette”, “theme dark”, “reset”.
- **Gaze Dwell Select** *(optional)*  
  If `WebGazer` is present, dwell over any `[data-gaze-selectable]` to click.
- **Gesture Swipes** *(optional)*  
  If `handtrack.js` is present, side-to-side hand motion triggers next/prev.
- **Adaptive Modes**  
  - **Focus**: hides chrome, boosts contrast, reduces motion.  
  - **Calm**: soft palette, larger targets, pauses distractions.

## Project structure
```
neurofusion-ui/
  index.html
  styles.css
  js/
    script.js       # Orchestrates everything
    ui.js           # UI state, themes, modes
    bci.js          # Mock BCI (swap with real adapter later)
    voice.js        # Voice command layer (Web Speech)
    gaze.js         # Optional gaze dwell (WebGazer if available)
    gesture.js      # Optional gestures (handtrack.js if available)
  assets/
    logo.svg
  LICENSE
  README.md
```

## Replace the BCI mock with a real device
Implement the same small adapter interface in `js/bci.js`:

```js
export function subscribe(cb) { /* call cb({focus, stress, intent}) */ }
export function start() {}
export function stop() {}
export function getState() { /* return latest */ }
```

Where `focus` and `stress` are `0..1`, and optional `intent` is a string like `"select" | "cancel" | "confirm" | "search"`.

## Optional libraries
For eye-tracking and hand tracking, include these in `index.html` (served over HTTPS):

```html
<!-- WebGazer (gaze) -->
<script src="https://webgazer.cs.brown.edu/webgazer.js"></script>

<!-- handtrack.js (gesture) -->
<script src="https://cdn.jsdelivr.net/npm/handtrackjs/dist/handtrack.min.js"></script>
```

Without them, the app gracefully falls back to mouse/keyboard.

## Voice commands (built-in)
- `focus mode` → Enter focus mode
- `calm mode` → Enter calm mode
- `open palette` → Open command palette
- `theme dark` / `theme light` → Toggle theme
- `reset` → Reset to default

## Keyboard fallbacks
- `Cmd/Ctrl + K` → Open command palette
- `[` / `]` → Previous / next card
- `F` → Focus mode, `C` → Calm mode, `D` → Default
- `G` → Toggle simulated “gaze cursor”
- `S` → Toggle “serendipity” suggestions

## Privacy
- All processing is local.  
- No data leaves the browser.  
- Microphone/camera are **opt-in** and can be disabled at any time.

## License
MIT — build cool things, be kind to humans.
