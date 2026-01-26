// JavaScript لرفع التطبيقات

class AppUploader {
    constructor() {
        this.files = {
            app: null,
            icon: null,
            screenshots: []
        };
        this.isEditMode = false;
        this.editingAppId = null;
        this.init();
    }

    async init() {
        // التحقق من صلاحيات المطور
        if (!authManager.requireDeveloper()) {
            return;
        }

        // التحقق من وضع التعديل
        const urlParams = new URLSearchParams(window.location.search);
        this.editingAppId = urlParams.get('edit');
        
        if (this.editingAppId) {
            this.isEditMode = true;
            await this.loadAppData();
        }

        this.setupFileUploads();
        this.setupForm();
    }

    async loadAppData() {
        try {
            Utils.showLoading(true);
            
            const { data: app, error } = await supabase
                .from(TABLES.apps)
                .select('*')
                .eq('id', this.editingAppId)
                .single();

            if (error) throw error;

            // ملء النموذج بالبيانات
            document.getElementById('pageTitle').textContent = 'تعديل التطبيق';
            document.getElementById('submitBtnText').textContent = 'تحديث التطبيق';
            
            document.getElementById('appName').value = app.name || '';
            document.getElementById('appVersion').value = app.version || '';
            document.getElementById('appCategory').value = app.category || '';
            document.getElementById('appPlatform').value = app.platform || 'Android';
            document.getElementById('appDescription').value = app.description || '';
            document.getElementById('appPrice').value = app.price || '';
            document.getElementById('appWebsite').value = app.website || '';
            document.getElementById('publishNow').checked = app.published || false;

        } catch (error) {
            console.error('Error loading app data:', error);
            Utils.showToast('حدث خطأ أثناء تحميل بيانات التطبيق', 'error');
        } finally {
            Utils.showLoading(false);
        }
    }

    setupFileUploads() {
        // إعداد رفع ملف التطبيق
        this.setupFileUpload('appFile', ['appFileDropZone', 'appFileInput'], 'appFilePreview');
        
        // إعداد رفع الأيقونة
        this.setupFileUpload('icon', ['iconDropZone', 'iconInput'], 'iconPreview');
        
        // إعداد رفع لقطات الشاشة
        this.setupFileUpload('screenshots', ['screenshotsDropZone', 'screenshotsInput'], 'screenshotsPreview', true);
    }

    setupFileUpload(fileType, [dropZoneId, inputId], previewId, multiple = false) {
        const dropZone = document.getElementById(dropZoneId);
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);

        // منع السلوك الافتراضي للسحب والإفلات
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        // إضافة تأثيرات بصرية
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.remove('dragover');
            });
        });

        // معالجة الإفلات
        dropZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            this.handleFiles(files, fileType, preview, multiple);
        });

        // معالجة الاختيار من المتصفح
        input.addEventListener('change', (e) => {
            const files = e.target.files;
            this.handleFiles(files, fileType, preview, multiple);
        });
    }

    handleFiles(files, fileType, preview, multiple) {
        if (multiple) {
            // لقطات الشاشة
            if (files.length > 5) {
                Utils.showToast('يمكنك رفع 5 صور كحد أقصى', 'warning');
                return;
            }
            
            this.files.screenshots = Array.from(files);
            this.showMultiplePreview(this.files.screenshots, preview);
        } else {
            // ملف واحد
            const file = files[0];
            
            if (fileType === 'appFile') {
                if (!Utils.isValidFileSize(file.size)) {
                    Utils.showToast('حجم الملف كبير جداً. الحد الأقصى 100 ميجابايت', 'error');
                    return;
                }
                this.files.app = file;
            } else if (fileType === 'icon') {
                this.files.icon = file;
            }
            
            this.showSinglePreview(file, preview);
        }
    }

    showSinglePreview(file, previewElement) {
        const preview = document.getElementById(previewElement);
        preview.style.display = 'block';
        
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML = `
                    <div class="file-preview-item">
                        <img src="${e.target.result}" alt="Preview">
                        <div class="flex-grow-1">
                            <strong>${file.name}</strong>
                            <br>
                            <small class="text-muted">${Utils.formatFileSize(file.size)}</small>
                        </div>
                        <button type="button" class="btn btn-sm btn-outline-danger" onclick="appUploader.removeFile('${previewElement}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
            };
            reader.readAsDataURL(file);
        } else {
            preview.innerHTML = `
                <div class="file-preview-item">
                    <i class="fas fa-file fa-3x text-primary"></i>
                    <div class="flex-grow-1">
                        <strong>${file.name}</strong>
                        <br>
                        <small class="text-muted">${Utils.formatFileSize(file.size)}</small>
                    </div>
                    <button type="button" class="btn btn-sm btn-outline-danger" onclick="appUploader.removeFile('${previewElement}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        }
    }

    showMultiplePreview(files, previewElement) {
        const preview = document.getElementById(previewElement);
        preview.style.display = 'block';
        preview.innerHTML = '';

        files.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML += `
                    <div class="file-preview-item">
                        <img src="${e.target.result}" alt="Screenshot ${index + 1}">
                        <div class="flex-grow-1">
                            <strong>${file.name}</strong>
                            <br>
                            <small class="text-muted">${Utils.formatFileSize(file.size)}</small>
                        </div>
                        <button type="button" class="btn btn-sm btn-outline-danger" onclick="appUploader.removeScreenshot(${index})">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
            };
            reader.readAsDataURL(file);
        });
    }

    removeFile(previewElement) {
        const preview = document.getElementById(previewElement);
        preview.style.display = 'none';
        preview.innerHTML = '';
        
        if (previewElement === 'appFilePreview') this.files.app = null;
        if (previewElement === 'iconPreview') this.files.icon = null;
    }

    removeScreenshot(index) {
        this.files.screenshots.splice(index, 1);
        this.showMultiplePreview(this.files.screenshots, 'screenshotsPreview');
    }

    setupForm() {
        const form = document.getElementById('uploadAppForm');
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!this.isEditMode && !this.files.app) {
                Utils.showToast('يرجى رفع ملف التطبيق', 'error');
                return;
            }
            
            if (!this.isEditMode && !this.files.icon) {
                Utils.showToast('يرجى رفع أيقونة التطبيق', 'error');
                return;
            }

            await this.submitApp();
        });
    }

    async submitApp() {
        try {
            Utils.showLoading(true);
            
            const appData = {
                name: document.getElementById('appName').value,
                version: document.getElementById('appVersion').value,
                category: document.getElementById('appCategory').value,
                platform: document.getElementById('appPlatform').value,
                description: document.getElementById('appDescription').value,
                price: parseFloat(document.getElementById('appPrice').value) || 0,
                website: document.getElementById('appWebsite').value,
                published: document.getElementById('publishNow').checked,
                developer_id: authManager.currentUser.id,
                rating: 0,
                downloads_count: 0
            };

            // رفع الملفات (محاكاة - يجب استخدام Supabase Storage)
            if (this.files.app) {
                appData.file_url = `https://example.com/apps/${this.files.app.name}`;
                appData.file_size = this.files.app.size;
            }
            
            if (this.files.icon) {
                appData.icon_url = `https://example.com/icons/${this.files.icon.name}`;
            }
            
            if (this.files.screenshots.length > 0) {
                appData.screenshots = JSON.stringify(
                    this.files.screenshots.map((_, i) => `https://example.com/screenshots/screenshot_${i}.png`)
                );
            }

            let result;
            if (this.isEditMode) {
                // تحديث التطبيق
                const { data, error } = await supabase
                    .from(TABLES.apps)
                    .update(appData)
                    .eq('id', this.editingAppId)
                    .select()
                    .single();

                if (error) throw error;
                result = data;
                Utils.showToast('تم تحديث التطبيق بنجاح!', 'success');
            } else {
                // إضافة تطبيق جديد
                const { data, error } = await supabase
                    .from(TABLES.apps)
                    .insert([appData])
                    .select()
                    .single();

                if (error) throw error;
                result = data;
                Utils.showToast('تم رفع التطبيق بنجاح!', 'success');
            }

            // إعادة التوجيه
            setTimeout(() => {
                window.location.href = 'developer-dashboard.html';
            }, 2000);

        } catch (error) {
            console.error('Error submitting app:', error);
            Utils.showToast('حدث خطأ أثناء رفع التطبيق', 'error');
        } finally {
            Utils.showLoading(false);
        }
    }
}

// إنشاء مثيل من AppUploader
let appUploader;

document.addEventListener('DOMContentLoaded', () => {
    appUploader = new AppUploader();
});
