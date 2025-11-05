// Sample Apps Data
const appsData = [
    {
        id: 1,
        name: 'واتساب ماسنجر',
        category: 'mobile',
        categoryName: 'تطبيقات الهاتف',
        description: 'تطبيق المراسلة الفورية الأكثر شهرة في العالم. يتيح لك إرسال الرسائل النصية، الصوتية، والفيديو مجاناً عبر الإنترنت. كما يدعم المكالمات الصوتية ومكالمات الفيديو الجماعية.',
        features: [
            'مراسلة فورية مجانية',
            'مكالمات صوتية وفيديو عالية الجودة',
            'مشاركة الصور والفيديوهات',
            'رسائل صوتية سريعة',
            'مجموعات تصل إلى 256 عضو',
            'حماية end-to-end encryption',
            'مشاركة الموقع الجغرافي',
            'ملصقات وإيموجي متنوعة'
        ],
        size: '55 MB',
        version: '2.23.25',
        platforms: ['android', 'ios', 'windows'],
        rating: 4.5,
        downloads: 5420,
        date: '2024-01-15',
        icon: 'fab fa-whatsapp',
        downloadUrl: '#'
    },
    {
        id: 2,
        name: 'Adobe Photoshop 2024',
        category: 'computer',
        categoryName: 'برامج الكمبيوتر',
        description: 'برنامج تحرير الصور والتصميم الجرافيكي الاحترافي. يوفر أدوات قوية لتحرير الصور وإنشاء تصاميم إبداعية مذهلة مع دعم الذكاء الاصطناعي.',
        features: [
            'تحرير الصور بدقة عالية',
            'أدوات ذكاء اصطناعي متقدمة',
            'دعم الطبقات Layers',
            'مئات الفلاتر والتأثيرات',
            'إزالة الخلفية تلقائياً',
            'أدوات الرسم الرقمي',
            'دعم ملفات RAW',
            'التكامل مع Adobe Creative Cloud'
        ],
        size: '2.4 GB',
        version: '25.0.1',
        platforms: ['windows', 'mac'],
        rating: 4.8,
        downloads: 3280,
        date: '2024-01-10',
        icon: 'fas fa-image',
        downloadUrl: '#'
    },
    {
        id: 3,
        name: 'تطبيق تعلم اللغة الإنجليزية',
        category: 'educational',
        categoryName: 'أدوات تعليمية',
        description: 'تطبيق تفاعلي لتعلم اللغة الإنجليزية من الصفر حتى الاحتراف. يحتوي على دروس تفاعلية وتمارين عملية واختبارات لتقييم مستواك.',
        features: [
            'دروس يومية تفاعلية',
            'تمارين استماع ونطق',
            'قاموس شامل بأكثر من 10,000 كلمة',
            'اختبارات لقياس التقدم',
            'محادثات صوتية مع الذكاء الاصطناعي',
            'دروس قواعد اللغة',
            'ألعاب تعليمية ممتعة',
            'شهادة إتمام معتمدة'
        ],
        size: '85 MB',
        version: '3.5.2',
        platforms: ['android', 'ios'],
        rating: 4.7,
        downloads: 8650,
        date: '2024-01-20',
        icon: 'fas fa-graduation-cap',
        downloadUrl: '#'
    },
    {
        id: 4,
        name: 'كتاب البرمجة للمبتدئين',
        category: 'pdf',
        categoryName: 'ملفات PDF',
        description: 'كتاب إلكتروني شامل لتعلم أساسيات البرمجة. يغطي مفاهيم البرمجة الأساسية ولغات البرمجة الشائعة مع أمثلة عملية.',
        features: [
            'أكثر من 400 صفحة',
            'أمثلة برمجية عملية',
            'تمارين في نهاية كل فصل',
            'شرح مبسط ومفصل',
            'يغطي Python و JavaScript',
            'رسوم توضيحية ملونة',
            'مشاريع عملية تطبيقية',
            'مناسب للمبتدئين تماماً'
        ],
        size: '12 MB',
        version: '2.0',
        platforms: ['windows', 'android', 'ios', 'mac'],
        rating: 4.9,
        downloads: 12340,
        date: '2024-01-05',
        icon: 'fas fa-file-pdf',
        downloadUrl: '#'
    },
    {
        id: 5,
        name: 'Minecraft',
        category: 'games',
        categoryName: 'ألعاب',
        description: 'لعبة البناء والمغامرات الشهيرة عالمياً. استكشف عوالم لا نهائية وابنِ أي شيء تتخيله في هذه اللعبة الإبداعية.',
        features: [
            'عوالم لا نهائية',
            'وضع البقاء والإبداع',
            'اللعب الجماعي عبر الإنترنت',
            'آلاف المودات والإضافات',
            'بناء وتصميم حر',
            'مغامرات وتحديات',
            'تحديثات منتظمة',
            'مناسبة لجميع الأعمار'
        ],
        size: '650 MB',
        version: '1.20.50',
        platforms: ['windows', 'android', 'ios'],
        rating: 4.6,
        downloads: 25680,
        date: '2024-01-18',
        icon: 'fas fa-gamepad',
        downloadUrl: '#'
    },
    {
        id: 6,
        name: 'تيليجرام',
        category: 'mobile',
        categoryName: 'تطبيقات الهاتف',
        description: 'تطبيق مراسلة فورية سريع وآمن. يتميز بالسرعة الفائقة وحماية الخصوصية وإمكانية إنشاء قنوات ومجموعات كبيرة.',
        features: [
            'مراسلة فائقة السرعة',
            'حماية قوية للخصوصية',
            'قنوات ومجموعات بلا حدود',
            'مشاركة ملفات حتى 2 GB',
            'روبوتات ذكية مفيدة',
            'رسائل ذاتية التدمير',
            'مكالمات صوتية مشفرة',
            'واجهة قابلة للتخصيص'
        ],
        size: '42 MB',
        version: '10.5.2',
        platforms: ['android', 'ios', 'windows', 'mac', 'linux'],
        rating: 4.7,
        downloads: 4320,
        date: '2024-01-22',
        icon: 'fab fa-telegram',
        downloadUrl: '#'
    },
    {
        id: 7,
        name: 'Microsoft Office 2024',
        category: 'computer',
        categoryName: 'برامج الكمبيوتر',
        description: 'حزمة مايكروسوفت أوفيس الكاملة. تشمل Word و Excel و PowerPoint وبرامج أخرى لإنتاجية مكتبية احترافية.',
        features: [
            'Word لمعالجة النصوص',
            'Excel للجداول والحسابات',
            'PowerPoint للعروض التقديمية',
            'Outlook لإدارة البريد',
            'أدوات تعاون سحابية',
            'قوالب احترافية جاهزة',
            'دعم الذكاء الاصطناعي',
            'تحديثات مستمرة'
        ],
        size: '3.2 GB',
        version: '2024',
        platforms: ['windows', 'mac'],
        rating: 4.8,
        downloads: 5890,
        date: '2024-01-08',
        icon: 'fab fa-microsoft',
        downloadUrl: '#'
    },
    {
        id: 8,
        name: 'Duolingo',
        category: 'educational',
        categoryName: 'أدوات تعليمية',
        description: 'تطبيق تعلم اللغات الأكثر شعبية في العالم. تعلم أكثر من 30 لغة بطريقة ممتعة وتفاعلية مع دروس يومية قصيرة.',
        features: [
            'أكثر من 30 لغة متاحة',
            'دروس قصيرة وممتعة',
            'تمارين يومية متنوعة',
            'متابعة التقدم بشكل مفصل',
            'تنافس مع الأصدقاء',
            'شهادات معتمدة',
            'دروس مخصصة حسب المستوى',
            'مجاني بالكامل'
        ],
        size: '68 MB',
        version: '5.118.4',
        platforms: ['android', 'ios'],
        rating: 4.9,
        downloads: 15420,
        date: '2024-01-25',
        icon: 'fas fa-language',
        downloadUrl: '#'
    },
    {
        id: 9,
        name: 'دليل التسويق الإلكتروني',
        category: 'pdf',
        categoryName: 'ملفات PDF',
        description: 'كتاب شامل عن التسويق الإلكتروني واستراتيجيات التسويق الرقمي. يغطي جميع جوانب التسويق عبر الإنترنت من الأساسيات إلى الاحتراف.',
        features: [
            'استراتيجيات التسويق الحديثة',
            'التسويق عبر وسائل التواصل',
            'تحسين محركات البحث SEO',
            'الإعلانات المدفوعة',
            'التسويق بالمحتوى',
            'تحليل البيانات والإحصائيات',
            'دراسات حالة واقعية',
            'أكثر من 300 صفحة'
        ],
        size: '18 MB',
        version: '1.5',
        platforms: ['windows', 'android', 'ios', 'mac'],
        rating: 4.8,
        downloads: 9870,
        date: '2024-01-12',
        icon: 'fas fa-chart-line',
        downloadUrl: '#'
    },
    {
        id: 10,
        name: 'Spotify',
        category: 'mobile',
        categoryName: 'تطبيقات الهاتف',
        description: 'أكبر منصة موسيقى وبودكاست في العالم. استمع إلى ملايين الأغاني والبودكاست بجودة عالية مع قوائم تشغيل مخصصة.',
        features: [
            'ملايين الأغاني',
            'بودكاست متنوعة',
            'قوائم تشغيل مخصصة',
            'جودة صوت عالية',
            'وضع عدم الاتصال',
            'توصيات ذكية',
            'مشاركة الموسيقى مع الأصدقاء',
            'كلمات الأغاني المتزامنة'
        ],
        size: '95 MB',
        version: '8.8.92',
        platforms: ['android', 'ios', 'windows'],
        rating: 4.6,
        downloads: 18650,
        date: '2024-01-28',
        icon: 'fab fa-spotify',
        downloadUrl: '#'
    },
    {
        id: 11,
        name: 'VLC Media Player',
        category: 'computer',
        categoryName: 'برامج الكمبيوتر',
        description: 'مشغل الوسائط الأكثر شعبية. يدعم جميع صيغ الفيديو والصوت بدون الحاجة لتثبيت أي إضافات.',
        features: [
            'دعم جميع صيغ الفيديو والصوت',
            'واجهة سهلة الاستخدام',
            'تشغيل ملفات التورنت',
            'دعم الترجمة',
            'معادل صوت متقدم',
            'تسجيل الشاشة',
            'بث الوسائط عبر الشبكة',
            'مجاني ومفتوح المصدر'
        ],
        size: '42 MB',
        version: '3.0.20',
        platforms: ['windows', 'mac', 'linux'],
        rating: 4.9,
        downloads: 7650,
        date: '2024-01-14',
        icon: 'fas fa-play-circle',
        downloadUrl: '#'
    },
    {
        id: 12,
        name: 'Khan Academy',
        category: 'educational',
        categoryName: 'أدوات تعليمية',
        description: 'منصة تعليمية مجانية شاملة. تقدم دروس في الرياضيات والعلوم والبرمجة وغيرها مع فيديوهات تعليمية وتمارين تفاعلية.',
        features: [
            'آلاف الدروس المجانية',
            'فيديوهات تعليمية عالية الجودة',
            'تمارين تفاعلية',
            'متابعة التقدم الدراسي',
            'مواد في جميع المجالات',
            'مناسب لجميع الأعمار',
            'اختبارات وتقييمات',
            'تعلم حسب سرعتك الخاصة'
        ],
        size: '52 MB',
        version: '7.3.1',
        platforms: ['android', 'ios'],
        rating: 4.8,
        downloads: 11230,
        date: '2024-01-19',
        icon: 'fas fa-book',
        downloadUrl: '#'
    },
    {
        id: 13,
        name: 'دليل تصميم المواقع',
        category: 'pdf',
        categoryName: 'ملفات PDF',
        description: 'كتاب شامل لتصميم وتطوير مواقع الويب. يشمل HTML و CSS و JavaScript مع أمثلة عملية ومشاريع تطبيقية.',
        features: [
            'تعلم HTML5 و CSS3',
            'JavaScript والبرمجة التفاعلية',
            'تصميم متجاوب Responsive',
            'أفضل ممارسات التصميم',
            'مشاريع عملية متكاملة',
            'أمثلة وأكواد جاهزة',
            'أكثر من 500 صفحة',
            'مناسب للمبتدئين والمحترفين'
        ],
        size: '25 MB',
        version: '3.0',
        platforms: ['windows', 'android', 'ios', 'mac'],
        rating: 4.7,
        downloads: 8420,
        date: '2024-01-16',
        icon: 'fas fa-code',
        downloadUrl: '#'
    },
    {
        id: 14,
        name: 'Among Us',
        category: 'games',
        categoryName: 'ألعاب',
        description: 'لعبة الغموض والاستراتيجية الشهيرة. العب مع الأصدقاء واكتشف من هو المحتال بينكم في هذه اللعبة الممتعة.',
        features: [
            'لعب جماعي مثير',
            'أوضاع لعب متنوعة',
            'خرائط مختلفة',
            'دردشة صوتية ونصية',
            'تخصيص الشخصيات',
            'مهام تفاعلية',
            'تحديثات جديدة',
            'مناسبة للعب مع الأصدقاء'
        ],
        size: '250 MB',
        version: '2024.3.5',
        platforms: ['android', 'ios', 'windows'],
        rating: 4.5,
        downloads: 32450,
        date: '2024-01-21',
        icon: 'fas fa-user-secret',
        downloadUrl: '#'
    },
    {
        id: 15,
        name: 'Zoom',
        category: 'computer',
        categoryName: 'برامج الكمبيوتر',
        description: 'تطبيق مؤتمرات الفيديو الأكثر استخداماً. مثالي للاجتماعات عن بُعد والتعليم الإلكتروني مع جودة صوت وصورة عالية.',
        features: [
            'مكالمات فيديو عالية الجودة',
            'مشاركة الشاشة',
            'غرف اجتماعات جانبية',
            'تسجيل الاجتماعات',
            'خلفيات افتراضية',
            'دردشة جماعية',
            'حتى 100 مشارك',
            'سهل الاستخدام'
        ],
        size: '125 MB',
        version: '5.17.0',
        platforms: ['windows', 'mac', 'android', 'ios'],
        rating: 4.7,
        downloads: 14580,
        date: '2024-01-23',
        icon: 'fas fa-video',
        downloadUrl: '#'
    }
];

// Sample Reviews Data
const reviewsData = [
    {
        id: 1,
        appId: 1,
        userName: 'أحمد محمد',
        rating: 5,
        comment: 'تطبيق رائع ومفيد جداً! استخدمه يومياً للتواصل مع العائلة والأصدقاء.',
        date: '2024-01-20'
    },
    {
        id: 2,
        appId: 1,
        userName: 'فاطمة علي',
        rating: 4,
        comment: 'ممتاز ولكن يحتاج لتحسين في واجهة المستخدم.',
        date: '2024-01-18'
    },
    {
        id: 3,
        appId: 2,
        userName: 'محمد حسن',
        rating: 5,
        comment: 'أفضل برنامج لتحرير الصور! الإمكانيات لا محدودة.',
        date: '2024-01-15'
    },
    {
        id: 4,
        appId: 3,
        userName: 'سارة أحمد',
        rating: 5,
        comment: 'ساعدني كثيراً في تحسين لغتي الإنجليزية. التطبيق تفاعلي وممتع.',
        date: '2024-01-22'
    },
    {
        id: 5,
        appId: 4,
        userName: 'علي محمود',
        rating: 5,
        comment: 'كتاب شامل ومفيد للمبتدئين في البرمجة.',
        date: '2024-01-10'
    }
];

// Sample Users Data
const usersData = [
    {
        id: 1,
        name: 'محمد أحمد',
        email: 'user1@example.com',
        password: 'user123',
        favorites: [1, 3, 5],
        downloads: [1, 2, 3, 4, 5],
        reviews: [1],
        joinDate: '2023-12-01'
    },
    {
        id: 2,
        name: 'فاطمة علي',
        email: 'user2@example.com',
        password: 'user123',
        favorites: [2, 4, 6],
        downloads: [2, 4, 6, 8],
        reviews: [2],
        joinDate: '2023-11-15'
    }
];

// Sample Admin Data
const adminData = {
    email: 'admin@appvault.com',
    password: 'admin123',
    name: 'المسؤول'
};

// Sample Messages/Contact Data
const messagesData = [
    {
        id: 1,
        name: 'أحمد محمد',
        email: 'ahmed@example.com',
        phone: '+20 123 456 7890',
        subject: 'support',
        message: 'مشكلة في تحميل أحد التطبيقات',
        date: '2024-01-28',
        read: false
    },
    {
        id: 2,
        name: 'سارة حسن',
        email: 'sara@example.com',
        phone: '+20 987 654 3210',
        subject: 'suggestion',
        message: 'أقترح إضافة تطبيقات تعليمية أكثر',
        date: '2024-01-27',
        read: false
    },
    {
        id: 3,
        name: 'محمود علي',
        email: 'mahmoud@example.com',
        phone: '',
        subject: 'partnership',
        message: 'أريد التعاون معكم في نشر تطبيقاتي',
        date: '2024-01-26',
        read: false
    }
];

// Initialize localStorage with sample data if empty
function initializeData() {
    if (!localStorage.getItem('appsData')) {
        localStorage.setItem('appsData', JSON.stringify(appsData));
    }
    if (!localStorage.getItem('reviewsData')) {
        localStorage.setItem('reviewsData', JSON.stringify(reviewsData));
    }
    if (!localStorage.getItem('usersData')) {
        localStorage.setItem('usersData', JSON.stringify(usersData));
    }
    if (!localStorage.getItem('messagesData')) {
        localStorage.setItem('messagesData', JSON.stringify(messagesData));
    }
}

// Get data from localStorage
function getAppsData() {
    const data = localStorage.getItem('appsData');
    return data ? JSON.parse(data) : appsData;
}

function getReviewsData() {
    const data = localStorage.getItem('reviewsData');
    return data ? JSON.parse(data) : reviewsData;
}

function getUsersData() {
    const data = localStorage.getItem('usersData');
    return data ? JSON.parse(data) : usersData;
}

function getMessagesData() {
    const data = localStorage.getItem('messagesData');
    return data ? JSON.parse(data) : messagesData;
}

// Save data to localStorage
function saveAppsData(data) {
    localStorage.setItem('appsData', JSON.stringify(data));
}

function saveReviewsData(data) {
    localStorage.setItem('reviewsData', JSON.stringify(data));
}

function saveUsersData(data) {
    localStorage.setItem('usersData', JSON.stringify(data));
}

function saveMessagesData(data) {
    localStorage.setItem('messagesData', JSON.stringify(data));
}

// Get current user
function getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
}

// Get app by ID
function getAppById(id) {
    const apps = getAppsData();
    return apps.find(app => app.id === parseInt(id));
}

// Get reviews for app
function getAppReviews(appId) {
    const reviews = getReviewsData();
    return reviews.filter(review => review.appId === parseInt(appId));
}

// Initialize data when page loads
initializeData();
