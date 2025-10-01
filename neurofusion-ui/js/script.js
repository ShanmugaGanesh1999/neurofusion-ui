import * as UI from './ui.js';
import * as BCI from './bci.js';
import * as VOICE from './voice.js';
import * as GAZE from './gaze.js';
import * as GESTURE from './gesture.js';

// --- Bootstrap ---
const els = {
  btnVoice: document.getElementById('btn-voice'),
  btnGaze: document.getElementById('btn-gaze'),
  btnGesture: document.getElementById('btn-gesture'),
  btnBCI: document.getElementById('btn-bci'),
  btnTheme: document.getElementById('btn-theme'),
  focus: document.getElementById('focus-range'),
  stress: document.getElementById('stress-range'),
  serendipity: document.getElementById('serendipity-range'),
  status: document.getElementById('bci-status'),
  modeBadge: document.getElementById('mode-badge'),
  reader: document.getElementById('reader'),
  canvas: document.getElementById('canvas'),
  clearCanvas: document.getElementById('clear-canvas'),
  palette: document.getElementById('palette'),
  paletteInput: document.getElementById('palette-input'),
  paletteList: document.getElementById('palette-list'),
  serendipityList: document.getElementById('serendipity-list'),
  gazeCursor: document.getElementById('gaze-cursor'),
  intentSelect: document.getElementById('intent-select'),
  intentCancel: document.getElementById('intent-cancel'),
  intentSearch: document.getElementById('intent-search'),
};

// Setup UI
UI.init(els);

// BCI mock hookup
BCI.subscribe(onBCIState);
BCI.start();
updateStatus();

// Voice
let voiceOn = false;
els.btnVoice.addEventListener('click', async () => {
  voiceOn = !voiceOn;
  els.btnVoice.setAttribute('aria-pressed', String(voiceOn));
  if (voiceOn) {
    const ok = await VOICE.start(handleVoiceCommand);
    if (!ok) {
      voiceOn = false;
      els.btnVoice.setAttribute('aria-pressed', 'false');
      UI.toast('Voice not supported or denied.');
    } else {
      UI.toast('Voice on. Try “focus mode” or “open palette”.');
    }
  } else {
    VOICE.stop();
    UI.toast('Voice off.');
  }
});

// Gaze
let gazeOn = false;
els.btnGaze.addEventListener('click', async () => {
  gazeOn = !gazeOn;
  els.btnGaze.setAttribute('aria-pressed', String(gazeOn));
  if (gazeOn) {
    const ok = await GAZE.start(els.gazeCursor);
    if (!ok) {
      gazeOn = false;
      els.btnGaze.setAttribute('aria-pressed', 'false');
      UI.toast('Gaze requires WebGazer or permissions.');
    } else {
      UI.toast('Gaze on. Dwell to select.');
    }
  } else {
    GAZE.stop();
    UI.toast('Gaze off.');
  }
});

// Gesture
let gestureOn = false;
els.btnGesture.addEventListener('click', async () => {
  gestureOn = !gestureOn;
  els.btnGesture.setAttribute('aria-pressed', String(gestureOn));
  if (gestureOn) {
    const ok = await GESTURE.start(onGesture);
    if (!ok) {
      gestureOn = false;
      els.btnGesture.setAttribute('aria-pressed', 'false');
      UI.toast('Gestures need camera or handtrack.js.');
    } else {
      UI.toast('Gestures on. Wave left/right for prev/next.');
    }
  } else {
    GESTURE.stop();
    UI.toast('Gestures off.');
  }
});

// Theme
els.btnTheme.addEventListener('click', UI.toggleTheme);

// Sliders to mock BCI
for (const key of ['focus', 'stress', 'serendipity']) {
  els[key].addEventListener('input', () => {
    BCI.setManual({
      focus: parseFloat(els.focus.value),
      stress: parseFloat(els.stress.value),
      serendipity: parseFloat(els.serendipity.value),
    });
    updateStatus();
  });
}

// Intent chips
els.intentSelect.addEventListener('click', () => BCI.emitIntent('select'));
els.intentCancel.addEventListener('click', () => BCI.emitIntent('cancel'));
els.intentSearch.addEventListener('click', () => BCI.emitIntent('search'));

// Palette
const commands = [
  { id: 'focus', label: 'Focus mode', run: () => UI.setMode('focus') },
  { id: 'calm', label: 'Calm mode', run: () => UI.setMode('calm') },
  { id: 'default', label: 'Default mode', run: () => UI.setMode('default') },
  { id: 'theme-dark', label: 'Theme: dark', run: () => UI.setTheme('dark') },
  { id: 'theme-light', label: 'Theme: light', run: () => UI.setTheme('light') },
  { id: 'next', label: 'Next card', run: () => UI.nextCard() },
  { id: 'prev', label: 'Previous card', run: () => UI.prevCard() },
  { id: 'serendipity', label: 'Surprise me', run: () => UI.injectSerendipity() },
  { id: 'reset', label: 'Reset', run: () => UI.reset() },
];

function openPalette() {
  UI.openPalette(els.palette, els.paletteInput, els.paletteList, commands);
}
function runCommandByText(text) {
  const t = text.toLowerCase().trim();
  const map = {
    'focus mode': 'focus', 'calm mode': 'calm',
    'theme dark': 'theme-dark', 'theme light': 'theme-light',
    'open palette': 'open', 'reset': 'reset',
  };
  if (t.includes('open palette')) { openPalette(); return; }
  for (const cmd of commands) {
    if (t.includes(cmd.label.split(':')[0].toLowerCase()) || t === cmd.id) {
      cmd.run(); return;
    }
  }
  UI.toast('No command recognized.');
}

function handleVoiceCommand(text) {
  runCommandByText(text);
}

// Gestures
function onGesture(evt) {
  if (evt.type === 'swipe-left') UI.prevCard();
  if (evt.type === 'swipe-right') UI.nextCard();
  if (evt.type === 'hand-present') UI.toast('Hand detected.');
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette(); }
  if (e.key === '[') UI.prevCard();
  if (e.key === ']') UI.nextCard();
  if (e.key.toLowerCase() === 'f') UI.setMode('focus');
  if (e.key.toLowerCase() === 'c') UI.setMode('calm');
  if (e.key.toLowerCase() === 'd') UI.setMode('default');
  if (e.key.toLowerCase() === 'g') GAZE.toggleSimulatedCursor();
  if (e.key.toLowerCase() === 's') UI.injectSerendipity();
});

// Canvas draw
(function setupCanvas() {
  const ctx = els.canvas.getContext('2d');
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  let drawing = false;
  let hue = 200;
  function draw(x, y) {
    ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#5ab1ff';
    ctx.lineTo(x, y);
    ctx.stroke();
  }
  els.canvas.addEventListener('pointerdown', (e) => {
    drawing = e.shiftKey || VOICE.isDrawing();
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
  });
  els.canvas.addEventListener('pointermove', (e) => drawing && draw(e.offsetX, e.offsetY));
  els.canvas.addEventListener('pointerup', () => drawing = false);
  els.canvas.addEventListener('pointerleave', () => drawing = false);
  els.clearCanvas.addEventListener('click', () => ctx.clearRect(0,0,els.canvas.width, els.canvas.height));
})();

// Serendipity
UI.seedSerendipity(els.serendipityList);

// BCI reactive effects
function onBCIState(state) {
  updateStatus(state);
  const { focus = 0, stress = 0 } = state;
  if (focus > 0.8 && stress < 0.4) UI.setMode('focus');
  else if (stress > 0.7) UI.setMode('calm');
  else UI.setMode('default');

  // Adjust reader verbosity
  const showLong = (focus + (1 - stress)) / 2 > 0.6;
  UI.setReaderDetail(els.reader, showLong);

  // Intent shortcuts
  if (state.intent === 'search') openPalette();
  if (state.intent === 'select') UI.highlightNext();
  if (state.intent === 'cancel') UI.reset();
}

function updateStatus(s = BCI.getState()) {
  els.status.textContent = `focus: ${s.focus.toFixed(2)}  •  stress: ${s.stress.toFixed(2)}  •  serendipity: ${s.serendipity.toFixed(2)}  intent: ${s.intent || '-'} `;
}

// Initial theme preference
UI.autoTheme();
