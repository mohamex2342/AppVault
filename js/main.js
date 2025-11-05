// Main JavaScript for AppVault

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('show');
    });
}

// Load Apps Data
let currentFilter = 'all';
let displayedApps = 9;

function loadApps(filter = 'all', limit = 9) {
    const apps = getAppsData();
    const appsGrid = document.getElementById('appsGrid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    if (!appsGrid) return;
    
    let filteredApps = filter === 'all' ? apps : apps.filter(app => app.category === filter);
    
    appsGrid.innerHTML = '';
    
    const appsToShow = filteredApps.slice(0, limit);
    
    appsToShow.forEach(app => {
        const appCard = createAppCard(app);
        appsGrid.appendChild(appCard);
    });
    
    // Show/hide load more button
    if (loadMoreBtn) {
        if (limit >= filteredApps.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'flex';
        }
    }
    
    // Update category counts
    updateCategoryCounts();
}

function createAppCard(app) {
    const card = document.createElement('div');
    card.className = 'app-card';
    card.onclick = () => window.location.href = `app-details.html?id=${app.id}`;
    
    const starsHtml = generateStars(app.rating);
    
    card.innerHTML = `
        <div class="app-card-image">
            <i class="${app.icon}"></i>
        </div>
        <div class="app-card-content">
            <h3 class="app-card-title">${app.name}</h3>
            <span class="app-card-category">${app.categoryName}</span>
            <div class="app-card-meta">
                <div class="app-rating">
                    <div class="stars">${starsHtml}</div>
                    <span>${app.rating}</span>
                </div>
                <div class="app-downloads">
                    <i class="fas fa-download"></i> ${app.downloads}
                </div>
            </div>
            <div class="app-card-footer">
                <button class="btn-primary" onclick="event.stopPropagation(); downloadApp(${app.id})">
                    <i class="fas fa-download"></i>
                    تحميل
                </button>
                <button class="btn-secondary" onclick="event.stopPropagation(); viewDetails(${app.id})">
                    <i class="fas fa-info-circle"></i>
                    تفاصيل
                </button>
            </div>
        </div>
    `;
    
    return card;
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

function filterApps(category) {
    currentFilter = category;
    displayedApps = 9;
    loadApps(category, displayedApps);
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

function loadMoreApps() {
    displayedApps += 6;
    loadApps(currentFilter, displayedApps);
}

function filterByCategory(category) {
    window.location.href = `index.html#featured-apps`;
    setTimeout(() => {
        filterApps(category);
    }, 100);
}

function updateCategoryCounts() {
    const apps = getAppsData();
    
    document.getElementById('mobileCount').textContent = apps.filter(a => a.category === 'mobile').length;
    document.getElementById('computerCount').textContent = apps.filter(a => a.category === 'computer').length;
    document.getElementById('educationalCount').textContent = apps.filter(a => a.category === 'educational').length;
    document.getElementById('pdfCount').textContent = apps.filter(a => a.category === 'pdf').length;
    document.getElementById('gamesCount').textContent = apps.filter(a => a.category === 'games').length;
    document.getElementById('allCount').textContent = apps.length;
}

// Load Latest Apps
function loadLatestApps() {
    const apps = getAppsData();
    const latestAppsList = document.getElementById('latestAppsList');
    
    if (!latestAppsList) return;
    
    // Sort by date (newest first)
    const sortedApps = apps.sort((a, b) => new Date(b.date) - new Date(a.date));
    const latestApps = sortedApps.slice(0, 5);
    
    latestAppsList.innerHTML = '';
    
    latestApps.forEach(app => {
        const appItem = document.createElement('div');
        appItem.className = 'app-list-item';
        appItem.onclick = () => window.location.href = `app-details.html?id=${app.id}`;
        
        const starsHtml = generateStars(app.rating);
        
        appItem.innerHTML = `
            <div class="app-list-icon">
                <i class="${app.icon}"></i>
            </div>
            <div class="app-list-info">
                <h3 class="app-list-title">${app.name}</h3>
                <div class="app-list-meta">
                    <span><i class="fas fa-tag"></i> ${app.categoryName}</span>
                    <span><i class="fas fa-download"></i> ${app.downloads} تحميل</span>
                    <span><div class="stars">${starsHtml}</div> ${app.rating}</span>
                </div>
                <p class="app-list-description">${app.description.substring(0, 120)}...</p>
            </div>
        `;
        
        latestAppsList.appendChild(appItem);
    });
}

// Search Functionality
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (!searchTerm) {
        alert('الرجاء إدخال كلمة البحث');
        return;
    }
    
    const apps = getAppsData();
    const results = apps.filter(app => 
        app.name.toLowerCase().includes(searchTerm) ||
        app.description.toLowerCase().includes(searchTerm) ||
        app.categoryName.toLowerCase().includes(searchTerm)
    );
    
    if (results.length === 0) {
        alert('لم يتم العثور على نتائج');
        return;
    }
    
    // Display results
    const appsGrid = document.getElementById('appsGrid');
    if (appsGrid) {
        appsGrid.innerHTML = '';
        results.forEach(app => {
            const appCard = createAppCard(app);
            appsGrid.appendChild(appCard);
        });
        
        // Hide load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = 'none';
        }
        
        // Scroll to results
        appsGrid.scrollIntoView({ behavior: 'smooth' });
    }
}

// Download App Function
function downloadApp(appId) {
    const app = getAppById(appId);
    if (!app) return;
    
    // Show loading
    showLoading();
    
    // Simulate download
    setTimeout(() => {
        hideLoading();
        
        // Increment download count
        const apps = getAppsData();
        const appIndex = apps.findIndex(a => a.id === appId);
        if (appIndex !== -1) {
            apps[appIndex].downloads++;
            saveAppsData(apps);
        }
        
        // Add to user downloads if logged in
        const currentUser = getCurrentUser();
        if (currentUser) {
            const users = getUsersData();
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1 && !users[userIndex].downloads.includes(appId)) {
                users[userIndex].downloads.push(appId);
                saveUsersData(users);
                localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
            }
        }
        
        alert(`جاري تحميل ${app.name}...\nسيتم بدء التحميل تلقائياً`);
    }, 1500);
}

function viewDetails(appId) {
    window.location.href = `app-details.html?id=${appId}`;
}

// Loading Functions
function showLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('show');
    }
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('show');
    }
}

// Update Hero Stats
function updateHeroStats() {
    const apps = getAppsData();
    const users = getUsersData();
    
    const totalDownloads = apps.reduce((sum, app) => sum + app.downloads, 0);
    
    if (document.getElementById('totalDownloads')) {
        document.getElementById('totalDownloads').textContent = totalDownloads.toLocaleString() + '+';
    }
    if (document.getElementById('totalApps')) {
        document.getElementById('totalApps').textContent = apps.length + '+';
    }
    if (document.getElementById('totalUsers')) {
        document.getElementById('totalUsers').textContent = (users.length * 1000).toLocaleString() + '+';
    }
}

// Check if user is logged in and update navigation
function checkLoginStatus() {
    const currentUser = getCurrentUser();
    const navMenu = document.querySelector('.nav-menu');
    
    if (currentUser && navMenu) {
        const loginLink = navMenu.querySelector('a[href="login.html"]');
        if (loginLink) {
            const li = loginLink.parentElement;
            li.innerHTML = `
                <a href="user-profile.html">
                    <i class="fas fa-user"></i>
                    ${currentUser.name}
                </a>
            `;
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadApps();
    loadLatestApps();
    updateHeroStats();
    updateCategoryCounts();
    checkLoginStatus();
});

// Handle Enter key in search
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}
