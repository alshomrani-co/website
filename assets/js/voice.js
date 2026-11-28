// الفويس نوت: تسجيل ← إيقاف ← (تشغيل / مسح / إرسال). مشترك بين شات الموقع وشات البوابة
const MAX = 120; // ثانية
const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const pickType = () => ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/ogg;codecs=opus'].find(t => window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) || '';
export const canRecord = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
const blobToData = b => new Promise((r, j) => { const f = new FileReader(); f.onload = () => r(f.result); f.onerror = j; f.readAsDataURL(b); });
// بيرجع زرار المايك. onSend(dataURL, mime, seconds) — en للغة
export function micButton({ bar, onSend, en = false, toast = alert }) {
  const T = (a, e) => en ? e : a;
  const b = document.createElement('button'); b.type = 'button'; b.className = 'vn-mic'; b.title = T('تسجيل فويس', 'Record voice note');
  b.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
  let rec = null, chunks = [], stream = null, t0 = 0, tick = null, blob = null, url = '', dur = 0, ac = null, an = null, raf = 0;
  const close = () => { clearInterval(tick); cancelAnimationFrame(raf); try { stream && stream.getTracks().forEach(t => t.stop()); } catch (e) { } try { ac && ac.close(); } catch (e) { } stream = null; ac = null; bar.hidden = true; bar.innerHTML = ''; bar.classList.remove('rec', 'prev'); if (url) URL.revokeObjectURL(url); url = ''; blob = null; };
  const preview = () => {
    bar.classList.remove('rec'); bar.classList.add('prev'); url = URL.createObjectURL(blob);
    bar.innerHTML = `<button type="button" class="vn-del" title="${T('مسح', 'Delete')}">🗑</button><audio src="${url}" preload="metadata"></audio><button type="button" class="vn-play" title="${T('تشغيل', 'Play')}">▶</button><div class="vn-prog"><i></i></div><span class="vn-t">${fmt(dur)}</span><button type="button" class="vn-send">${T('إرسال', 'Send')} ➤</button>`;
    const au = bar.querySelector('audio'), pl = bar.querySelector('.vn-play'), pr = bar.querySelector('.vn-prog i');
    pl.onclick = () => { if (au.paused) { au.play(); pl.textContent = '⏸'; } else { au.pause(); pl.textContent = '▶'; } };
    au.ontimeupdate = () => { pr.style.width = Math.min(100, au.currentTime / (dur || 1) * 100) + '%'; }; au.onended = () => { pl.textContent = '▶'; pr.style.width = '0'; };
    bar.querySelector('.vn-del').onclick = close;
    bar.querySelector('.vn-send').onclick = async () => { const d = await blobToData(blob); const m = blob.type || 'audio/webm'; const s = dur; close(); if (d.length > 990000) return toast(T('الفويس طويل — سجّل أقل من دقيقتين', 'Voice note too long')); onSend(d, m, s); };
  };
  b.onclick = async () => {
    if (!canRecord()) return toast(T('المتصفح ده مش بيدعم تسجيل الصوت', 'Recording not supported here'));
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); } catch (e) { return toast(T('لازم تسمح بالمايك من إعدادات المتصفح', 'Allow microphone access')); }
    const type = pickType(); chunks = []; rec = new MediaRecorder(stream, Object.assign({ audioBitsPerSecond: 24000 }, type ? { mimeType: type } : {}));
    rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
    rec.onstop = () => { blob = new Blob(chunks, { type: rec.mimeType || type || 'audio/webm' }); try { stream.getTracks().forEach(t => t.stop()); } catch (e) { } clearInterval(tick); cancelAnimationFrame(raf); preview(); };
    rec.start(250); t0 = Date.now(); bar.hidden = false; bar.classList.add('rec');
    bar.innerHTML = `<i class="vn-dot"></i><span class="vn-t">0:00</span><canvas class="vn-wave" width="160" height="28"></canvas><button type="button" class="vn-cancel" title="${T('إلغاء', 'Cancel')}">✕</button><button type="button" class="vn-stop">⏹ ${T('إيقاف', 'Stop')}</button>`;
    const tt = bar.querySelector('.vn-t'); tick = setInterval(() => { dur = (Date.now() - t0) / 1000; tt.textContent = fmt(dur); if (dur >= MAX) rec.state === 'recording' && rec.stop(); }, 200);
    bar.querySelector('.vn-stop').onclick = () => { dur = (Date.now() - t0) / 1000; rec.state === 'recording' && rec.stop(); };
    bar.querySelector('.vn-cancel').onclick = () => { rec.onstop = null; try { rec.stop(); } catch (e) { } close(); };
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); an = ac.createAnalyser(); an.fftSize = 64; ac.createMediaStreamSource(stream).connect(an); const cv = bar.querySelector('.vn-wave'), g = cv.getContext('2d'), d = new Uint8Array(an.frequencyBinCount);
      const draw = () => { an.getByteFrequencyData(d); g.clearRect(0, 0, 160, 28); g.fillStyle = '#E1262B'; for (let i = 0; i < 20; i++) { const v = Math.max(2, d[i] / 255 * 26); g.fillRect(i * 8, 14 - v / 2, 5, v); } raf = requestAnimationFrame(draw); }; draw(); } catch (e) { }
  };
  return b;
}
// فقاعة الفويس في المحادثة (data بيتجاب بعدين)
export const voiceHTML = (id, dur, cls = 'cm-voice') => `<div class="${cls}" data-vid="${id}"><button type="button" class="vp">▶</button><div class="vn-prog"><i></i></div><span class="vn-t">${fmt(dur || 0)}</span><audio preload="none"></audio></div>`;
export function wireVoices(root, getData, onPlay) {
  root.querySelectorAll('[data-vid]').forEach(el => { if (el._w) return; el._w = 1; const au = el.querySelector('audio'), b = el.querySelector('.vp'), pr = el.querySelector('.vn-prog i');
    b.onclick = async () => { if (!au.src) { b.textContent = '…'; const d = await getData(el.dataset.vid); if (!d) { b.textContent = '⚠'; return; } au.src = d; } if (au.paused) { root.querySelectorAll('audio').forEach(a => a !== au && a.pause()); au.play(); b.textContent = '⏸'; el.classList.add('played'); if (onPlay && !el._p) { el._p = 1; try { onPlay(el.dataset.vid, el); } catch (e) { } } } else { au.pause(); b.textContent = '▶'; } };
    au.ontimeupdate = () => { pr.style.width = Math.min(100, au.currentTime / (au.duration && isFinite(au.duration) ? au.duration : 1) * 100) + '%'; }; au.onended = () => { b.textContent = '▶'; pr.style.width = '0'; }; });
}
