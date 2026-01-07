// =====================================================
// ملف إدارة المصادقة والمستخدمين
// Authentication & User Management
// =====================================================

// إعداد Supabase
const SUPABASE_URL = 'https://krqquvxfakhqiafubpno.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-txePmEdiUx7a6v0pD-rtw_5UXTdVFp';

// إنشاء عميل Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// متغيرات عامة
let currentUser = null;
let avatarFile = null;

// =====================================================
// وظائف المساعدة
// =====================================================

// إظهار رسالة تنبيه
function showAlert(message, type = 'success') {
    const alertDiv = document.getElementById('alertMessage');
    alertDiv.textContent = message;
    alertDiv.className = `alert alert-${type} show`;
    
    // إخفاء الرسالة بعد 5 ثواني
    setTimeout(() => {
        alertDiv.classList.remove('show');
    }, 5000);
}

// إظهار/إخفاء مؤشر التحميل في الزر
function toggleButtonLoading(button, loading) {
    const btnText = button.querySelector('.btn-text');
    
    if (loading) {
        button.disabled = true;
        btnText.innerHTML = '<span class="loading-spinner"></span> جاري التحميل...';
    } else {
        button.disabled = false;
        const isSignIn = button.closest('#signinForm');
        btnText.textContent = isSignIn ? 'تسجيل الدخول' : 'إنشاء حساب';
    }
}

// رفع الصورة الشخصية إلى Supabase Storage
async function uploadAvatar(file, userId) {
    try {
        // تحديد اسم الملف
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        // رفع الملف إلى Storage
        const { data, error } = await supabase.storage
            .from('chat-files')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        // الحصول على الرابط العام للملف
        const { data: urlData } = supabase.storage
            .from('chat-files')
            .getPublicUrl(filePath);

        return urlData.publicUrl;
    } catch (error) {
        console.error('خطأ في رفع الصورة:', error);
        return null;
    }
}

// =====================================================
// التعامل مع تسجيل الدخول
// =====================================================
document.getElementById('signinForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('signinEmail').value.trim();
    const password = document.getElementById('signinPassword').value;
    const button = e.target.querySelector('.btn-primary');
    
    try {
        toggleButtonLoading(button, true);
        
        // تسجيل الدخول باستخدام Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        // تحديث حالة المستخدم إلى online
        await supabase
            .from('profiles')
            .update({ 
                status: 'online',
                last_seen: new Date().toISOString()
            })
            .eq('id', data.user.id);
        
        showAlert('تم تسجيل الدخول بنجاح! جاري التحويل...', 'success');
        
        // الانتقال إلى صفحة المحادثة بعد ثانيتين
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        
    } catch (error) {
        console.error('خطأ في تسجيل الدخول:', error);
        showAlert(error.message || 'حدث خطأ في تسجيل الدخول. تحقق من البريد وكلمة المرور.', 'error');
        toggleButtonLoading(button, false);
    }
});

// =====================================================
// التعامل مع إنشاء حساب جديد
// =====================================================
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const avatarInput = document.getElementById('avatarInput');
    const button = e.target.querySelector('.btn-primary');
    
    // التحقق من صحة البيانات
    if (!name || !email || !password) {
        showAlert('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    if (password.length < 6) {
        showAlert('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
        return;
    }
    
    try {
        toggleButtonLoading(button, true);
        
        // إنشاء حساب جديد في Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: name
                }
            }
        });
        
        if (error) throw error;
        
        if (data.user) {
            // رفع الصورة الشخصية إذا تم اختيارها
            let avatarUrl = null;
            if (avatarInput.files.length > 0) {
                avatarUrl = await uploadAvatar(avatarInput.files[0], data.user.id);
            }
            
            // إنشاء ملف شخصي في جدول profiles
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: data.user.id,
                    email: email,
                    full_name: name,
                    avatar_url: avatarUrl,
                    status: 'online',
                    last_seen: new Date().toISOString()
                });
            
            if (profileError) throw profileError;
            
            showAlert('تم إنشاء الحساب بنجاح! جاري التحويل...', 'success');
            
            // الانتقال إلى صفحة المحادثة بعد ثانيتين
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
        
    } catch (error) {
        console.error('خطأ في إنشاء الحساب:', error);
        let errorMessage = 'حدث خطأ في إنشاء الحساب';
        
        if (error.message.includes('already registered')) {
            errorMessage = 'هذا البريد الإلكتروني مسجل بالفعل';
        } else if (error.message.includes('invalid email')) {
            errorMessage = 'البريد الإلكتروني غير صحيح';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        showAlert(errorMessage, 'error');
        toggleButtonLoading(button, false);
    }
});

// =====================================================
// التحقق من حالة تسجيل الدخول عند تحميل الصفحة
// =====================================================
window.addEventListener('DOMContentLoaded', async () => {
    try {
        // التحقق من الجلسة الحالية
        const { data: { session } } = await supabase.auth.getSession();
        
        // إذا كان المستخدم مسجل الدخول بالفعل، انتقل إلى صفحة المحادثة
        if (session) {
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('خطأ في التحقق من الجلسة:', error);
    }
});

// =====================================================
// تصدير الوظائف للاستخدام في صفحات أخرى
// =====================================================
window.authUtils = {
    supabase,
    getCurrentUser: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },
    getUserProfile: async (userId) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error) throw error;
        return data;
    },
    signOut: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
            // تحديث حالة المستخدم إلى offline
            await supabase
                .from('profiles')
                .update({ 
                    status: 'offline',
                    last_seen: new Date().toISOString()
                })
                .eq('id', user.id);
        }
        
        await supabase.auth.signOut();
        window.location.href = 'auth.html';
    }
};
