let recognition;
let drawing = false;

export async function start(onText) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return false;
  recognition = new SR();
  recognition.lang = 'en-US';
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.onresult = (e) => {
    const text = Array.from(e.results).slice(-1)[0][0].transcript.trim();
    if (!text) return;
    // simple intent: if the user says "draw", enter drawing mode until "stop drawing"
    if (text.toLowerCase().includes('draw')) drawing = true;
    if (text.toLowerCase().includes('stop drawing')) drawing = false;
    onText(text);
  };
  try {
    recognition.start();
    return true;
  } catch (e) {
    console.warn(e);
    return false;
  }
}

export function stop() { try { recognition && recognition.stop(); } catch {} }
export function isDrawing() { return drawing; }
