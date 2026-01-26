// ملف إدارة المصادقة والمستخدمين

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    async init() {
        // التحقق من وجود جلسة نشطة
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            await this.loadUserData(session.user.id);
        }
        
        // الاستماع لتغييرات حالة المصادقة
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                await this.loadUserData(session.user.id);
                this.updateUI();
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.updateUI();
            }
        });

        this.updateUI();
    }

    async loadUserData(userId) {
        try {
            const { data, error } = await supabase
                .from(TABLES.users)
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            
            this.currentUser = data;
            Utils.saveToLocalStorage('currentUser', data);
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    async signUp(email, password, fullName, role = 'user') {
        try {
            Utils.showLoading(true);

            // إنشاء حساب المستخدم في Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email,
                password: password
            });

            if (authError) throw authError;

            // إضافة بيانات المستخدم في جدول users
            const { data: userData, error: userError } = await supabase
                .from(TABLES.users)
                .insert([
                    {
                        id: authData.user.id,
                        email: email,
                        full_name: fullName,
                        role: role,
                        created_at: new Date().toISOString()
                    }
                ])
                .select()
                .single();

            if (userError) throw userError;

            Utils.showToast('تم إنشاء الحساب بنجاح! يرجى تفعيل بريدك الإلكتروني.', 'success');
            
            return { success: true, data: userData };
        } catch (error) {
            console.error('Error signing up:', error);
            Utils.showToast(error.message || 'حدث خطأ أثناء إنشاء الحساب', 'error');
            return { success: false, error: error.message };
        } finally {
            Utils.showLoading(false);
        }
    }

    async signIn(email, password) {
        try {
            Utils.showLoading(true);

            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            await this.loadUserData(data.user.id);
            Utils.showToast('تم تسجيل الدخول بنجاح!', 'success');
            
            return { success: true, data: this.currentUser };
        } catch (error) {
            console.error('Error signing in:', error);
            Utils.showToast('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error');
            return { success: false, error: error.message };
        } finally {
            Utils.showLoading(false);
        }
    }

    async signOut() {
        try {
            Utils.showLoading(true);

            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            this.currentUser = null;
            Utils.removeFromLocalStorage('currentUser');
            Utils.showToast('تم تسجيل الخروج بنجاح', 'success');
            
            // إعادة التوجيه إلى الصفحة الرئيسية
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);

            return { success: true };
        } catch (error) {
            console.error('Error signing out:', error);
            Utils.showToast('حدث خطأ أثناء تسجيل الخروج', 'error');
            return { success: false, error: error.message };
        } finally {
            Utils.showLoading(false);
        }
    }

    async resetPassword(email) {
        try {
            Utils.showLoading(true);

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/reset-password.html'
            });

            if (error) throw error;

            Utils.showToast('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني', 'success');
            return { success: true };
        } catch (error) {
            console.error('Error resetting password:', error);
            Utils.showToast('حدث خطأ أثناء إرسال رابط إعادة التعيين', 'error');
            return { success: false, error: error.message };
        } finally {
            Utils.showLoading(false);
        }
    }

    async updateProfile(updates) {
        try {
            Utils.showLoading(true);

            const { data, error } = await supabase
                .from(TABLES.users)
                .update(updates)
                .eq('id', this.currentUser.id)
                .select()
                .single();

            if (error) throw error;

            this.currentUser = data;
            Utils.saveToLocalStorage('currentUser', data);
            Utils.showToast('تم تحديث الملف الشخصي بنجاح', 'success');
            
            return { success: true, data };
        } catch (error) {
            console.error('Error updating profile:', error);
            Utils.showToast('حدث خطأ أثناء تحديث الملف الشخصي', 'error');
            return { success: false, error: error.message };
        } finally {
            Utils.showLoading(false);
        }
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    isDeveloper() {
        return this.currentUser && this.currentUser.role === 'developer';
    }

    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }

    requireAuth(redirectUrl = 'auth.html') {
        if (!this.isAuthenticated()) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }

    requireDeveloper(redirectUrl = 'index.html') {
        if (!this.isDeveloper() && !this.isAdmin()) {
            Utils.showToast('يجب أن تكون مطوراً للوصول إلى هذه الصفحة', 'error');
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 2000);
            return false;
        }
        return true;
    }

    updateUI() {
        const authButtons = document.getElementById('authButtons');
        if (!authButtons) return;

        if (this.isAuthenticated()) {
            authButtons.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-light dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown">
                        <i class="fas fa-user-circle me-1"></i>
                        ${this.currentUser.full_name || 'المستخدم'}
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item" href="profile.html">
                            <i class="fas fa-user me-2"></i>الملف الشخصي
                        </a></li>
                        ${this.isDeveloper() || this.isAdmin() ? `
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item" href="developer-dashboard.html">
                                <i class="fas fa-tachometer-alt me-2"></i>لوحة التحكم
                            </a></li>
                            <li><a class="dropdown-item" href="developer-upload.html">
                                <i class="fas fa-upload me-2"></i>رفع تطبيق
                            </a></li>
                            <li><a class="dropdown-item" href="developer-apps.html">
                                <i class="fas fa-tasks me-2"></i>إدارة التطبيقات
                            </a></li>
                        ` : ''}
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item text-danger" href="#" id="signOutBtn">
                            <i class="fas fa-sign-out-alt me-2"></i>تسجيل الخروج
                        </a></li>
                    </ul>
                </div>
            `;

            // إضافة حدث تسجيل الخروج
            document.getElementById('signOutBtn').addEventListener('click', (e) => {
                e.preventDefault();
                this.signOut();
            });
        } else {
            authButtons.innerHTML = `
                <a href="auth.html" class="btn btn-outline-light me-2">
                    <i class="fas fa-sign-in-alt me-1"></i>
                    تسجيل الدخول
                </a>
                <a href="auth.html?register=true" class="btn btn-light">
                    <i class="fas fa-user-plus me-1"></i>
                    إنشاء حساب
                </a>
            `;
        }
    }
}

// إنشاء مثيل عام من AuthManager
const authManager = new AuthManager();

// تصدير للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthManager, authManager };
}
