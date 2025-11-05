// Contact Page JavaScript

// Handle contact form submission
function handleContactForm(event) {
    event.preventDefault();
    
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const phone = document.getElementById('contactPhone').value;
    const subject = document.getElementById('contactSubject').value;
    const message = document.getElementById('contactMessage').value;
    const captcha = document.getElementById('captcha').checked;
    
    // Validate
    if (!captcha) {
        alert('يرجى التأكيد أنك لست روبوت');
        return;
    }
    
    if (!subject) {
        alert('يرجى اختيار موضوع الرسالة');
        return;
    }
    
    // Save message
    const messages = getMessagesData();
    const newMessage = {
        id: messages.length + 1,
        name: name,
        email: email,
        phone: phone,
        subject: subject,
        message: message,
        date: new Date().toISOString().split('T')[0],
        read: false
    };
    
    messages.push(newMessage);
    saveMessagesData(messages);
    
    // Show success message
    document.getElementById('contactForm').reset();
    const successMessage = document.getElementById('successMessage');
    successMessage.classList.add('show');
    
    // Hide after 5 seconds
    setTimeout(() => {
        successMessage.classList.remove('show');
    }, 5000);
}

// Toggle FAQ items
function toggleFaq(element) {
    const faqItem = element.parentElement;
    const allFaqItems = document.querySelectorAll('.faq-item');
    
    // Close all others
    allFaqItems.forEach(item => {
        if (item !== faqItem) {
            item.classList.remove('active');
        }
    });
    
    // Toggle current
    faqItem.classList.toggle('active');
}

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('show');
    });
}
