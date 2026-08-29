# دليل إعداد وتشغيل المشروع في بيئة الإنتاج | Deployment & Production Guide

يحتوي هذا الملف على جميع المتطلبات، والخطوات، والأوامر البرمجية اللازمة لتهيئة ونشر موقع **معهد الجونة الفني للتمريض (GTNI)** في بيئة الإنتاج (Production).

---

## 📋 المتطلبات الأساسية | Prerequisites

لتشغيل المشروع بكفاءة، يجب توافر المتطلبات التالية على خادم الإنتاج:

- **Node.js**: الإصدار **22.22.x** (أو أي إصدار أحدث متوافق مثل `>=22.9.0`).
- **pnpm**: مدير الحزم المستخدم للمشروع (الإصدار `^9` أو `^10`).
- **خادم قاعدة البيانات (SQLite)**: مدمج محلياً ويتم حفظ البيانات في ملف `.db` بالمسار الرئيسي للمشروع.
- **خدمة بريد إلكتروني (اختياري)**: حساب على موقع [Resend](https://resend.com) أو خادم SMTP لإرسال رسائل البريد الإلكتروني.

---

## ⚙️ متغيرات البيئة | Environment Variables

يجب إنشاء ملف `.env` في المجلد الرئيسي للمشروع وإضافة المتغيرات التالية مع تعيين قيمها المناسبة لبيئة التشغيل:

```env
# مسار قاعدة بيانات SQLite (يجب الحفاظ على هذا الملف في بيئة مستمرة)
DATABASE_URL=file:./.db

# مفتاح تشفير عشوائي وقوي خاص بـ Payload CMS (مثال: سلسلة عشوائية من 24-32 رمزاً)
PAYLOAD_SECRET=your_super_secret_payload_key

# رابط الموقع العام في الإنتاج (الرابط الفعلي للموقع)
NEXT_PUBLIC_SERVER_URL=https://gtni.edu.eg


# --- إعدادات البريد الإلكتروني (يمكن استخدام Resend أو SMTP عادي) ---

# الخيار الأول: باستخدام Resend (موصى به)
RESEND_API_KEY=re_your_resend_api_key

# الخيار الثاني: باستخدام SMTP (في حال عدم توفر Resend)
# SMTP_HOST=mail.gtni.edu.eg
# SMTP_PORT=465
# SMTP_USER=info@gtni.edu.eg
# SMTP_PASS=your_smtp_password

# معلومات مرسل البريد الإلكتروني
EMAIL_FROM_NAME="Gouna Technical Nursing Institute"
EMAIL_FROM_ADDRESS="info@gtni.edu.eg"
```

---

## 🚀 خطوات النشر والتشغيل | Deployment Steps

اتبع الخطوات التالية بالترتيب لإعداد الخادم وتشغيل التطبيق:

### 1. تثبيت الحزم والمكتبات الاعتمادية (Install Dependencies)

يجب تثبيت المكتبات باستخدام `pnpm` مع تفعيل خيار Hoisting لضمان عمل Payload CMS بشكل صحيح:

```bash
pnpm install --shamefully-hoist --node-linker=hoisted
```

> [!IMPORTANT]
> الخيارات `--shamefully-hoist` و `--node-linker=hoisted` ضرورية جداً لعمل Payload CMS بشكل سليم بسبب طريقة استدعائه لبعض حزم الـ Admin Panel.

### 2. توليد ملفات الأنواع والخرائط التلقائية (Generate Payload Types & Import Map)

قبل بناء المشروع، يجب توليد خريطة استدعاءات Payload والأنواع البرمجية الخاصة بـ TypeScript:

```bash
pnpm run generate:importmap
pnpm run generate:types
```

### 3. بناء المشروع للإنتاج (Build the Application)

لبناء الموقع وتجهيزه للإنتاج، قم بتشغيل أمر البناء:

```bash
pnpm run build
```

> [!TIP]
> يقوم هذا الأمر تلقائياً بزيادة سعة الذاكرة المستهلكة أثناء البناء لتفادي مشكلة نفاد الذاكرة (Out of Memory):
> `NODE_OPTIONS="--no-deprecation --max-old-space-size=8000" next build`

### 4. بدء تشغيل الخادم في بيئة الإنتاج (Start the Server)

لتشغيل خادم الويب على المنفذ الافتراضي (غالباً 3000):

```bash
pnpm run start
```

---

## 💾 استمرارية البيانات وحفظها | Data Persistence & Backups

بما أن المشروع يستخدم قاعدة بيانات SQLite محلية ويخزن ملفات الوسائط على القرص، **يجب** التأكد من استمرارية الملفات التالية وعدم حذفها أو استبدالها عند تحديث الكود أو إعادة النشر:

1.  **ملف قاعدة البيانات (`.db`)**:
    - هو الملف المسؤول عن حفظ المقالات، الصفحات، بيانات المستخدمين والإعدادات.
    - يجب أخذ نسخة احتياطية دورية منه.
2.  **مجلد الوسائط المرفوعة (`public/media`)**:
    - يتم حفظ جميع الصور والملفات المرفوعة بواسطة لوحة التحكم

---

## 🛠️ إدارة التشغيل عبر PM2 | Process Management with PM2

يُفضل في بيئة الإنتاج تشغيل التطبيق في الخلفية وإعادة تشغيله تلقائياً في حال حدوث أي خطأ أو توقف للخادم. نوصي باستخدام **PM2**:

### التشغيل المباشر عبر PM2:

```bash
pm2 start pnpm --name "gtni-website" -- start
```

### أو باستخدام ملف الإعدادات `ecosystem.config.cjs`:

قم بإنشاء ملف باسم `ecosystem.config.cjs` في المجلد الرئيسي بالبيانات التالية:

```javascript
module.exports = {
  apps: [
    {
      name: 'gtni-website',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        PORT: 3000,
        NODE_ENV: 'production',
      },
    },
  ],
}
```

ثم قم بتشغيله باستخدام:

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

---

## 🌐 تهيئة خادم الويب العكسي (Nginx Reverse Proxy)

لتوجيه الطلبات من النطاق الخارجي (مثل `https://gtni.edu.eg`) إلى التطبيق الداخلي الذي يعمل على المنفذ `3000` مع تفعيل شهادة الأمان (SSL)، يُنصح باستخدام الإعداد التالي في Nginx:

```nginx
server {
    listen 80;
    server_name gtni.edu.eg www.gtni.edu.eg;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name gtni.edu.eg www.gtni.edu.eg;

    # مسارات شهادة الـ SSL (قم بتعديلها لتناسب مسارات الشهادة الخاصة بك)
    ssl_certificate /etc/letsencrypt/live/gtni.edu.eg/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gtni.edu.eg/privkey.pem;

    # تحديد حجم الرفع الأقصى للملفات (لتتوافق مع حد رفع الفيديو والصور)
    client_max_body_size 150M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
