// =====================================================
// ملف إدارة الوسائط والملفات
// Media & Files Management
// =====================================================

// الحصول على مرجع لعميل Supabase
const mediaSupabase = window.authUtils.supabase;

// =====================================================
// معالجة إرسال الملف
// =====================================================
document.getElementById('sendFileBtn').addEventListener('click', async () => {
    const fileInput = document.getElementById('fileInput');
    const caption = document.getElementById('fileCaption').value.trim();
    
    if (fileInput.files.length === 0) return;
    
    const file = fileInput.files[0];
    const button = document.getElementById('sendFileBtn');
    
    try {
        // تعطيل الزر وإظهار مؤشر التحميل
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الرفع...';
        
        // رفع الملف
        const result = await uploadFile(file);
        
        if (result.success) {
            // تحديد نوع الرسالة
            let messageType = 'file';
            const fileType = file.type.split('/')[0];
            
            if (fileType === 'image') {
                messageType = 'image';
            } else if (fileType === 'video') {
                messageType = 'video';
            } else if (fileType === 'audio') {
                messageType = 'audio';
            }
            
            // إرسال الرسالة مع الملف
            await window.sendMessage(
                caption,
                messageType,
                result.url,
                file.name,
                file.size,
                file.type
            );
            
            // إغلاق النافذة وإعادة تعيين الحقول
            closeModal('filePreviewModal');
            fileInput.value = '';
            document.getElementById('fileCaption').value = '';
            document.getElementById('filePreview').innerHTML = '';
            
        } else {
            throw new Error(result.error || 'فشل رفع الملف');
        }
        
    } catch (error) {
        console.error('خطأ في إرسال الملف:', error);
        alert('فشل إرسال الملف. يرجى المحاولة مرة أخرى.');
    } finally {
        // إعادة تفعيل الزر
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-paper-plane"></i> إرسال';
    }
});

// =====================================================
// رفع ملف إلى Supabase Storage
// =====================================================
async function uploadFile(file) {
    try {
        // التحقق من حجم الملف (الحد الأقصى 50 ميجابايت)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            return {
                success: false,
                error: 'حجم الملف كبير جداً. الحد الأقصى هو 50 ميجابايت.'
            };
        }
        
        // إنشاء اسم فريد للملف
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 9);
        const fileExt = file.name.split('.').pop();
        const fileName = `${timestamp}-${randomStr}.${fileExt}`;
        
        // تحديد المجلد حسب نوع الملف
        const fileType = file.type.split('/')[0];
        let folderName = 'files';
        
        if (fileType === 'image') {
            folderName = 'images';
        } else if (fileType === 'video') {
            folderName = 'videos';
        } else if (fileType === 'audio') {
            folderName = 'audio';
        }
        
        const filePath = `${folderName}/${fileName}`;
        
        // رفع الملف إلى Supabase Storage
        const { data, error } = await mediaSupabase.storage
            .from('chat-files')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });
        
        if (error) {
            console.error('خطأ في رفع الملف:', error);
            return {
                success: false,
                error: error.message
            };
        }
        
        // الحصول على الرابط العام للملف
        const { data: urlData } = mediaSupabase.storage
            .from('chat-files')
            .getPublicUrl(filePath);
        
        return {
            success: true,
            url: urlData.publicUrl,
            path: filePath
        };
        
    } catch (error) {
        console.error('خطأ في رفع الملف:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// =====================================================
// ضغط الصورة قبل الرفع (اختياري)
// =====================================================
async function compressImage(file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // حساب الأبعاد الجديدة
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob(
                    (blob) => {
                        resolve(new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        }));
                    },
                    'image/jpeg',
                    quality
                );
            };
            
            img.src = e.target.result;
        };
        
        reader.readAsDataURL(file);
    });
}

// =====================================================
// التحقق من نوع الملف المدعوم
// =====================================================
function isSupportedFileType(file) {
    const supportedTypes = [
        // صور
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        // فيديو
        'video/mp4',
        'video/webm',
        'video/ogg',
        'video/quicktime',
        // صوت
        'audio/mpeg',
        'audio/mp3',
        'audio/wav',
        'audio/ogg',
        'audio/webm',
        // مستندات
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        // نصوص
        'text/plain',
        'text/csv',
        // ملفات مضغوطة
        'application/zip',
        'application/x-rar-compressed',
        'application/x-7z-compressed'
    ];
    
    return supportedTypes.includes(file.type);
}

// =====================================================
// الحصول على أيقونة الملف حسب نوعه
// =====================================================
function getFileIcon(fileType) {
    const type = fileType.toLowerCase();
    
    if (type.includes('pdf')) return 'fa-file-pdf';
    if (type.includes('word') || type.includes('doc')) return 'fa-file-word';
    if (type.includes('excel') || type.includes('sheet')) return 'fa-file-excel';
    if (type.includes('powerpoint') || type.includes('presentation')) return 'fa-file-powerpoint';
    if (type.includes('image')) return 'fa-file-image';
    if (type.includes('video')) return 'fa-file-video';
    if (type.includes('audio')) return 'fa-file-audio';
    if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return 'fa-file-archive';
    if (type.includes('text') || type.includes('csv')) return 'fa-file-alt';
    
    return 'fa-file';
}

// =====================================================
// تحميل ملف من URL
// =====================================================
async function downloadFile(url, fileName) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName || 'download';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        window.URL.revokeObjectURL(blobUrl);
        
    } catch (error) {
        console.error('خطأ في تحميل الملف:', error);
        alert('فشل تحميل الملف. يرجى المحاولة مرة أخرى.');
    }
}

// =====================================================
// حذف ملف من Storage
// =====================================================
async function deleteFile(filePath) {
    try {
        const { error } = await mediaSupabase.storage
            .from('chat-files')
            .remove([filePath]);
        
        if (error) throw error;
        
        return { success: true };
        
    } catch (error) {
        console.error('خطأ في حذف الملف:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// =====================================================
// معاينة الصورة في نافذة منبثقة
// =====================================================
function previewImage(imageUrl) {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content large" style="max-width: 90vw;">
            <div class="modal-header">
                <h2><i class="fas fa-image"></i> معاينة الصورة</h2>
                <button class="close-modal" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body" style="text-align: center; padding: 20px;">
                <img src="${imageUrl}" alt="Preview" style="max-width: 100%; max-height: 80vh; border-radius: 8px;">
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // إغلاق عند النقر خارج النافذة
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// =====================================================
// تحويل الملف إلى Base64 (للاستخدامات الخاصة)
// =====================================================
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// =====================================================
// التحقق من صحة امتداد الملف
// =====================================================
function isValidFileExtension(fileName) {
    const validExtensions = [
        // صور
        'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp',
        // فيديو
        'mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv',
        // صوت
        'mp3', 'wav', 'ogg', 'webm', 'm4a', 'aac',
        // مستندات
        'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
        // نصوص
        'txt', 'csv', 'json', 'xml',
        // مضغوطة
        'zip', 'rar', '7z', 'tar', 'gz'
    ];
    
    const ext = fileName.split('.').pop().toLowerCase();
    return validExtensions.includes(ext);
}

// =====================================================
// الحصول على معلومات الملف
// =====================================================
function getFileInfo(file) {
    return {
        name: file.name,
        size: file.size,
        type: file.type,
        extension: file.name.split('.').pop().toLowerCase(),
        sizeFormatted: formatFileSize(file.size),
        lastModified: new Date(file.lastModified)
    };
}

// =====================================================
// إنشاء صورة مصغرة للفيديو
// =====================================================
function generateVideoThumbnail(file) {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        
        video.onloadedmetadata = () => {
            video.currentTime = 1; // الحصول على إطار من الثانية الأولى
        };
        
        video.onseeked = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            canvas.toBlob((blob) => {
                resolve(URL.createObjectURL(blob));
            }, 'image/jpeg', 0.8);
        };
        
        video.src = URL.createObjectURL(file);
    });
}

// =====================================================
// تصدير الوظائف للاستخدام العام
// =====================================================
window.mediaUtils = {
    uploadFile,
    compressImage,
    isSupportedFileType,
    getFileIcon,
    downloadFile,
    deleteFile,
    previewImage,
    fileToBase64,
    isValidFileExtension,
    getFileInfo,
    generateVideoThumbnail
};

// =====================================================
// معالجة السحب والإفلات (Drag & Drop)
// =====================================================
const messagesContainer = document.getElementById('messagesContainer');

if (messagesContainer) {
    // منع السلوك الافتراضي للسحب والإفلات
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        messagesContainer.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // إضافة تأثير بصري عند السحب
    ['dragenter', 'dragover'].forEach(eventName => {
        messagesContainer.addEventListener(eventName, () => {
            messagesContainer.style.background = 'rgba(102, 126, 234, 0.1)';
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        messagesContainer.addEventListener(eventName, () => {
            messagesContainer.style.background = '';
        }, false);
    });
    
    // معالجة الإفلات
    messagesContainer.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            const fileInput = document.getElementById('fileInput');
            fileInput.files = files;
            
            // تشغيل حدث التغيير
            const event = new Event('change', { bubbles: true });
            fileInput.dispatchEvent(event);
        }
    }
}

// =====================================================
// نسخ النص من الرسائل
// =====================================================
document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.message-text')) {
        e.preventDefault();
        
        const text = e.target.closest('.message-text').textContent;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                showToast('تم نسخ النص');
            });
        }
    }
});

// =====================================================
// إظهار رسالة توست
// =====================================================
function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// إضافة الأنيميشن للتوست
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
