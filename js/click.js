// صوت الضغط في الموقع والتطبيق — الصوت والعلو والكتم بيتحددوا من لوحة التحكم ← الأصوات
// الإعدادات بتتخزن في site/content.sound وبتتنسخ محلياً (sh.sndcfg) عشان البوابة والتطبيق يقروها
let ac = null, last = 0, nb = null;
const DEF = { s: 'mouse', v: 0.7, site: true, app: true };
const isApp = () => !/\/(index\.html)?$/.test(location.pathname);
export function getCfg() { try { return Object.assign({}, DEF, JSON.parse(localStorage.getItem('sh.sndcfg') || '{}')); } catch (e) { return { ...DEF }; } }
export function setCfg(c) { try { if (c && typeof c === 'object') localStorage.setItem('sh.sndcfg', JSON.stringify(Object.assign({}, DEF, c))); } catch (e) { } }
const muted = () => { const c = getCfg(); if (isApp() ? c.app === false : c.site === false) return true; try { return localStorage.getItem('sh.mute') === '1' || localStorage.getItem('sh.pmute') === '1' || localStorage.getItem('sh.click') === '0'; } catch (e) { return false; } };
const ctx = () => { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); return ac; };
const noise = () => { if (nb) return nb; const a = ctx(), n = a.createBuffer(1, a.sampleRate * .2, a.sampleRate), d = n.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return nb = n; };
// نبضة ضوضاء مفلترة (الكليك) ونغمة قصيرة
function burst(t, dur, f, q, g, type = 'bandpass', out) { const a = ctx(), s = a.createBufferSource(), fl = a.createBiquadFilter(), gn = a.createGain(); s.buffer = noise(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; gn.gain.setValueAtTime(g, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(fl); fl.connect(gn); gn.connect(out); s.start(t, Math.random() * .1); s.stop(t + dur + .01); }
function tone(t, f0, f1, dur, g, wave, out) { const a = ctx(), o = a.createOscillator(), gn = a.createGain(); o.type = wave || 'sine'; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur); gn.gain.setValueAtTime(0.0001, t); gn.gain.exponentialRampToValueAtTime(g, t + .003); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(gn); gn.connect(out); o.start(t); o.stop(t + dur + .01); }
export const SOUNDS = {
  mouse: { ar: 'كليك ماوس', fn: (t, o) => { burst(t, .007, 3800, 1.4, .9, 'bandpass', o); burst(t + .002, .012, 1700, 2.2, .35, 'bandpass', o); burst(t + .065, .006, 4300, 1.6, .4, 'bandpass', o); } },
  mouse2: { ar: 'كليك ماوس ناعم', fn: (t, o) => { burst(t, .008, 2300, 1.2, .6, 'bandpass', o); burst(t + .06, .006, 2800, 1.2, .25, 'bandpass', o); } },
  mouse3: { ar: 'ماوس جيمنج', fn: (t, o) => { burst(t, .005, 5200, 2, .9, 'bandpass', o); tone(t, 2600, 2400, .012, .05, 'square', o); burst(t + .045, .004, 5600, 2, .35, 'bandpass', o); } },
  key: { ar: 'كيبورد ميكانيكي', fn: (t, o) => { burst(t, .014, 2600, .9, .7, 'bandpass', o); tone(t, 190, 120, .035, .18, 'sine', o); burst(t + .055, .009, 3600, 1, .3, 'bandpass', o); } },
  tap: { ar: 'تاب آيفون', fn: (t, o) => tone(t, 1500, 900, .028, .16, 'sine', o) },
  tick: { ar: 'تِك خفيف', fn: (t, o) => tone(t, 1800, 620, .05, .1, 'triangle', o) },
  pop: { ar: 'بوب', fn: (t, o) => tone(t, 380, 950, .07, .25, 'sine', o) },
  wood: { ar: 'نقرة خشب', fn: (t, o) => { tone(t, 820, 790, .06, .3, 'triangle', o); burst(t, .005, 2100, 2, .25, 'bandpass', o); } },
  metal: { ar: 'زرار معدن', fn: (t, o) => { tone(t, 2400, 2390, .16, .08, 'sine', o); tone(t, 3620, 3600, .11, .04, 'sine', o); burst(t, .004, 6000, 1, .3, 'highpass', o); } },
  bubble: { ar: 'فقاعة', fn: (t, o) => tone(t, 300, 1250, .09, .2, 'sine', o) },
  paper: { ar: 'ورقة', fn: (t, o) => burst(t, .045, 5500, .6, .25, 'highpass', o) },
  soft: { ar: 'نقرة هادية', fn: (t, o) => tone(t, 520, 480, .05, .14, 'sine', o) }
};
export function play(name, vol) {
  if (document.documentElement.classList.contains('mourn')) return; // وضع الحداد: مفيش أصوات
  try { const a = ctx(), c = getCfg(), s = SOUNDS[name || c.s] || SOUNDS.mouse, g = a.createGain(); g.gain.value = Math.max(0, Math.min(1.5, vol == null ? +c.v : vol)); g.connect(a.destination); s.fn(a.currentTime + .005, g); } catch (e) { }
}
export function tick(force) { const now = performance.now(); if ((!force && now - last < 45) || muted()) return; last = now; play(); }
const SEL = 'button, a[href], [role="button"], .opt, summary, label.switch, input[type="checkbox"], input[type="radio"], select, .h7-xi, .li, .tile';
// الموبايل (خصوصاً الآيفون): الصوت لازم «يتفتح» بأول لمسة — بنشغّل صوت صامت مرة واحدة
let unlocked = false;
const unlock = () => { if (unlocked) return; try { const a = ctx(), b = a.createBuffer(1, 1, 22050), s = a.createBufferSource(); s.buffer = b; s.connect(a.destination); s.start(0); if (a.state !== 'suspended') unlocked = true; else a.resume().then(() => { unlocked = true; }); } catch (e) { } };
['touchend', 'click', 'keydown'].forEach(t => document.addEventListener(t, unlock, { capture: true, passive: true }));
let pend = null;
document.addEventListener('touchend', () => { if (pend && performance.now() - pend < 800) { pend = null; unlock(); setTimeout(() => { if (ac && ac.state === 'running') tick(true); }, 40); } }, { capture: true, passive: true });
document.addEventListener('pointerdown', e => { if (e.button !== 0 && e.pointerType === 'mouse') return; const el = e.target.closest(SEL); if (!el || el.disabled || el.closest('[data-nosnd]')) return; if (e.pointerType !== 'mouse' && (!ac || ac.state !== 'running')) { pend = performance.now(); unlock(); return; } tick(); }, { capture: true, passive: true });
