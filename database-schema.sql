-- ==========================================
-- Supabase Database Schema for App Store
-- ==========================================
-- نسخ والصق هذا الكود في SQL Editor على Supabase

-- 1. إنشاء جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'developer', 'admin')),
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. إنشاء جدول الفئات
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  name_en TEXT,
  icon TEXT DEFAULT 'fas fa-folder',
  app_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. إنشاء جدول التطبيقات
CREATE TABLE IF NOT EXISTS apps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  version TEXT DEFAULT '1.0',
  category TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  platform TEXT DEFAULT 'Android' CHECK (platform IN ('Android', 'iOS', 'Both')),
  icon_url TEXT,
  file_url TEXT,
  file_size BIGINT,
  screenshots TEXT, -- JSON array of URLs
  rating NUMERIC(2,1) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  downloads_count INTEGER DEFAULT 0,
  price NUMERIC(10,2) DEFAULT 0.00,
  website TEXT,
  published BOOLEAN DEFAULT false,
  developer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. إنشاء جدول التقييمات
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(app_id, user_id)
);

-- 5. إنشاء الفهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_apps_developer ON apps(developer_id);
CREATE INDEX IF NOT EXISTS idx_apps_category ON apps(category_id);
CREATE INDEX IF NOT EXISTS idx_apps_published ON apps(published);
CREATE INDEX IF NOT EXISTS idx_apps_rating ON apps(rating DESC);
CREATE INDEX IF NOT EXISTS idx_apps_downloads ON apps(downloads_count DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_app ON reviews(app_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);

-- 6. تفعيل Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 7. سياسات الأمان للمستخدمين
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- 8. سياسات الأمان للتطبيقات
CREATE POLICY "Anyone can view published apps"
  ON apps FOR SELECT
  USING (published = true OR developer_id = auth.uid());

CREATE POLICY "Developers can insert their own apps"
  ON apps FOR INSERT
  WITH CHECK (auth.uid() = developer_id);

CREATE POLICY "Developers can update their own apps"
  ON apps FOR UPDATE
  USING (auth.uid() = developer_id);

CREATE POLICY "Developers can delete their own apps"
  ON apps FOR DELETE
  USING (auth.uid() = developer_id);

-- 9. سياسات الأمان للفئات
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  USING (true);

-- 10. سياسات الأمان للتقييمات
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);

-- 11. دالة لتحديث عداد الفئات
CREATE OR REPLACE FUNCTION update_category_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE categories 
    SET app_count = app_count + 1 
    WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE categories 
    SET app_count = app_count - 1 
    WHERE id = OLD.category_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.category_id != OLD.category_id THEN
    UPDATE categories 
    SET app_count = app_count - 1 
    WHERE id = OLD.category_id;
    UPDATE categories 
    SET app_count = app_count + 1 
    WHERE id = NEW.category_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 12. تفعيل Trigger لعداد الفئات
CREATE TRIGGER update_category_app_count
  AFTER INSERT OR UPDATE OR DELETE ON apps
  FOR EACH ROW
  EXECUTE FUNCTION update_category_count();

-- 13. دالة لتحديث متوسط التقييم
CREATE OR REPLACE FUNCTION update_app_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE apps
  SET rating = (
    SELECT COALESCE(AVG(rating), 0)
    FROM reviews
    WHERE app_id = COALESCE(NEW.app_id, OLD.app_id)
  )
  WHERE id = COALESCE(NEW.app_id, OLD.app_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 14. تفعيل Trigger لمتوسط التقييم
CREATE TRIGGER update_app_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_app_rating();

-- 15. دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 16. تفعيل Trigger لـ updated_at
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_apps_updated_at
  BEFORE UPDATE ON apps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 17. إدراج بيانات تجريبية للفئات
INSERT INTO categories (name, name_en, icon, app_count) VALUES
('ألعاب', 'Games', 'fas fa-gamepad', 0),
('تعليم', 'Education', 'fas fa-graduation-cap', 0),
('أعمال', 'Business', 'fas fa-briefcase', 0),
('إنتاجية', 'Productivity', 'fas fa-tasks', 0),
('صحة', 'Health', 'fas fa-heartbeat', 0),
('ترفيه', 'Entertainment', 'fas fa-film', 0),
('تواصل اجتماعي', 'Social', 'fas fa-users', 0),
('أدوات', 'Tools', 'fas fa-wrench', 0),
('تصوير', 'Photography', 'fas fa-camera', 0),
('موسيقى', 'Music', 'fas fa-music', 0),
('سفر', 'Travel', 'fas fa-plane', 0),
('طعام', 'Food', 'fas fa-utensils', 0)
ON CONFLICT (name) DO NOTHING;

-- 18. عرض جميع التطبيقات مع معلومات المطور (View)
CREATE OR REPLACE VIEW apps_with_developer AS
SELECT 
  a.*,
  u.full_name as developer_name,
  u.email as developer_email,
  u.avatar_url as developer_avatar,
  c.name as category_name
FROM apps a
LEFT JOIN users u ON a.developer_id = u.id
LEFT JOIN categories c ON a.category_id = c.id;

-- 19. عرض إحصائيات التطبيقات
CREATE OR REPLACE VIEW app_statistics AS
SELECT 
  COUNT(*) as total_apps,
  SUM(downloads_count) as total_downloads,
  AVG(rating) as average_rating,
  COUNT(DISTINCT developer_id) as total_developers
FROM apps
WHERE published = true;

-- ==========================================
-- تم الانتهاء! قاعدة البيانات جاهزة 🎉
-- ==========================================

-- ملاحظات مهمة:
-- 1. تأكد من تفعيل Email Authentication في Supabase
-- 2. أنشئ Storage Buckets: apps, icons, screenshots
-- 3. اضبط سياسات الوصول للـ Buckets
-- 4. حدّث SUPABASE_URL و SUPABASE_ANON_KEY في js/config.js
