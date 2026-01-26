// Supabase Configuration
// يجب تعديل هذه القيم بقيم مشروعك الخاص من Supabase

const SUPABASE_URL = 'YOUR_SUhttps://wtqogvxxxzwiruewumzc.supabase.coPABASE_URL'; // مثال: https://xxxxxxxxxxxxx.supabase.co
const SUPABASE_ANON_KEY = 'sb_publishable_8HMESE5dJWXVaD_i-pM9eA_UAICfXzs'; // المفتاح العام من Supabase

// إنشاء عميل Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// إعدادات التطبيق
const APP_CONFIG = {
    appsPerPage: 12,
    maxFileSize: 100 * 1024 * 1024, // 100MB
    allowedFileTypes: {
        app: ['.apk', '.ipa'],
        icon: ['.png', '.jpg', '.jpeg', '.webp'],
        screenshot: ['.png', '.jpg', '.jpeg', '.webp']
    },
    storageBuckets: {
        apps: 'apps',
        icons: 'icons',
        screenshots: 'screenshots'
    }
};

// أسماء الجداول في قاعدة البيانات
const TABLES = {
    users: 'users',
    apps: 'apps',
    categories: 'categories',
    reviews: 'reviews'
};

// دوال مساعدة عامة
const Utils = {
    // تنسيق عدد التحميلات
    formatDownloads: (count) => {
        if (count >= 1000000) {
            return (count / 1000000).toFixed(1) + 'M+';
        } else if (count >= 1000) {
            return (count / 1000).toFixed(1) + 'K+';
        }
        return count.toString();
    },

    // تنسيق التاريخ
    formatDate: (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    // عرض رسالة Toast
    showToast: (message, type = 'success') => {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            const container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toastId = 'toast-' + Date.now();
        const bgColor = type === 'success' ? 'bg-success' : 
                       type === 'error' ? 'bg-danger' : 
                       type === 'warning' ? 'bg-warning' : 'bg-info';

        const toast = `
            <div id="${toastId}" class="toast toast-custom ${bgColor} text-white" role="alert">
                <div class="toast-body d-flex align-items-center">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : 
                                        type === 'error' ? 'exclamation-circle' : 
                                        type === 'warning' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
                    <span>${message}</span>
                </div>
            </div>
        `;

        document.getElementById('toastContainer').insertAdjacentHTML('beforeend', toast);
        const toastElement = document.getElementById(toastId);
        const bsToast = new bootstrap.Toast(toastElement, { delay: 3000 });
        bsToast.show();

        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    },

    // عرض حالة التحميل
    showLoading: (show = true) => {
        let overlay = document.getElementById('loadingOverlay');
        
        if (show) {
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'loadingOverlay';
                overlay.className = 'spinner-overlay';
                overlay.innerHTML = `
                    <div class="spinner-border text-light" style="width: 3rem; height: 3rem;" role="status">
                        <span class="visually-hidden">جاري التحميل...</span>
                    </div>
                `;
                document.body.appendChild(overlay);
            }
            overlay.style.display = 'flex';
        } else {
            if (overlay) {
                overlay.style.display = 'none';
            }
        }
    },

    // التحقق من صحة البريد الإلكتروني
    isValidEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // التحقق من نوع الملف
    isValidFileType: (fileName, allowedTypes) => {
        const extension = '.' + fileName.split('.').pop().toLowerCase();
        return allowedTypes.includes(extension);
    },

    // التحقق من حجم الملف
    isValidFileSize: (fileSize, maxSize = APP_CONFIG.maxFileSize) => {
        return fileSize <= maxSize;
    },

    // تحويل حجم الملف لصيغة قابلة للقراءة
    formatFileSize: (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    },

    // إنشاء نجوم التقييم
    createStars: (rating) => {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i - 0.5 <= rating) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        return stars;
    },

    // حفظ البيانات في localStorage
    saveToLocalStorage: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    },

    // جلب البيانات من localStorage
    getFromLocalStorage: (key) => {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('Error getting from localStorage:', error);
            return null;
        }
    },

    // حذف البيانات من localStorage
    removeFromLocalStorage: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    },

    // إنشاء معرف فريد
    generateUUID: () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    // نسخ نص للحافظة
    copyToClipboard: (text) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text)
                .then(() => Utils.showToast('تم النسخ بنجاح!', 'success'))
                .catch(() => Utils.showToast('فشل النسخ!', 'error'));
        } else {
            // طريقة بديلة للمتصفحات القديمة
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                Utils.showToast('تم النسخ بنجاح!', 'success');
            } catch (err) {
                Utils.showToast('فشل النسخ!', 'error');
            }
            document.body.removeChild(textarea);
        }
    }
};

// تصدير المتغيرات والدوال للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { supabase, APP_CONFIG, TABLES, Utils };
}
