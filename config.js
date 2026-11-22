// إعدادات Firebase — نفس مشروع البصمة (alshmorani-1a1a2) عشان كل الحسابات والبيانات تفضل واحدة
export const firebaseConfig = {
  apiKey: "AIzaSyC0CKfm1aiiuc-If8WVYiLBad8DP-iLz5Q",
  authDomain: "alshmorani-1a1a2.firebaseapp.com",
  projectId: "alshmorani-1a1a2",
  storageBucket: "alshmorani-1a1a2.firebasestorage.app",
  messagingSenderId: "608129324316",
  appId: "1:608129324316:web:197f339d9e2bf9e471d6d9",
  measurementId: "G-62VGJTMSYP"
};
// رقم حساب المالك (نفس اللي في البصمة)
export const OWNER_UID = "bRGeKE9GqXYFh2F93FO6osHYxr63";
// الموظف يدخل باسم المستخدم — نفس طريقة البصمة بالظبط
export const EMAIL_DOMAIN = "shamrani-basma.app";

// حسابات مدير إضافية بصلاحية المالك الكاملة (مثلاً حساب الإيميل) — حط الـ UID من Firebase → Authentication
export const OWNER_UIDS = [
  // 'ضع_هنا_UID_حساب_alshomrani.founder@gmail.com'
];
