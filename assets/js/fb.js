// اتصال Firebase المشترك بين الموقع وبوابة الموظفين ولوحة التحكم
import * as CFG from '../../config.js';
const { firebaseConfig, OWNER_UID, EMAIL_DOMAIN } = CFG;
export const OWNER_UIDS = [OWNER_UID, ...((CFG.OWNER_UIDS || []).filter(Boolean))];
export const isOwnerUid = uid => !!uid && OWNER_UIDS.includes(uid);
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, setPersistence, indexedDBLocalPersistence, browserSessionPersistence, updatePassword, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, sendPasswordResetEmail, updateProfile, EmailAuthProvider, linkWithCredential, fetchSignInMethodsForEmail, reauthenticateWithCredential, reauthenticateWithPopup } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { persistentLocalCache, persistentMultipleTabManager, initializeFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc, collection, getDocs, query, where, orderBy, limit, onSnapshot, serverTimestamp, arrayUnion, Timestamp, increment, runTransaction, writeBatch, deleteField } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// الاتصال بيتحوّل لوحده لطريقة بديلة لو المتصفح (زي متصفح واتساب الداخلي) قاطع الاتصال المباشر
// ذاكرة محلية دائمة: البيانات اللي اتفتحت قبل كده بتفتح فوراً وبتشتغل حتى لو النت ضعيف
function mkDb() { try { return initializeFirestore(app, { experimentalAutoDetectLongPolling: true, localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) }); } catch (e) { return initializeFirestore(app, { experimentalAutoDetectLongPolling: true }); } }
export const db = mkDb();
export { reauthenticateWithCredential, reauthenticateWithPopup, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, sendPasswordResetEmail, updateProfile, EmailAuthProvider, linkWithCredential, fetchSignInMethodsForEmail };
export { OWNER_UID, EMAIL_DOMAIN, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, setPersistence, indexedDBLocalPersistence, browserSessionPersistence, updatePassword,
  doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc, collection, getDocs, query, where, orderBy, limit, onSnapshot, serverTimestamp, arrayUnion, Timestamp, increment, runTransaction, writeBatch, deleteField };

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
  if (c.includes('email-already-in-use')) return 'الحساب ده مسجّل قبل كده — جرّب تسجيل الدخول';
  if (c.includes('popup-closed') || c.includes('cancelled-popup')) return 'اتقفلت نافذة جوجل قبل ما التسجيل يخلص';
  if (c.includes('unauthorized-domain')) return 'الدومين ده مش متضاف في Firebase ← Authentication ← Authorized domains';
  if (c.includes('operation-not-allowed')) return 'طريقة التسجيل دي مش متفعّلة في Firebase ← Authentication ← Sign-in method';
  if (c.includes('permission-denied')) return 'مفيش صلاحية — اتأكد إن قواعد الحماية اتحدّثت في Firebase';
  if (c.includes('invalid-argument')) return 'البيانات فيها حاجة مش مقبولة (' + ((e && e.message) || c).slice(0, 120) + ')';
  if (c.includes('unavailable')) return 'الاتصال بقاعدة البيانات ضعيف — حاول تاني';
  return (e && e.msg) || ('حدث خطأ: ' + (c || (e && e.message) || 'غير معروف')).slice(0, 160);
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
  report: { t: 'الإشراف', d: 'العملاء والتقارير الميدانية', href: 'supervision.html', ic: 'clip' },
  reports: { t: 'كل تقارير المهندسين', d: 'صلاحية مشاهدة تقارير الكل', href: 'supervision.html', ic: 'folder', tile: false },
  support: { t: 'الدعم والمحادثات', d: 'طلبات العملاء والشات المباشر', href: 'portal.html#support', ic: 'chat' },
  cms: { t: 'لوحة التحكم', d: 'تعديل الموقع والإحصائيات', href: 'admin.html', ic: 'gear' }
};

/* المُلّاك: الأساسيين في config.js + اللي اتضافوا من لوحة التحكم (owners/{uid})، والأساسي ممكن يتوقف (ownersOff/{uid}) */
export async function ownerOf(uid) {
  if (!uid) return false;
  try { const s = await getDoc(doc(db, 'owners', uid)); if (s.exists()) return true; } catch (e) { }
  if (!OWNER_UIDS.includes(uid)) return false;
  try { const o = await getDoc(doc(db, 'ownersOff', uid)); return !o.exists(); } catch (e) { return true; }
}
