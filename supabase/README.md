# قاعدة البيانات (Supabase)

المشروع: `hrfzogcmophmhjuyrxhd` — المنطقة `eu-central-1`
الرابط: `https://hrfzogcmophmhjuyrxhd.supabase.co`

المخطط الكامل في [`schema.sql`](./schema.sql). كل السكربت آمن للتشغيل أكتر من مرة.

---

## ١) الجداول

| الجدول | الغرض | العلاقة |
| --- | --- | --- |
| `profiles` | اسم وإيميل وصورة كل لاعب | `id → auth.users.id` (1:1) |
| `stats` | جولات / فوز / أعلى مكسب | `user_id → auth.users.id` (1:1) |
| `leaderboard` | نسخة مجمّعة للعرض السريع | بتتحدث بـ trigger من `stats` و `profiles` |
| `questions` | أسئلة الزوار (`o0..o3` الاختيارات) | `uid → auth.users.id` |
| `votes` | صوت واحد لكل حساب لكل سؤال | `(question_id, user_id)` مفتاح أساسي |
| `rooms` | غرف تحدي الشلة (كود ٥ حروف) | `host → auth.users.id` |
| `room_players` | مين في الغرفة وأي فريق | `(room_code, user_id)` |
| `room_progress` | تقدّم كل لاعب داخل الغرفة | `(room_code, user_id)` |
| `user_activity` | حضور اللاعب (نبضة/دقيقة) | `(user_id, session)` |
| `room_activity` | حضور داخل الغرفة | `(room_code, user_id, session)` |
| `admins` | قائمة المشرفين | `user_id → auth.users.id` |

كمان في view اسمه `vote_counts` بيجمع الأصوات لكل اختيار
(`security_invoker = true` يعني بيحترم RLS بتاعة `votes`).

> **ليه `leaderboard` جدول مش view؟** عشان Supabase Realtime بيشتغل على الجداول،
> والموقع بيسمع تغييرات اللوحة لحظيًا.

---

## ٢) الصلاحيات (RLS)

كل الجداول عليها RLS مفعّل، ومفيش أي وصول لـ `anon` — كل حاجة للـ `authenticated`:

- `profiles` / `stats` / `user_activity`: كل واحد بيشوف ويكتب صفّه هو بس (+ المشرف).
- `questions`: القراءة لكل المسجلين، الكتابة/التعديل لصاحب السؤال (+ المشرف).
- `votes`: القراءة لكل المسجلين (عشان العدادات)، الكتابة بصوت صاحب الحساب فقط.
- `leaderboard`: قراءة للكل، والكتابة **بالtrigger فقط** (مفيش policy للكتابة).
- `rooms`: المقدرة يشوفها = المنشئ أو أي عضو فيها أو المشرف.
- `room_players` / `room_progress` / `room_activity`: لأعضاء الغرفة فقط.
- `admins`: كل واحد يشوف صفّه بس (والمشرفين بيعدّوا عن طريق `is_admin()`).

دوال مساعدة (`security definer`): `is_admin()` و `in_room(code)` — مستخدمة داخل
السياسات وممنوع تنادي عليها من برّه غير المسجلين.

---

## ٣) الدوال (RPC) اللي الموقع بينادي عليها

| الدالة | الوظيفة |
| --- | --- |
| `record_result(p_play, p_win, p_best)` | تزويد الإحصائيات بشكل ذرّي + مزامنة اللوحة |
| `create_room(p_code, p_size, p_questions, p_secs)` | إنشاء غرفة وإضافة المنشئ كأول لاعب |
| `join_room(p_code, p_name)` | انمام آمن (بيوزّع الفرق ويرفض لو الغرفة كاملة/بدأت) |
| `leave_room(p_code)` | خروج + حذف التقدّم + قفل الغرفة لو فضيت |
| `set_team(p_code, p_team)` | نقل لاعب لفريق مع مراعاة الحجم |
| `update_room_settings(p_code, p_size, p_secs)` | إعدادات المنشئ قبل البدء |
| `start_room(p_code)` | بدء التحدي (المنشئ فقط، بشرط فريقين) |
| `finish_room(p_code)` | قفل الغرفة لما الفريقين يخلصوا |
| `cleanup_stale_rooms()` | حذف الغرف المهجورة والنشاط القديم |

كل الدوال `security definer` وبتتحقق من `auth.uid()` بنفسها، والتنفيذ ممنوح
لـ `authenticated` فقط.

---

## ٤) Realtime

التفعيل موجود في نهاية `schema.sql`:

- الجداول المضافة للـ publication: `votes`, `questions`, `stats`, `leaderboard`,
  `rooms`, `room_players`, `room_progress`.
- `replica identity full` على كل الجداول دي عشان التحديث/الحذف يوصّل الصف كامل.
- الموقع بيستخدم قناتين: `data:<uid>` للتحديثات العامة، و `room:<code>` للغرفة.

لو التحديث اللحظي مش شغال: راجع **Database → Replication** في لوحة Supabase إن
الجداول دي مفعّلة، وتأكد إن `Realtime` مش في وضع `COMING_UP`.

---

## ٥) المصادقة

الإعدادات المطبّقة على المشروع:

- تسجيل بالإيميل مفعّل.
- **تأكيد الإيميل مقفول** (`mailer_autoconfirm = true`) عشان اللاعب يدخل فورًا
  من غير SMTP. لو حبيت تفعّله: `Authentication → Providers → Email` وشغّل
  «Confirm email» + اضبط SMTP.
- `Site URL = https://million-site-e1xo.vercel.app`
- Redirect URLs: `https://million-site-e1xo.vercel.app/**`, `http://localhost:8080/**`,
  `http://localhost:3000/**`.

### تسجيل الدخول بجوجل

الكود جاهز في الموقع، لكن المزوّد مش مفعّل. للتفعيل:

1. اعمل OAuth Client ID من Google Cloud Console (نوع Web application).
2. Authorized redirect URI:
   `https://hrfzogcmophmhjuyrxhd.supabase.co/auth/v1/callback`
3. في Supabase → Authentication → Providers → Google: حط الـ Client ID والـ Secret.
4. أضف نطاق الموقع في Redirect URLs.

من غير الخطوات دي، زر جوجل هيعرض رسالة «تسجيل جوجل مش مفعّل» واللاعب يكمل بالإيميل.

---

## ٦) إضافة مشرف

```sql
insert into public.admins (user_id)
select id from auth.users where email = 'you@example.com'
on conflict do nothing;
```

---

## ٧) الصيانة

```sql
-- تنضيف يدوي (أو جدولة بـ pg_cron كل ساعة)
select public.cleanup_stale_rooms();
```

مثال pg_cron:

```sql
select cron.schedule('cleanup-rooms', '0 * * * *', $$select public.cleanup_stale_rooms();$$);
```

---

## ٨) تطبيق المخطط من جديد

انسخ محتوى `schema.sql` والصقه في **SQL Editor** ثم Run. الملف idempotent،
فينفع تشغله على قاعدة فيها الجداول بالفعل.

---

## ٩) ملاحظات أمان

- المتصفح بيستخدم مفتاح `anon` العام فقط.
- **متستخدمش** `service_role` / `sb_secret_...` في HTML أو JS.
- CSP في `index.html` مسموح لها بالاتصال بـ `https://hrfzogcmophmhjuyrxhd.supabase.co`
  و `wss://...` بس — لو غيّرت المشروع، حدّث الـ CSP في نفس الوقت.
