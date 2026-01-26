// JavaScript للوحة تحكم المطور

class DeveloperDashboard {
    constructor() {
        this.charts = {
            downloads: null,
            categories: null
        };
        this.init();
    }

    async init() {
        // التحقق من صلاحيات المطور
        if (!authManager.requireDeveloper()) {
            return;
        }

        // عرض اسم المطور
        if (authManager.currentUser) {
            document.getElementById('developerName').textContent = authManager.currentUser.full_name || 'المطور';
        }

        await this.loadStatistics();
        await this.loadRecentApps();
        await this.loadCharts();
    }

    async loadStatistics() {
        try {
            const developerId = authManager.currentUser.id;

            // إجمالي التطبيقات
            const { data: apps, error: appsError } = await supabase
                .from(TABLES.apps)
                .select('*')
                .eq('developer_id', developerId);

            if (appsError) throw appsError;

            const totalApps = apps?.length || 0;
            const totalDownloads = apps?.reduce((sum, app) => sum + (app.downloads_count || 0), 0) || 0;
            const avgRating = apps?.length > 0 
                ? (apps.reduce((sum, app) => sum + (app.rating || 0), 0) / apps.length).toFixed(1)
                : 0.0;

            // إجمالي المراجعات
            const appIds = apps?.map(app => app.id) || [];
            let totalReviews = 0;

            if (appIds.length > 0) {
                const { count, error: reviewsError } = await supabase
                    .from(TABLES.reviews)
                    .select('*', { count: 'exact', head: true })
                    .in('app_id', appIds);

                if (!reviewsError) {
                    totalReviews = count || 0;
                }
            }

            // تحديث الواجهة
            document.getElementById('totalApps').textContent = totalApps;
            document.getElementById('totalDownloads').textContent = Utils.formatDownloads(totalDownloads);
            document.getElementById('avgRating').textContent = avgRating;
            document.getElementById('totalReviews').textContent = totalReviews;

            // حفظ البيانات للرسوم البيانية
            this.appsData = apps;

        } catch (error) {
            console.error('Error loading statistics:', error);
            Utils.showToast('حدث خطأ أثناء تحميل الإحصائيات', 'error');
        }
    }

    async loadRecentApps() {
        try {
            const developerId = authManager.currentUser.id;

            const { data: apps, error } = await supabase
                .from(TABLES.apps)
                .select('*')
                .eq('developer_id', developerId)
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) throw error;

            this.renderRecentApps(apps || []);

        } catch (error) {
            console.error('Error loading recent apps:', error);
            document.getElementById('recentAppsTable').innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-danger py-4">
                        حدث خطأ أثناء تحميل التطبيقات
                    </td>
                </tr>
            `;
        }
    }

    renderRecentApps(apps) {
        const tbody = document.getElementById('recentAppsTable');

        if (apps.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">
                        <i class="fas fa-inbox text-muted" style="font-size: 2rem;"></i>
                        <p class="text-muted mt-2 mb-0">لا توجد تطبيقات بعد</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = apps.map(app => `
            <tr>
                <td>
                    <img src="${app.icon_url || 'https://via.placeholder.com/40'}" 
                         alt="${app.name}" 
                         width="40" 
                         height="40" 
                         class="rounded"
                         onerror="this.src='https://via.placeholder.com/40'">
                </td>
                <td>
                    <strong>${app.name}</strong>
                    <br>
                    <small class="text-muted">v${app.version || '1.0'}</small>
                </td>
                <td>
                    <span class="badge bg-primary">${app.category || 'عام'}</span>
                </td>
                <td>
                    <i class="fas fa-download text-success me-1"></i>
                    ${Utils.formatDownloads(app.downloads_count || 0)}
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="fas fa-star text-warning me-1"></i>
                        ${app.rating || 0}
                    </div>
                </td>
                <td>
                    ${app.published 
                        ? '<span class="badge bg-success">منشور</span>' 
                        : '<span class="badge bg-warning">مسودة</span>'}
                </td>
                <td>
                    <div class="btn-group btn-group-sm" role="group">
                        <a href="app-details.html?id=${app.id}" class="btn btn-outline-primary" title="عرض">
                            <i class="fas fa-eye"></i>
                        </a>
                        <button class="btn btn-outline-info" onclick="dashboard.editApp('${app.id}')" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="dashboard.deleteApp('${app.id}', '${app.name}')" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async loadCharts() {
        await this.createDownloadsChart();
        await this.createCategoriesChart();
    }

    async createDownloadsChart() {
        if (!this.appsData || this.appsData.length === 0) {
            return;
        }

        const ctx = document.getElementById('downloadsChart');
        if (!ctx) return;

        // تجميع البيانات حسب الشهر (آخر 6 أشهر)
        const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
                        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        
        const labels = [];
        const data = [];
        const now = new Date();
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            labels.push(months[date.getMonth()]);
            
            // حساب التحميلات لكل شهر (محاكاة - يمكن تحسينها مع بيانات حقيقية)
            const monthData = Math.floor(Math.random() * 1000) + 100;
            data.push(monthData);
        }

        this.charts.downloads = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'عدد التحميلات',
                    data: data,
                    borderColor: 'rgb(102, 126, 234)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    async createCategoriesChart() {
        if (!this.appsData || this.appsData.length === 0) {
            return;
        }

        const ctx = document.getElementById('categoriesChart');
        if (!ctx) return;

        // تجميع التطبيقات حسب الفئة
        const categoryCount = {};
        this.appsData.forEach(app => {
            const category = app.category || 'غير مصنف';
            categoryCount[category] = (categoryCount[category] || 0) + 1;
        });

        const labels = Object.keys(categoryCount);
        const data = Object.values(categoryCount);
        const colors = [
            'rgba(102, 126, 234, 0.8)',
            'rgba(118, 75, 162, 0.8)',
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)'
        ];

        this.charts.categories = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom'
                    }
                }
            }
        });
    }

    editApp(appId) {
        window.location.href = `developer-upload.html?edit=${appId}`;
    }

    async deleteApp(appId, appName) {
        if (!confirm(`هل أنت متأكد من حذف التطبيق "${appName}"؟\nهذا الإجراء لا يمكن التراجع عنه.`)) {
            return;
        }

        try {
            Utils.showLoading(true);

            const { error } = await supabase
                .from(TABLES.apps)
                .delete()
                .eq('id', appId);

            if (error) throw error;

            Utils.showToast('تم حذف التطبيق بنجاح', 'success');
            
            // إعادة تحميل البيانات
            await this.loadStatistics();
            await this.loadRecentApps();

        } catch (error) {
            console.error('Error deleting app:', error);
            Utils.showToast('حدث خطأ أثناء حذف التطبيق', 'error');
        } finally {
            Utils.showLoading(false);
        }
    }
}

// إنشاء مثيل من لوحة التحكم
let dashboard;

document.addEventListener('DOMContentLoaded', () => {
    dashboard = new DeveloperDashboard();
});
