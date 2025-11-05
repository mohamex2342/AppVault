// Admin Dashboard JavaScript

// Check authentication
function checkAdminAuth() {
    const isAdminLoggedIn = localStorage.getItem('adminLoggedIn');
    if (isAdminLoggedIn !== 'true') {
        alert('يجب تسجيل الدخول كمسؤول');
        window.location.href = 'admin-login.html';
        return false;
    }
    return true;
}

// Toggle admin sidebar
function toggleAdminSidebar() {
    const sidebar = document.getElementById('adminSidebar');
    sidebar.classList.toggle('show');
}

// Show admin section
function showAdminSection(section) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(sec => {
        sec.classList.remove('active');
    });
    
    // Remove active class from all menu items
    document.querySelectorAll('.admin-menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    const sectionMap = {
        'dashboard': 'dashboardSection',
        'apps': 'appsSection',
        'add-app': 'addAppSection',
        'reviews': 'reviewsSection',
        'users': 'usersSection',
        'messages': 'messagesSection',
        'settings': 'settingsSection'
    };
    
    document.getElementById(sectionMap[section]).classList.add('active');
    event.currentTarget.classList.add('active');
    
    // Update page title
    const titles = {
        'dashboard': 'لوحة المعلومات',
        'apps': 'إدارة التطبيقات',
        'add-app': 'إضافة تطبيق جديد',
        'reviews': 'إدارة التقييمات',
        'users': 'إدارة المستخدمين',
        'messages': 'الرسائل',
        'settings': 'الإعدادات'
    };
    document.getElementById('adminPageTitle').textContent = titles[section];
    
    // Load data for section
    if (section === 'dashboard') {
        loadDashboardData();
    } else if (section === 'apps') {
        loadAppsTable();
    } else if (section === 'reviews') {
        loadReviewsTable();
    } else if (section === 'users') {
        loadUsersTable();
    } else if (section === 'messages') {
        loadMessages();
    }
}

// Load dashboard data
function loadDashboardData() {
    const apps = getAppsData();
    const users = getUsersData();
    const reviews = getReviewsData();
    
    // Update stats
    const totalDownloads = apps.reduce((sum, app) => sum + app.downloads, 0);
    const avgRating = apps.reduce((sum, app) => sum + app.rating, 0) / apps.length;
    
    document.getElementById('totalAppsCount').textContent = apps.length;
    document.getElementById('totalDownloadsCount').textContent = totalDownloads.toLocaleString();
    document.getElementById('totalUsersCount').textContent = users.length * 1000;
    document.getElementById('avgRatingCount').textContent = avgRating.toFixed(1);
    
    // Load charts
    loadDownloadsChart();
    loadCategoriesChart();
    
    // Load activity
    loadActivity();
}

// Load downloads chart
function loadDownloadsChart() {
    const ctx = document.getElementById('downloadsChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
            datasets: [{
                label: 'التحميلات',
                data: [4200, 5800, 7200, 8500, 9800, 12000],
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
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

// Load categories chart
function loadCategoriesChart() {
    const ctx = document.getElementById('categoriesChart');
    if (!ctx) return;
    
    const apps = getAppsData();
    const categories = {
        'mobile': 0,
        'computer': 0,
        'educational': 0,
        'pdf': 0,
        'games': 0
    };
    
    apps.forEach(app => {
        categories[app.category]++;
    });
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['تطبيقات الهاتف', 'برامج الكمبيوتر', 'أدوات تعليمية', 'ملفات PDF', 'ألعاب'],
            datasets: [{
                data: Object.values(categories),
                backgroundColor: [
                    '#6366f1',
                    '#8b5cf6',
                    '#10b981',
                    '#f59e0b',
                    '#ef4444'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Load activity
function loadActivity() {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;
    
    const activities = [
        { icon: 'fas fa-download', color: '#6366f1', text: 'تحميل جديد لتطبيق واتساب', time: 'منذ 5 دقائق' },
        { icon: 'fas fa-user-plus', color: '#10b981', text: 'مستخدم جديد انضم للمنصة', time: 'منذ 15 دقيقة' },
        { icon: 'fas fa-star', color: '#f59e0b', text: 'تقييم جديد 5 نجوم', time: 'منذ 30 دقيقة' },
        { icon: 'fas fa-upload', color: '#8b5cf6', text: 'تم إضافة تطبيق جديد', time: 'منذ ساعة' },
        { icon: 'fas fa-comment', color: '#3b82f6', text: 'تعليق جديد من أحمد', time: 'منذ ساعتين' }
    ];
    
    activityList.innerHTML = '';
    activities.forEach(activity => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <div class="activity-icon" style="background: ${activity.color}">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-info">
                <strong>${activity.text}</strong>
                <small>${activity.time}</small>
            </div>
        `;
        activityList.appendChild(item);
    });
}

// Load apps table
function loadAppsTable() {
    const apps = getAppsData();
    const tbody = document.getElementById('appsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    apps.forEach(app => {
        const tr = document.createElement('tr');
        const starsHtml = generateStars(app.rating);
        
        tr.innerHTML = `
            <td>
                <div class="table-app-img">
                    <i class="${app.icon}"></i>
                </div>
            </td>
            <td>${app.name}</td>
            <td>${app.categoryName}</td>
            <td>
                <div class="stars">${starsHtml}</div>
                ${app.rating}
            </td>
            <td>${app.downloads}</td>
            <td>${new Date(app.date).toLocaleDateString('ar-EG')}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon btn-edit" onclick="editApp(${app.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteApp(${app.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function generateStars(rating) {
    let starsHtml = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
        starsHtml += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += '<i class="far fa-star"></i>';
    }
    
    return starsHtml;
}

// Filter apps table
function filterAppsTable() {
    const searchInput = document.getElementById('appsSearchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const apps = getAppsData();
    
    let filtered = apps;
    
    if (searchInput) {
        filtered = filtered.filter(app => 
            app.name.toLowerCase().includes(searchInput) ||
            app.description.toLowerCase().includes(searchInput)
        );
    }
    
    if (categoryFilter) {
        filtered = filtered.filter(app => app.category === categoryFilter);
    }
    
    const tbody = document.getElementById('appsTableBody');
    tbody.innerHTML = '';
    
    filtered.forEach(app => {
        const tr = document.createElement('tr');
        const starsHtml = generateStars(app.rating);
        
        tr.innerHTML = `
            <td>
                <div class="table-app-img">
                    <i class="${app.icon}"></i>
                </div>
            </td>
            <td>${app.name}</td>
            <td>${app.categoryName}</td>
            <td>
                <div class="stars">${starsHtml}</div>
                ${app.rating}
            </td>
            <td>${app.downloads}</td>
            <td>${new Date(app.date).toLocaleDateString('ar-EG')}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon btn-edit" onclick="editApp(${app.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteApp(${app.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Edit app
function editApp(appId) {
    const app = getAppById(appId);
    if (!app) return;
    
    // Show modal
    const modal = document.getElementById('editAppModal');
    modal.classList.add('show');
    
    // Fill form
    document.getElementById('editAppId').value = app.id;
    document.getElementById('editAppName').value = app.name;
    document.getElementById('editAppCategory').value = app.category;
    document.getElementById('editAppDescription').value = app.description;
}

function closeEditModal() {
    const modal = document.getElementById('editAppModal');
    modal.classList.remove('show');
}

// Handle edit app form
function handleEditApp(event) {
    event.preventDefault();
    
    const appId = parseInt(document.getElementById('editAppId').value);
    const name = document.getElementById('editAppName').value;
    const category = document.getElementById('editAppCategory').value;
    const description = document.getElementById('editAppDescription').value;
    
    const apps = getAppsData();
    const appIndex = apps.findIndex(a => a.id === appId);
    
    if (appIndex !== -1) {
        apps[appIndex].name = name;
        apps[appIndex].category = category;
        apps[appIndex].description = description;
        
        saveAppsData(apps);
        alert('تم تحديث التطبيق بنجاح!');
        closeEditModal();
        loadAppsTable();
    }
}

// Delete app
function deleteApp(appId) {
    if (!confirm('هل أنت متأكد من حذف هذا التطبيق؟')) return;
    
    const apps = getAppsData();
    const filtered = apps.filter(a => a.id !== appId);
    saveAppsData(filtered);
    
    alert('تم حذف التطبيق بنجاح');
    loadAppsTable();
}

// Handle add app
function handleAddApp(event) {
    event.preventDefault();
    
    const name = document.getElementById('appName').value;
    const category = document.getElementById('appCategory').value;
    const size = document.getElementById('appSize').value;
    const version = document.getElementById('appVersion').value;
    const description = document.getElementById('appDescription').value;
    const features = document.getElementById('appFeatures').value.split('\n').filter(f => f.trim());
    const icon = document.getElementById('appIcon').value;
    const downloadUrl = document.getElementById('appDownloadUrl').value;
    
    // Get selected platforms
    const platforms = [];
    document.querySelectorAll('input[name="platform"]:checked').forEach(checkbox => {
        platforms.push(checkbox.value);
    });
    
    if (platforms.length === 0) {
        alert('يرجى اختيار منصة واحدة على الأقل');
        return;
    }
    
    const categoryNames = {
        'mobile': 'تطبيقات الهاتف',
        'computer': 'برامج الكمبيوتر',
        'educational': 'أدوات تعليمية',
        'pdf': 'ملفات PDF',
        'games': 'ألعاب'
    };
    
    const apps = getAppsData();
    const newApp = {
        id: apps.length + 1,
        name: name,
        category: category,
        categoryName: categoryNames[category],
        description: description,
        features: features,
        size: size,
        version: version,
        platforms: platforms,
        rating: 0,
        downloads: 0,
        date: new Date().toISOString().split('T')[0],
        icon: icon.includes('fa-') ? icon : 'fas fa-mobile-alt',
        downloadUrl: downloadUrl
    };
    
    apps.push(newApp);
    saveAppsData(apps);
    
    alert('تم إضافة التطبيق بنجاح!');
    event.target.reset();
}

// Load reviews table
function loadReviewsTable() {
    const reviews = getReviewsData();
    const apps = getAppsData();
    const tbody = document.getElementById('reviewsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    reviews.forEach(review => {
        const app = apps.find(a => a.id === review.appId);
        const tr = document.createElement('tr');
        const starsHtml = generateStars(review.rating);
        
        tr.innerHTML = `
            <td>${review.userName}</td>
            <td>${app ? app.name : 'غير معروف'}</td>
            <td>
                <div class="stars">${starsHtml}</div>
                ${review.rating}
            </td>
            <td>${review.comment.substring(0, 50)}...</td>
            <td>${new Date(review.date).toLocaleDateString('ar-EG')}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon btn-delete" onclick="deleteReview(${review.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function deleteReview(reviewId) {
    if (!confirm('هل أنت متأكد من حذف هذا التقييم؟')) return;
    
    const reviews = getReviewsData();
    const filtered = reviews.filter(r => r.id !== reviewId);
    saveReviewsData(filtered);
    
    alert('تم حذف التقييم');
    loadReviewsTable();
}

function filterReviewsTable() {
    const searchInput = document.getElementById('reviewsSearchInput').value.toLowerCase();
    const reviews = getReviewsData();
    const apps = getAppsData();
    
    const filtered = reviews.filter(review => 
        review.userName.toLowerCase().includes(searchInput) ||
        review.comment.toLowerCase().includes(searchInput)
    );
    
    const tbody = document.getElementById('reviewsTableBody');
    tbody.innerHTML = '';
    
    filtered.forEach(review => {
        const app = apps.find(a => a.id === review.appId);
        const tr = document.createElement('tr');
        const starsHtml = generateStars(review.rating);
        
        tr.innerHTML = `
            <td>${review.userName}</td>
            <td>${app ? app.name : 'غير معروف'}</td>
            <td>
                <div class="stars">${starsHtml}</div>
                ${review.rating}
            </td>
            <td>${review.comment.substring(0, 50)}...</td>
            <td>${new Date(review.date).toLocaleDateString('ar-EG')}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon btn-delete" onclick="deleteReview(${review.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Load users table
function loadUsersTable() {
    const users = getUsersData();
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    users.forEach(user => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.downloads.length}</td>
            <td>${user.reviews.length}</td>
            <td>${new Date(user.joinDate).toLocaleDateString('ar-EG')}</td>
            <td><span style="color: var(--success-color);">●</span> نشط</td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon btn-delete" onclick="deleteUser(${user.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function deleteUser(userId) {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    
    const users = getUsersData();
    const filtered = users.filter(u => u.id !== userId);
    saveUsersData(filtered);
    
    alert('تم حذف المستخدم');
    loadUsersTable();
}

function filterUsersTable() {
    const searchInput = document.getElementById('usersSearchInput').value.toLowerCase();
    const users = getUsersData();
    
    const filtered = users.filter(user => 
        user.name.toLowerCase().includes(searchInput) ||
        user.email.toLowerCase().includes(searchInput)
    );
    
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    
    filtered.forEach(user => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.downloads.length}</td>
            <td>${user.reviews.length}</td>
            <td>${new Date(user.joinDate).toLocaleDateString('ar-EG')}</td>
            <td><span style="color: var(--success-color);">●</span> نشط</td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon btn-delete" onclick="deleteUser(${user.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Load messages
function loadMessages() {
    const messages = getMessagesData();
    const messagesList = document.getElementById('messagesList');
    if (!messagesList) return;
    
    messagesList.innerHTML = '';
    messages.forEach(message => {
        const item = document.createElement('div');
        item.className = 'message-item' + (message.read ? '' : ' unread');
        item.onclick = () => viewMessage(message.id);
        
        const subjectNames = {
            'support': 'الدعم الفني',
            'suggestion': 'اقتراح',
            'complaint': 'شكوى',
            'partnership': 'شراكة',
            'other': 'أخرى'
        };
        
        item.innerHTML = `
            <div class="message-header">
                <div class="message-subject">${message.name} - ${subjectNames[message.subject]}</div>
                <div class="message-date">${new Date(message.date).toLocaleDateString('ar-EG')}</div>
            </div>
            <div class="message-preview">${message.message.substring(0, 100)}...</div>
        `;
        
        messagesList.appendChild(item);
    });
}

function viewMessage(messageId) {
    const messages = getMessagesData();
    const message = messages.find(m => m.id === messageId);
    
    if (message) {
        const subjectNames = {
            'support': 'الدعم الفني',
            'suggestion': 'اقتراح',
            'complaint': 'شكوى',
            'partnership': 'شراكة',
            'other': 'أخرى'
        };
        
        alert(`
من: ${message.name}
البريد: ${message.email}
الموضوع: ${subjectNames[message.subject]}
الرسالة: ${message.message}
        `);
        
        // Mark as read
        message.read = true;
        saveMessagesData(messages);
        loadMessages();
    }
}

function filterMessages() {
    const filter = document.getElementById('messageFilter').value;
    const messages = getMessagesData();
    
    let filtered = messages;
    if (filter === 'unread') {
        filtered = messages.filter(m => !m.read);
    } else if (filter === 'read') {
        filtered = messages.filter(m => m.read);
    }
    
    const messagesList = document.getElementById('messagesList');
    messagesList.innerHTML = '';
    
    filtered.forEach(message => {
        const item = document.createElement('div');
        item.className = 'message-item' + (message.read ? '' : ' unread');
        item.onclick = () => viewMessage(message.id);
        
        const subjectNames = {
            'support': 'الدعم الفني',
            'suggestion': 'اقتراح',
            'complaint': 'شكوى',
            'partnership': 'شراكة',
            'other': 'أخرى'
        };
        
        item.innerHTML = `
            <div class="message-header">
                <div class="message-subject">${message.name} - ${subjectNames[message.subject]}</div>
                <div class="message-date">${new Date(message.date).toLocaleDateString('ar-EG')}</div>
            </div>
            <div class="message-preview">${message.message.substring(0, 100)}...</div>
        `;
        
        messagesList.appendChild(item);
    });
}

// Handle site settings
function handleSiteSettings(event) {
    event.preventDefault();
    alert('تم حفظ الإعدادات بنجاح!');
}

// Admin logout
function adminLogout() {
    if (confirm('هل تريد تسجيل الخروج؟')) {
        localStorage.removeItem('adminLoggedIn');
        window.location.href = 'admin-login.html';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAdminAuth()) return;
    loadDashboardData();
});
