// اتصال Firebase المشترك بين الموقع وبوابة الموظفين ولوحة التحكم
import { firebaseConfig, OWNER_UID, EMAIL_DOMAIN } from '../../config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, setPersistence, indexedDBLocalPersistence, browserSessionPersistence, updatePassword } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc, collection, getDocs, query, where, orderBy, limit, onSnapshot, serverTimestamp, arrayUnion, Timestamp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export { OWNER_UID, EMAIL_DOMAIN, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, setPersistence, indexedDBLocalPersistence, browserSessionPersistence, updatePassword,
  doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc, collection, getDocs, query, where, orderBy, limit, onSnapshot, serverTimestamp, arrayUnion, Timestamp };

let secondary = null;
export function secondaryAuth() { if (!secondary) { const a = initializeApp(firebaseConfig, 'secondary'); secondary = getAuth(a); } return secondary; }

/* اسم المستخدم → إيميل داخلي (نفس كود البصمة حرفياً عشان الحسابات تشتغل في الاتنين) */
export const toEn = s => String(s ?? '').replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
export const normUser = s => toEn(String(s ?? ''))
  .replace(/[ً-ْـ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
  .replace(/[\s_.\-]+/g, '').toLowerCase();
export const USER_OK = /^[a-z0-9ء-ي]{2,24}$/;
export function toEmail(user) {
  const n = normUser(user);
  if (/^[a-z0-9]+$/.test(n)) return n + '@' + EMAIL_DOMAIN;
  let host = n; try { host = new URL('http://' + n + '.x').hostname.slice(0, -2); } catch (e) { }
  return 'u.' + host.replace(/^xn--/, '') + '@' + EMAIL_DOMAIN;
}
export function authMsg(e) {
  const c = e && e.code || '';
  if (c.includes('invalid-credential') || c.includes('wrong-password') || c.includes('user-not-found') || c.includes('invalid-email')) return 'اسم المستخدم أو كلمة السر غير صحيحة';
  if (c.includes('too-many-requests')) return 'محاولات كثيرة، انتظر دقائق ثم حاول مرة أخرى';
  if (c.includes('network')) return 'لا يوجد اتصال بالإنترنت';
  if (c.includes('weak-password')) return 'كلمة السر لازم تكون ٦ حروف أو أرقام على الأقل';
  if (c.includes('email-already-in-use')) return 'اسم المستخدم مستخدم بالفعل';
  if (c.includes('permission-denied')) return 'مفيش صلاحية — اتأكد إن قواعد الحماية اتحدّثت في Firebase';
  return (e && e.msg) || 'حدث خطأ، حاول مرة أخرى';
}

/* ضغط صورة لـ webp/jpeg كـ dataURL */
export function compressImage(file, max = 1600, q = 0.8) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => { const im = new Image(); im.onload = () => {
      const k = Math.min(1, max / Math.max(im.width, im.height)); const c = document.createElement('canvas');
      c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      let d = c.toDataURL('image/webp', q); if (!d.startsWith('data:image/webp')) d = c.toDataURL('image/jpeg', q);
      let qq = q; while (d.length > 850000 && qq > 0.35) { qq -= 0.1; d = c.toDataURL('image/jpeg', qq); }
      res(d); }; im.onerror = rej; im.src = r.result; };
    r.onerror = rej; r.readAsDataURL(file);
  });
}

/* وحدات النظام اللي المالك بيحددها لكل موظف */
export const MODULES = {
  basma: { t: 'البصمة', d: 'الحضور والانصراف', href: 'basma/', ic: 'finger' },
  report: { t: 'تقرير الإشراف', d: 'نموذج الاستلام الهندسي', href: 'report/', ic: 'clip' },
  reports: { t: 'أرشيف التقارير', d: 'كل تقارير الإشراف', href: 'portal.html#reports', ic: 'folder' },
  support: { t: 'الدعم الفني', d: 'طلبات العملاء والردود', href: 'portal.html#support', ic: 'chat' },
  cms: { t: 'لوحة التحكم', d: 'تعديل الموقع بالكامل', href: 'admin.html', ic: 'gear' }
};
