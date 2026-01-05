// ملف الإعدادات - يجب تحديث هذه القيم من لوحة تحكم Supabase الخاصة بك
// Configuration file - Global Access Fixed

const SUPABASE_URL = 'https://hnhointuuhhdqrxfnpvx.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_f32lSNgiFkN1EguPnZO_DA_AzLHbc6N'; 

// 1. التحقق من وجود الإعدادات الافتراضية وتنبيه المستخدم
if (SUPABASE_URL.includes('your-project') || SUPABASE_ANON_KEY.startsWith('your-anon')) {
    console.error('⚠️ يرجى تحديث إعدادات Supabase في ملف js/config.js');
    window.addEventListener('DOMContentLoaded', () => {
        if (typeof showToast === 'function') {
            showToast('يرجى تحديث إعدادات Supabase ببيانات مشروعك الخاصة', 'error');
        } else {
            alert('يرجى تحديث إعدادات Supabase في ملف config.js');
        }
    });
}

// 2. إنشاء اتصال Supabase وجعله متاحاً بشكل عام (Global)
// نستخدم window.supabase لضمان أن ملفات auth.js و chat.js يمكنها رؤيته فوراً
try {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
        // تعريف المتغير على نطاق النافذة (Global Scope)
        window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("✅ تم تهيئة اتصال Supabase بنجاح");
    } else {
        console.error('⚠️ مكتبة Supabase JS غير محملة! تأكد من ترتيب scripts في index.html');
    }
} catch (error) {
    console.error('⚠️ خطأ فني في تهيئة Supabase:', error);
}

// 3. تعريف المتغيرات العامة للمشروع لتكون متاحة في كل الملفات
window.currentUser = null;
window.currentChatUserId = null;
window.messagesSubscription = null;

// ملاحظة: تأكد أن ملف index.html يستدعي المكتبة أولاً ثم هذا الملف
