// User Profile JavaScript

let currentUser = null;

// Check if user is logged in
function checkAuth() {
    currentUser = getCurrentUser();
    if (!currentUser) {
        alert('يجب تسجيل الدخول أولاً');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Load user profile
function loadUserProfile() {
    if (!checkAuth()) return;
    
    // Update profile info
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userEmail').textContent = currentUser.email;
    document.getElementById('userDownloads').textContent = currentUser.downloads.length;
    document.getElementById('userFavorites').textContent = currentUser.favorites.length;
    document.getElementById('userReviews').textContent = currentUser.reviews.length;
    
    // Load favorites
    loadFavorites();
    
    // Load settings
    loadSettings();
}

// Show section
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.style.display = 'none';
    });
    
    // Remove active class from all menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    const sectionMap = {
        'favorites': 'favoritesSection',
        'downloads': 'downloadsSection',
        'reviews': 'reviewsSection',
        'settings': 'settingsSection'
    };
    
    document.getElementById(sectionMap[section]).style.display = 'block';
    event.currentTarget.classList.add('active');
    
    // Load data for section
    if (section === 'favorites') {
        loadFavorites();
    } else if (section === 'downloads') {
        loadDownloads();
    } else if (section === 'reviews') {
        loadUserReviews();
    }
}

// Load favorites
function loadFavorites() {
    const favoritesGrid = document.getElementById('favoritesGrid');
    const emptyFavorites = document.getElementById('emptyFavorites');
    
    if (currentUser.favorites.length === 0) {
        favoritesGrid.style.display = 'none';
        emptyFavorites.style.display = 'block';
        return;
    }
    
    favoritesGrid.style.display = 'grid';
    emptyFavorites.style.display = 'none';
    favoritesGrid.innerHTML = '';
    
    const apps = getAppsData();
    const favoriteApps = apps.filter(app => currentUser.favorites.includes(app.id));
    
    favoriteApps.forEach(app => {
        const card = createAppCard(app);
        favoritesGrid.appendChild(card);
    });
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
            </div>
            <div class="app-card-footer">
                <button class="btn-primary" onclick="event.stopPropagation(); window.location.href='app-details.html?id=${app.id}'">
                    <i class="fas fa-eye"></i>
                    عرض
                </button>
                <button class="btn-secondary" onclick="event.stopPropagation(); removeFavorite(${app.id})">
                    <i class="fas fa-trash"></i>
                    إزالة
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

// Remove from favorites
function removeFavorite(appId) {
    if (!confirm('هل تريد إزالة هذا التطبيق من المفضلة؟')) return;
    
    const users = getUsersData();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
        const favIndex = users[userIndex].favorites.indexOf(appId);
        if (favIndex > -1) {
            users[userIndex].favorites.splice(favIndex, 1);
            saveUsersData(users);
            currentUser = users[userIndex];
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Update count
            document.getElementById('userFavorites').textContent = currentUser.favorites.length;
            
            // Reload favorites
            loadFavorites();
        }
    }
}

// Load downloads
function loadDownloads() {
    const downloadsList = document.getElementById('downloadsList');
    const emptyDownloads = document.getElementById('emptyDownloads');
    
    if (currentUser.downloads.length === 0) {
        downloadsList.style.display = 'none';
        emptyDownloads.style.display = 'block';
        return;
    }
    
    downloadsList.style.display = 'flex';
    emptyDownloads.style.display = 'none';
    downloadsList.innerHTML = '';
    
    const apps = getAppsData();
    const downloadedApps = apps.filter(app => currentUser.downloads.includes(app.id));
    
    downloadedApps.forEach(app => {
        const item = document.createElement('div');
        item.className = 'download-item';
        
        item.innerHTML = `
            <div class="download-icon">
                <i class="${app.icon}"></i>
            </div>
            <div class="download-info">
                <h4>${app.name}</h4>
                <span>${app.categoryName} • ${app.size}</span>
            </div>
            <div class="download-actions">
                <button class="btn-primary" onclick="window.location.href='app-details.html?id=${app.id}'">
                    <i class="fas fa-eye"></i>
                    عرض
                </button>
            </div>
        `;
        
        downloadsList.appendChild(item);
    });
}

// Load user reviews
function loadUserReviews() {
    const reviewsList = document.getElementById('userReviewsList');
    const emptyReviews = document.getElementById('emptyReviews');
    
    const allReviews = getReviewsData();
    const userReviews = allReviews.filter(review => review.userName === currentUser.name);
    
    if (userReviews.length === 0) {
        reviewsList.style.display = 'none';
        emptyReviews.style.display = 'block';
        return;
    }
    
    reviewsList.style.display = 'flex';
    emptyReviews.style.display = 'none';
    reviewsList.innerHTML = '';
    
    const apps = getAppsData();
    
    userReviews.forEach(review => {
        const app = apps.find(a => a.id === review.appId);
        if (!app) return;
        
        const item = document.createElement('div');
        item.className = 'user-review-item';
        
        const starsHtml = generateStars(review.rating);
        const reviewDate = new Date(review.date).toLocaleDateString('ar-EG');
        
        item.innerHTML = `
            <div class="user-review-header">
                <div>
                    <div class="user-review-app">${app.name}</div>
                    <div class="review-date">${reviewDate}</div>
                </div>
                <div class="review-rating">
                    ${starsHtml}
                </div>
            </div>
            <p class="review-text">${review.comment}</p>
        `;
        
        reviewsList.appendChild(item);
    });
}

// Load settings
function loadSettings() {
    document.getElementById('settingsName').value = currentUser.name;
    document.getElementById('settingsEmail').value = currentUser.email;
}

// Update profile
function updateProfile(event) {
    event.preventDefault();
    
    const name = document.getElementById('settingsName').value;
    const email = document.getElementById('settingsEmail').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    
    // Validate
    if (newPassword && newPassword !== confirmNewPassword) {
        alert('كلمة المرور غير متطابقة');
        return;
    }
    
    if (newPassword && newPassword.length < 8) {
        alert('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
        return;
    }
    
    // Update user data
    const users = getUsersData();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
        users[userIndex].name = name;
        users[userIndex].email = email;
        if (newPassword) {
            users[userIndex].password = newPassword;
        }
        
        saveUsersData(users);
        currentUser = users[userIndex];
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Update displayed name
        document.getElementById('userName').textContent = name;
        document.getElementById('userEmail').textContent = email;
        
        alert('تم تحديث البيانات بنجاح!');
        
        // Clear password fields
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmNewPassword').value = '';
    }
}

// Logout
function logout() {
    if (confirm('هل تريد تسجيل الخروج؟')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
});

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('show');
    });
}
