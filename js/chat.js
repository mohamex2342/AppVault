// وظائف الدردشة الرئيسية

// تحميل قائمة المستخدمين
async function loadUsers() {
    try {
        // جلب جميع المستخدمين ماعدا المستخدم الحالي
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .neq('id', currentUser.id)
            .order('full_name', { ascending: true });
        
        if (error) throw error;
        
        displayUsers(data);
        
    } catch (error) {
        console.error('خطأ في تحميل المستخدمين:', error);
        showToast('خطأ في تحميل المستخدمين', 'error');
    }
}

// عرض قائمة المستخدمين
function displayUsers(users) {
    const usersList = document.getElementById('users-list');
    
    if (users.length === 0) {
        usersList.innerHTML = `
            <div style="padding: 40px 20px; text-align: center; color: var(--text-light);">
                <i class="fas fa-users" style="font-size: 50px; margin-bottom: 15px; opacity: 0.5;"></i>
                <p>لا يوجد مستخدمون آخرون حالياً</p>
            </div>
        `;
        return;
    }
    
    usersList.innerHTML = users.map(user => `
        <div class="user-item" onclick="openChat('${user.id}', '${user.full_name}')" data-user-id="${user.id}">
            <div class="user-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="user-details">
                <div class="user-name">${user.full_name}</div>
                <div class="last-message" id="last-msg-${user.id}">انقر للبدء في المحادثة</div>
            </div>
            <div class="message-time" id="time-${user.id}"></div>
        </div>
    `).join('');
    
    // تحميل آخر رسالة لكل مستخدم
    users.forEach(user => {
        loadLastMessage(user.id);
    });
}

// تحميل آخر رسالة
async function loadLastMessage(userId) {
    try {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${currentUser.id})`)
            .order('created_at', { ascending: false })
            .limit(1);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
            const message = data[0];
            const lastMsgEl = document.getElementById(`last-msg-${userId}`);
            const timeEl = document.getElementById(`time-${userId}`);
            
            if (lastMsgEl) {
                const prefix = message.sender_id === currentUser.id ? 'أنت: ' : '';
                lastMsgEl.textContent = prefix + message.content;
            }
            
            if (timeEl) {
                timeEl.textContent = formatTime(message.created_at);
            }
        }
        
    } catch (error) {
        console.error('خطأ في تحميل آخر رسالة:', error);
    }
}

// فتح محادثة مع مستخدم
async function openChat(userId, userName) {
    currentChatUserId = userId;
    
    // تحديث واجهة المستخدم
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('chat-screen').style.display = 'flex';
    document.getElementById('current-chat-user').textContent = userName;
    
    // إزالة الكلاس النشط من جميع المستخدمين
    document.querySelectorAll('.user-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // إضافة الكلاس النشط للمستخدم الحالي
    const userItem = document.querySelector(`[data-user-id="${userId}"]`);
    if (userItem) {
        userItem.classList.add('active');
    }
    
    // تحميل الرسائل
    await loadMessages(userId);
    
    // الاشتراك في الرسائل الجديدة
    subscribeToMessages(userId);
}

// تحميل الرسائل
async function loadMessages(userId) {
    try {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${currentUser.id})`)
            .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        displayMessages(data);
        
    } catch (error) {
        console.error('خطأ في تحميل الرسائل:', error);
        showToast('خطأ في تحميل الرسائل', 'error');
    }
}

// عرض الرسائل
function displayMessages(messages) {
    const container = document.getElementById('messages-container');
    
    if (messages.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: var(--text-light); padding: 40px;">
                <i class="fas fa-comment-dots" style="font-size: 50px; margin-bottom: 15px; opacity: 0.3;"></i>
                <p>لا توجد رسائل بعد. ابدأ المحادثة الآن!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = messages.map(msg => {
        const isSent = msg.sender_id === currentUser.id;
        const className = isSent ? 'received' : 'sent';
        
        return `
            <div class="message ${className}">
                <div class="message-content">
                    <div class="message-bubble">${escapeHtml(msg.content)}</div>
                    <div class="message-timestamp">${formatTime(msg.created_at)}</div>
                </div>
            </div>
        `;
    }).join('');
    
    // التمرير إلى آخر رسالة
    scrollToBottom();
}

// إرسال رسالة
async function sendMessage(event) {
    event.preventDefault();
    
    const input = document.getElementById('message-input');
    const content = input.value.trim();
    
    if (!content || !currentChatUserId) return;
    
    try {
        const { data, error } = await supabase
            .from('messages')
            .insert([
                {
                    sender_id: currentUser.id,
                    receiver_id: currentChatUserId,
                    content: content,
                    created_at: new Date().toISOString()
                }
            ])
            .select();
        
        if (error) throw error;
        
        // مسح حقل الإدخال
        input.value = '';
        
        // إضافة الرسالة إلى الواجهة
        if (data && data.length > 0) {
            addMessageToUI(data[0]);
        }
        
        // تحديث آخر رسالة في القائمة
        loadLastMessage(currentChatUserId);
        
    } catch (error) {
        console.error('خطأ في إرسال الرسالة:', error);
        showToast('خطأ في إرسال الرسالة', 'error');
    }
}

// إضافة رسالة إلى الواجهة
function addMessageToUI(message) {
    const container = document.getElementById('messages-container');
    
    // إزالة رسالة "لا توجد رسائل" إذا كانت موجودة
    const emptyState = container.querySelector('div[style*="text-align: center"]');
    if (emptyState) {
        container.innerHTML = '';
    }
    
    const isSent = message.sender_id === currentUser.id;
    const className = isSent ? 'received' : 'sent';
    
    const messageHtml = `
        <div class="message ${className}">
            <div class="message-content">
                <div class="message-bubble">${escapeHtml(message.content)}</div>
                <div class="message-timestamp">${formatTime(message.created_at)}</div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', messageHtml);
    scrollToBottom();
}

// الاشتراك في الرسائل الجديدة (Real-time)
function subscribeToMessages(userId) {
    // إلغاء الاشتراك السابق إذا كان موجوداً
    if (messagesSubscription) {
        messagesSubscription.unsubscribe();
    }
    
    // الاشتراك في الرسائل الجديدة
    messagesSubscription = supabase
        .channel('messages')
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `sender_id=eq.${userId}`
            },
            (payload) => {
                // تحقق من أن الرسالة موجهة للمستخدم الحالي
                if (payload.new.receiver_id === currentUser.id) {
                    addMessageToUI(payload.new);
                    loadLastMessage(userId);
                }
            }
        )
        .subscribe();
}

// إغلاق شاشة الدردشة
function closeChatScreen() {
    document.getElementById('chat-screen').style.display = 'none';
    document.getElementById('welcome-screen').style.display = 'flex';
    
    // إزالة الكلاس النشط
    document.querySelectorAll('.user-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // إلغاء الاشتراك
    if (messagesSubscription) {
        messagesSubscription.unsubscribe();
    }
    
    currentChatUserId = null;
}

// البحث عن مستخدمين
async function searchUsers(query) {
    if (!query.trim()) {
        loadUsers();
        return;
    }
    
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .neq('id', currentUser.id)
            .ilike('full_name', `%${query}%`)
            .order('full_name', { ascending: true });
        
        if (error) throw error;
        
        displayUsers(data);
        
    } catch (error) {
        console.error('خطأ في البحث:', error);
    }
}

// إظهار مودال محادثة جديدة
async function showNewChatModal() {
    document.getElementById('new-chat-modal').style.display = 'flex';
    await loadAllUsers();
}

// إغلاق مودال محادثة جديدة
function closeNewChatModal() {
    document.getElementById('new-chat-modal').style.display = 'none';
    document.getElementById('search-all-users').value = '';
}

// تحميل جميع المستخدمين للمودال
async function loadAllUsers() {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .neq('id', currentUser.id)
            .order('full_name', { ascending: true });
        
        if (error) throw error;
        
        displayAllUsers(data);
        
    } catch (error) {
        console.error('خطأ في تحميل المستخدمين:', error);
    }
}

// عرض جميع المستخدمين في المودال
function displayAllUsers(users) {
    const container = document.getElementById('all-users-list');
    
    if (users.length === 0) {
        container.innerHTML = `
            <div style="padding: 40px 20px; text-align: center; color: var(--text-light);">
                <p>لا يوجد مستخدمون</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = users.map(user => `
        <div class="user-item" onclick="startNewChat('${user.id}', '${user.full_name}')">
            <div class="user-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="user-details">
                <div class="user-name">${user.full_name}</div>
                <div class="last-message">${user.email}</div>
            </div>
        </div>
    `).join('');
}

// بدء محادثة جديدة
function startNewChat(userId, userName) {
    closeNewChatModal();
    openChat(userId, userName);
}

// البحث عن جميع المستخدمين في المودال
async function searchAllUsers(query) {
    if (!query.trim()) {
        loadAllUsers();
        return;
    }
    
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .neq('id', currentUser.id)
            .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
            .order('full_name', { ascending: true });
        
        if (error) throw error;
        
        displayAllUsers(data);
        
    } catch (error) {
        console.error('خطأ في البحث:', error);
    }
}

// التمرير إلى أسفل حاوية الرسائل
function scrollToBottom() {
    const container = document.getElementById('messages-container');
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 100);
}

// تنسيق الوقت
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // إذا كان اليوم
    if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
        return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    }
    
    // إذا كان بالأمس
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.getDate() === yesterday.getDate()) {
        return 'أمس';
    }
    
    // إذا كان في الأسبوع الماضي
    if (diff < 7 * 24 * 60 * 60 * 1000) {
        return date.toLocaleDateString('ar-EG', { weekday: 'long' });
    }
    
    // تاريخ كامل
    return date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
}

// تأمين النصوص من HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
