// ملف الإعدادات - يجب على المستخدم تحديث هذه القيم
// Configuration file - User must update these values with their Supabase credentials

const SUPABASE_URL = 'https://hnhointuuhhdqrxfnpvx.supabase.co'; // مثال: https://xxxxx.supabase.co
const SUPABASE_ANON_KEY = 'sb_publishable_f32lSNgiFkN1EguPnZO_DA_AzLHbc6N'; // المفتاح العام من Supabase

// تحقق من وجود الإعدادات
if (SUPABASE_URL === 'https://hnhointuuhhdqrxfnpvx.supabase.co' || SUPABASE_ANON_KEY === 'sb_publishable_f32lSNgiFkN1EguPnZO_DA_AzLHbc6N') {
    console.error('⚠️ يرجى تحديث إعدادات Supabase في ملف js/config.js');
    // تأخير عرض التنبيه حتى يتم تحميل باقي الملفات
    window.addEventListener('DOMContentLoaded', () => {
        if (typeof showToast === 'function') {
            showToast('يرجى تحديث إعدادات Supabase في ملف config.js', 'error');
        } else {
            alert('يرجى تحديث إعدادات Supabase في ملف config.js');
        }
    });
}

// إنشاء اتصال Supabase
let supabase;
try {
    if (window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        console.error('⚠️ مكتبة Supabase غير محملة! تأكد من وجود وسم script في index.html');
    }
} catch (error) {
    console.error('⚠️ خطأ في تهيئة Supabase:', error);
}

// متغيرات عامة
let currentUser = null;
let currentChatUserId = null;
let messagesSubscription = null;
