// صوت ضغطة خفيف مع كل زرار في الموقع والتطبيق (بيتقفل مع كتم الصوت)
let ac = null, last = 0;
const muted = () => { try { return localStorage.getItem('sh.mute') === '1' || localStorage.getItem('sh.pmute') === '1' || localStorage.getItem('sh.click') === '0'; } catch (e) { return false; } };
function tick() {
  const now = performance.now(); if (now - last < 45 || muted()) return; last = now;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume();
    const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain(), f = ac.createBiquadFilter();
    o.type = 'triangle'; o.frequency.setValueAtTime(1800, t); o.frequency.exponentialRampToValueAtTime(620, t + .045);
    f.type = 'highpass'; f.frequency.value = 400;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09, t + .004); g.gain.exponentialRampToValueAtTime(0.0001, t + .06);
    o.connect(f); f.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + .07);
  } catch (e) { }
}
const SEL = 'button, a[href], [role="button"], .opt, summary, label.switch, input[type="checkbox"], input[type="radio"], select, .h7-xi, .li, .tile';
document.addEventListener('pointerdown', e => { if (e.button !== 0 && e.pointerType === 'mouse') return; const el = e.target.closest(SEL); if (!el || el.disabled) return; tick(); }, { capture: true, passive: true });
export { tick };
