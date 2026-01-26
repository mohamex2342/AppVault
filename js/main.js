// ملف JavaScript الرئيسي للصفحة الرئيسية

class AppStore {
    constructor() {
        this.apps = [];
        this.categories = [];
        this.currentFilter = 'all';
        this.currentPage = 1;
        this.appsPerPage = APP_CONFIG.appsPerPage;
        this.init();
    }

    async init() {
        await this.loadCategories();
        await this.loadApps();
        await this.loadStats();
        this.setupEventListeners();
    }

    async loadCategories() {
        try {
            const { data, error } = await supabase
                .from(TABLES.categories)
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;

            this.categories = data || [];
            this.renderCategories();
        } catch (error) {
            console.error('Error loading categories:', error);
            this.renderEmptyCategories();
        }
    }

    async loadApps(filter = 'all', page = 1) {
        try {
            let query = supabase
                .from(TABLES.apps)
                .select('*, users!developer_id(full_name)')
                .eq('published', true);

            // تطبيق الفلتر
            if (filter === 'popular') {
                query = query.order('downloads_count', { ascending: false });
            } else if (filter === 'newest') {
                query = query.order('created_at', { ascending: false });
            } else {
                query = query.order('rating', { ascending: false });
            }

            // التصفح
            const start = (page - 1) * this.appsPerPage;
            const end = start + this.appsPerPage - 1;
            query = query.range(start, end);

            const { data, error } = await query;

            if (error) throw error;

            if (page === 1) {
                this.apps = data || [];
            } else {
                this.apps = [...this.apps, ...(data || [])];
            }

            this.currentPage = page;
            this.renderApps();
        } catch (error) {
            console.error('Error loading apps:', error);
            this.renderEmptyApps();
        }
    }

    async loadStats() {
        try {
            // إجمالي التطبيقات
            const { count: appsCount } = await supabase
                .from(TABLES.apps)
                .select('*', { count: 'exact', head: true })
                .eq('published', true);

            // إجمالي التحميلات
            const { data: appsData } = await supabase
                .from(TABLES.apps)
                .select('downloads_count');

            const totalDownloads = appsData?.reduce((sum, app) => sum + (app.downloads_count || 0), 0) || 0;

            // إجمالي المستخدمين
            const { count: usersCount } = await supabase
                .from(TABLES.users)
                .select('*', { count: 'exact', head: true });

            // تحديث الإحصائيات في الواجهة
            document.getElementById('totalApps').textContent = appsCount || 0;
            document.getElementById('totalDownloads').textContent = Utils.formatDownloads(totalDownloads);
            document.getElementById('totalUsers').textContent = Utils.formatDownloads(usersCount || 0);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    renderCategories() {
        const container = document.getElementById('categoriesContainer');
        
        if (this.categories.length === 0) {
            this.renderEmptyCategories();
            return;
        }

        container.innerHTML = this.categories.map(category => `
            <div class="col-lg-2 col-md-3 col-sm-4 col-6">
                <div class="category-card" data-category="${category.id}">
                    <div class="category-icon">
                        <i class="${category.icon || 'fas fa-folder'}"></i>
                    </div>
                    <h5 class="category-name">${category.name}</h5>
                    <p class="category-count">${category.app_count || 0} تطبيق</p>
                </div>
            </div>
        `).join('');

        // إضافة أحداث النقر على الفئات
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const categoryId = card.dataset.category;
                this.filterByCategory(categoryId);
            });
        });
    }

    renderEmptyCategories() {
        const container = document.getElementById('categoriesContainer');
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-folder-open text-muted" style="font-size: 4rem;"></i>
                <p class="text-muted mt-3">لا توجد فئات متاحة حالياً</p>
            </div>
        `;
    }

    renderApps() {
        const container = document.getElementById('appsContainer');
        
        if (this.apps.length === 0) {
            this.renderEmptyApps();
            return;
        }

        container.innerHTML = this.apps.map(app => `
            <div class="col-lg-3 col-md-4 col-sm-6 fade-in">
                <div class="app-card">
                    <div class="p-3">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <img src="${app.icon_url || 'https://via.placeholder.com/80'}" 
                                 alt="${app.name}" 
                                 class="app-icon"
                                 onerror="this.src='https://via.placeholder.com/80'">
                            <span class="badge-category">${app.category || 'عام'}</span>
                        </div>
                        
                        <h5 class="app-title">${app.name}</h5>
                        <p class="app-developer">
                            <i class="fas fa-user-circle me-1"></i>
                            ${app.users?.full_name || 'مطور'}
                        </p>
                        <p class="app-description">${app.description || 'لا يوجد وصف'}</p>
                        
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <div class="app-rating">
                                <span class="stars">${Utils.createStars(app.rating || 0)}</span>
                                <span class="text-muted">(${app.rating || 0})</span>
                            </div>
                            <span class="app-downloads">
                                <i class="fas fa-download me-1"></i>
                                ${Utils.formatDownloads(app.downloads_count || 0)}
                            </span>
                        </div>
                        
                        <div class="d-flex gap-2">
                            <button class="btn btn-download flex-grow-1" onclick="appStore.viewAppDetails('${app.id}')">
                                <i class="fas fa-info-circle me-1"></i>
                                التفاصيل
                            </button>
                            <button class="btn btn-outline-primary" onclick="appStore.downloadApp('${app.id}')">
                                <i class="fas fa-download"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderEmptyApps() {
        const container = document.getElementById('appsContainer');
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-mobile-alt text-muted" style="font-size: 4rem;"></i>
                <p class="text-muted mt-3">لا توجد تطبيقات متاحة حالياً</p>
            </div>
        `;
    }

    async searchApps(searchQuery) {
        if (!searchQuery.trim()) {
            await this.loadApps();
            return;
        }

        try {
            const { data, error } = await supabase
                .from(TABLES.apps)
                .select('*, users!developer_id(full_name)')
                .eq('published', true)
                .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
                .order('rating', { ascending: false });

            if (error) throw error;

            this.apps = data || [];
            this.renderApps();
        } catch (error) {
            console.error('Error searching apps:', error);
            Utils.showToast('حدث خطأ أثناء البحث', 'error');
        }
    }

    async filterByCategory(categoryId) {
        try {
            const { data, error } = await supabase
                .from(TABLES.apps)
                .select('*, users!developer_id(full_name)')
                .eq('published', true)
                .eq('category_id', categoryId)
                .order('rating', { ascending: false });

            if (error) throw error;

            this.apps = data || [];
            this.renderApps();

            // التمرير لقسم التطبيقات
            document.getElementById('featured').scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error filtering apps:', error);
            Utils.showToast('حدث خطأ أثناء التصفية', 'error');
        }
    }

    async downloadApp(appId) {
        try {
            // الحصول على بيانات التطبيق
            const { data: app, error } = await supabase
                .from(TABLES.apps)
                .select('*')
                .eq('id', appId)
                .single();

            if (error) throw error;

            // زيادة عداد التحميلات
            await supabase
                .from(TABLES.apps)
                .update({ downloads_count: (app.downloads_count || 0) + 1 })
                .eq('id', appId);

            // فتح رابط التحميل
            if (app.file_url) {
                window.open(app.file_url, '_blank');
                Utils.showToast('بدأ التحميل...', 'success');
                
                // تحديث العداد في الواجهة
                await this.loadStats();
            } else {
                Utils.showToast('رابط التحميل غير متوفر', 'error');
            }
        } catch (error) {
            console.error('Error downloading app:', error);
            Utils.showToast('حدث خطأ أثناء التحميل', 'error');
        }
    }

    viewAppDetails(appId) {
        window.location.href = `app-details.html?id=${appId}`;
    }

    setupEventListeners() {
        // البحث
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');

        searchBtn?.addEventListener('click', () => {
            this.searchApps(searchInput.value);
        });

        searchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchApps(searchInput.value);
            }
        });

        // أزرار الفلتر
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                // إزالة الحالة النشطة من جميع الأزرار
                document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
                
                // إضافة الحالة النشطة للزر الحالي
                e.target.classList.add('active');
                
                // تحميل التطبيقات حسب الفلتر
                const filter = e.target.dataset.filter;
                this.currentFilter = filter;
                this.currentPage = 1;
                await this.loadApps(filter, 1);
            });
        });

        // زر تحميل المزيد
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        loadMoreBtn?.addEventListener('click', async () => {
            await this.loadApps(this.currentFilter, this.currentPage + 1);
        });
    }
}

// إنشاء مثيل عام من AppStore
let appStore;

document.addEventListener('DOMContentLoaded', () => {
    appStore = new AppStore();
});
