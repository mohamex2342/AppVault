// Admin Authentication JavaScript

// Handle admin login
function handleAdminLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    
    // Check credentials (using data.js adminData)
    if (email === 'admin@appvault.com' && password === 'admin123') {
        localStorage.setItem('adminLoggedIn', 'true');
        alert('تم تسجيل الدخول بنجاح!');
        window.location.href = 'admin-dashboard.html';
    } else {
        alert('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }
}

// Toggle password visibility
function toggleAdminPassword() {
    const input = document.getElementById('adminPassword');
    const button = event.currentTarget;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Check if already logged in
document.addEventListener('DOMContentLoaded', () => {
    const isAdminLoggedIn = localStorage.getItem('adminLoggedIn');
    if (isAdminLoggedIn === 'true' && window.location.pathname.includes('admin-login.html')) {
        window.location.href = 'admin-dashboard.html';
    }
});
