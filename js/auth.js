// وظائف المصادقة (Authentication)

// تسجيل الدخول
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        showToast('تم تسجيل الدخول بنجاح!', 'success');
        currentUser = data.user;
        
        // الانتقال إلى صفحة الدردشة
        showChatPage();
        
    } catch (error) {
        console.error('خطأ في تسجيل الدخول:', error);
        showToast('خطأ في تسجيل الدخول: ' + error.message, 'error');
    }
}

// إنشاء حساب جديد
async function handleSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    
    try {
        // إنشاء الحساب
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
        
        // إضافة المستخدم إلى جدول المستخدمين
        if (data.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    {
                        id: data.user.id,
                        full_name: name,
                        email: email,
                        created_at: new Date().toISOString()
                    }
                ]);
            
            if (profileError) {
                console.error('خطأ في إنشاء الملف الشخصي:', profileError);
            }
        }
        
        showToast('تم إنشاء الحساب بنجاح! يمكنك تسجيل الدخول الآن.', 'success');
        
        // التبديل إلى نموذج تسجيل الدخول
        switchToLogin();
        
        // مسح النموذج
        document.getElementById('signup-name').value = '';
        document.getElementById('signup-email').value = '';
        document.getElementById('signup-password').value = '';
        
    } catch (error) {
        console.error('خطأ في إنشاء الحساب:', error);
        showToast('خطأ في إنشاء الحساب: ' + error.message, 'error');
    }
}

// تسجيل الخروج
async function handleLogout() {
    try {
        const { error } = await supabase.auth.signOut();
        
        if (error) throw error;
        
        // إلغاء الاشتراك في الرسائل
        if (messagesSubscription) {
            messagesSubscription.unsubscribe();
        }
        
        currentUser = null;
        currentChatUserId = null;
        
        showToast('تم تسجيل الخروج بنجاح', 'info');
        showAuthPage();
        
    } catch (error) {
        console.error('خطأ في تسجيل الخروج:', error);
        showToast('خطأ في تسجيل الخروج: ' + error.message, 'error');
    }
}

// التحقق من حالة المستخدم عند تحميل الصفحة
async function checkAuthState() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
        currentUser = session.user;
        showChatPage();
    } else {
        showAuthPage();
    }
}

// التبديل بين نماذج تسجيل الدخول والتسجيل
function switchToSignup() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
}

function switchToLogin() {
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
}

// عرض صفحة المصادقة
function showAuthPage() {
    document.getElementById('auth-page').style.display = 'flex';
    document.getElementById('chat-page').style.display = 'none';
}

// عرض صفحة الدردشة
function showChatPage() {
    document.getElementById('auth-page').style.display = 'none';
    document.getElementById('chat-page').style.display = 'flex';
    
    // تحديث اسم المستخدم
    const userName = currentUser.user_metadata?.full_name || currentUser.email;
    document.getElementById('user-name').textContent = userName;
    
    // تحميل قائمة المستخدمين
    loadUsers();
}
