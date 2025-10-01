let els = {};
let state = {
  mode: 'default',
  theme: 'dark',
  idx: 0,
  serendipityPool: [],
};
export function init(refs) { els = refs; }
export function autoTheme() {
  const prefers = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  setTheme(prefers);
}
export function setTheme(t) {
  state.theme = t;
  document.body.classList.toggle('light', t === 'light');
}
export function toggleTheme() { setTheme(state.theme === 'dark' ? 'light' : 'dark'); }
export function setMode(m) {
  state.mode = m;
  document.body.classList.remove('default', 'focus', 'calm');
  document.body.classList.add(m);
  if (els.modeBadge) els.modeBadge.textContent = `Mode: ${m[0].toUpperCase()}${m.slice(1)}`;
}
export function setReaderDetail(readerEl, long) {
  readerEl.querySelector('.reader-body.long').style.display = long ? 'block' : 'none';
  readerEl.querySelector('.reader-body.short').style.display = long ? 'none' : 'block';
}

// Cards navigation
function cards() { return Array.from(document.querySelectorAll('.card')); }
export function nextCard() {
  const c = cards(); if (!c.length) return;
  state.idx = (state.idx + 1) % c.length;
  c[state.idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
  pulse(c[state.idx]);
}
export function prevCard() {
  const c = cards(); if (!c.length) return;
  state.idx = (state.idx - 1 + c.length) % c.length;
  c[state.idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
  pulse(c[state.idx]);
}
export function highlightNext() { nextCard(); }

// Palette
export function openPalette(container, input, list, commands) {
  container.hidden = false; input.focus(); render(commands);
  function render(cmds) {
    list.innerHTML = '';
    for (const cmd of cmds) {
      const li = document.createElement('li');
      li.innerHTML = `<span>${cmd.label}</span> <span class="small">${cmd.id}</span>`;
      li.addEventListener('click', () => { cmd.run(); container.hidden = true; });
      list.appendChild(li);
    }
  }
  input.oninput = () => {
    const q = input.value.toLowerCase();
    const filtered = commands.filter(c => c.label.toLowerCase().includes(q) || c.id.includes(q));
    render(filtered);
  };
  input.onkeydown = (e) => { if (e.key === 'Escape') container.hidden = true; };
}

// Serendipity
const DEFAULT_POOL = [
  { title: 'Design with mental models, not features', tag: 'HCI note' },
  { title: 'Try a one-handed gesture experiment', tag: 'Prototype prompt' },
  { title: 'Rethink error states as recovery funnels', tag: 'UX pattern' },
  { title: 'Use dwell-to-click for accessibility', tag: 'A11y' },
  { title: 'Ask: what’s the zero-UI path?', tag: 'Thought' },
  { title: 'Annotate uncertainty, not just outputs', tag: 'AI UX' },
  { title: 'Surface opposing views on demand', tag: 'Serendipity' },
  { title: 'Design for calm, not just speed', tag: 'Wellbeing' },
];
export function seedSerendipity(listEl, pool = DEFAULT_POOL) {
  state.serendipityPool = pool;
  injectSerendipity(listEl);
}
export function injectSerendipity(listEl = els.serendipityList) {
  if (!listEl) return;
  listEl.innerHTML = '';
  const pick = shuffle(state.serendipityPool).slice(0, 5);
  for (const item of pick) {
    const li = document.createElement('li');
    li.textContent = `${item.title} — ${item.tag}`;
    listEl.appendChild(li);
  }
}
function shuffle(arr) { return arr.slice().sort(() => Math.random() - 0.5); }

// Toast
let toastEl;
export function toast(msg = '') {
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.style.cssText = `position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
      background: rgba(0,0,0,.8); color: white; padding: 10px 14px; border-radius: 10px; z-index: 9999;
      border: 1px solid rgba(255,255,255,.15); box-shadow: 0 8px 24px rgba(0,0,0,.3);`;
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = msg;
  toastEl.style.opacity = '1';
  setTimeout(() => toastEl && (toastEl.style.opacity = '0'), 2000);
}

function pulse(el) {
  el.style.transition = 'box-shadow .2s ease';
  el.style.boxShadow = '0 0 0 2px var(--accent)';
  setTimeout(() => el.style.boxShadow = '', 350);
}
export function reset() {
  setMode('default');
  setTheme('dark');
}
