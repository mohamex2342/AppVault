// App Details Page JavaScript

let currentAppId = null;
let selectedRating = 0;

// Get app ID from URL
function getAppIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get('id'));
}

// Load app details
function loadAppDetails() {
    currentAppId = getAppIdFromURL();
    const app = getAppById(currentAppId);
    
    if (!app) {
        alert('التطبيق غير موجود');
        window.location.href = 'index.html';
        return;
    }
    
    // Update page title
    document.title = `${app.name} - AppVault`;
    
    // Update breadcrumb
    document.getElementById('breadcrumbCategory').textContent = app.categoryName;
    document.getElementById('breadcrumbApp').textContent = app.name;
    
    // Update app header
    document.getElementById('appTitle').textContent = app.name;
    document.getElementById('appCategory').innerHTML = `<i class="fas fa-tag"></i> ${app.categoryName}`;
    document.getElementById('appRating').textContent = app.rating;
    document.getElementById('appDownloads').textContent = app.downloads;
    
    const appIcon = document.getElementById('appIcon');
    appIcon.innerHTML = `<i class="${app.icon}"></i>`;
    
    // Update stars
    const starsHtml = generateStars(app.rating);
    document.getElementById('appStars').innerHTML = starsHtml;
    
    // Update platforms
    const platformsHtml = app.platforms.map(platform => {
        const icons = {
            'windows': 'fab fa-windows',
            'android': 'fab fa-android',
            'ios': 'fab fa-apple',
            'mac': 'fab fa-apple',
            'linux': 'fab fa-linux'
        };
        return `<span class="platform-badge"><i class="${icons[platform]}"></i> ${platform.toUpperCase()}</span>`;
    }).join('');
    document.getElementById('appPlatforms').innerHTML = platformsHtml;
    
    // Update info cards
    document.getElementById('appSize').textContent = app.size;
    document.getElementById('appVersion').textContent = app.version;
    document.getElementById('appDate').textContent = new Date(app.date).toLocaleDateString('ar-EG');
    
    // Update description
    document.getElementById('appDescription').innerHTML = `<p>${app.description}</p>`;
    
    // Update features
    const featuresList = document.getElementById('featuresList');
    featuresList.innerHTML = '';
    app.features.forEach(feature => {
        const li = document.createElement('li');
        li.textContent = feature;
        featuresList.appendChild(li);
    });
    
    // Load reviews
    loadReviews();
    
    // Load similar apps
    loadSimilarApps(app.category, currentAppId);
    
    // Check if favorited
    checkIfFavorited();
}

function loadReviews() {
    const reviews = getAppReviews(currentAppId);
    const reviewsList = document.getElementById('reviewsList');
    const reviewsCount = document.getElementById('reviewsCount');
    
    reviewsCount.textContent = reviews.length;
    
    if (reviews.length === 0) {
        reviewsList.innerHTML = '<p style="text-align: center; color: var(--gray-500); padding: 40px;">لا توجد تقييمات بعد. كن أول من يقيّم هذا التطبيق!</p>';
        return;
    }
    
    reviewsList.innerHTML = '';
    reviews.forEach(review => {
        const reviewItem = document.createElement('div');
        reviewItem.className = 'review-item';
        
        const starsHtml = generateStars(review.rating);
        const reviewDate = new Date(review.date).toLocaleDateString('ar-EG');
        
        reviewItem.innerHTML = `
            <div class="review-header">
                <div class="reviewer-info">
                    <div class="reviewer-avatar">
                        ${review.userName.charAt(0)}
                    </div>
                    <div>
                        <div class="reviewer-name">${review.userName}</div>
                        <div class="review-date">${reviewDate}</div>
                    </div>
                </div>
                <div class="review-rating">
                    ${starsHtml}
                </div>
            </div>
            <p class="review-text">${review.comment}</p>
        `;
        
        reviewsList.appendChild(reviewItem);
    });
}

function loadSimilarApps(category, excludeId) {
    const apps = getAppsData();
    const similarApps = apps.filter(app => app.category === category && app.id !== excludeId).slice(0, 4);
    
    const similarAppsGrid = document.getElementById('similarApps');
    similarAppsGrid.innerHTML = '';
    
    similarApps.forEach(app => {
        const appCard = createSimpleAppCard(app);
        similarAppsGrid.appendChild(appCard);
    });
}

function createSimpleAppCard(app) {
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

// Star rating input
const starsInput = document.querySelectorAll('.stars-input i');
starsInput.forEach(star => {
    star.addEventListener('click', function() {
        selectedRating = parseInt(this.dataset.rating);
        updateStarInput();
        document.getElementById('selectedRating').textContent = selectedRating;
    });
    
    star.addEventListener('mouseenter', function() {
        const rating = parseInt(this.dataset.rating);
        highlightStars(rating);
    });
});

const starsInputContainer = document.getElementById('starsInput');
if (starsInputContainer) {
    starsInputContainer.addEventListener('mouseleave', () => {
        updateStarInput();
    });
}

function highlightStars(rating) {
    starsInput.forEach((star, index) => {
        if (index < rating) {
            star.classList.remove('far');
            star.classList.add('fas', 'active');
        } else {
            star.classList.remove('fas', 'active');
            star.classList.add('far');
        }
    });
}

function updateStarInput() {
    starsInput.forEach((star, index) => {
        if (index < selectedRating) {
            star.classList.remove('far');
            star.classList.add('fas', 'active');
        } else {
            star.classList.remove('fas', 'active');
            star.classList.add('far');
        }
    });
}

// Submit review
function submitReview() {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        alert('يجب تسجيل الدخول أولاً لإضافة تقييم');
        window.location.href = 'login.html';
        return;
    }
    
    if (selectedRating === 0) {
        alert('الرجاء اختيار التقييم بالنجوم');
        return;
    }
    
    const reviewText = document.getElementById('reviewText').value.trim();
    if (!reviewText) {
        alert('الرجاء كتابة تعليق');
        return;
    }
    
    // Add review
    const reviews = getReviewsData();
    const newReview = {
        id: reviews.length + 1,
        appId: currentAppId,
        userName: currentUser.name,
        rating: selectedRating,
        comment: reviewText,
        date: new Date().toISOString().split('T')[0]
    };
    
    reviews.push(newReview);
    saveReviewsData(reviews);
    
    // Update app rating
    const apps = getAppsData();
    const appIndex = apps.findIndex(a => a.id === currentAppId);
    if (appIndex !== -1) {
        const appReviews = reviews.filter(r => r.appId === currentAppId);
        const avgRating = appReviews.reduce((sum, r) => sum + r.rating, 0) / appReviews.length;
        apps[appIndex].rating = Math.round(avgRating * 10) / 10;
        saveAppsData(apps);
    }
    
    // Reset form
    document.getElementById('reviewText').value = '';
    selectedRating = 0;
    updateStarInput();
    document.getElementById('selectedRating').textContent = '0';
    
    // Reload reviews
    loadReviews();
    
    alert('تم إضافة تقييمك بنجاح!');
}

// Download app
function downloadApp() {
    const app = getAppById(currentAppId);
    if (!app) return;
    
    // Show modal
    const modal = document.getElementById('downloadModal');
    modal.classList.add('show');
    
    // Simulate download progress
    let progress = 0;
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const downloadInfo = document.getElementById('downloadInfo');
    
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        
        progressFill.style.width = progress + '%';
        progressText.textContent = Math.floor(progress) + '%';
        
        if (progress >= 100) {
            clearInterval(interval);
            downloadInfo.innerHTML = '<i class="fas fa-check-circle" style="color: var(--success-color); font-size: 48px; margin: 20px 0;"></i><br>تم التحميل بنجاح!';
            
            // Increment download count
            const apps = getAppsData();
            const appIndex = apps.findIndex(a => a.id === currentAppId);
            if (appIndex !== -1) {
                apps[appIndex].downloads++;
                saveAppsData(apps);
                document.getElementById('appDownloads').textContent = apps[appIndex].downloads;
            }
            
            // Close modal after 2 seconds
            setTimeout(() => {
                closeDownloadModal();
            }, 2000);
        }
    }, 200);
}

function closeDownloadModal() {
    const modal = document.getElementById('downloadModal');
    modal.classList.remove('show');
    
    // Reset progress
    setTimeout(() => {
        document.getElementById('progressFill').style.width = '0%';
        document.getElementById('progressText').textContent = '0%';
        document.getElementById('downloadInfo').textContent = 'سيتم بدء التحميل تلقائياً في غضون ثوانٍ...';
    }, 300);
}

// Toggle favorite
function toggleFavorite() {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        alert('يجب تسجيل الدخول أولاً');
        window.location.href = 'login.html';
        return;
    }
    
    const users = getUsersData();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
        const favoriteIndex = users[userIndex].favorites.indexOf(currentAppId);
        
        if (favoriteIndex > -1) {
            // Remove from favorites
            users[userIndex].favorites.splice(favoriteIndex, 1);
            alert('تم إزالة التطبيق من المفضلة');
        } else {
            // Add to favorites
            users[userIndex].favorites.push(currentAppId);
            alert('تم إضافة التطبيق إلى المفضلة');
        }
        
        saveUsersData(users);
        localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
        checkIfFavorited();
    }
}

function checkIfFavorited() {
    const currentUser = getCurrentUser();
    const favoriteBtn = document.querySelector('.favorite-btn i');
    
    if (currentUser && favoriteBtn) {
        if (currentUser.favorites.includes(currentAppId)) {
            favoriteBtn.classList.remove('far');
            favoriteBtn.classList.add('fas');
        } else {
            favoriteBtn.classList.remove('fas');
            favoriteBtn.classList.add('far');
        }
    }
}

// Share app
function shareApp() {
    const app = getAppById(currentAppId);
    if (!app) return;
    
    const shareData = {
        title: app.name,
        text: app.description,
        url: window.location.href
    };
    
    if (navigator.share) {
        navigator.share(shareData);
    } else {
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(window.location.href);
        alert('تم نسخ رابط التطبيق');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadAppDetails();
});

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('show');
    });
}
