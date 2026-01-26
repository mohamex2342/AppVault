# 🚀 دليل البدء السريع - Quick Start Guide

## ⚡ ابدأ في 5 دقائق!

### الخطوة 1️⃣: إعداد Supabase

1. **إنشاء حساب:**
   - اذهب إلى https://supabase.com
   - أنشئ حساباً جديداً مجاناً

2. **إنشاء مشروع:**
   - اضغط "New Project"
   - أدخل اسم المشروع وكلمة مرور قوية
   - اختر المنطقة الأقرب إليك

3. **نسخ البيانات:**
   - من قائمة Project Settings → API
   - انسخ `URL` و `anon/public key`

### الخطوة 2️⃣: تكوين المشروع

افتح `js/config.js` واستبدل:

```javascript
const SUPABASE_URL = 'ضع_الـ_URL_هنا';
const SUPABASE_ANON_KEY = 'ضع_المفتاح_هنا';
```

### الخطوة 3️⃣: إنشاء قاعدة البيانات

في Supabase SQL Editor، نفذ:

```sql
-- الجداول الأساسية
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE apps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  version TEXT DEFAULT '1.0',
  category TEXT,
  icon_url TEXT,
  file_url TEXT,
  rating NUMERIC(2,1) DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT false,
  developer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  icon TEXT,
  app_count INTEGER DEFAULT 0
);

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### الخطوة 4️⃣: تفعيل المصادقة

في Supabase:
1. اذهب إلى Authentication → Settings
2. فعّل Email Provider
3. احفظ التغييرات

### الخطوة 5️⃣: إنشاء Storage Buckets

1. اذهب إلى Storage
2. أنشئ 3 Buckets:
   - `apps` (Private)
   - `icons` (Public)
   - `screenshots` (Public)

### الخطوة 6️⃣: تشغيل المشروع

#### محلياً (للتطوير):
```bash
# افتح في المتصفح
open index.html
```

#### على خادم:
- ارفع الملفات إلى GitHub Pages أو Netlify أو Vercel
- تأكد من تحديث CORS في Supabase

---

## 🎯 الاستخدام الأول

### إنشاء حساب مطور:

1. افتح `auth.html`
2. اختر "إنشاء حساب جديد"
3. املأ البيانات واختر "مطور تطبيقات"
4. سجل الدخول

### رفع أول تطبيق:

1. اذهب إلى لوحة التحكم
2. اضغط "رفع تطبيق جديد"
3. املأ بيانات التطبيق
4. ارفع الملفات (APK/أيقونة)
5. اضغط "رفع التطبيق"

---

## 📱 الصفحات الرئيسية

| الرابط | الوصف |
|--------|-------|
| `index.html` | الصفحة الرئيسية |
| `auth.html` | تسجيل الدخول |
| `developer-dashboard.html` | لوحة المطور |
| `developer-upload.html` | رفع تطبيق |

---

## ❓ مشاكل شائعة

### لا تظهر البيانات:
✅ تأكد من إدخال URL و Key صحيحين
✅ افتح Console للتحقق من الأخطاء
✅ تأكد من إنشاء الجداول

### لا يمكن التسجيل:
✅ فعّل Email Provider في Supabase
✅ تحقق من Spam للبريد التأكيدي
✅ تأكد من قوة كلمة المرور (8+ أحرف)

### أخطاء CORS:
✅ استخدم خادم ويب (لا تفتح الملفات مباشرة)
✅ أضف Domain في Supabase Settings

---

## 📞 المساعدة

- **الوثائق الكاملة:** اقرأ `README.md`
- **Supabase Docs:** https://supabase.com/docs
- **Issues:** أبلغ عن المشاكل في GitHub

---

**✨ الآن أنت جاهز! استمتع ببناء منصتك 🚀**
