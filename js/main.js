// وظائف مساعدة عامة

// عرض رسالة تنبيه
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 
                 type === 'error' ? 'fa-exclamation-circle' : 
                 'fa-info-circle';
    
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // إزالة التنبيه بعد 4 ثواني
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 4000);
}

// التحقق من حالة المصادقة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
    
    // الاستماع لتغييرات حالة المصادقة
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
            currentUser = session.user;
            showChatPage();
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            showAuthPage();
        }
    });
});

// إغلاق المودال عند النقر خارجه
document.addEventListener('click', (e) => {
    const modal = document.getElementById('new-chat-modal');
    if (e.target === modal) {
        closeNewChatModal();
    }
});

// منع إرسال النموذج عند الضغط على Enter في حقل البحث
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.target.id === 'search-users' || e.target.id === 'search-all-users')) {
        e.preventDefault();
    }
});
