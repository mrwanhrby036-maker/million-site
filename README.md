# من سيربح المليون؟ — million-site

موقع مسابقات عربي (RTL) ثابت: HTML + CSS + JavaScript من غير أي build step.
كل حسابات اللاعبين، الأصوات، الأسئلة، الإحصائيات، لوحة المتصدرين، وغرف تحدي الشلة
متخزنة في **قاعدة بيانات Supabase** (Postgres + RLS + Realtime).

## الملفات

| الملف | الوظيفة |
| --- | --- |
| `index.html` | الصفحة الوحيدة (SPA بتوجيه بالـ hash) + سياسة الأمان CSP |
| `script.js` | كل منطق المنصة + طبقة الاتصال بـ Supabase (Auth / Postgres / Realtime) |
| `supabase.min.js` | عميل Supabase الرسمي (v2) مبنى كـ bundle محلي — مفيش CDN |
| `style.css` | التنسيقات |
| `supabase/schema.sql` | مخطط قاعدة البيانات الكامل (جداول + RLS + دوال + Realtime) |
| `supabase/README.md` | تفاصيل القاعدة والصلاحيات والخطوات |
| `robots.txt` / `sitemap.xml` | إعدادات محركات البحث |
| `1234firebase-_rules.json` | **قديم** — قواعد Firebase Realtime Database قبل الترحيل (مش مستخدمة) |
| `Maru$#_admin.html` | **قديم** — لوحة إدارة مبنية على Firebase (شوف «حالة لوحة الإدارة» تحت) |

## الإعداد

إعدادات المشروع في أول `script.js` داخل `SB_CONFIG`:

```js
const SB_CONFIG = {
  url: 'https://hrfzogcmophmhjuyrxhd.supabase.co',
  key: 'eyJ...' // مفتاح anon العام (مش secret)
};
```

- المفتاح ده **عام** ومصمم يبقى في المتصفح؛ الحماية الحقيقية في سياسات RLS.
- **ممنوع** تحط مفتاح `service_role` أو `sb_secret_...` في أي ملف من الموقع.
- المشروع فيه كمان مفتاح publishable (`sb_publishable_...`) تقدر تبدله مكان الـ anon
  لو حبيت النظام الجديد للمفاتيح.

## التشغيل محليًا

```bash
python3 -m http.server 8080
# افتح http://localhost:8080
```

> لازم سيرفر (مش `file://`) عشان الـ CSP والـ hash routing يشتغلوا صح.

## النشر

الموقع ثابت، ينفع على Vercel / Netlify / GitHub Pages من غير أي إعداد build.
لو استخدمت Vercel، خلي **Framework Preset = Other** و **Build Command = فاضي**،
وبس هتقدم الملفات زي ما هي.

## حالة الميزات

| الميزة | الحالة |
| --- | --- |
| تسجيل حساب/دخول بالإيميل | ✅ Supabase Auth |
| تسجيل بجوجل | ⚙️ الكود جاهز، لكن لازم تفعّل Google provider من لوحة Supabase (شوف `supabase/README.md`) |
| تصويت «ماذا لو» | ✅ صوت واحد لكل حساب لكل سؤال |
| نشر أسئلة الزوار | ✅ بحدود طول وقيود على مستوى القاعدة |
| الإحصائيات + لوحة المتصدرين | ✅ بتتحدث أوتوماتيك بـ trigger |
| تحدي الشلة (غرف 1v1 لحد 4v4) | ✅ مع مزامنة لحظية (Realtime) |
| النشاط/الحضور | ✅ نبضة كل دقيقة + تنظيف دوري |

## حالة لوحة الإدارة

`Maru$#_admin.html` **لسه بتشتغل على Firebase** ومش متصلة بقاعدة البيانات الجديدة.
لو محتاجها، الخطوة التالية هي ترحيلها لـ Supabase (same UI، Auth + جداول جديدة).
للإدارة مؤقتًا استخدم SQL Editor في Supabase، أو أضف نفسك في جدول `admins` وابعت طلب الترحيل.
