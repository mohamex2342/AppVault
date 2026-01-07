// =====================================================
// ملف إدارة المحادثات والرسائل
// Chat & Messages Management
// =====================================================

const { supabase, getCurrentUser, getUserProfile, signOut } = window.authUtils;

// متغيرات عامة
let currentUser = null;
let currentConversation = null;
let conversations = [];
let messages = [];
let allUsers = [];
let messageSubscription = null;
let conversationSubscription = null;

// =====================================================
// تهيئة التطبيق عند تحميل الصفحة
// =====================================================
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // التحقق من تسجيل الدخول
        currentUser = await getCurrentUser();
        
        if (!currentUser) {
            window.location.href = 'auth.html';
            return;
        }
        
        // تحميل بيانات المستخدم
        await loadUserProfile();
        
        // تحميل المحادثات
        await loadConversations();
        
        // تحميل جميع المستخدمين
        await loadAllUsers();
        
        // الاشتراك في التحديثات الفورية
        subscribeToMessages();
        subscribeToConversations();
        
        // إعداد الأحداث
        setupEventListeners();
        
        // إخفاء شاشة التحميل
        document.getElementById('loadingScreen').classList.add('hidden');
        
    } catch (error) {
        console.error('خطأ في تهيئة التطبيق:', error);
        alert('حدث خطأ في تحميل التطبيق. يرجى المحاولة مرة أخرى.');
    }
});

// =====================================================
// تحميل معلومات المستخدم
// =====================================================
async function loadUserProfile() {
    try {
        const profile = await getUserProfile(currentUser.id);
        
        document.getElementById('userName').textContent = profile.full_name;
        
        if (profile.avatar_url) {
            document.getElementById('userAvatar').src = profile.avatar_url;
            document.getElementById('userAvatar').style.display = 'block';
        }
        
        // تحديث حالة المستخدم إلى online
        await supabase
            .from('profiles')
            .update({ status: 'online', last_seen: new Date().toISOString() })
            .eq('id', currentUser.id);
        
    } catch (error) {
        console.error('خطأ في تحميل معلومات المستخدم:', error);
    }
}

// =====================================================
// تحميل جميع المحادثات
// =====================================================
async function loadConversations() {
    try {
        // الحصول على المحادثات التي يشارك فيها المستخدم
        const { data: memberData, error: memberError } = await supabase
            .from('conversation_members')
            .select('conversation_id')
            .eq('user_id', currentUser.id);
        
        if (memberError) throw memberError;
        
        const conversationIds = memberData.map(m => m.conversation_id);
        
        if (conversationIds.length === 0) {
            renderConversations([]);
            return;
        }
        
        // الحصول على تفاصيل المحادثات
        const { data: convData, error: convError } = await supabase
            .from('conversations')
            .select('*')
            .in('id', conversationIds)
            .order('updated_at', { ascending: false });
        
        if (convError) throw convError;
        
        // إضافة معلومات إضافية لكل محادثة
        for (let conv of convData) {
            // الحصول على آخر رسالة
            const { data: lastMsg } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conv.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
            
            conv.lastMessage = lastMsg;
            
            // الحصول على عدد الرسائل غير المقروءة
            const { data: memberInfo } = await supabase
                .from('conversation_members')
                .select('unread_count')
                .eq('conversation_id', conv.id)
                .eq('user_id', currentUser.id)
                .single();
            
            conv.unreadCount = memberInfo?.unread_count || 0;
            
            // إذا كانت محادثة فردية، احصل على بيانات المستخدم الآخر
            if (conv.type === 'private') {
                const { data: members } = await supabase
                    .from('conversation_members')
                    .select('user_id')
                    .eq('conversation_id', conv.id)
                    .neq('user_id', currentUser.id);
                
                if (members && members.length > 0) {
                    const otherUserId = members[0].user_id;
                    const otherUserProfile = await getUserProfile(otherUserId);
                    conv.otherUser = otherUserProfile;
                }
            }
        }
        
        conversations = convData;
        renderConversations(conversations);
        
    } catch (error) {
        console.error('خطأ في تحميل المحادثات:', error);
    }
}

// =====================================================
// عرض قائمة المحادثات
// =====================================================
function renderConversations(convs) {
    const container = document.getElementById('conversationsList');
    
    if (convs.length === 0) {
        container.innerHTML = `
            <div style="padding: 40px 20px; text-align: center; color: var(--text-muted);">
                <i class="fas fa-comments fa-3x" style="margin-bottom: 15px; opacity: 0.5;"></i>
                <p>لا توجد محادثات بعد</p>
                <p style="font-size: 14px;">ابدأ محادثة جديدة الآن!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = convs.map(conv => {
        const name = conv.type === 'group' ? conv.name : (conv.otherUser?.full_name || 'مستخدم');
        const avatar = conv.type === 'group' ? conv.avatar_url : conv.otherUser?.avatar_url;
        const status = conv.type === 'group' ? '' : conv.otherUser?.status;
        const lastMessage = conv.lastMessage?.content || 'لا توجد رسائل';
        const lastMessageTime = conv.lastMessage ? formatTime(conv.lastMessage.created_at) : '';
        const unreadBadge = conv.unreadCount > 0 ? `<span class="unread-badge">${conv.unreadCount}</span>` : '';
        const onlineIndicator = status === 'online' ? '<span class="online-indicator"></span>' : '';
        
        return `
            <div class="conversation-item" data-id="${conv.id}">
                <div class="conversation-avatar">
                    ${avatar ? `<img src="${avatar}" alt="${name}">` : `<div class="avatar-placeholder"><i class="fas fa-${conv.type === 'group' ? 'users' : 'user'}"></i></div>`}
                    ${onlineIndicator}
                </div>
                <div class="conversation-info">
                    <div class="conversation-header">
                        <span class="conversation-name">${name}</span>
                        <span class="conversation-time">${lastMessageTime}</span>
                    </div>
                    <div class="conversation-preview">
                        <span class="last-message">${truncateText(lastMessage, 40)}</span>
                        ${unreadBadge}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // إضافة حدث النقر على المحادثات
    document.querySelectorAll('.conversation-item').forEach(item => {
        item.addEventListener('click', () => {
            const convId = item.dataset.id;
            openConversation(convId);
        });
    });
}

// =====================================================
// فتح محادثة
// =====================================================
async function openConversation(conversationId) {
    try {
        // العثور على المحادثة
        const conv = conversations.find(c => c.id === conversationId);
        if (!conv) return;
        
        currentConversation = conv;
        
        // تحديث واجهة المستخدم
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('chatHeader').style.display = 'flex';
        document.getElementById('messagesContainer').style.display = 'block';
        document.getElementById('messageInputContainer').style.display = 'flex';
        
        // تحديث معلومات المحادثة في الرأس
        const name = conv.type === 'group' ? conv.name : (conv.otherUser?.full_name || 'مستخدم');
        const avatar = conv.type === 'group' ? conv.avatar_url : conv.otherUser?.avatar_url;
        const status = conv.type === 'group' ? `${await getGroupMembersCount(conv.id)} أعضاء` : 
                       (conv.otherUser?.status === 'online' ? 'متصل الآن' : `آخر ظهور ${formatTime(conv.otherUser?.last_seen)}`);
        
        document.getElementById('chatName').textContent = name;
        document.getElementById('chatStatus').textContent = status;
        
        if (avatar) {
            document.getElementById('chatAvatar').src = avatar;
            document.getElementById('chatAvatar').style.display = 'block';
        } else {
            document.getElementById('chatAvatar').style.display = 'none';
        }
        
        // إظهار/إخفاء مؤشر الاتصال
        const onlineIndicator = document.getElementById('onlineIndicator');
        if (conv.type === 'private' && conv.otherUser?.status === 'online') {
            onlineIndicator.style.display = 'block';
        } else {
            onlineIndicator.style.display = 'none';
        }
        
        // تحديد المحادثة النشطة في القائمة
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.id === conversationId) {
                item.classList.add('active');
            }
        });
        
        // تحميل الرسائل
        await loadMessages(conversationId);
        
        // تحديث عداد الرسائل غير المقروءة
        await markConversationAsRead(conversationId);
        
        // للهواتف المحمولة: إخفاء الشريط الجانبي
        if (window.innerWidth <= 768) {
            document.getElementById('sidebar').classList.add('hidden');
        }
        
    } catch (error) {
        console.error('خطأ في فتح المحادثة:', error);
    }
}

// =====================================================
// تحميل رسائل المحادثة
// =====================================================
async function loadMessages(conversationId) {
    try {
        const { data, error } = await supabase
            .from('messages')
            .select('*, sender:profiles(*)')
            .eq('conversation_id', conversationId)
            .eq('is_deleted', false)
            .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        messages = data;
        renderMessages(messages);
        
        // التمرير إلى آخر رسالة
        scrollToBottom();
        
    } catch (error) {
        console.error('خطأ في تحميل الرسائل:', error);
    }
}

// =====================================================
// عرض الرسائل
// =====================================================
function renderMessages(msgs) {
    const container = document.getElementById('messagesContainer');
    
    if (msgs.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                <i class="fas fa-comments fa-3x" style="margin-bottom: 15px; opacity: 0.3;"></i>
                <p>لا توجد رسائل في هذه المحادثة</p>
                <p style="font-size: 14px;">كن أول من يبدأ المحادثة!</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    let lastDate = null;
    
    msgs.forEach((msg, index) => {
        const msgDate = new Date(msg.created_at).toDateString();
        
        // إضافة فاصل التاريخ
        if (msgDate !== lastDate) {
            html += `<div class="date-divider"><span>${formatDate(msg.created_at)}</span></div>`;
            lastDate = msgDate;
        }
        
        const isSent = msg.sender_id === currentUser.id;
        const messageClass = isSent ? 'sent' : 'received';
        const senderName = msg.sender?.full_name || 'مستخدم';
        const senderAvatar = msg.sender?.avatar_url;
        const showSender = !isSent && currentConversation?.type === 'group';
        
        html += `
            <div class="message ${messageClass}">
                ${!isSent ? `
                    <div class="message-avatar">
                        ${senderAvatar ? `<img src="${senderAvatar}" alt="${senderName}">` : `<div class="avatar-placeholder"><i class="fas fa-user"></i></div>`}
                    </div>
                ` : ''}
                <div class="message-content">
                    ${showSender ? `<div class="message-sender">${senderName}</div>` : ''}
                    <div class="message-bubble">
                        ${renderMessageContent(msg)}
                        <div class="message-time">
                            ${formatTime(msg.created_at)}
                            ${isSent ? '<i class="fas fa-check-double"></i>' : ''}
                        </div>
                    </div>
                </div>
                ${isSent ? `
                    <div class="message-avatar">
                        ${currentUser.avatar_url ? `<img src="${currentUser.avatar_url}" alt="أنت">` : `<div class="avatar-placeholder"><i class="fas fa-user"></i></div>`}
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// =====================================================
// عرض محتوى الرسالة حسب النوع
// =====================================================
function renderMessageContent(msg) {
    let content = '';
    
    // عرض الملفات المرفقة
    if (msg.type !== 'text' && msg.file_url) {
        if (msg.type === 'image') {
            content += `<div class="message-media"><img src="${msg.file_url}" alt="صورة" onclick="viewMedia('${msg.file_url}', 'image')"></div>`;
        } else if (msg.type === 'video') {
            content += `<div class="message-media"><video controls playsinline webkit-playsinline><source src="${msg.file_url}" type="video/mp4"></video></div>`;
        } else if (msg.type === 'audio') {
            content += `<div class="message-media"><audio controls><source src="${msg.file_url}"></audio></div>`;
        } else if (msg.type === 'file') {
            const fileSize = msg.file_size ? formatFileSize(msg.file_size) : '';
            content += `
                <div class="message-file" onclick="window.open('${msg.file_url}', '_blank')">
                    <div class="file-icon"><i class="fas fa-file"></i></div>
                    <div class="file-info">
                        <div class="file-name">${msg.file_name || 'ملف'}</div>
                        <div class="file-size">${fileSize}</div>
                    </div>
                    <i class="fas fa-download"></i>
                </div>
            `;
        }
    }
    
    // عرض النص
    if (msg.content) {
        content += `<div class="message-text">${escapeHtml(msg.content)}</div>`;
    }
    
    return content;
}

// =====================================================
// إرسال رسالة
// =====================================================
async function sendMessage(content, type = 'text', fileUrl = null, fileName = null, fileSize = null, fileType = null) {
    if (!currentConversation) return;
    
    try {
        const { data, error } = await supabase
            .from('messages')
            .insert({
                conversation_id: currentConversation.id,
                sender_id: currentUser.id,
                content: content,
                type: type,
                file_url: fileUrl,
                file_name: fileName,
                file_size: fileSize,
                file_type: fileType
            })
            .select()
            .single();
        
        if (error) throw error;
        
        // إضافة الرسالة للقائمة المحلية
        data.sender = await getUserProfile(currentUser.id);
        messages.push(data);
        renderMessages(messages);
        scrollToBottom();
        
        // تحديث وقت آخر تحديث للمحادثة
        await supabase
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', currentConversation.id);
        
    } catch (error) {
        console.error('خطأ في إرسال الرسالة:', error);
        alert('فشل إرسال الرسالة. يرجى المحاولة مرة أخرى.');
    }
}

// =====================================================
// تحميل جميع المستخدمين
// =====================================================
async function loadAllUsers() {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .neq('id', currentUser.id)
            .order('full_name');
        
        if (error) throw error;
        
        allUsers = data;
        
    } catch (error) {
        console.error('خطأ في تحميل المستخدمين:', error);
    }
}

// =====================================================
// بدء محادثة جديدة
// =====================================================
async function startNewChat(userId) {
    try {
        // التحقق من وجود محادثة سابقة
        const existingConv = conversations.find(c => 
            c.type === 'private' && c.otherUser?.id === userId
        );
        
        if (existingConv) {
            // فتح المحادثة الموجودة
            closeModal('newChatModal');
            openConversation(existingConv.id);
            return;
        }
        
        // إنشاء محادثة جديدة
        const { data: convData, error: convError } = await supabase
            .from('conversations')
            .insert({
                type: 'private',
                created_by: currentUser.id
            })
            .select()
            .single();
        
        if (convError) throw convError;
        
        // إضافة الأعضاء
        const { error: membersError } = await supabase
            .from('conversation_members')
            .insert([
                { conversation_id: convData.id, user_id: currentUser.id },
                { conversation_id: convData.id, user_id: userId }
            ]);
        
        if (membersError) throw membersError;
        
        // إعادة تحميل المحادثات
        await loadConversations();
        
        // فتح المحادثة الجديدة
        closeModal('newChatModal');
        openConversation(convData.id);
        
    } catch (error) {
        console.error('خطأ في بدء محادثة جديدة:', error);
        alert('فشل إنشاء المحادثة. يرجى المحاولة مرة أخرى.');
    }
}

// =====================================================
// إنشاء مجموعة جديدة
// =====================================================
async function createNewGroup(groupName, groupAvatar, memberIds) {
    try {
        let avatarUrl = null;
        
        // رفع صورة المجموعة إذا وجدت
        if (groupAvatar) {
            const fileExt = groupAvatar.name.split('.').pop();
            const fileName = `group-${Date.now()}.${fileExt}`;
            const filePath = `groups/${fileName}`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('chat-files')
                .upload(filePath, groupAvatar);
            
            if (uploadError) throw uploadError;
            
            const { data: urlData } = supabase.storage
                .from('chat-files')
                .getPublicUrl(filePath);
            
            avatarUrl = urlData.publicUrl;
        }
        
        // إنشاء المجموعة
        const { data: groupData, error: groupError } = await supabase
            .from('conversations')
            .insert({
                type: 'group',
                name: groupName,
                avatar_url: avatarUrl,
                created_by: currentUser.id
            })
            .select()
            .single();
        
        if (groupError) throw groupError;
        
        // إضافة الأعضاء (بما فيهم منشئ المجموعة)
        const members = [
            { conversation_id: groupData.id, user_id: currentUser.id, role: 'admin' },
            ...memberIds.map(id => ({ conversation_id: groupData.id, user_id: id, role: 'member' }))
        ];
        
        const { error: membersError } = await supabase
            .from('conversation_members')
            .insert(members);
        
        if (membersError) throw membersError;
        
        // إعادة تحميل المحادثات
        await loadConversations();
        
        // فتح المجموعة الجديدة
        closeModal('newGroupModal');
        openConversation(groupData.id);
        
    } catch (error) {
        console.error('خطأ في إنشاء المجموعة:', error);
        alert('فشل إنشاء المجموعة. يرجى المحاولة مرة أخرى.');
    }
}

// =====================================================
// الاشتراك في الرسائل الجديدة (Realtime)
// =====================================================
function subscribeToMessages() {
    messageSubscription = supabase
        .channel('messages-channel')
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'messages'
            },
            async (payload) => {
                const newMessage = payload.new;
                
                // إذا كانت الرسالة في المحادثة الحالية
                if (currentConversation && newMessage.conversation_id === currentConversation.id) {
                    // إضافة بيانات المرسل
                    newMessage.sender = await getUserProfile(newMessage.sender_id);
                    
                    // إضافة الرسالة للقائمة
                    messages.push(newMessage);
                    renderMessages(messages);
                    scrollToBottom();
                    
                    // تشغيل صوت الإشعار إذا لم تكن الرسالة من المستخدم الحالي
                    if (newMessage.sender_id !== currentUser.id) {
                        playNotificationSound();
                        markConversationAsRead(currentConversation.id);
                    }
                } else {
                    // تحديث قائمة المحادثات
                    await loadConversations();
                    
                    // تشغيل صوت الإشعار
                    if (newMessage.sender_id !== currentUser.id) {
                        playNotificationSound();
                    }
                }
            }
        )
        .subscribe();
}

// =====================================================
// الاشتراك في تحديثات المحادثات
// =====================================================
function subscribeToConversations() {
    conversationSubscription = supabase
        .channel('conversations-channel')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'conversations'
            },
            async () => {
                await loadConversations();
            }
        )
        .subscribe();
}

// =====================================================
// تعيين المحادثة كمقروءة
// =====================================================
async function markConversationAsRead(conversationId) {
    try {
        await supabase
            .from('conversation_members')
            .update({ 
                unread_count: 0,
                last_read_at: new Date().toISOString()
            })
            .eq('conversation_id', conversationId)
            .eq('user_id', currentUser.id);
        
        // تحديث واجهة المستخدم
        const convItem = document.querySelector(`.conversation-item[data-id="${conversationId}"]`);
        if (convItem) {
            const badge = convItem.querySelector('.unread-badge');
            if (badge) badge.remove();
        }
        
    } catch (error) {
        console.error('خطأ في تعيين المحادثة كمقروءة:', error);
    }
}

// =====================================================
// الحصول على عدد أعضاء المجموعة
// =====================================================
async function getGroupMembersCount(conversationId) {
    try {
        const { count, error } = await supabase
            .from('conversation_members')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conversationId);
        
        if (error) throw error;
        
        return count || 0;
        
    } catch (error) {
        console.error('خطأ في الحصول على عدد الأعضاء:', error);
        return 0;
    }
}

// =====================================================
// إعداد مستمعي الأحداث
// =====================================================
function setupEventListeners() {
    // زر تسجيل الخروج
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
            await signOut();
        }
    });
    
    // زر محادثة جديدة
    document.getElementById('newChatBtn').addEventListener('click', () => {
        openModal('newChatModal');
        renderUsersList(allUsers, 'usersList', false);
    });
    
    // زر مجموعة جديدة
    document.getElementById('newGroupBtn').addEventListener('click', () => {
        openModal('newGroupModal');
        renderUsersList(allUsers, 'groupMembersList', true);
    });
    
    // زر الملف الشخصي
    document.getElementById('profileBtn').addEventListener('click', () => {
        window.location.href = 'profile.html';
    });
    
    // زر بدء محادثة من الحالة الفارغة
    document.getElementById('startChatBtn').addEventListener('click', () => {
        openModal('newChatModal');
        renderUsersList(allUsers, 'usersList', false);
    });
    
    // زر إرسال الرسالة
    document.getElementById('sendBtn').addEventListener('click', handleSendMessage);
    
    // الضغط على Enter لإرسال الرسالة
    document.getElementById('messageInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });
    
    // تعديل ارتفاع حقل النص تلقائياً
    document.getElementById('messageInput').addEventListener('input', (e) => {
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    });
    
    // زر إرفاق ملف
    document.getElementById('attachBtn').addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });
    
    // عند اختيار ملف
    document.getElementById('fileInput').addEventListener('change', handleFileSelect);
    
    // زر إنشاء مجموعة
    document.getElementById('createGroupBtn').addEventListener('click', handleCreateGroup);
    
    // البحث في المستخدمين (محادثة جديدة)
    document.getElementById('searchUsers').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = allUsers.filter(u => 
            u.full_name.toLowerCase().includes(query) || 
            u.email.toLowerCase().includes(query)
        );
        renderUsersList(filtered, 'usersList', false);
    });
    
    // البحث في المستخدمين (مجموعة جديدة)
    document.getElementById('searchGroupMembers').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = allUsers.filter(u => 
            u.full_name.toLowerCase().includes(query) || 
            u.email.toLowerCase().includes(query)
        );
        renderUsersList(filtered, 'groupMembersList', true);
    });
    
    // البحث في المحادثات
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = conversations.filter(c => {
            const name = c.type === 'group' ? c.name : c.otherUser?.full_name;
            return name?.toLowerCase().includes(query);
        });
        renderConversations(filtered);
    });
    
    // زر الرجوع للهواتف
    document.getElementById('mobileBackBtn').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('hidden');
        document.getElementById('emptyState').style.display = 'flex';
        document.getElementById('chatHeader').style.display = 'none';
        document.getElementById('messagesContainer').style.display = 'none';
        document.getElementById('messageInputContainer').style.display = 'none';
    });
    
    // إغلاق النوافذ المنبثقة
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal(btn.dataset.modal);
        });
    });
    
    // إغلاق النافذة عند النقر خارجها
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
}

// =====================================================
// معالجة إرسال الرسالة
// =====================================================
async function handleSendMessage() {
    const input = document.getElementById('messageInput');
    const content = input.value.trim();
    
    if (!content || !currentConversation) return;
    
    await sendMessage(content);
    
    input.value = '';
    input.style.height = 'auto';
}

// =====================================================
// معالجة اختيار الملف
// =====================================================
function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length === 0) return;
    
    // عرض معاينة الملف
    const file = files[0];
    const fileType = file.type.split('/')[0];
    
    const previewArea = document.getElementById('filePreview');
    
    if (fileType === 'image') {
        const reader = new FileReader();
        reader.onload = (event) => {
            previewArea.innerHTML = `<img src="${event.target.result}" alt="Preview" style="max-width: 100%; max-height: 400px; border-radius: 8px;">`;
        };
        reader.readAsDataURL(file);
    } else if (fileType === 'video') {
        previewArea.innerHTML = `
            <video controls style="max-width: 100%; max-height: 400px; border-radius: 8px;">
                <source src="${URL.createObjectURL(file)}" type="${file.type}">
            </video>
        `;
    } else if (fileType === 'audio') {
        previewArea.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-music fa-3x" style="color: var(--primary-color); margin-bottom: 20px;"></i>
                <p><strong>${file.name}</strong></p>
                <p style="color: var(--text-muted); font-size: 14px;">${formatFileSize(file.size)}</p>
            </div>
        `;
    } else {
        previewArea.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-file fa-3x" style="color: var(--primary-color); margin-bottom: 20px;"></i>
                <p><strong>${file.name}</strong></p>
                <p style="color: var(--text-muted); font-size: 14px;">${formatFileSize(file.size)}</p>
            </div>
        `;
    }
    
    openModal('filePreviewModal');
}

// =====================================================
// معالجة إنشاء المجموعة
// =====================================================
async function handleCreateGroup() {
    const groupName = document.getElementById('groupName').value.trim();
    const groupAvatarInput = document.getElementById('groupAvatar');
    const selectedUsers = document.querySelectorAll('#groupMembersList .user-item.selected');
    
    if (!groupName) {
        alert('يرجى إدخال اسم المجموعة');
        return;
    }
    
    if (selectedUsers.length === 0) {
        alert('يرجى اختيار عضو واحد على الأقل');
        return;
    }
    
    const memberIds = Array.from(selectedUsers).map(item => item.dataset.userId);
    const groupAvatar = groupAvatarInput.files.length > 0 ? groupAvatarInput.files[0] : null;
    
    await createNewGroup(groupName, groupAvatar, memberIds);
}

// =====================================================
// عرض قائمة المستخدمين
// =====================================================
function renderUsersList(users, containerId, multiSelect = false) {
    const container = document.getElementById(containerId);
    
    if (users.length === 0) {
        container.innerHTML = `
            <div style="padding: 20px; text-align: center; color: var(--text-muted);">
                <p>لا توجد نتائج</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = users.map(user => `
        <div class="user-item" data-user-id="${user.id}">
            <div class="user-item-avatar">
                ${user.avatar_url ? `<img src="${user.avatar_url}" alt="${user.full_name}">` : `<div class="avatar-placeholder"><i class="fas fa-user"></i></div>`}
            </div>
            <div class="user-item-info">
                <div class="user-item-name">${user.full_name}</div>
                <div class="user-item-email">${user.email}</div>
            </div>
            ${multiSelect ? '<div class="user-item-checkbox"></div>' : ''}
        </div>
    `).join('');
    
    // إضافة أحداث النقر
    container.querySelectorAll('.user-item').forEach(item => {
        item.addEventListener('click', () => {
            if (multiSelect) {
                item.classList.toggle('selected');
                const checkbox = item.querySelector('.user-item-checkbox');
                if (item.classList.contains('selected')) {
                    checkbox.innerHTML = '<i class="fas fa-check"></i>';
                } else {
                    checkbox.innerHTML = '';
                }
            } else {
                const userId = item.dataset.userId;
                startNewChat(userId);
            }
        });
    });
}

// =====================================================
// فتح نافذة منبثقة
// =====================================================
function openModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

// =====================================================
// إغلاق نافذة منبثقة
// =====================================================
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

// =====================================================
// تشغيل صوت الإشعار
// =====================================================
function playNotificationSound() {
    try {
        const audio = document.getElementById('notificationSound');
        audio.play().catch(e => console.log('لا يمكن تشغيل الصوت:', e));
    } catch (error) {
        console.log('خطأ في تشغيل الصوت:', error);
    }
}

// =====================================================
// التمرير إلى أسفل المحادثة
// =====================================================
function scrollToBottom() {
    const container = document.getElementById('messagesContainer');
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 100);
}

// =====================================================
// وظائف المساعدة
// =====================================================

// تنسيق الوقت
function formatTime(timestamp) {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    if (diffInDays < 7) return `منذ ${diffInDays} يوم`;
    
    return date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
}

// تنسيق التاريخ
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'اليوم';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'أمس';
    } else {
        return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
    }
}

// اختصار النص
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// تنسيق حجم الملف
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// تحويل HTML لنص آمن
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// عرض وسائط بحجم كامل
function viewMedia(url, type) {
    // يمكن إضافة نافذة لعرض الصورة بحجم كامل
    window.open(url, '_blank');
}

// =====================================================
// تصدير الوظائف للاستخدام العام
// =====================================================
window.sendMessage = sendMessage;
window.openModal = openModal;
window.closeModal = closeModal;
