-- =====================================================
-- سكريبت إعداد قاعدة البيانات لموقع المحادثة
-- Supabase Database Setup Script
-- =====================================================

-- 1. إنشاء جدول الملفات الشخصية للمستخدمين (Profiles)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    status TEXT DEFAULT 'offline', -- online, offline, away
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إضافة فهرس لتسريع البحث
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_status_idx ON profiles(status);

-- سياسات الأمان (Row Level Security) للملفات الشخصية
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- السماح للمستخدمين بقراءة جميع الملفات الشخصية
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

-- السماح للمستخدمين بتحديث ملفهم الشخصي فقط
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- السماح بإدراج ملف شخصي عند التسجيل
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- =====================================================
-- 2. إنشاء جدول المحادثات (Conversations)
-- =====================================================
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('private', 'group')), -- private or group
    name TEXT, -- اسم المجموعة (null للمحادثات الفردية)
    avatar_url TEXT, -- صورة المجموعة (null للمحادثات الفردية)
    description TEXT, -- وصف المجموعة
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إضافة فهرس لتسريع البحث
CREATE INDEX IF NOT EXISTS conversations_type_idx ON conversations(type);
CREATE INDEX IF NOT EXISTS conversations_created_at_idx ON conversations(created_at DESC);

-- سياسات الأمان للمحادثات
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- السماح للأعضاء بقراءة المحادثات التي ينتمون إليها
CREATE POLICY "Users can view their conversations"
    ON conversations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversation_members
            WHERE conversation_members.conversation_id = conversations.id
            AND conversation_members.user_id = auth.uid()
        )
    );

-- السماح للمستخدمين بإنشاء محادثات
CREATE POLICY "Users can create conversations"
    ON conversations FOR INSERT
    WITH CHECK (auth.uid() = created_by);

-- =====================================================
-- 3. إنشاء جدول أعضاء المحادثات (Conversation Members)
-- =====================================================
CREATE TABLE IF NOT EXISTS conversation_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')), -- admin or member
    unread_count INTEGER DEFAULT 0, -- عدد الرسائل غير المقروءة
    last_read_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

-- إضافة فهرس لتسريع البحث
CREATE INDEX IF NOT EXISTS conversation_members_conversation_idx ON conversation_members(conversation_id);
CREATE INDEX IF NOT EXISTS conversation_members_user_idx ON conversation_members(user_id);

-- سياسات الأمان لأعضاء المحادثات
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;

-- السماح للمستخدمين بقراءة عضويتهم
CREATE POLICY "Users can view conversation members"
    ON conversation_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversation_members cm
            WHERE cm.conversation_id = conversation_members.conversation_id
            AND cm.user_id = auth.uid()
        )
    );

-- السماح للمستخدمين بإضافة أعضاء للمحادثات التي أنشأوها
CREATE POLICY "Users can add conversation members"
    ON conversation_members FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversations
            WHERE conversations.id = conversation_members.conversation_id
            AND conversations.created_by = auth.uid()
        )
    );

-- السماح بتحديث حالة القراءة
CREATE POLICY "Users can update own membership"
    ON conversation_members FOR UPDATE
    USING (user_id = auth.uid());

-- =====================================================
-- 4. إنشاء جدول الرسائل (Messages)
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT, -- محتوى الرسالة النصية
    type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'image', 'video', 'audio', 'file')),
    file_url TEXT, -- رابط الملف في Supabase Storage
    file_name TEXT, -- اسم الملف الأصلي
    file_size INTEGER, -- حجم الملف بالبايت
    file_type TEXT, -- نوع الملف (MIME type)
    reply_to UUID REFERENCES messages(id) ON DELETE SET NULL, -- الرد على رسالة
    is_edited BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إضافة فهرس لتسريع البحث
CREATE INDEX IF NOT EXISTS messages_conversation_idx ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS messages_sender_idx ON messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at DESC);

-- سياسات الأمان للرسائل
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- السماح للأعضاء بقراءة رسائل المحادثات التي ينتمون إليها
CREATE POLICY "Users can view messages in their conversations"
    ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversation_members
            WHERE conversation_members.conversation_id = messages.conversation_id
            AND conversation_members.user_id = auth.uid()
        )
    );

-- السماح للمستخدمين بإرسال رسائل في المحادثات التي ينتمون إليها
CREATE POLICY "Users can send messages to their conversations"
    ON messages FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id
        AND EXISTS (
            SELECT 1 FROM conversation_members
            WHERE conversation_members.conversation_id = messages.conversation_id
            AND conversation_members.user_id = auth.uid()
        )
    );

-- السماح للمرسل بتعديل رسائله
CREATE POLICY "Users can update own messages"
    ON messages FOR UPDATE
    USING (sender_id = auth.uid());

-- السماح للمرسل بحذف رسائله
CREATE POLICY "Users can delete own messages"
    ON messages FOR DELETE
    USING (sender_id = auth.uid());

-- =====================================================
-- 5. إنشاء دالة لتحديث last_seen تلقائياً
-- =====================================================
CREATE OR REPLACE FUNCTION update_last_seen()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles
    SET last_seen = NOW()
    WHERE id = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. إنشاء دالة لتحديث updated_at تلقائياً
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- تطبيق الدالة على الجداول
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. إنشاء دالة لتحديث unread_count تلقائياً
-- =====================================================
CREATE OR REPLACE FUNCTION increment_unread_count()
RETURNS TRIGGER AS $$
BEGIN
    -- تحديث عداد الرسائل غير المقروءة لجميع الأعضاء ماعدا المرسل
    UPDATE conversation_members
    SET unread_count = unread_count + 1
    WHERE conversation_id = NEW.conversation_id
    AND user_id != NEW.sender_id;
    
    -- تحديث وقت آخر تحديث للمحادثة
    UPDATE conversations
    SET updated_at = NOW()
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- تطبيق الدالة على جدول الرسائل
CREATE TRIGGER increment_unread_count_trigger
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION increment_unread_count();

-- =====================================================
-- 8. إعداد Realtime للحصول على التحديثات الفورية
-- =====================================================
-- تفعيل Realtime على الجداول
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_members;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- =====================================================
-- 9. إنشاء Storage Bucket للملفات
-- =====================================================
-- يجب تنفيذ هذه الأوامر من لوحة تحكم Supabase أو عبر JavaScript:
-- 1. افتح Storage في لوحة تحكم Supabase
-- 2. أنشئ Bucket جديد باسم 'chat-files'
-- 3. اجعله Public أو Private حسب الحاجة
-- 4. أضف سياسات الأمان التالية:

-- البديل: استخدام SQL لإنشاء Bucket (إذا كانت الصلاحيات متاحة)
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-files', 'chat-files', true)
ON CONFLICT (id) DO NOTHING;

-- سياسات الأمان لـ Storage
CREATE POLICY "Users can upload files"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'chat-files' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view files"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'chat-files');

CREATE POLICY "Users can delete own files"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'chat-files' AND auth.uid()::text = owner);

-- =====================================================
-- 10. إضافة بيانات تجريبية (اختياري)
-- =====================================================
-- يمكنك إضافة مستخدمين تجريبيين هنا إذا لزم الأمر

-- =====================================================
-- انتهى السكريبت! ✅
-- =====================================================
-- لتطبيق هذا السكريبت:
-- 1. افتح لوحة تحكم Supabase
-- 2. اذهب إلى SQL Editor
-- 3. انسخ والصق هذا السكريبت
-- 4. اضغط على Run لتنفيذه
-- =====================================================
