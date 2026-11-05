/* ============================================================
   من سيربح المليون؟ — كود المنصة (اللعبة + التصويت + الحساب + تحدي الغرف)
   ------------------------------------------------------------
   • قاعدة البيانات والمصادقة: Supabase (Postgres + RLS + Realtime)
   • عميل Supabase محمّل قبل الملف ده في supabase.min.js
     ← بيظهر كـ window.SupabaseLib.createClient
   • مفيش CDN ولا import — الملف مستقل تمامًا.
   ============================================================ */
/* ============================================================
   ماذا لو؟ — مولد أسئلة جدلية + تصويت
   كل الكود في ملف واحد. مفيش مكتبات خارجية. مفيش إيموجي.
   ============================================================ */
(function () {
  'use strict';

  /* ==========================================================
     1) أدوات عامة
     ========================================================== */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // Client validation protects rendering, not authorization or score integrity.
  const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
  const validKey = (key) => typeof key === 'string' && key.length > 0 && key.length <= 128 && !/[.#$\[\]\/\u0000-\u001f\u007f]/.test(key) && !['__proto__', 'constructor', 'prototype'].includes(key);
  const boundedText = (value, max) => typeof value === 'string' ? value.slice(0, max) : '';
  const safeDecode = (value) => { try { return decodeURIComponent(value); } catch (e) { return ''; } };

  const rnd = (n) => Math.floor(Math.random() * n);
  const pick = (a) => a[rnd(a.length)];
  const shuffle = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = rnd(i + 1); const t = b[i]; b[i] = b[j]; b[j] = t; } return b; };
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const nf = new Intl.NumberFormat('en-US');
  const num = (n) => nf.format(Math.round(Number(n) || 0));
  const pct = (n) => num(n) + '%';
  const todayKey = () => new Date().toLocaleDateString('en-CA');

  function pctOf(counts) {
    const t = sum(counts) || 1;
    const out = counts.map((c) => Math.round((c / t) * 100));
    const diff = 100 - sum(out);
    if (out.length) out[out.indexOf(Math.max.apply(null, out))] += diff;
    return out.map((n) => clamp(n, 0, 100));
  }

  /* ==========================================================
     2) الأيقونات (SVG بدل الإيموجي)
     ========================================================== */
  const PATHS = {
    home: '<path d="M3.5 10.6 12 3.8l8.5 6.8V20a1 1 0 0 1-1 1h-4.6v-6.3H9.1V21H5a1 1 0 0 1-1-1z"/>',
    dice: '<rect x="3.6" y="3.6" width="16.8" height="16.8" rx="4.4"/><circle cx="8.4" cy="8.4" r="1.15" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.15" fill="currentColor" stroke="none"/><circle cx="15.6" cy="15.6" r="1.15" fill="currentColor" stroke="none"/>',
    users: '<circle cx="9.2" cy="8.4" r="3.3"/><path d="M3.4 20.2c0-3.3 2.6-5.4 5.8-5.4s5.8 2.1 5.8 5.4"/><path d="M16.2 5.6a3.3 3.3 0 0 1 0 5.9"/><path d="M17.4 14.9c2 .7 3.2 2.5 3.2 5.3"/>',
    gamepad: '<rect x="2.6" y="7.4" width="18.8" height="9.6" rx="4.8"/><path d="M7 10.4v3.6M5.2 12.2h3.6"/><circle cx="16.1" cy="11.4" r="1.1" fill="currentColor" stroke="none"/><circle cx="18.3" cy="13.6" r="1.1" fill="currentColor" stroke="none"/>',
    pencil: '<path d="M4 20h4.2L20.2 8 16 3.8 4 15.8z"/><path d="M14.4 5.4 18.6 9.6"/>',
    chart: '<path d="M4 20.2h16"/><path d="M7.2 16.6V11M12 16.6V6.6M16.8 16.6v-3.8"/>',
    trophy: '<path d="M7.2 4h9.6v4.2a4.8 4.8 0 0 1-9.6 0z"/><path d="M7.2 6H4.6a3.4 3.4 0 0 0 3.3 3.6M16.8 6h2.6a3.4 3.4 0 0 1-3.3 3.6"/><path d="M12 13.2v3.6M8.6 20.2h6.8"/>',
    refresh: '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20.2 4.2v4.2H16"/>',
    check: '<path d="M4.6 12.6l4.9 4.9L19.4 7.2"/>',
    plus: '<path d="M12 5.2v13.6M5.2 12h13.6"/>',
    minus: '<path d="M5.2 12h13.6"/>',
    share: '<circle cx="17.8" cy="5.6" r="2.5"/><circle cx="6.2" cy="12" r="2.5"/><circle cx="17.8" cy="18.4" r="2.5"/><path d="M8.4 10.8 15.6 6.9M8.4 13.2l7.2 3.9"/>',
    whatsapp: '<path d="M12 3.4A8.6 8.6 0 0 0 4.6 16.4L3.4 20.6l4.3-1.2A8.6 8.6 0 1 0 12 3.4z"/><path d="M9.2 8.5h1.4l.8 2-1 1c.5 1.1 1.3 1.9 2.4 2.4l1-1 2 .8v1.4c0 .6-.5 1.1-1.1 1.1-2.9 0-5.3-2.4-5.3-5.3 0-.6.5-1.4 1.1-1.4z"/>',
    sound: '<path d="M4.2 9.4h3.2L11.6 5.8v12.4L7.4 14.6H4.2z"/><path d="M14.8 9.2a4 4 0 0 1 0 5.6"/><path d="M17.3 6.6a7.6 7.6 0 0 1 0 10.8"/>',
    mute: '<path d="M4.2 9.4h3.2L11.6 5.8v12.4L7.4 14.6H4.2z"/><path d="M15 9.6l4 4.8M19 9.6l-4 4.8"/>',
    back: '<path d="M15 4.6 7.6 12 15 19.4"/>',
    next: '<path d="M9 4.6 16.4 12 9 19.4"/>',
    clock: '<circle cx="12" cy="12" r="8.4"/><path d="M12 7.4V12l3.1 2"/>',
    sparkle: '<path d="M11.6 3.6 13.3 8l4.4 1.7-4.4 1.7-1.7 4.4-1.7-4.4L5.5 9.7 9.9 8z"/><path d="M18.2 15.4l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
    sprout: '<path d="M12 20.2v-6.4"/><path d="M12 13.8c-3.9 0-6-2-6-4.9 3.9 0 6 2 6 4.9z"/><path d="M12 13.8c3.9 0 6-2 6-4.9-3.9 0-6 2-6 4.9z"/>',
    question: '<circle cx="12" cy="12" r="8.4"/><path d="M9.4 9.5a2.8 2.8 0 1 1 3.8 2.6c-.8.4-1.2 1-1.2 1.9v.4"/><circle cx="12" cy="17.2" r="1" fill="currentColor" stroke="none"/>',
    trash: '<path d="M4.6 7.2h14.8"/><path d="M9.2 7.2V4.6h5.6v2.6"/><path d="M6.6 7.2 7.6 20.2h8.8l1-13"/>',
    image: '<rect x="3.4" y="4.6" width="17.2" height="14.8" rx="2.8"/><circle cx="8.6" cy="9.4" r="1.6"/><path d="M4.4 17.2l4.6-4.2 3.4 3 2.8-2.4 4.4 4"/>',
    download: '<path d="M12 4.4v10.4"/><path d="M8 11l4 4 4-4"/><path d="M4.6 19.6h14.8"/>',
    play: '<path d="M8.4 5.4 19 12 8.4 18.6z"/>',
    expand: '<path d="M9.2 3.8H3.8v5.4M14.8 3.8h5.4v5.4M9.2 20.2H3.8v-5.4M14.8 20.2h5.4v-5.4"/>',
    bolt: '<path d="M13.6 3.4 6.4 13.6h4.3L10 20.6l7.2-10.2H13z"/>',
    target: '<circle cx="12" cy="12" r="8.4"/><circle cx="12" cy="12" r="4.4"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>',
    /* أيقونات الأقسام */
    wallet: '<rect x="3.2" y="6" width="17.6" height="12.8" rx="3"/><path d="M3.2 10h17.6"/><circle cx="16.6" cy="14.6" r="1.2" fill="currentColor" stroke="none"/>',
    plane: '<path d="M20.8 4.2 3.4 10.9l6.4 2.6 2.6 6.4z"/><path d="M9.8 13.5 20.8 4.2"/>',
    food: '<path d="M8 3.4v7.4M10.6 3.4v7.4M9.3 10.8v9.8"/><path d="M17.2 3.4c1.7 1.5 2.4 3.2 2.4 5.4 0 1.7-.8 2.7-2.4 3.1v8.7"/>',
    heart: '<path d="M12 20.2s-7.4-4.5-7.4-9.3a4.2 4.2 0 0 1 7.4-2.8 4.2 4.2 0 0 1 7.4 2.8c0 4.8-7.4 9.3-7.4 9.3z"/>',
    phone: '<rect x="6.6" y="2.6" width="10.8" height="18.8" rx="2.8"/><path d="M10.6 18.4h2.8"/>',
    mask: '<circle cx="12" cy="12" r="8.4"/><path d="M8.6 14.4c.9 1.4 2.1 2.1 3.4 2.1s2.5-.7 3.4-2.1"/><circle cx="9.1" cy="9.9" r="1" fill="currentColor" stroke="none"/><circle cx="14.9" cy="9.9" r="1" fill="currentColor" stroke="none"/>',
    book: '<path d="M4 4.6h6.4A2.6 2.6 0 0 1 13 7.2v13a2 2 0 0 0-2-2H4z"/><path d="M20 4.6h-6.4A2.6 2.6 0 0 0 11 7.2v13a2 2 0 0 1 2-2h7z"/>',
    bus: '<rect x="3.4" y="4" width="17.2" height="12.8" rx="2.6"/><path d="M3.4 11h17.2"/><circle cx="7.6" cy="19.2" r="1.6"/><circle cx="16.4" cy="19.2" r="1.6"/>',
    brain: '<path d="M12 5.6a3 3 0 0 0-5.5 1.7A3 3 0 0 0 5.1 12a3 3 0 0 0 1.6 4.6A3 3 0 0 0 12 18.6z"/><path d="M12 5.6a3 3 0 0 1 5.5 1.7A3 3 0 0 1 18.9 12a3 3 0 0 1-1.6 4.6A3 3 0 0 1 12 18.6z"/><path d="M12 5.6v13"/>'
  };

  function ICON(name, cls) {
    const p = PATHS[name] || PATHS.sparkle;
    return '<svg class="ico' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + p + '</svg>';
  }

  /* ==========================================================
     3) الشعار (SVG)
     ========================================================== */
  let uidn = 0;
  const uid = () => 'g' + (++uidn) + Math.random().toString(36).slice(2, 6);

  function LOGO_MARK(size, flat) {
    const s = size || 40, id = uid(), rot = flat ? 0 : -4;
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 64 64" fill="none" aria-hidden="true" ' +
      'style="transform:rotate(' + rot + 'deg);display:block">' +
      '<defs><linearGradient id="' + id + '" x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">' +
      '<stop stop-color="#7b5cff"/><stop offset=".52" stop-color="#ff2d92"/><stop offset="1" stop-color="#ffb03a"/></linearGradient></defs>' +
      '<rect x="1" y="1" width="62" height="62" rx="18" fill="url(#' + id + ')"/>' +
      '<path d="M21.6 23.4c0-6.2 4.6-10.8 10.4-10.8s10.4 4.4 10.4 9.9c0 4.4-2.4 6.8-5.6 8.7-2.6 1.6-4.6 2.9-4.6 5.7v1.4" ' +
      'stroke="#150a1e" stroke-width="7.2" stroke-linecap="round" fill="none"/>' +
      '<circle cx="32.2" cy="48.6" r="4.1" fill="#150a1e"/>' +
      '<path d="M49.4 9.6l1.7 4.2 4.2 1.7-4.2 1.7-1.7 4.2-1.7-4.2-4.2-1.7 4.2-1.7z" fill="#fff" opacity=".92"/>' +
      '</svg>';
  }

  function LOGO_LOCKUP(size) {
    const s = size || 40;
    return '<span class="brand__mark">' + LOGO_MARK(s) + '</span>' +
      '<span class="brand__text">المليون؟<small>أسئلة وجايزة بالمليون</small></span>';
  }

  /* ==========================================================
     4) الأسئلة (قاعدة البيانات)
     ========================================================== */
  const CATS = [
    { id: 'money', name: 'فلوس وشغل', icon: 'wallet', color: '#ffb03a' },
    { id: 'powers', name: 'قدرات خارقة', icon: 'bolt', color: '#7b5cff' },
    { id: 'travel', name: 'سفر ومغامرة', icon: 'plane', color: '#22d3ee' },
    { id: 'food', name: 'أكل', icon: 'food', color: '#ff5c7a' },
    { id: 'love', name: 'حب وجواز', icon: 'heart', color: '#ff8fab' },
    { id: 'tech', name: 'تكنولوجيا', icon: 'phone', color: '#2ec4b6' },
    { id: 'weird', name: 'غريب ومضحك', icon: 'mask', color: '#a3e635' },
    { id: 'study', name: 'دراسة وشغل', icon: 'book', color: '#8ac926' },
    { id: 'trip', name: 'رحلات', icon: 'bus', color: '#4cc9f0' },
    { id: 'deep', name: 'أسئلة عميقة', icon: 'brain', color: '#a78bfa' }
  ];

  const BASE = [
    /* فلوس وشغل */
    { id: 'm1', c: 'money', q: 'ماذا لو خيّروك بين مليون جنيه دلوقتي على طول، ولا ٥ مليون بعد ٥ سنين؟', o: ['مليون دلوقتي حالًا', '٥ مليون بعد ٥ سنين'], s: [62, 38] },
    { id: 'm2', c: 'money', q: 'ماذا لو خيّروك بين راتب ٣٠ ألف وشغل تقيل ومحتاجه كل يوم، ولا ١٢ ألف وشغل بتحبّه؟', o: ['٣٠ ألف وشغل تقيل', '١٢ ألف وشغل بتحبّه'], s: [48, 52] },
    { id: 'm3', c: 'money', q: 'ماذا لو خيّروك بين تبقى مليونير في السر ومحدش يعرف، ولا مشهور وعندك ١٠٠ ألف بس؟', o: ['مليونير محدش يعرف', 'مشهور و١٠٠ ألف'], s: [71, 29] },
    { id: 'm4', c: 'money', q: 'ماذا لو كل شهر يختفي معاك ١٠٠٠ جنيه، على إيه هتصرفهم؟', o: ['أكل وشرب', 'سفر', 'تكنولوجيا', 'هدوم'], s: [38, 30, 18, 14] },
    { id: 'm5', c: 'money', q: 'ماذا لو خيّروك بين تشتغل من البيت للأبد، ولا تروح المكتب للأبد؟', o: ['من البيت للأبد', 'المكتب للأبد'], s: [67, 33] },
    { id: 'm6', c: 'money', q: 'ماذا لو الكاش اتلغي خالص وبقى كل حاجة بالكارت والبصمة؟', o: ['أيوه طبعًا، أسهل', 'لا طبعًا، الكاش أمان'], s: [41, 59] },
    /* قدرات خارقة */
    { id: 'p1', c: 'powers', q: 'ماذا لو خيّروك بين تقرا أفكار الناس، ولا تبقى غير مرئي وقت اللي تحب؟', o: ['أقرا الأفكار', 'أبقى غير مرئي'], s: [55, 45] },
    { id: 'p2', c: 'powers', q: 'ماذا لو خيّروك بين تطير، ولا تختفي من غير ما حد يحس؟', o: ['أطير', 'أختفي'], s: [64, 36] },
    { id: 'p3', c: 'powers', q: 'ماذا لو خيّروك بين ترجع في الزمن ١٠ سنين بكل اللي تعرفه، ولا تشوف المستقبل ٥ سنين؟', o: ['أرجع للورا', 'أشوف المستقبل'], s: [58, 42] },
    { id: 'p4', c: 'powers', q: 'ماذا لو خيّروك بين متخافش من أي حاجة خالص، ولا تبقى أقوى واحد في الشارع؟', o: ['شجاعة من غير خوف', 'قوة ورهبة'], s: [46, 54] },
    { id: 'p5', c: 'powers', q: 'ماذا لو خيّروك بين تطير بسرعة ٣٠٠ كم/س، ولا تتنقل بين أي مكانين في ثانية؟', o: ['طيران سريع', 'تنقّل لحظي'], s: [39, 61] },
    { id: 'p6', c: 'powers', q: 'ماذا لو خيّروك تختار قدرة واحدة بس، هتختار إيه؟', o: ['الطيران', 'قراءة الأفكار', 'السفر في الزمن', 'الشفاء'], s: [34, 27, 24, 15] },
    /* سفر */
    { id: 't1', c: 'travel', q: 'ماذا لو خيّروك بين أسبوع سفر في شقة فخمة، ولا شهر كامل بترابيزة وشنطة على ضهرك؟', o: ['أسبوع فخم', 'شهر على أد الحال'], s: [42, 58] },
    { id: 't2', c: 'travel', q: 'ماذا لو خيّروك بين تسافر أبعد مكان في العالم لوحدك، ولا رحلة قريبة مع ١٠ من صحابك؟', o: ['أبعد مكان لوحدي', 'رحلة مع الشلة'], s: [29, 71] },
    { id: 't3', c: 'travel', q: 'ماذا لو الدنيا كلها بقت مفتوحة ليك ببلاش، بس ممنوع تركب طيارة؟', o: ['ماشي، أتنقل بأي حاجة', 'لأ، من غير طيارة مش بروح'], s: [68, 32] },
    { id: 't4', c: 'travel', q: 'ماذا لو خيّروك بين تعيش سنة في اليابان، ولا سنة في إيطاليا؟', o: ['اليابان', 'إيطاليا'], s: [52, 48] },
    /* أكل */
    { id: 'f1', c: 'food', q: 'ماذا لو خيّروك بين مفيش كشري تاني في الدنيا أبدًا، ولا مفيش شاي تاني أبدًا؟', o: ['كشري ولا شاي', 'شاي ولا كشري'], s: [57, 43] },
    { id: 'f2', c: 'food', q: 'ماذا لو خيّروك بين تأكل حلويات كل يوم للأبد، ولا مفيش حلويات خالص تاني؟', o: ['حلويات كل يوم', 'بلاش حلويات خالص'], s: [76, 24] },
    { id: 'f3', c: 'food', q: 'ماذا لو خيّروك بين تاكل أكلك المفضل كل يوم لسنة، ولا تبعد عنه سنة؟', o: ['كل يوم سنة كاملة', 'أستغنى عنه سنة'], s: [44, 56] },
    { id: 'f4', c: 'food', q: 'ماذا لو مسموح لك بتلات أصناف بس على مدار حياتك؟', o: ['كشري وطعمية', 'مكرونة وباستا', 'مشويات', 'فطير وحلويات'], s: [31, 26, 24, 19] },
    { id: 'f5', c: 'food', q: 'ماذا لو خيّروك بين فطار بلدي كل يوم، ولا فطار فندق فخم كل يوم؟', o: ['فطار بلدي', 'فطار فندق'], s: [66, 34] },
    /* حب */
    { id: 'l1', c: 'love', q: 'ماذا لو خيّروك بين حبيب بيحبك بجد ومفيش فلوس، ولا حد غني ومش بيحبك؟', o: ['حب ونقعد على أدنا', 'فلوس وإحساس بلاش'], s: [79, 21] },
    { id: 'l2', c: 'love', q: 'ماذا لو خيّروك بين جواز من غير حب، ولا حب من غير جواز؟', o: ['جواز من غير حب', 'حب من غير جواز'], s: [36, 64] },
    { id: 'l3', c: 'love', q: 'ماذا لو خيّروك بين تعرف كل أسرار شريكك، ولا يبقى عندك سر واحد مش هينكشف أبدًا؟', o: ['أعرف كل أسراره', 'أحتفظ بسرّي'], s: [47, 53] },
    { id: 'l4', c: 'love', q: 'ماذا لو الجو بقى مثالي، بس لازم تسكن مع أهل الطرف التاني في نفس العمارة؟', o: ['ماشي، الجو هيكمل', 'لأ شكرًا، عايز خصوصية'], s: [31, 69] },
    /* تكنولوجيا */
    { id: 'x1', c: 'tech', q: 'ماذا لو خيّروك بين تعيش من غير سوشيال ميديا سنة، ولا من غير تليفون أسبوع؟', o: ['من غير سوشيال سنة', 'من غير تليفون أسبوع'], s: [61, 39] },
    { id: 'x2', c: 'tech', q: 'ماذا لو خيّروك بين بطارية أسبوع، ولا إنترنت ١ جيجا في أي مكان؟', o: ['بطارية أسبوع', 'نت صاروخي'], s: [43, 57] },
    { id: 'x3', c: 'tech', q: 'ماذا لو الذكاء الاصطناعي بقى يشتغل مكانك، وأنت بتاخد نص الراتب وتقعد في البيت؟', o: ['موافق فورًا', 'لأ، عايز أشتغل بنفسي'], s: [72, 28] },
    { id: 'x4', c: 'tech', q: 'ماذا لو لازم تستغنى عن تليفونك يوم كامل، هتستغنى عن إيه الأول؟', o: ['السوشيال', 'الواتساب', 'الألعاب', 'الكاميرا'], s: [29, 41, 17, 13] },
    /* غريب ومضحك */
    { id: 'w1', c: 'weird', q: 'ماذا لو خيّروك بين عينك تبقى كاميرا بتسجل كل حاجة، ولا ودنك تسمع من ١٠٠ متر؟', o: ['كاميرا في عيني', 'سمع من ١٠٠ متر'], s: [38, 62] },
    { id: 'w2', c: 'weird', q: 'ماذا لو كل مرة تكدب يطلع على وشك لون أزرق لمدة ساعة؟', o: ['هبقى صادق جدًا', 'هبقى أزرق على طول'], s: [74, 26] },
    { id: 'w3', c: 'weird', q: 'ماذا لو خيّروك بين تمشي على إيديك شهر، ولا تتكلم شهر؟', o: ['أمشي على إيديا', 'أسكت شهر'], s: [21, 79] },
    { id: 'w4', c: 'weird', q: 'ماذا لو كل الأغاني بقت بصوتك للأبد، ولا مفيش أغاني تاني في الدنيا؟', o: ['أغاني بصوتي', 'مفيش موسيقى'], s: [33, 67] },
    { id: 'w5', c: 'weird', q: 'ماذا لو خيّروك بين تنام ساعتين بس من غير تعب، ولا ١٠ ساعات وتعيش نص يومك نايم؟', o: ['ساعتين ونشيط', '١٠ ساعات ومرتاح'], s: [55, 45] },
    { id: 'w6', c: 'weird', q: 'ماذا لو كل حاجة بتاكلها بتتحول للون الأخضر قبل ما تدوقها؟', o: ['مش مشكلة', 'لأ، شهيتي هتقفل'], s: [24, 76] },
    { id: 'w7', c: 'weird', q: 'ماذا لو لازم تختار صوت واحد بس يفضل شغال حواليك للأبد؟', o: ['صوت المطر', 'صوت البحر', 'سكوت تام', 'صوت صحابك'], s: [34, 29, 22, 15] },
    /* دراسة وشغل */
    { id: 's1', c: 'study', q: 'ماذا لو خيّروك بين ترجع ثانوي بس بذكاء اليوم ده، ولا تدخل الكلية اللي نفسك فيها من غير امتحان؟', o: ['أرجع ثانوي', 'كلية من غير امتحان'], s: [35, 65] },
    { id: 's2', c: 'study', q: 'ماذا لو كل حاجة ذاكرتها بتفضل في دماغك للأبد، بس بتيجي في المنام وتصحى تعبان؟', o: ['ذاكرة خارقة', 'لأ، نومي أهم'], s: [57, 43] },
    { id: 's3', c: 'study', q: 'ماذا لو خيّروك بين شغل حلمك براتب متوسط، ولا شغل مش بتحبه براتب عالي؟', o: ['حلمي مهما كان', 'الراتب العالي'], s: [49, 51] },
    { id: 's4', c: 'study', q: 'ماذا لو خيّروك بين تشتغل شغلين وتجيب دبل، ولا شغل واحد براحة بالك؟', o: ['شغلين ومضاعفة', 'شغل واحد وهدوء'], s: [31, 69] },
    /* رحلات */
    { id: 'r1', c: 'trip', q: 'ماذا لو خيّروك بين رحلة يوم مع الشلة كل أسبوع، ولا رحلة أسبوع كامل كل سنة؟', o: ['كل أسبوع يوم', 'أسبوع كامل في السنة'], s: [58, 42] },
    { id: 'r2', c: 'trip', q: 'ماذا لو هتسافر مع ٢٠ واحد ببصلة، ولا مع ٣ بس كل واحد فيهم هيمسك وينجّم؟', o: ['٢٠ واحد وعشوائية', '٣ بس وانتظام'], s: [44, 56] },
    { id: 'r3', c: 'trip', q: 'ماذا لو في الرحلة مسموح لك باختيار الأغاني للأبد، ولا الأكل للأبد؟', o: ['أنا الدي جي', 'أنا الشيف'], s: [52, 48] },
    { id: 'r4', c: 'trip', q: 'ماذا لو خيّروك بين مكان ببحر جميل ومفيش نت، ولا مكان عادي ونت صاروخي؟', o: ['بحر ومفيش نت', 'عادي ونت سريع'], s: [63, 37] },
    { id: 'r5', c: 'trip', q: 'ماذا لو هتورّد شنطة رحلة واحدة بس، هتفضّل إيه؟', o: ['أكل وسناكس', 'هدوم زيادة', 'أدوات ترفيه', 'أدوية وإسعافات'], s: [30, 27, 25, 18] },
    /* أسئلة عميقة */
    { id: 'd1', c: 'deep', q: 'ماذا لو خيّروك بين تعرف السبب الحقيقي لكل حاجة حصلت في حياتك، ولا تعيش في سلام من غير ما تعرف؟', o: ['أعرف كل حاجة', 'عيش في سلام'], s: [44, 56] },
    { id: 'd2', c: 'deep', q: 'ماذا لو أغلى صحابك في وقت محتاجك، بس هتضحي بحلمك عشانه؟', o: ['أضحي بالحلم', 'أفضل على حلمي'], s: [67, 33] },
    { id: 'd3', c: 'deep', q: 'ماذا لو خيّروك بين تعيش ١٠٠ سنة بصحة كاملة لوحدك، ولا ٦٠ سنة وسط كل اللي بتحبهم؟', o: ['١٠٠ سنة لوحدي', '٦٠ سنة معاهم'], s: [14, 86] },
    { id: 'd4', c: 'deep', q: 'ماذا لو تعرف موعد آخر يوم في حياتك، تقدر تكمل عادي؟', o: ['أيوه، هختار أعيشه صح', 'لأ، معرفته هتقتلني'], s: [58, 42] },
    { id: 'd5', c: 'deep', q: 'ماذا لو خيّروك بين تكون سعيد ومحدش فاكرك بعد ١٠ سنين، ولا مشهور ومش سعيد؟', o: ['سعيد ومنسي', 'مشهور وموجوع'], s: [82, 18] },
    { id: 'd6', c: 'deep', q: 'ماذا لو خيّروك تمسح حاجة واحدة من حياتك للأبد؟', o: ['الخوف', 'الندم', 'الغضب', 'الملل'], s: [31, 27, 22, 20] }
  ];

  /* ==========================================================
     5) التخزين والتصويت
     ========================================================== */
  const LS = {
    get(k, d) { try { const v = localStorage.getItem('ml_' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('ml_' + k, JSON.stringify(v)); } catch (e) {} },
    del(k) { try { localStorage.removeItem('ml_' + k); } catch (e) {} }
  };

  /* التخزين المحلي بقى للتفضيلات الشخصية بس (الصوت، الستريك، الجولة المفتوحة).
     الأصوات والأسئلة والإحصائيات كلها في قاعدة بيانات Supabase — مفيش بيانات وهمية. */
  const store = {
    settings: LS.get('settings', { sound: true }),
    streak: LS.get('streak', { n: 0, last: '' }),
    save(k) { LS.set(k, this[k]); }
  };

  const allQuestions = () => BASE.concat(customQuestions());
  const byId = (id) => allQuestions().find((q) => q.id === id) || null;
  const catOf = (id) => CATS.find((c) => c.id === id) || null;

  /* أسئلة الزوار — جاية من Supabase (مفيش أسئلة محلية) */
  function customQuestions() {
    const records = isRecord(DATA.questions) ? DATA.questions : {};
    return Object.keys(records).filter(validKey).flatMap((key) => {
      const v = records[key];
      if (!isRecord(v) || typeof v.q !== 'string' || v.q.length < 8 || v.q.length > 160) return [];
      if (![v.o0, v.o1].every(o => typeof o === 'string' && o.trim() && o.length <= 60)) return [];
      const opts = ['o0', 'o1', 'o2', 'o3'].map((k) => v[k]).filter((x) => typeof x === 'string' && x.trim() && x.length <= 60);
      if (opts.length < 2) return [];
      return [{ id: key, q: v.q, o: opts, c: catOf(v.c) ? v.c : 'weird', custom: true,
        by: boundedText(v.name, 40), at: Number.isFinite(v.at) && v.at >= 0 ? v.at : 0 }];
    }).sort((a, b) => b.at - a.at);
  }

  /* الأصوات الحقيقية من قاعدة البيانات (تجميع من السيرفر) */
  function countsOf(q) {
    const row = (DATA.counts && DATA.counts[q.id]) || {};
    return q.o.map((o, i) => {
      const n = Number(row[i]);
      return Number.isFinite(n) && n > 0 ? n : 0;
    });
  }

  const myVote = (qid) => {
    if (!AUTH.user) return undefined;
    const v = DATA.myVotes ? DATA.myVotes[qid] : undefined;
    return v === undefined || v === null ? undefined : Number(v);
  };
  const realVotes = (q) => sum(countsOf(q));
  const totalVotes = () => Object.keys(DATA.counts || {}).reduce((n, qid) => {
    const row = DATA.counts[qid] || {};
    return n + Object.keys(row).reduce((m, c) => m + Number(row[c] || 0), 0);
  }, 0);
  const myVotesCount = () => Object.keys(DATA.myVotes || {}).length;

  /* تسجيل الصوت في قاعدة البيانات: صوت واحد لكل حساب لكل سؤال */
  async function castVote(q, idx) {
    if (!AUTH.user) {
      AUTH.afterAuth = '#/q/' + encodeURIComponent(q.id);
      toast('سجّل دخول عشان صوتك يتحسب للجميع');
      location.hash = '#/auth?tab=login';
      return false;
    }
    if (myVote(q.id) !== undefined) return false;
    try {
      const { error } = await SB.client.from('votes').upsert({
        question_id: String(q.id),
        user_id: AUTH.user.id,
        choice: idx
      }, { onConflict: 'question_id,user_id' });
      if (error) throw error;
      DATA.myVotes[q.id] = idx;
      DATA.soon('votes', DATA.loadVotes);
    } catch (e) {
      toast(sbWriteError(e));
      return false;
    }
    const t = todayKey(), st = store.streak;
    if (st.last !== t) {
      const y = new Date(Date.now() - 864e5).toLocaleDateString('en-CA');
      st.n = st.last === y ? (st.n || 0) + 1 : 1;
      st.last = t; store.save('streak');
    }
    SFX.pick();
    return true;
  }

  /* نشر سؤال جديد في قاعدة البيانات */
  async function addCustom(q) {
    if (!AUTH.user) throw new Error('سجّل دخول الأول عشان سؤالك يتنشر للكل.');
    const opts = q.o.slice(0, 4).map((x) => String(x).trim().slice(0, 60)).filter((x) => x.length > 0);
    const payload = {
      q: String(q.q || '').trim().slice(0, 160),
      c: (q.c || 'weird'),
      uid: AUTH.user.id,
      name: (AUTH.user.name || 'لاعب').slice(0, 40)
    };
    /* الاختيارات بتتخزن في أعمدة o0..o3 عشان قيود القاعدة تتحقق منها */
    opts.forEach((o, i) => { payload['o' + i] = o; });
    const { data, error } = await SB.client.from('questions').insert(payload).select('id').single();
    if (error) throw new Error(sbWriteError(error));
    DATA.soon('questions', DATA.loadQuestions);
    return { id: data.id, q: payload.q, o: opts, c: payload.c, custom: true, by: payload.name, at: Date.now() };
  }

  /* ==========================================================
     5.5) مشاركة حقيقية لتطبيقات الموبايل
     - Web Share API (ملف + نص) → يفتح شيت المشاركة الأصلي في الموبايل
     - fallback: deep links لكل تطبيق + نسخ
     ========================================================== */
  const APP_URL = () => pageUrl();

  function shareTextFor(kind, extra) {
    const g = MZ.g || {};
    if (kind === 'win') {
      return 'كسبت المليون في «من سيربح المليون؟» — ' + num(MZ_TOTAL) + ' سؤال و٤٠ مستوى.\nجرّب تكسب الشيك: ' + APP_URL();
    }
    if (kind === 'out') {
      return 'انسحبت بـ ' + mzMoney(g.amount || 0) + ' في «من سيربح المليون؟» — تقدر توصل أعلى؟\n' + APP_URL();
    }
    if (kind === 'lose') {
      return 'وصلت مستوى ' + num(g.correct || 0) + ' من ' + num(MZ_TOTAL) + ' في «من سيربح المليون؟» — جرّب تغلبني:\n' + APP_URL();
    }
    return extra || ('العب «من سيربح المليون؟» — ' + num(MZ_TOTAL) + ' سؤال لحد مليون جنيه:\n' + APP_URL());
  }

  function mzShareKind() {
    const g = MZ.g || {};
    if (g.stage === 'win') return 'win';
    if (g.stage === 'out') return 'out';
    if (g.stage === 'lose') return 'lose';
    return 'invite';
  }

  /* هل المتصفح بيدعم مشاركة الملفات؟ */
  function canShareFiles(file) {
    try {
      return !!(navigator.canShare && navigator.canShare({ files: [file] }));
    } catch (e) { return false; }
  }

  function chequeFile() {
    const cv = document.getElementById('mzCheque');
    if (!cv) return null;
    try {
      const data = cv.toDataURL('image/png').split(',')[1];
      const bin = atob(data);
      const arr = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      return new File([arr], 'cheque-million.png', { type: 'image/png' });
    } catch (e) { return null; }
  }

  /* المشاركة الأصلية: بتفتح شيت التطبيقات (واتساب/تليجرام/فيسبوك/ماسنجر/…) */
  async function nativeShare(opts) {
    opts = opts || {};
    const text = shareTextFor(mzShareKind(), opts.text);
    const file = opts.withImage ? chequeFile() : null;
    if (navigator.share) {
      try {
        if (file && canShareFiles(file)) {
          await navigator.share({ title: 'من سيربح المليون؟', text: text, url: APP_URL(), files: [file] });
          return 'shared-file';
        }
        await navigator.share({ title: 'من سيربح المليون؟', text: text, url: APP_URL() });
        return 'shared';
      } catch (e) {
        if (e && e.name === 'AbortError') return 'abort';
      }
    }
    const ok = await copyText(text);
    return ok ? 'copied' : 'fail';
  }

  /* مسار مباشر لكل تطبيق (بيشتغل على الموبايل حتى من غير Web Share) */
  function appLinks(text) {
    const t = encodeURIComponent(text);
    return {
      whatsapp: 'https://wa.me/?text=' + t,
      telegram: 'https://t.me/share/url?url=' + encodeURIComponent(APP_URL()) + '&text=' + t,
      facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(APP_URL()) + '&quote=' + t,
      messenger: 'fb-messenger://share?link=' + encodeURIComponent(APP_URL()),
      sms: 'sms:?&body=' + t,
      mail: 'mailto:?subject=' + encodeURIComponent('من سيربح المليون؟') + '&body=' + t
    };
  }

  function mzShareButtons() {
    const L = appLinks(shareTextFor(mzShareKind()));
    const b = (act, icon, label, href) => href
      ? '<a class="shareapp shareapp--' + act + '" href="' + href + '" ' + (act === 'messenger' ? '' : 'target="_blank" rel="noopener"') + '>' + ICON(icon) + '<span>' + label + '</span></a>'
      : '<button class="shareapp shareapp--' + act + '" type="button" data-act="share-' + act + '">' + ICON(icon) + '<span>' + label + '</span></button>';
    return b('native', 'share', 'مشاركة…', null) +
      b('whatsapp', 'whatsapp', 'واتساب', L.whatsapp) +
      b('telegram', 'send', 'تليجرام', L.telegram) +
      b('facebook', 'facebook', 'فيسبوك', L.facebook) +
      b('messenger', 'chat', 'ماسنجر', L.messenger) +
      b('sms', 'phone', 'رسالة SMS', L.sms) +
      b('mail', 'mail', 'إيميل', L.mail) +
      b('copy', 'link', 'نسخ الرابط', null);
  }

  async function mzShareAction(which) {
    if (which === 'native') {
      const r = await nativeShare({ withImage: true });
      if (r === 'shared-file') toast('اتفتح شيت المشاركة — اختار التطبيق وابعت الشيك');
      else if (r === 'shared') toast('اتفتح شيت المشاركة — اختار التطبيق');
      else if (r === 'copied') toast('المتصفح مش بيدعم المشاركة — اتنسخ النص، ابعته على واتساب');
      return;
    }
    if (which === 'copy') {
      const ok = await copyText(shareTextFor(mzShareKind()));
      toast(ok ? 'اتنسخ النص والرابط — ابعته على أي تطبيق' : 'مش قادر أنسخ — اختار رابط من الصفحة');
    }
  }

  /* ==========================================================
     6) صوت + توست + كونفيتي
     ========================================================== */
  const SFX = {
    ctx: null,
    get on() { return !!store.settings.sound; },
    ensure() {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!this.ctx && AC) this.ctx = new AC();
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
      return this.ctx;
    },
    blip(f, d, type, g) {
      if (!this.on) return;
      const ctx = this.ensure(); if (!ctx) return;
      try {
        const o = ctx.createOscillator(), gn = ctx.createGain();
        o.type = type || 'sine'; o.frequency.value = f;
        const t = ctx.currentTime;
        gn.gain.setValueAtTime(0.0001, t);
        gn.gain.exponentialRampToValueAtTime(g || 0.05, t + 0.012);
        gn.gain.exponentialRampToValueAtTime(0.0001, t + (d || 0.09));
        o.connect(gn); gn.connect(ctx.destination);
        o.start(t); o.stop(t + (d || 0.09) + 0.03);
      } catch (e) {}
    },
    tick() { this.blip(420, 0.05, 'triangle', 0.03); },
    pick() { this.blip(620, 0.08); setTimeout(() => this.blip(900, 0.12), 70); },
    reveal() { [520, 700, 880].forEach((f, i) => setTimeout(() => this.blip(f, 0.12, 'sine', 0.045), i * 70)); },
    win() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.blip(f, 0.18, 'sine', 0.05), i * 95)); },
    toggle() { store.settings.sound = !store.settings.sound; store.save('settings'); if (store.settings.sound) this.pick(); return store.settings.sound; }
  };

  let toastT = null;
  function toast(msg, ms) {
    const box = $('#toast'); if (!box) return;
    box.firstElementChild.textContent = msg;
    box.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(() => box.classList.remove('is-on'), ms || 2300);
  }

  function confetti(x, y, n) {
    const layer = $('#confetti'); if (!layer) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const colors = ['#7b5cff', '#ff2d92', '#22d3ee', '#ffb03a', '#a3e635', '#ff8fab'];
    const cx = x == null ? window.innerWidth / 2 : x;
    const cy = y == null ? window.innerHeight * 0.35 : y;
    for (let i = 0; i < (n || 16); i++) {
      const p = document.createElement('i');
      const ang = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 150;
      p.style.left = cx + 'px'; p.style.top = cy + 'px';
      p.style.background = pick(colors);
      p.style.width = (6 + Math.random() * 7) + 'px';
      p.style.height = (6 + Math.random() * 7) + 'px';
      p.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
      p.style.setProperty('--dy', Math.sin(ang) * dist + 45 + 'px');
      p.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
      layer.appendChild(p);
      setTimeout(() => p.remove(), 1200);
    }
  }

  /* ==========================================================
     7) مشاركة
     ========================================================== */
  const pageUrl = () => location.origin + location.pathname;
  const qUrl = (id) => pageUrl() + '#/q/' + encodeURIComponent(id);

  async function copyText(txt) {
    /* الطريقة الحديثة أولًا (وتشتغل بس على https أو localhost) */
    if (navigator.clipboard && window.isSecureContext) {
      try { await navigator.clipboard.writeText(txt); return true; } catch (e) {}
    }
    /* احتياطي قديم — بيشتغل على أي متصفح، وخصوصًا على الموبايل */
    try {
      const ta = document.createElement('textarea');
      ta.value = txt;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;padding:0;border:0;opacity:0;';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      ta.setSelectionRange(0, txt.length);
      const ok = document.execCommand('copy');
      ta.remove();
      return !!ok;
    } catch (e) { return false; }
  }

  async function shareQuestion(q) {
    const text = q.q + '\n\nصوّت وقولي رأيك: ' + qUrl(q.id);
    if (navigator.share) {
      try { await navigator.share({ title: 'ماذا لو؟', text: text, url: qUrl(q.id) }); return 'shared'; }
      catch (e) { if (e && e.name === 'AbortError') return 'abort'; }
    }
    return (await copyText(text)) ? 'copied' : 'fail';
  }

  /* ==========================================================
     7.4) Supabase — الاتصال الحقيقي بقاعدة البيانات
     ----------------------------------------------------------
     • Supabase Auth : حسابات حقيقية (إيميل/باسورد + جوجل)
     • Postgres (RLS): التصويتات، الأسئلة، الإحصائيات، المتصدرين، الغرف
     • Realtime      : تحديث لحظي للأصوات وغرف تحدي الشلة
     الإعدادات في الثابت SB_CONFIG تحت — مفيش وضع تجريبي ولا بيانات وهمية.
     ========================================================== */
  const SB_CONFIG = {
    url: 'https://hrfzogcmophmhjuyrxhd.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyZnpvZ2Ntb3BobWhqdXlyeGhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4MTE1MzEsImV4cCI6MjEwNTM4NzUzMX0.YFLiy6DC6P8vfgSIMEC8_Eab0lrFEmwq-qQ_HIhVjFs'
  };

  /* عميل واحد لكل الصفحة — سكربت supabase.min.js محمّل قبل الملف ده */
  const SB = {
    ready: false,
    error: '',
    client: null,

    configured() {
      return !!(window.SupabaseLib && SB_CONFIG && SB_CONFIG.url && SB_CONFIG.key &&
        SB_CONFIG.key.indexOf('__') !== 0);
    },

    init() {
      if (!this.configured()) { this.error = 'config'; return false; }
      try {
        this.client = window.SupabaseLib.createClient(SB_CONFIG.url, SB_CONFIG.key, {
          auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' }
        });
        this.ready = true;
        this.error = '';
        return true;
      } catch (e) {
        this.error = (e && e.message) || 'init';
        this.ready = false;
        return false;
      }
    }
  };

  /* رابط الرجوع بعد تسجيل الدخول بجوجل */
  function sbRedirect() {
    try { return location.origin + location.pathname; } catch (e) { return undefined; }
  }

  function sbWriteError(e) {
    const c = String((e && (e.code || e.status || e.message)) || '');
    if (c.indexOf('Failed to fetch') > -1 || c.indexOf('NetworkError') > -1 || c.indexOf('network') > -1) {
      return 'مشكلة في النت — جرّب تاني.';
    }
    if (c.indexOf('JWT') > -1 || c === '401' || c.indexOf('refresh') > -1) return 'لازم تسجّل دخول الأول.';
    if (c.indexOf('23505') > -1 || c.indexOf('duplicate') > -1) return 'البيانات دي محفوظة قبل كده.';
    if (c.indexOf('23514') > -1 || c.indexOf('violates') > -1 || c.indexOf('check constraint') > -1) {
      return 'البيانات مش مطابقة للشروط — راجع اللي كتبته.';
    }
    if (c.indexOf('42501') > -1 || c.indexOf('permission') > -1 || c.indexOf('RLS') > -1 || c === '403') {
      return 'مش مسموح بالعملية دي — سجّل دخول أو جرّب تاني بعد شوية.';
    }
    return 'حصلت مشكلة في الحفظ — جرّب تاني.';
  }

  /* ==========================================================
     7.5) المصادقة — Supabase Auth (تسجيل حقيقي)
     ========================================================== */
  const AUTH = {
    user: null,
    mode: 'off',
    busy: false,
    loaded: false,
    afterAuth: null,
    listeners: [],

    on(fn) { this.listeners.push(fn); },
    emit() { this.listeners.forEach((fn) => { try { fn(this.user); } catch (e) {} }); },

    /* ---------- التهيئة ---------- */
    async init() {
      const ok = SB.init();
      AUTH.mode = ok ? 'supabase' : 'off';
      if (!ok) {
        AUTH.loaded = true;
        AUTH.emit();
        syncChrome();
        return;
      }

      /* Supabase بينادي الكولباك جوه قفل داخلي — نأجّل أي شغل عليه */
      SB.client.auth.onAuthStateChange((event, session) => {
        setTimeout(() => { AUTH.applySession(session); }, 0);
      });

      let session = null;
      try {
        const res = await SB.client.auth.getSession();
        session = res && res.data ? res.data.session : null;
      } catch (e) {}
      await AUTH.applySession(session);
    },

    /* ---------- تطبيق الجلسة على واجهة الموقع ---------- */
    async applySession(session) {
      const prevUid = AUTH.user && AUTH.user.id;

      if (!session || !session.user) {
        AUTH.user = null;
        AUTH.loaded = true;
        AUTH.emit();
        syncChrome();
        if (prevUid) { DATA.stop(); roomLeave(true); }
        return;
      }

      const u = session.user;
      const meta = u.user_metadata || {};
      AUTH.user = AUTH.normalize({
        id: u.id,
        name: meta.name || meta.full_name || (u.email || '').split('@')[0],
        email: u.email || '',
        provider: (u.app_metadata && u.app_metadata.provider) || 'email',
        photo: meta.avatar_url || meta.picture || ''
      });
      AUTH.loaded = true;
      AUTH.emit();
      syncChrome();

      if (prevUid !== AUTH.user.id) {
        DATA.start();
        await AUTH.loadProfile();
        userActivityStop = startUserActivity();
      }

      const r = parse();
      if (r.name === 'auth' || r.name === 'million' || r.name === 'home' || r.name === 'party') render(false);
    },

    ready() { return AUTH.mode === 'supabase' && SB.ready && !!SB.client; },

    normalize(u) {
      return {
        id: u.id || '',
        name: u.name || (u.email || '').split('@')[0],
        email: u.email || '',
        provider: u.provider || 'email',
        photo: u.photo || ''
      };
    },

    /* ---------- بروفايل في قاعدة البيانات ---------- */
    async loadProfile() {
      if (!AUTH.ready() || !AUTH.user) return;
      try {
        const { data } = await SB.client.from('profiles')
          .select('name,avatar_url').eq('id', AUTH.user.id).maybeSingle();
        if (data) {
          if (data.name && data.name !== AUTH.user.name) {
            AUTH.user = Object.assign({}, AUTH.user, {
              name: data.name,
              photo: data.avatar_url || AUTH.user.photo
            });
            AUTH.emit();
            syncChrome();
          }
        } else {
          AUTH.saveProfile();
        }
      } catch (e) {}
    },

    saveProfile() {
      if (!AUTH.ready() || !AUTH.user) return;
      const payload = {
        id: AUTH.user.id,
        name: (AUTH.user.name || 'لاعب').slice(0, 40),
        email: (AUTH.user.email || '').slice(0, 254),
        avatar_url: (AUTH.user.photo || '').slice(0, 500)
      };
      try {
        SB.client.from('profiles').upsert(payload, { onConflict: 'id' }).then(() => {}).catch(() => {});
      } catch (e) {}
    },

    /* ---------- إنشاء حساب ---------- */
    async signup(name, email, pw) {
      if (!AUTH.ready()) throw new Error('الخدمة مش متاحة دلوقتي — حدّث الصفحة وجرّب تاني.');
      name = String(name || '').trim();
      email = String(email || '').trim().toLowerCase();
      const check = AUTH.validate(name, email, pw);
      if (check) throw new Error(check);

      let res;
      try {
        res = await SB.client.auth.signUp({
          email: email,
          password: pw,
          options: { data: { name: name }, emailRedirectTo: sbRedirect() }
        });
      } catch (e) {
        throw new Error(AUTH.fbError(e));
      }
      if (res.error) throw new Error(AUTH.fbError(res.error));

      if (!res.data || !res.data.session) {
        throw new Error('بعتنالك لينك تأكيد على الإيميل — فعّله الأول وبعدين سجّل دخول.');
      }

      /* الاسم بيتحفظ في البروفايل (التريجر بيعمله، وده احتياطي) */
      try {
        await SB.client.from('profiles').upsert({
          id: res.data.user.id,
          name: name.slice(0, 40),
          email: email,
          avatar_url: ''
        }, { onConflict: 'id' });
      } catch (e) {}

      await AUTH.applySession(res.data.session);
      return res.data.user;
    },

    /* ---------- تسجيل الدخول ---------- */
    async login(email, pw) {
      if (!AUTH.ready()) throw new Error('الخدمة مش متاحة دلوقتي — حدّث الصفحة وجرّب تاني.');
      email = String(email || '').trim().toLowerCase();
      if (!AUTH.validEmail(email)) throw new Error('اكتب إيميل صحيح.');
      if (!pw) throw new Error('اكتب كلمة المرور.');

      let res;
      try {
        res = await SB.client.auth.signInWithPassword({ email: email, password: pw });
      } catch (e) {
        throw new Error(AUTH.fbError(e));
      }
      if (res.error) throw new Error(AUTH.fbError(res.error));

      await AUTH.applySession(res.data.session);
      return res.data.user;
    },

    /* ---------- تسجيل بجوجل ---------- */
    async google() {
      if (!AUTH.ready()) throw new Error('الخدمة مش متاحة دلوقتي — حدّث الصفحة وجرّب تاني.');
      try {
        const res = await SB.client.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: sbRedirect() }
        });
        if (res.error) throw res.error;
        return null; /* إعادة توجيه جارية */
      } catch (e) {
        throw new Error(AUTH.fbError(e));
      }
    },

    /* ---------- خروج ---------- */
    async logout() {
      if (ROOM.code) await roomLeave(true);
      if (AUTH.ready()) { try { await SB.client.auth.signOut(); } catch (e) {} }
      AUTH.user = null;
      DATA.stop();
      AUTH.emit();
      syncChrome();
    },

    /* ---------- تحديث الاسم ---------- */
    update(patch) {
      if (!AUTH.user) return;
      AUTH.user = Object.assign({}, AUTH.user, patch);
      if (AUTH.ready() && patch.name) {
        try {
          SB.client.auth.updateUser({ data: { name: patch.name } }).then(() => {}).catch(() => {});
        } catch (e) {}
      }
      AUTH.saveProfile();
      syncChrome();
    },

    /* ---------- إحصائيات اللعب في قاعدة البيانات ---------- */
    recordWin() { bumpStats({ wins: 1, plays: 0, best: 1000000 }); },
    recordPlay() { bumpStats({ wins: 0, plays: 1, best: 0 }); },
    recordBest(v) { bumpStats({ wins: 0, plays: 0, best: Number(v) || 0 }); },

    /* ---------- مساعدات ---------- */
    validEmail(e) { return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(String(e || '').trim()); },

    validate(name, email, pw) {
      if (typeof name !== 'string' || name.length < 2 || name.length > 40) return 'الاسم لازم يكون من حرفين لحد ٤٠ حرف.';
      if (typeof email !== 'string' || email.length > 254 || !AUTH.validEmail(email)) return 'اكتب إيميل صحيح زي name@example.com.';
      if (typeof pw !== 'string' || pw.length < 6 || pw.length > 4096) return 'طول كلمة المرور غير مناسب — استخدم ٦ أحرف على الأقل.';
      return '';
    },

    /* ---------- ترجمة أخطاء Supabase ---------- */
    fbError(e) {
      const msg = String((e && (e.message || e.error_description || e.msg)) || e || '');
      const code = String((e && (e.code || e.error_code || e.status)) || '');
      const all = (msg + ' ' + code).toLowerCase();

      if (all.indexOf('invalid login credentials') > -1) return 'الإيميل أو كلمة المرور غير صحيحة.';
      if (all.indexOf('email not confirmed') > -1) return 'فعّل إيميلك الأول من الرسالة اللي بعتناها — وبعدين سجّل دخول.';
      if (all.indexOf('user already registered') > -1 || all.indexOf('already been registered') > -1) {
        return 'الإيميل ده متسجل قبل كده — جرّب تسجيل الدخول.';
      }
      if (all.indexOf('password should be at least') > -1 || all.indexOf('weak_password') > -1) {
        return 'كلمة المرور ضعيفة — ٦ حروف على الأقل.';
      }
      if (all.indexOf('unable to validate email') > -1 || all.indexOf('invalid email') > -1 || all.indexOf('email_address_invalid') > -1) {
        return 'الإيميل مش صحيح.';
      }
      if (all.indexOf('email rate limit') > -1 || all.indexOf('over_email_send_rate_limit') > -1) {
        return 'بعتنالك رسائل كتير — استنى دقيقة وجرّب تاني.';
      }
      if (all.indexOf('provider is not enabled') > -1 || all.indexOf('unsupported provider') > -1) {
        return 'تسجيل جوجل مش مفعّل في المشروع — استخدم الإيميل وكلمة المرور دلوقتي.';
      }
      if (all.indexOf('popup') > -1) return 'المتصفح منع النافذة — اسمح بالنوافذ وجرّب.';
      if (all.indexOf('rate limit') > -1 || all.indexOf('too many') > -1 || code === '429') {
        return 'محاولات كثيرة — استنى شوية وجرّب تاني.';
      }
      if (all.indexOf('failed to fetch') > -1 || all.indexOf('network') > -1) return 'مشكلة في النت — جرّب تاني.';
      if (all.indexOf('signup') > -1 && all.indexOf('disabled') > -1) return 'التسجيل مقفول دلوقتي — جرّب بعد شوية.';
      return msg || 'حصلت مشكلة — جرّب تاني.';
    },

    /* توافق مع الاسم القديم */
    get fb() { return AUTH.ready() ? { client: SB.client } : null; }
  };

  /* ==========================================================
     7.6) طبقة البيانات الحقيقية (Supabase / Postgres)
     ========================================================== */
  const DATA = {
    counts: {},      /* qid -> { choice: عدد الأصوات } */
    myVotes: {},     /* qid -> اختياري */
    questions: {},   /* qid -> السؤال */
    stats: { plays: 0, wins: 0, best: 0 },
    board: {},
    started: false,
    channel: null,
    timers: {},

    async start() {
      DATA.stop();
      if (!SB.ready || !AUTH.user) return;
      DATA.started = true;
      await Promise.all([DATA.loadVotes(), DATA.loadQuestions(), DATA.loadStats(), DATA.loadBoard()]);
      if (!DATA.started) return;

      const uid = AUTH.user.id;
      const name = 'data:' + uid.slice(0, 8) + ':' + Math.random().toString(36).slice(2, 8);
      const ch = SB.client.channel(name);
      ch.on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, () => DATA.soon('votes', DATA.loadVotes));
      ch.on('postgres_changes', { event: '*', schema: 'public', table: 'questions' }, () => DATA.soon('questions', DATA.loadQuestions));
      ch.on('postgres_changes', { event: '*', schema: 'public', table: 'leaderboard' }, () => DATA.soon('board', DATA.loadBoard));
      ch.on('postgres_changes', { event: '*', schema: 'public', table: 'stats', filter: 'user_id=eq.' + uid }, () => DATA.soon('stats', DATA.loadStats));
      ch.subscribe();
      DATA.channel = ch;
    },

    soon(key, fn) {
      clearTimeout(DATA.timers[key]);
      DATA.timers[key] = setTimeout(() => { try { fn.call(DATA); } catch (e) {} }, 220);
    },

    stop() {
      if (DATA.channel && SB.client) { try { SB.client.removeChannel(DATA.channel); } catch (e) {} }
      DATA.channel = null;
      Object.keys(DATA.timers).forEach((k) => clearTimeout(DATA.timers[k]));
      DATA.timers = {};
      DATA.counts = {};
      DATA.myVotes = {};
      DATA.questions = {};
      DATA.stats = { plays: 0, wins: 0, best: 0 };
      DATA.board = {};
      DATA.started = false;
    },

    /* الأصوات: بنجيب التجميع (view) + أصوات المستخدم نفسه */
    async loadVotes() {
      if (!SB.ready || !AUTH.user) return;
      try {
        const [counts, mine] = await Promise.all([
          SB.client.from('vote_counts').select('question_id,choice,n'),
          SB.client.from('votes').select('question_id,choice').eq('user_id', AUTH.user.id)
        ]);
        const map = {};
        (counts && counts.data ? counts.data : []).forEach((r) => {
          const qid = String(r.question_id);
          const row = map[qid] || (map[qid] = {});
          row[Number(r.choice)] = Number(r.n) || 0;
        });
        const own = {};
        (mine && mine.data ? mine.data : []).forEach((r) => { own[String(r.question_id)] = Number(r.choice); });
        DATA.counts = map;
        DATA.myVotes = own;
        dataChanged();
      } catch (e) {}
    },

    /* أسئلة الزوار */
    async loadQuestions() {
      if (!SB.ready || !AUTH.user) return;
      try {
        const { data } = await SB.client.from('questions')
          .select('id,q,o0,o1,o2,o3,c,name,at,uid')
          .order('at', { ascending: false })
          .limit(500);
        const map = {};
        (data || []).forEach((r) => {
          map[r.id] = Object.assign({}, r, { at: Date.parse(r.at) || 0 });
        });
        DATA.questions = map;
        dataChanged();
      } catch (e) {}
    },

    /* إحصائيات المستخدم */
    async loadStats() {
      if (!SB.ready || !AUTH.user) return;
      try {
        const { data } = await SB.client.from('stats')
          .select('plays,wins,best').eq('user_id', AUTH.user.id).maybeSingle();
        DATA.stats = data
          ? { plays: Number(data.plays || 0), wins: Number(data.wins || 0), best: Number(data.best || 0) }
          : { plays: 0, wins: 0, best: 0 };
        dataChanged();
      } catch (e) {}
    },

    /* لوحة المتصدرين */
    async loadBoard() {
      if (!SB.ready || !AUTH.user) return;
      try {
        const { data } = await SB.client.from('leaderboard')
          .select('user_id,name,best,wins,plays')
          .order('best', { ascending: false })
          .limit(200);
        const map = {};
        (data || []).forEach((r) => {
          map[r.user_id] = {
            name: r.name,
            best: Number(r.best || 0),
            wins: Number(r.wins || 0),
            plays: Number(r.plays || 0)
          };
        });
        DATA.board = map;
        dataChanged();
      } catch (e) {}
    }
  };

  const myStats = () => ({
    plays: Number((DATA.stats && DATA.stats.plays) || 0),
    wins: Number((DATA.stats && DATA.stats.wins) || 0),
    best: Number((DATA.stats && DATA.stats.best) || 0)
  });

  /* ---------- الحضور / النشاط ---------- */
  const SESSION_ID = (function () {
    try {
      let s = sessionStorage.getItem('ml_sid');
      if (!s) {
        s = Math.random().toString(36).slice(2) + Date.now().toString(36);
        sessionStorage.setItem('ml_sid', s);
      }
      return s.slice(0, 64);
    } catch (e) {
      return (Math.random().toString(36).slice(2) + Date.now().toString(36)).slice(0, 64);
    }
  })();

  let userActivityStop = null;

  function startUserActivity() {
    if (!SB.ready || !AUTH.user) return null;
    const uid = AUTH.user.id;
    let stopped = false;

    const beat = () => {
      if (stopped) return;
      try {
        SB.client.from('user_activity')
          .upsert({ user_id: uid, session: SESSION_ID, last_seen: new Date().toISOString() },
            { onConflict: 'user_id,session' })
          .then(() => {}).catch(() => {});
      } catch (e) {}
    };

    beat();
    const timer = setInterval(beat, 60000);

    return () => {
      if (stopped) return;
      stopped = true;
      clearInterval(timer);
      try {
        SB.client.from('user_activity').delete().eq('user_id', uid).eq('session', SESSION_ID)
          .then(() => {}).catch(() => {});
      } catch (e) {}
    };
  }

  /* ---------- زيادة الإحصائيات بشكل آمن (RPC على السيرفر) ---------- */
  async function bumpStats(delta) {
    if (!SB.ready || !AUTH.user) return;
    try {
      const { data, error } = await SB.client.rpc('record_result', {
        p_play: Number(delta.plays || 0) > 0,
        p_win: Number(delta.wins || 0) > 0,
        p_best: Number(delta.best || 0)
      });
      if (error) return;
      const row = Array.isArray(data) ? data[0] : data;
      if (row && typeof row === 'object') {
        DATA.stats = {
          plays: Number(row.plays || 0),
          wins: Number(row.wins || 0),
          best: Number(row.best || 0)
        };
        dataChanged();
      }
    } catch (e) {}
  }

  /* إعادة رسم خفيفة لما البيانات تتغير */
  let dataRenderT = null;
  function dataChanged() {
    clearTimeout(dataRenderT);
    dataRenderT = setTimeout(() => {
      const r = parse();
      if (r.name === 'create' || r.name === 'auth' || r.name === 'games') return;
      render(false);
    }, 260);
  }

  /* ---------- شريط المستخدم في الهيدر ---------- */
  function renderUserBox() {
    const box = $('#userBox');
    if (!box) return;
    const u = AUTH.user;
    if (!u) {
      box.innerHTML = '<a class="userbtn userbtn--in" href="#/auth" data-nav="auth">' + ICON('idcard') + '<span>دخول</span></a>';
      return;
    }
    const initial = (u.name || u.email || '؟').trim().charAt(0);
    const avatar = u.photo
      ? '<img src="' + esc(u.photo) + '" alt="" referrerpolicy="no-referrer">'
      : '<b>' + esc(initial) + '</b>';
    box.innerHTML = '<div class="userchip" id="userChip">' +
        '<button class="userchip__btn" type="button" data-act="user-menu" aria-expanded="false" aria-haspopup="menu">' +
          '<span class="userchip__av">' + avatar + '</span>' +
          '<span class="userchip__n">' + esc(u.name) + '</span>' +
          ICON('chevron') +
        '</button>' +
        '<div class="usermenu" id="userMenu" role="menu">' +
          '<div class="usermenu__head"><b>' + esc(u.name) + '</b><span>' + esc(u.email) + '</span></div>' +
          '<a href="#/auth" role="menuitem">' + ICON('idcard') + ' حسابي وإحصائياتي</a>' +
          '<a href="#/million" role="menuitem">' + ICON('crown') + ' كمّل اللعب</a>' +
          '<button type="button" role="menuitem" data-act="logout">' + ICON('logout') + ' تسجيل الخروج</button>' +
        '</div>' +
      '</div>';
  }

  /* ---------- شاشات الحساب ---------- */
  function authCardHTML(tab) {
    const isLogin = tab !== 'signup';
    const u = AUTH.user;
    if (u) {
      return '<section class="wrap page authpage">' +
        '<div class="authcard authcard--profile">' +
          '<div class="authcard__av">' + (u.photo ? '<img src="' + esc(u.photo) + '" alt="">' : '<b>' + esc((u.name || '؟').charAt(0)) + '</b>') + '</div>' +
          '<h1 class="authcard__t">أهلاً ' + esc(u.name) + '</h1>' +
          '<p class="authcard__s">' + esc(u.email) + ' · ' + (u.provider === 'google' ? 'حساب جوجل' : 'حساب بالإيميل') + '</p>' +
          '<div class="authstats">' +
            '<div class="stat"><b>' + num(myStats().wins) + '</b><span>مرات الفوز</span></div>' +
            '<div class="stat"><b>' + num(myStats().plays) + '</b><span>جولات لعبتها</span></div>' +
            '<div class="stat"><b>' + num(myStats().best) + '</b><span>أعلى مكسب</span></div>' +
          '</div>' +
          '<div class="authstats">' +
            '<div class="stat"><b>' + num(myVotesCount()) + '</b><span>أصواتك في «ماذا لو»</span></div>' +
            '<div class="stat"><b>' + num(Object.keys(DATA.questions || {}).length) + '</b><span>أسئلة الزوار</span></div>' +
            '<div class="stat"><b>' + num(totalVotes()) + '</b><span>إجمالي أصوات الموقع</span></div>' +
          '</div>' +
          '<div class="authcard__acts">' +
            '<a class="btn btn--primary btn--lg" href="#/million">' + ICON('play') + ' العب دلوقتي</a>' +
            '<button class="btn btn--ghost" data-act="logout" type="button">' + ICON('logout') + ' تسجيل الخروج</button>' +
          '</div>' +
          '<p class="hint">الحساب بيحفظ اسمك وإحصائياتك — وجولتك المفتوحة بتفضل مستنية.</p>' +
        '</div>' +
      '</section>';
    }

    return '<section class="wrap page authpage">' +
      '<div class="authcard">' +
        '<div class="authcard__logo">' + LOGO_MARK(46) + '</div>' +
        '<h1 class="authcard__t">' + (isLogin ? 'تسجيل الدخول' : 'اعمل حساب جديد') + '</h1>' +
        '<p class="authcard__s">' + (isLogin ? 'ادخل بحسابك وكمّل من حيث ما وقفت.' : 'حساب واحد بيحفظ إحصائياتك وشيكاتك على كل أجهزتك.') + '</p>' +

        '<button class="gbtn" type="button" data-act="google">' +
          '<span class="gbtn__g">' + GBUTTON_SVG + '</span>' +
          (isLogin ? 'الدخول بحساب جوجل' : 'التسجيل بحساب جوجل') +
        '</button>' +
        '<div class="ordiv"><span>أو بالإيميل</span></div>' +

        '<div class="authmsg" id="authMsg" role="alert" hidden></div>' +

        '<div class="authform" autocomplete="on" role="group" aria-label="بيانات الحساب">' +
          (isLogin ? '' :
            '<label class="afield" for="auName"><span>' + ICON('idcard') + ' الاسم</span>' +
              '<input id="auName" name="name" type="text" autocomplete="name" placeholder="اسمك اللي هيظهر على الشيك" maxlength="40"></label>') +
          '<label class="afield" for="auEmail"><span>' + ICON('mail') + ' الإيميل</span>' +
            '<input id="auEmail" name="email" type="email" inputmode="email" autocomplete="' + (isLogin ? 'username' : 'email') + '" placeholder="name@example.com" dir="ltr" maxlength="80"></label>' +
          '<label class="afield" for="auPass"><span>' + ICON('lock') + ' كلمة المرور</span>' +
            '<span class="afield__pw">' +
              '<input id="auPass" name="password" type="password" autocomplete="' + (isLogin ? 'current-password' : 'new-password') + '" placeholder="٦ حروف أو أرقام على الأقل" dir="ltr" maxlength="64">' +
              '<button type="button" class="afield__eye" data-act="pw-eye" aria-label="إظهار كلمة المرور">' + ICON('eye') + '</button>' +
            '</span></label>' +
          '<button class="btn btn--primary btn--lg btn--block" type="button" data-act="' + (isLogin ? 'login' : 'signup') + '">' +
            (isLogin ? ICON('login') + ' دخول' : ICON('plus') + ' اعمل الحساب') + '</button>' +
        '</div>' +

        '<p class="authswap">' + (isLogin
          ? 'معندكش حساب؟ <a href="#/auth?tab=signup">اعمل حساب جديد</a>'
          : 'عندك حساب بالفعل؟ <a href="#/auth?tab=login">سجّل دخول</a>') + '</p>' +
        '<p class="authmode">' + (AUTH.mode === 'supabase'
          ? ICON('bolt') + ' دخول آمن — بياناتك محفوظة في قاعدة البيانات'
          : ICON('minus') + ' الخدمة مش متاحة دلوقتي — حدّث الصفحة') + '</p>' +
      '</div>' +
    '</section>';
  }

  const GBUTTON_SVG =
    '<svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true">' +
      '<path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>' +
      '<path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>' +
      '<path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z"/>' +
      '<path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C41 35 44 30 44 24c0-1.3-.1-2.3-.4-3.5z"/>' +
    '</svg>';

  function authMsg(text, kind) {
    const box = $('#authMsg');
    if (!box) return;
    if (!text) { box.hidden = true; box.textContent = ''; return; }
    box.hidden = false;
    box.className = 'authmsg ' + (kind === 'ok' ? 'is-ok' : 'is-err');
    box.innerHTML = ICON(kind === 'ok' ? 'check' : 'minus') + '<span>' + esc(text) + '</span>';
  }

  function authBusy(on) {
    AUTH.busy = !!on;
    $$('.authcard .btn, .authcard .gbtn').forEach((b) => { b.disabled = !!on; });
    const card = $('.authcard');
    if (card) card.classList.toggle('is-busy', !!on);
  }

  function authValues() {
    const g = (id) => (document.getElementById(id) || {}).value || '';
    return { name: g('auName'), email: g('auEmail'), pw: g('auPass') };
  }

  async function doSignup() {
    const v = authValues();
    const bad = AUTH.validate(v.name, v.email, v.pw);
    if (bad) { authMsg(bad); return; }
    authBusy(true); authMsg('');
    try {
      await AUTH.signup(v.name, v.email, v.pw);
      SFX.win();
      toast('أهلاً ' + AUTH.user.name + ' — حسابك جاهز');
      location.hash = AUTH.afterAuth || '#/million'; AUTH.afterAuth = null;
      render(false);
    } catch (e) {
      authMsg(e.message || 'حصلت مشكلة في التسجيل.');
      SFX.blip(180, 0.2, 'sawtooth', 0.04);
    } finally { authBusy(false); }
  }

  async function doLogin() {
    const v = authValues();
    authBusy(true); authMsg('');
    try {
      await AUTH.login(v.email, v.pw);
      SFX.pick();
      toast('أهلاً بيك تاني يا ' + AUTH.user.name);
      location.hash = AUTH.afterAuth || '#/million'; AUTH.afterAuth = null;
      render(false);
    } catch (e) {
      authMsg(e.message || 'مش قادر أسجّل دخول.');
      SFX.blip(180, 0.2, 'sawtooth', 0.04);
    } finally { authBusy(false); }
  }

  async function doGoogle() {
    authBusy(true); authMsg('');
    try {
      const u = await AUTH.google();
      if (u === null) return; /* إعادة توجيه جارية */
      SFX.win();
      toast('أهلاً ' + AUTH.user.name);
      location.hash = AUTH.afterAuth || '#/million'; AUTH.afterAuth = null;
      render(false);
    } catch (e) {
      authMsg((e && e.message) || 'تسجيل جوجل مش متاح دلوقتي.');
      SFX.blip(180, 0.2, 'sawtooth', 0.04);
    } finally { authBusy(false); }
  }

  /* ==========================================================
     8) الشاشات
     ========================================================== */
  const STATE = { play: { cat: 'all', q: null, recent: [] }, game: { running: false, left: 0, score: 0, t: null, deck: [], i: 0 } };

  function adSlot() {
    return '<div class="ad"><span class="ad__tag">إعلان</span><div class="ad__ph">مساحة إعلان محجوزة</div></div>';
  }

  function catChip(catId) {
    const c = catOf(catId); if (!c) return '';
    return '<span class="chip" style="color:' + c.color + ';border-color:' + c.color + '55;background:' + c.color + '14">' +
      ICON(c.icon) + ' ' + esc(c.name) + '</span>';
  }

  function resultsHTML(q, my) {
    const counts = countsOf(q);
    const p = pctOf(counts);
    const total = sum(counts);
    const best = p.indexOf(Math.max.apply(null, p));
    const verdict = my == null ? '' : (my === best
      ? '<div class="verdict verdict--win"><span class="vd">' + ICON('check') + '</span><span>أنت مع الأغلبية — <b>' + pct(p[my]) + '</b> اختاروا نفس اختيارك</span></div>'
      : '<div class="verdict verdict--odd"><span class="vd">' + ICON('sparkle') + '</span><span>أنت في الأقلية — بس <b>' + pct(p[my]) + '</b> اختاروا اللي أنت اخترته</span></div>');
    return '<div class="res">' +
      q.o.map((o, i) => '<div class="res__row' + (i === my ? ' is-mine' : '') + '">' +
        '<div class="res__head"><span>' + ICON('check', 'res__mark') + esc(o) + '</span><b class="res__pct">' + pct(p[i]) + '</b></div>' +
        '<div class="res__bar"><i style="width:' + p[i] + '%"></i></div></div>').join('') +
      '<div class="res__meta">' +
        '<span class="chip">' + ICON('sprout') + ' أصوات حقيقية من قاعدة البيانات</span>' +
        '<span>إجمالي الأصوات: <b>' + num(total) + '</b></span>' +
      '</div>' + verdict + '</div>';
  }

  function cardActions(q, opts) {
    opts = opts || {};
    return '<div class="card__actions">' +
      (opts.next ? '<button class="btn btn--primary" data-act="next">' + ICON('refresh') + ' سؤال تاني</button>' : '') +
      '<button class="btn btn--ghost" data-act="share" data-qid="' + esc(q.id) + '">' + ICON('share') + ' شارك</button>' +
      '<a class="btn btn--wa" data-wa="' + esc(q.id) + '" href="#">' + ICON('whatsapp') + ' واتساب</a>' +
      '</div>';
  }

  function qCard(q, opts) {
    opts = opts || {};
    const my = myVote(q.id);
    const voted = my !== undefined;
    return '<article class="qcard" data-card="' + esc(q.id) + '">' +
      '<div class="qcard__top">' + catChip(q.c) +
        (q.daily ? '<span class="chip chip--live">' + ICON('clock') + ' سؤال اليوم</span>' : '') +
        (q.custom ? '<span class="chip">' + ICON('pencil') + ' من الزوار</span>' : '') +
        '<span class="qcard__count">' + (opts.counter ? esc(opts.counter) : num(sum(countsOf(q))) + ' صوت') + '</span>' +
      '</div>' +
      '<h2 class="qtext">' + esc(q.q) + '</h2>' +
      (voted ? resultsHTML(q, my) : (AUTH.user ?
        '<div class="opts' + (q.o.length === 2 ? ' opts--two' : '') + '">' +
        q.o.map((o, i) => '<button class="opt" data-act="vote" data-qid="' + esc(q.id) + '" data-i="' + i + '">' +
          '<span class="opt__key">' + (q.o.length === 2 ? (i ? 'ب' : 'أ') : (i + 1)) + '</span>' +
          '<span class="opt__label">' + esc(o) + '</span></button>').join('') +
        '</div>' : voteGateHTML())) +
      cardActions(q, { next: opts.next || voted }) +
      '</article>';
  }

  function voteGateHTML() {
    return '<div class="votegate">' +
      '<span class="votegate__ico">' + ICON('idcard') + '</span>' +
      '<b>سجّل حسابك عشان تصوّت</b>' +
      '<span>صوتك بيتحفظ على حسابك، وتقدر تشوف رأي الباقيين وتغيّره في أي وقت.</span>' +
      '<a class="btn btn--primary" href="#/auth?tab=signup" data-nav="auth">' + ICON('plus') + ' اعمل حساب</a>' +
      '<a class="btn btn--ghost" href="#/auth?tab=login" data-nav="auth">' + ICON('login') + ' عندي حساب — دخول</a>' +
      '</div>';
  }

  function miniCard(q) {
    const p = pctOf(countsOf(q));
    return '<a class="mini" href="#/q/' + encodeURIComponent(q.id) + '">' +
      '<div class="mini__q">' + esc(q.q) + '</div>' +
      '<div class="mini__split">' + p.map((x) => '<i style="width:' + x + '%"></i>').join('') + '</div>' +
      '<div class="mini__foot">' + catChip(q.c) + '<span>' + num(sum(countsOf(q))) + ' صوت</span>' +
      '<span class="mini__cta">صوّت ' + ICON('back') + '</span></div></a>';
  }

  function rankRow(q, i, votes) {
    const p = pctOf(countsOf(q));
    return '<a class="rank" href="#/q/' + encodeURIComponent(q.id) + '">' +
      '<span class="rank__n' + (i < 3 ? ' rank__n--' + (i + 1) : '') + '">' + (i + 1) + '</span>' +
      '<span class="rank__body"><span class="rank__q">' + esc(q.q) + '</span>' +
      '<span class="mini__split" style="margin-top:8px">' + p.map((x) => '<i style="width:' + x + '%"></i>').join('') + '</span></span>' +
      '<span class="rank__v">' + (votes ? num(votes) + ' صوت' : 'لسه جديد') + '</span></a>';
  }

  /* ---------- الرئيسية ---------- */
  function viewHome() {
    const total = allQuestions().length;
    const myVotes = myVotesCount();
    const nq = MBANK.length;
    const daily = (function () {
      const d = todayKey(); let h = 0;
      for (let i = 0; i < d.length; i++) h = (h * 31 + d.charCodeAt(i)) >>> 0;
      return BASE[h % BASE.length];
    })();

    /* كارت الظهور الأول */
    const g = MZ.g;
    let play = '';
    if (g && g.deck && g.q && g.stage === 'q') {
      play = '<div class="mzresume"><div><b>عندك جولة مفتوحة يا ' + esc(MZ.name || 'بطل') + '</b>' +
        '<span>واقف عند سؤال ' + num(g.i + 1) + ' من ' + num(MZ_TOTAL) + ' — مكسبك المضمون ' + mzMoney(g.correct ? MZ_LADDER[g.correct - 1] : 0) + '</span></div>' +
        '<a class="btn btn--primary" href="#/million">' + ICON('play') + ' كمّل</a></div>';
    }

    return play + '<section class="hero wrap mzhero">' +
        '<div class="mzhero__badge"><span class="chip chip--live">' + ICON('crown') + ' اللعبة الرسمية</span></div>' +
        '<h1 class="mzhero__title">من سيربح <span class="grad">المليون؟</span></h1>' +
        '<p class="mzhero__sub">٤٠ سؤال من السهل للصعب، ٤ وسائل مساعدة، ومفيش مؤقت. اوصل للمليون وخد شيك باسمك.</p>' +
        '<div class="hero__cta">' +
          '<button class="btn btn--primary btn--lg" type="button" data-act="mz-quick">' + ICON('play') + ' ابدأ اللعب</button>' +
          '<a class="btn btn--ghost btn--lg" href="#/million/rules">' + ICON('book') + ' القواعد</a>' +
        '</div>' +
        (AUTH.user
            ? '<p class="mzhero__note">' + ICON('check') + ' أهلاً ' + esc(AUTH.user.name) + ' — جولاتك وفوزك محفوظين على حسابك.</p>'
            : '<p class="mzhero__note">' + ICON('idcard') + ' سجّل دخولك بالإيميل أو جوجل عشان جولاتك وفوزك يتحفظوا في حسابك.' +
              ' <a href="#/auth" data-nav="auth">دخول / حساب جديد</a></p>') +
        '<div class="mzhero__stats">' +
          '<div class="stat"><b>' + num(nq) + '</b><span>سؤال في البنك</span></div>' +
          '<div class="stat"><b>' + num(MZ_TOTAL) + '</b><span>مستوى للجائزة</span></div>' +
          '<div class="stat"><b>' + num(myStats().wins) + '</b><span>مرات فوزك</span></div>' +
        '</div>' +
        '<div class="mzhero__art"><img referrerpolicy="no-referrer" src="https://i.ibb.co/Fb4HLGSN/million-light.png" alt="لاعب على مسرح المسابقة وشيك مليون جنيه" width="1279" height="709" loading="eager"></div>' +
      '</section>' +
      '<div class="wrap">' + adSlot() + '</div>' +
      '<section class="wrap">' +
        '<div class="sec-head"><div><span class="eyebrow">إزاي بتشتغل</span><h2>٤ خطوات للمليون</h2></div><a class="btn btn--ghost btn--sm" href="#/million/rules">التفاصيل</a></div>' +
        '<div class="mzrules">' +
          '<div class="mzrule">' + ICON('target') + '<b>أسئلة متدرجة</b><span>١٠ أسئلة من كل مستوى: سهل، متوسط، صعب، صعب جدًا.</span></div>' +
          '<div class="mzrule">' + ICON('fifty') + '<b>وسائل مساعدة</b><span>٥٠:٥٠، اسأل الجمهور، اتصال بصديق، وبدّل السؤال.</span></div>' +
          '<div class="mzrule">' + ICON('wallet') + '<b>انسحاب وشبكات أمان</b><span>تنسحب بمبلغ مستواك، أو تاخد أعلى مستوى أمان.</span></div>' +
          '<div class="mzrule">' + ICON('ticket') + '<b>شيك المليون</b><span>فوز = شيك باسمك وتاريخك، جاهز للتحميل.</span></div>' +
        '</div>' +
      '</section>' +
      '<section class="wrap">' +
        '<div class="sec-head"><div><span class="eyebrow">كل يوم سؤال</span><h2>سؤال اليوم من «ماذا لو»</h2></div><a class="btn btn--ghost btn--sm" href="#/play">اللعب</a></div>' +
        qCard(Object.assign({}, daily, { daily: true })) +
      '</section>' +
      '<div class="wrap">' + adSlot() + '</div>' +
      '<section class="wrap">' +
        '<div class="sec-head"><div><span class="eyebrow">على الجانب</span><h2>أقسام تانية</h2></div><p>زي الألعاب بالظبط</p></div>' +
        '<div class="promos">' +
          '<a class="promo" href="#/play"><img referrerpolicy="no-referrer" src="https://i.ibb.co/MkB4pQ2k/talk-light.png" alt="اتنين من الشلة بيتكلموا" class="promo__img">' +
            '<b>ماذا لو خيّروك؟</b><span>أسئلة جدلية للشلة والرحلات — مفيش إجابة صح، فيه جو حلو بس.</span>' +
            '<span class="promo__go">' + ICON('dice') + ' العب</span></a>' +
          '<a class="promo" href="#/party"><img referrerpolicy="no-referrer" src="https://i.ibb.co/RGGyqxsP/trip-light.png" alt="الشلة في رحلة" class="promo__img">' +
            '<b>تحدي الشلة</b><span>غرف تحدي بأسئلة المليون — ١ ضد ١ لحد ٤ ضد ٤، والفريق الأعلى مكسب يكسب.</span>' +
            '<span class="promo__go">' + ICON('users') + ' ابدأ</span></a>' +
          '<a class="promo" href="#/games"><img referrerpolicy="no-referrer" src="https://i.ibb.co/nMk1KM0k/whatif-light.png" alt="طفل ماسك علامة استفهام" class="promo__img promo__img--tall">' +
            '<b>الألعاب</b><span>«مين يبدأ؟» وتحدي ٢٠ ثانية — ألعاب سريعة للشلة.</span>' +
            '<span class="promo__go">' + ICON('gamepad') + ' العب</span></a>' +
        '</div>' +
      '</section>';
  }

  /* ---------- اللعب ---------- */
  function nextQuestion(cat) {
    const list = allQuestions().filter((q) => !cat || cat === 'all' || q.c === cat);
    if (!list.length) return null;
    let fresh = list.filter((q) => STATE.play.recent.indexOf(q.id) < 0);
    if (!fresh.length) { STATE.play.recent = []; fresh = list; }
    const unvoted = fresh.filter((q) => myVote(q.id) === undefined);
    const q = pick(unvoted.length ? unvoted : fresh);
    STATE.play.recent.push(q.id);
    STATE.play.recent = STATE.play.recent.slice(-8);
    return q;
  }

  function viewPlay(params) {
    const cat = (params && params.cat) || STATE.play.cat || 'all';
    STATE.play.cat = cat;
    if (!STATE.play.q || (cat !== 'all' && STATE.play.q.c !== cat)) STATE.play.q = nextQuestion(cat);
    const q = STATE.play.q;
    if (!q) return '<section class="wrap page"><h1>مفيش أسئلة هنا</h1></section>';

    const total = allQuestions().length;
    const myVotes = myVotesCount();
    return '<section class="wrap play">' +
      '<div class="play__bar"><a class="btn btn--ghost btn--sm" href="#/">' + ICON('back') + ' الرئيسية</a>' +
        '<div class="progress"><i style="width:' + Math.round((myVotes / Math.max(total, 1)) * 100) + '%"></i></div>' +
        '<span class="play__score">' + num(myVotes) + ' / ' + num(total) + '</span></div>' +
      '<div class="filters">' +
        '<button class="fchip' + (cat === 'all' ? ' is-on' : '') + '" data-act="filter" data-cat="all">الكل</button>' +
        CATS.map((c) => '<button class="fchip' + (cat === c.id ? ' is-on' : '') + '" data-act="filter" data-cat="' + c.id + '">' +
          ICON(c.icon) + ' ' + esc(c.name) + '</button>').join('') +
      '</div>' +
      '<div id="playHost">' + qCard(q, { counter: 'سؤال جديد' }) + '</div>' +
      adSlot() +
      '<p class="hint" style="text-align:center;margin-top:16px">كل ما تصوّت أكتر، الأسئلة تبقى أدق — والتحدي يبقى أحلى.</p>' +
    '</section>';
  }

  /* ---------- سؤال واحد ---------- */
  function viewSingle(id) {
    const q = byId(id);
    if (!q) return viewNotFound();
    const rel = shuffle(BASE.filter((x) => x.id !== q.id && x.c === q.c)).slice(0, 3);
    return '<section class="wrap play">' +
      '<h1 class="sr">' + esc(q.q) + '</h1>' +
      '<div class="play__bar"><a class="btn btn--ghost btn--sm" href="#/play">' + ICON('back') + ' كل الأسئلة</a>' +
        '<span class="chip">' + ICON('share') + ' ابعته للشلة وشوف رأيهم</span></div>' +
      qCard(q, {}) +
      (rel.length ? '<div class="sec-head"><div><h2>أسئلة قريبة</h2></div></div>' +
        '<div class="grid-cards">' + rel.map(miniCard).join('') + '</div>' : '') +
    '</section>';
  }

  /* ==========================================================
     9.5) تحدي الغرف — «من سيربح المليون» بين الشلة (1v1 لحد 4v4)
     ----------------------------------------------------------
     • للمسجّلين بس، والغرفة بتتفتح للمسجّلين بس.
     • كل فريق (أ/ب) بياخد ٤٠ سؤال لوحده بترتيبه من السهل للصعب.
     • كل فريق بيلعب سلّم المليون على أسئلته، ومكسبه المضمون بيتحدث مع كل إجابة صح.
     • ٤٠ سؤال لكل فريق، والفريقين بيبدأوا مع بعض. اللي يخلص الأول بيستنى التاني.
     • قواعد صارمة: ٣ محاولات لكل سؤال، الوقت بيقفل السؤال، والفريق اللي يغلط
       ٣ مرات بيخرج بمكسبه المضمون. الفايز = أعلى مكسب.
     ========================================================== */
  const ROOM = {
    code: '',
    data: null,
    ref: null,
    started: 0,
    timer: null,
    deadline: 0,
    total: 20000,
    busy: false
  };

  const ROOM_SETUP = {
    sizes: [1, 2, 3, 4],      /* عدد أفراد كل فريق */
    secs: [20, 30, 45]        /* وقت السؤال */
  };
  const ROOM_QUESTIONS = 40;   /* ٤٠ سؤال ثابت لكل فريق */
  
  function randCode() {
    const L = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let s = '';
    for (let i = 0; i < 5; i++) s += L[rnd(L.length)];
    return s;
  }

  function roomPlayers() {
    const p = (ROOM.data && ROOM.data.players) || {};
    if (!isRecord(p)) return [];
    return Object.keys(p).filter((uid) => validKey(uid) && isRecord(p[uid]))
      .map((uid) => ({ uid, name: boundedText(p[uid].name, 20) || 'لاعب',
        team: p[uid].team === 'b' ? 'b' : 'a', ready: p[uid].ready === true }));
  }
  function teamMembers(t) {
    return roomPlayers().filter((p) => (p.team || 'a') === t);
  }
  function roomMeta() { return (ROOM.data && ROOM.data.meta) || {}; }
  function myProgress() {
    const pr = (ROOM.data && ROOM.data.progress) || {};
    return pr[AUTH.user ? AUTH.user.id : ''] || null;
  }
  function teamProgress(t) {
    const list = teamMembers(t).map((p) => {
      const pr = (ROOM.data.progress || {})[p.uid];
      return { uid: p.uid, name: p.name || 'لاعب', done: !!(pr && pr.done), amount: Number((pr && pr.amount) || 0) };
    });
    const amount = list.reduce((m, x) => Math.max(m, x.amount), 0);
    const allDone = list.length > 0 && list.every((x) => x.done);
    return { list: list, amount: amount, done: allDone };
  }
  function roomBothDone() {
    const a = teamProgress('a'), b = teamProgress('b');
    return (a.list.length > 0 && b.list.length > 0 && a.done && b.done);
  }
  function roomWinner() {
    const a = teamProgress('a'), b = teamProgress('b');
    if (!a.list.length || !b.list.length) return null;
    if (a.amount === b.amount) return 'tie';
    return a.amount > b.amount ? 'a' : 'b';
  }

  /* ---------- المزامنة اللحظية ---------- */
  /* بنقرأ الغرفة كاملة (بيانات + لاعبين + تقدّم) في استعلام واحد */
  async function roomFetch(code) {
    if (!SB.ready || !AUTH.user) return null;
    const { data, error } = await SB.client.from('rooms')
      .select('code,host,state,size,questions,secs,updated_at,' +
        'room_players(user_id,name,team,ready,joined_at),' +
        'room_progress(user_id,q,ok,amount,done,t)')
      .eq('code', code)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  /* تحويل صفوف قاعدة البيانات لنفس الشكل اللي الواجهة بتقراه */
  function roomShape(r) {
    if (!r) return null;
    const players = {}, progress = {};
    (r.room_players || []).forEach((p) => {
      players[p.user_id] = {
        name: p.name, team: p.team, ready: p.ready === true,
        at: Date.parse(p.joined_at) || 0
      };
    });
    (r.room_progress || []).forEach((p) => {
      progress[p.user_id] = {
        q: Number(p.q || 0), ok: Number(p.ok || 0), amount: Number(p.amount || 0),
        done: p.done === true, t: Date.parse(p.t) || 0
      };
    });
    return {
      meta: {
        host: r.host, state: r.state, size: Number(r.size || 4),
        questions: Number(r.questions || 0), secs: Number(r.secs || 30),
        at: Date.parse(r.updated_at) || 0
      },
      players: players,
      progress: progress
    };
  }

  function roomAttach(code) {
    roomDetach();
    ROOM.code = code;
    roomStartPresence(code);
    ROOM.data = null;
    ROOM.decks = Object.create(null);

    const refresh = () => {
      roomFetch(code).then((row) => {
        if (ROOM.code !== code) return;
        if (!row) {
          roomDetach(); ROOM.code = ''; ROOM.data = null;
          if (parse().name === 'party') { toast('الغرفة غير موجودة'); location.hash = '#/party'; }
          return;
        }
        ROOM.data = roomShape(row);
        roomChanged();
      }).catch(() => {});
    };
    ROOM.refresh = refresh;
    refresh();

    /* اشتراك لحظي في تغييرات الغرفة واللاعبين والتقدّم */
    try {
      const ch = SB.client.channel('room:' + code + ':' + Math.random().toString(36).slice(2, 8));
      const onChange = () => {
        clearTimeout(ROOM.syncT);
        ROOM.syncT = setTimeout(refresh, 120);
      };
      ch.on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: 'code=eq.' + code }, onChange);
      ch.on('postgres_changes', { event: '*', schema: 'public', table: 'room_players', filter: 'room_code=eq.' + code }, onChange);
      ch.on('postgres_changes', { event: '*', schema: 'public', table: 'room_progress', filter: 'room_code=eq.' + code }, onChange);
      ch.subscribe();
      ROOM.channel = ch;
    } catch (e) {}
  }

  function roomDetach() {
    roomStopPresence();
    if (ROOM.channel && SB.ready) { try { SB.client.removeChannel(ROOM.channel); } catch (e) {} }
    ROOM.channel = null;
    ROOM.refresh = null;
    clearTimeout(ROOM.syncT);
    ROOM.syncT = null;
    roomStopTimer();
  }

  // Separate session per tab: closing one tab must not disconnect another.
  let roomPresenceStop = null;
  function roomStopPresence() {
    if (roomPresenceStop) roomPresenceStop();
    roomPresenceStop = null;
  }
  function roomStartPresence(code) {
    if (!AUTH.user) return;
    roomPresenceStop = startRoomActivity(code);
  }

  /* نبضة حضور داخل الغرفة (بديل onDisconnect) */
  function startRoomActivity(code) {
    if (!SB.ready || !AUTH.user) return null;
    const uid = AUTH.user.id;
    let stopped = false;

    const beat = () => {
      if (stopped) return;
      try {
        SB.client.from('room_activity')
          .upsert({ room_code: code, user_id: uid, session: SESSION_ID, last_seen: new Date().toISOString() },
            { onConflict: 'room_code,user_id,session' })
          .then(() => {}).catch(() => {});
      } catch (e) {}
    };

    beat();
    const timer = setInterval(beat, 60000);

    return () => {
      if (stopped) return;
      stopped = true;
      clearInterval(timer);
      try {
        SB.client.from('room_activity').delete()
          .eq('room_code', code).eq('user_id', uid).eq('session', SESSION_ID)
          .then(() => {}).catch(() => {});
      } catch (e) {}
    };
  }


  /* السؤال بيتعرض بنفس ترتيب اختياراته لكل اللاعبين (بيتبني من التقدّم نفسه) */
  function roomQuestionView() {
    const q = roomMyQ();
    if (!q) return null;
    const pr = myProgress() || {};
    const key = ROOM.code + ':' + myTeam() + ':' + pr.q;
    let view = ROOM.qview;
    if (!view || view.key !== key) {
      view = mzPrep(q.id);          /* تجهيز الاختيارات بنفس منطق اللعبة الفردية */
      view.key = key;
      view.locked = false;
      view.phase = 'ask';
      view.hide = [];
      ROOM.qview = view;
    }
    return view;
  }

  /* مفيش خروج بدري: اللي يخلص أسئلته بيستنى الفريق التاني لحد ما يخلص (مفيش استسلام) */
  async function roomWatchOpponent() {
    const meta = roomMeta();
    if ((meta.state || '') !== 'play' || !ROOM.code || !AUTH.user) return;
    const a = teamProgress('a'), b = teamProgress('b');
    if (a.list.length && b.list.length && a.done && b.done && meta.state !== 'done') {
      try {
        await SB.client.rpc('finish_room', { p_code: ROOM.code });
      } catch (e) {}
    }
  }

  const roomProgressPending = new Set();
  async function roomEnsureProgress() {
    if (!AUTH.user || !ROOM.code || roomMeta().state !== 'play' || myProgress()) return;
    const uid = AUTH.user.id, code = ROOM.code;
    if (!ROOM.data?.players?.[uid]) return;
    const key = code + '/' + uid;
    if (roomProgressPending.has(key)) return;
    roomProgressPending.add(key);
    try {
      // Each player initializes only their own row; the host cannot write for others.
      const { error } = await SB.client.from('room_progress').upsert({
        room_code: code, user_id: uid, q: 0, ok: 0, amount: 0, done: false, t: new Date().toISOString()
      }, { onConflict: 'room_code,user_id', ignoreDuplicates: true });
      if (error) throw error;
    } catch (e) { toast(sbWriteError(e)); }
    finally { roomProgressPending.delete(key); }
  }

  let roomRenderT = null;
  function roomChanged() {
    roomEnsureProgress();
    roomCheckTimer();
    roomWatchOpponent();
    clearTimeout(roomRenderT);
    roomRenderT = setTimeout(() => {
      if (parse().name === 'party' && parse().arg.toUpperCase() === ROOM.code) render(false);
    }, 200);
  }

  /* ---------- إنشاء / دخول / خروج ---------- */
  async function roomCreate(size, questions, secs) {
    if (!AUTH.user) return roomNeedAuth();
    if (ROOM.busy) return;
    ROOM.busy = true;
    try {
      let code = '';
      for (let tries = 0; tries < 6; tries++) {
        const candidate = randCode();
        const { data, error } = await SB.client.rpc('create_room', {
          p_code: candidate,
          p_size: Math.max(1, Math.min(4, Number(size) || 4)),
          p_questions: ROOM_QUESTIONS,
          p_secs: Math.max(10, Math.min(120, Number(secs) || 30))
        });
        if (error) throw error;
        if (data) { code = data; break; }
      }
      if (!code) { toast('تعذر إنشاء كود متاح — جرّب تاني'); return; }
      if (!await roomJoinUnlocked(code)) return;
      location.hash = '#/party/' + code;
      toast('الغرفة اتفتحت — ابعت الكود ' + code + ' لشلتك');
    } catch (e) {
      toast(sbWriteError(e));
    } finally {
      ROOM.busy = false;
    }
  }

  async function roomJoinUnlocked(code) {
    const { data, error } = await SB.client.rpc('join_room', {
      p_code: code,
      p_name: (AUTH.user.name || 'لاعب').slice(0, 20)
    });
    if (error) { toast(sbWriteError(error)); return false; }
    const res = isRecord(data) ? data : {};
    if (!res.ok) {
      if (res.error === 'not_found') toast('مفيش غرفة بالكود ده');
      else if (res.error === 'started') toast('التحدي بدأ خلاص');
      else if (res.error === 'full') toast('الغرفة كاملة');
      else toast('مش قادرين نلخّصك بالغرفة — جرّب تاني');
      return false;
    }
    return true;
  }

  async function roomJoin(code, fromRoute) {
    if (!AUTH.user) return roomNeedAuth();
    code = String(code || '').trim().toUpperCase();
    if (!/^[A-Z0-9]{4,8}$/.test(code)) { toast('الكود مش صحيح'); if (fromRoute) location.hash = '#/party'; return; }
    if (ROOM.busy) return;
    ROOM.busy = true;
    try {
      if (!await roomJoinUnlocked(code)) { if (fromRoute) location.hash = '#/party'; return; }
      if (fromRoute) {
        if (parse().name === 'party' && parse().arg.toUpperCase() === code) roomAttach(code);
      } else location.hash = '#/party/' + code;
    } catch (e) { toast(sbWriteError(e)); if (fromRoute) location.hash = '#/party'; }
    finally { ROOM.busy = false; }
  }

  async function roomLeave(silent) {
    if (ROOM.code && AUTH.user) {
      try { await SB.client.rpc('leave_room', { p_code: ROOM.code }); } catch (e) {}
    }
    roomDetach();
    ROOM.code = ''; ROOM.data = null; ROOM.started = 0;
    if (!silent) { if (parse().arg) location.hash = '#/party'; else render(false); }
  }

  async function roomSwitchTeam(team) {
    if (!ROOM.code || !AUTH.user) return;
    const meta = roomMeta();
    if (meta.state && meta.state !== 'wait') { toast('مش وقته — التحدي بدأ'); return; }
    if ((meta.host && meta.host !== AUTH.user.id) && meta.state !== 'wait') return;
    if (teamMembers(team).length >= Number(meta.size || 4)) { toast('الفريق ده كامل'); return; }
    try {
      const { data, error } = await SB.client.rpc('set_team', { p_code: ROOM.code, p_team: team });
      if (error) throw error;
      const res = isRecord(data) ? data : {};
      if (!res.ok) {
        if (res.error === 'full') toast('الفريق ده كامل');
        else if (res.error === 'started') toast('مش وقته — التحدي بدأ');
        else toast('مش قادرين ننقلك للفريق ده');
      }
    } catch (e) { toast(sbWriteError(e)); }
  }

  function roomNeedAuth() {
    AUTH.afterAuth = '#/party';
    toast('الدخول للمسجّلين بس — سجّل حسابك الأول');
    location.hash = '#/auth?tab=login';
  }

  /* ---------- بدء التحدي ---------- */
  async function roomStart() {
    if (!ROOM.code || !AUTH.user) return;
    const meta = roomMeta();
    if (meta.host !== AUTH.user.id) { toast('منشئ الغرفة بس اللي يبدأ'); return; }
    const a = teamMembers('a').length, b = teamMembers('b').length;
    if (!a || !b) { toast('محتاج لاعب واحد على الأقل في كل فريق'); return; }
    if (a > Number(meta.size) || b > Number(meta.size)) { toast('فريق فيه لاعبين أكتر من الحجم المحدد'); return; }
    if (meta.state !== 'wait') return;
    const nq = ROOM_QUESTIONS;
    try {
      const { data, error } = await SB.client.rpc('start_room', { p_code: ROOM.code });
      if (error) throw error;
      const res = isRecord(data) ? data : {};
      if (!res.ok) {
        if (res.error === 'teams') toast('محتاج لاعب واحد على الأقل في كل فريق');
        else if (res.error === 'size') toast('فريق فيه لاعبين أكتر من الحجم المحدد');
        else if (res.error === 'started') toast('التحدي بدأ خلاص');
        else toast('مش قادرين نبدأ التحدي دلوقتي');
        return;
      }
      toast('يلا بينا — كل فريق على أسئلته، ' + nq + ' سؤال و' + Number(meta.secs || 30) + ' ثانية للسؤال');
    } catch (e) { toast(sbWriteError(e)); }
  }

  /* ---------- أسئلة كل فريق ---------- */
  function roomDeck(team) {
    const cache = ROOM.decks || (ROOM.decks = Object.create(null));
    const key = ROOM.code + ':' + team;
    if (cache[key]) return cache[key];
    // Reproducible ordering for this room/team, NOT an anti-cheat secret.
    let seed = 2166136261;
    for (const c of key) seed = Math.imul(seed ^ c.charCodeAt(0), 16777619) >>> 0;
    const mix = (list) => {
      const result = list.slice();
      for (let i = result.length - 1; i > 0; i--) {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        const j = Math.floor((seed / 4294967296) * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
      return result;
    };
    const n = ROOM_QUESTIONS;
    /* ١٠ من كل مستوى بنفس ترتيب اللعبة الفردية — والفريق «ب» بيمشي على ترتيب مستوى معاكس عشان الأسئلة تختلف */
    const bands = team === 'a' ? [1, 2, 3, 4] : [2, 1, 4, 3];
    const deck = [];
    bands.forEach((lv) => {
      mix(MBANK.filter((q) => q.l === lv)).slice(0, Math.ceil(n / 4)).forEach((q) => deck.push(q.id));
    });
    if (deck.length < n) {
      mix(MBANK.filter((q) => deck.indexOf(q.id) === -1)).slice(0, n - deck.length).forEach((q) => deck.push(q.id));
    }
    return (cache[key] = deck.slice(0, n).map((id) => ({ id: id })));
  }

  function roomProgressOf(uid) {
    const pr = (ROOM.data && ROOM.data.progress) || {};
    return pr[uid] || { q: 0, ok: 0, amount: 0, done: false, t: 0 };
  }

  function roomMyQ() {
    const deck = roomDeck(myTeam());
    const pr = myProgress() || { q: 0, ok: 0, amount: 0, done: false };
    const ref = deck[pr.q];
    return ref ? MZ_BY_ID[ref.id] : null;
  }

  function myTeam() {
    const me = roomPlayers().find((p) => p.uid === (AUTH.user && AUTH.user.id));
    return me ? (me.team || 'a') : 'a';
  }


  async function roomAnswer(idx) {
    const view = roomQuestionView();
    const q = roomMyQ();
    if (!view || !q) return;
    if (view.locked) return;
    const pr = roomProgressOf(AUTH.user.id);
    if (pr.done) return;
    view.locked = true;
    view.pick = idx;
    SFX.tick();
    if (idx === view.ai) {
      view.phase = 'right';
      SFX.pick();
      render(false);
      await roomAdvance(true);
      toast('صح — مكسبك المضمون بقى ' + mzMoney(mzSafe(roomProgressOf(AUTH.user.id).ok)));
    } else {
      view.phase = 'wrong';
      SFX.blip(160, 0.3, 'sawtooth', 0.05);
      render(false);
      await roomAdvance(false, true);
      toast('غلط — خرجت بمكسبك المضمون');
    }
  }

  /* تقدّم اللاعب: صح → مكسب مضمون + سؤال جديد | غلط ٣ مرات / وقت خلص → خروج */
  async function roomAdvance(ok, out) {
    if (!ROOM.code || !AUTH.user) return;
    const pr = roomProgressOf(AUTH.user.id);
    const n = ROOM_QUESTIONS;
      const nextQ = Number(pr.q || 0) + 1;
    const nextOk = Number(pr.ok || 0) + (ok ? 1 : 0);
    const done = !!out || nextQ >= n;
    const amount = mzSafe(nextOk);
    const row = {
      room_code: ROOM.code,
      user_id: AUTH.user.id,
      q: done ? Number(pr.q || 0) : nextQ,
      ok: nextOk,
      amount: amount,
      done: done,
      t: new Date().toISOString()
    };
    /* تحديث محلي فوري عشان الواجهة تتحرك من غير انتظار */
    if (ROOM.data && ROOM.data.progress) {
      ROOM.data.progress[AUTH.user.id] = {
        q: row.q, ok: row.ok, amount: row.amount, done: row.done, t: Date.parse(row.t)
      };
    }
    try {
      const { error } = await SB.client.from('room_progress')
        .upsert(row, { onConflict: 'room_code,user_id' });
      if (error) throw error;
    } catch (e) { toast(sbWriteError(e)); }
    ROOM.qview = null;
    ROOM.deadline = 0;
    roomStopTimer();
    /* لو الفريقين خلصوا، الغرفة تتقفل والنتيجة تظهر للكل */
    if (done && roomBothDone()) {
      try {
        await SB.client.rpc('finish_room', { p_code: ROOM.code });
      } catch (e) {}
    }
  }

  async function roomDropTeam() {
    if (!ROOM.code || !AUTH.user) return;
    const pr = roomProgressOf(AUTH.user.id);
    try {
      const { error } = await SB.client.from('room_progress').upsert({
        room_code: ROOM.code,
        user_id: AUTH.user.id,
        q: Number(pr.q || 0),
        ok: Number(pr.ok || 0),
        amount: mzSafe(Number(pr.ok || 0)),
        done: true,
        t: new Date().toISOString()
      }, { onConflict: 'room_code,user_id' });
      if (error) throw error;
    } catch (e) {}
  }

  /* ---------- المؤقت ---------- */
  function roomStopTimer() {
    if (ROOM.timer) { clearInterval(ROOM.timer); ROOM.timer = null; }
  }

  function roomCheckTimer() {
    const meta = roomMeta();
    if ((meta.state || '') !== 'play') { roomStopTimer(); return; }
    const pr = myProgress();
    if (!pr || pr.done || !roomMyQ()) { roomStopTimer(); return; }
    const total = Number(meta.secs || 30) * 1000;
    if (ROOM.deadline && ROOM.total === total) return;   /* المؤقت شغال على نفس السؤال */
    if (ROOM.deadline && ROOM.deadline > Date.now()) return;
    ROOM.total = total;
    ROOM.deadline = Date.now() + total;
    roomStopTimer();
    ROOM.timer = setInterval(() => {
      const left = ROOM.deadline - Date.now();
      const bar = document.getElementById('roomTimer');
      const num = document.getElementById('roomTimerN');
      if (num) num.textContent = Math.max(0, Math.ceil(left / 1000));
      if (bar) bar.style.width = clamp((left / ROOM.total) * 100, 0, 100) + '%';
      if (left <= 0) {
        roomStopTimer();
        ROOM.deadline = 0;
        toast('الوقت خلص في السؤال ده');
        roomAdvance(false, true);
      }
    }, 250);
  }

  function roomResetDeadline() {
    ROOM.deadline = 0;
    ROOM.qview = null;
  }

  /* ---------- صفحة تحدي الشلة (عمل/دخول الغرف) ---------- */
  function viewParty() {
    if (!AUTH.user) {
      return '<section class="wrap page">' +
        '<span class="chip chip--live">' + ICON('users') + ' تحدي الشلة</span>' +
        '<h1 class="page__title">غرف تحدي «من سيربح المليون؟»</h1>' +
        '<p class="lead">اعمل غرفة، ابعت الكود لشلتك، واتنافسوا على سلّم المليون — من ١ ضد ١ لحد ٤ ضد ٤. الغرف للمسجّلين بس.</p>' +
        '<div class="card__actions">' +
          '<a class="btn btn--primary btn--lg" href="#/auth?tab=signup">' + ICON('plus') + ' اعمل حساب عشان تلعب</a>' +
          '<a class="btn btn--ghost" href="#/auth?tab=login">' + ICON('login') + ' دخول</a>' +
        '</div>' +
      '</section>';
    }
    return '<section class="wrap page">' +
      '<span class="chip chip--live">' + ICON('users') + ' تحدي الشلة</span>' +
      '<h1 class="page__title">اعمل غرفة… وابعت الكود للشلة</h1>' +
      '<p class="lead">كل فريق بياخد أسئلته لوحده وسلّم المليون — الفريق اللي يوصل أعلى مكسب يكسب. المسجّلين بس اللي يقدروا يدخلوا.</p>' +
      '<div class="roomnew">' +
        '<button class="btn btn--primary btn--lg" data-act="room-create">' + ICON('plus') + ' افتح غرفة جديدة</button>' +
        '<div class="roomjoin">' +
          '<input class="inp" id="roomCode" placeholder="كود الغرفة" maxlength="8" dir="ltr" autocomplete="off">' +
          '<button class="btn btn--ghost" data-act="room-join">' + ICON('login') + ' دخول بكود</button>' +
        '</div>' +
      '</div>' +
      '<div class="roomrules" style="margin-top:22px">' +
        '<h2>قواعد التحدي (صارمة)</h2>' +
        '<ul class="ul">' +
          '<li>مسجّلين بس — مفيش غرف للزوار، وكل لاعب لازم يكون داخل بحسابه.</li>' +
          '<li>حجم الفريق من ١ لحد ٤ — يعني ١ضد١، ٢ضد٢، ٣ضد٣، أو ٤ضد٤ (الغرفة ٨ لاعبين كحد أقصى).</li>' +
          '<li>كل فريق بيتنزّل له ٤٠ سؤال مختلف، والفريقين بيبدأوا مع بعض في نفس اللحظة.</li>' +
          '<li>إجابة واحدة نهائية لكل سؤال (مفيش تصحيح)، والوقت اللي يخلص بيقفل السؤال.</li>' +
          '<li>مفيش انسحاب ولا خروج بدري — اللي يخلص أسئلته بيستنى الفريق التاني لحد ما يخلص.</li>' +
          '<li>الفايز = أعلى مكسب، ولو اتساووا → تعادل.</li>' +
        '</ul>' +
      '</div>' +
    '</section>';
  }

  /* ---------- واجهة الغرفة ---------- */
  function viewRoom(code) {
    if (!AUTH.user) {
      return '<section class="wrap page">' +
        '<span class="chip chip--live">' + ICON('users') + ' تحدي الشلة</span>' +
        '<h1 class="page__title">الغرف للمسجّلين بس</h1>' +
        '<p class="lead">عشان تعمل غرفة أو تدخل غرفة حد، لازم حسابك يبقى مسجّل — عشان نتايجك ومكسبك يتحفظوا.</p>' +
        '<div class="card__actions"><a class="btn btn--primary btn--lg" href="#/auth?tab=signup">' + ICON('plus') + ' اعمل حساب</a>' +
        '<a class="btn btn--ghost" href="#/auth?tab=login">' + ICON('login') + ' دخول</a></div>' +
      '</section>';
    }
    if (!code) return viewParty();
    if (ROOM.code !== code) {
      if (ROOM.channel) { roomDetach(); ROOM.code = ''; ROOM.data = null; }
      if (!ROOM.busy) roomJoin(code, true);
      return '<section class="wrap page"><div class="empty">بنفتح الغرفة…</div></section>';
    }
    if (!ROOM.data) return '<section class="wrap page"><div class="empty">جارٍ تحميل الغرفة…</div></section>';
    const meta = roomMeta();
    if ((meta.state || 'wait') === 'wait') return roomLobbyHTML();
    return roomPlayHTML();
  }

  function roomLobbyHTML() {
    const meta = roomMeta();
    const size = Number(meta.size || 4);
    const a = teamMembers('a'), b = teamMembers('b');
    const isHost = meta.host === AUTH.user.id;
    const mine = myTeam();
    const teamCard = (team, list, label) =>
      '<div class="roomteam' + (mine === team ? ' is-mine' : '') + '">' +
        '<div class="roomteam__head"><b>الفريق ' + label + '</b><span>' + num(list.length) + ' / ' + num(size) + '</span></div>' +
        '<div class="roomteam__list">' +
          (list.length ? list.map((p) => '<span class="roomplayer">' + esc(p.name || 'لاعب') + '</span>').join('')
            : '<span class="hint">لسه فاضي</span>') +
        '</div>' +
        (meta.state === 'wait' && list.length < size
          ? '<button class="btn btn--ghost btn--sm" data-act="room-team" data-team="' + team + '">' + (mine === team ? 'أنا هنا' : 'انضم للفريق ' + label) + '</button>'
          : '') +
      '</div>';

    return '<section class="wrap page">' +
      '<span class="chip chip--live">' + ICON('users') + ' تحدي الشلة</span>' +
      '<h1 class="page__title">غرفة <b dir="ltr">' + esc(ROOM.code) + '</b></h1>' +
      '<p class="lead">' + (isHost ? 'إنت منشئ الغرفة — ظبّط الحجم وابدأ لما الفريقين يجهزوا.' : 'استنى منشئ الغرفة يبدأ التحدي.') + '</p>' +
      '<div class="roomcode" dir="ltr">' + esc(ROOM.code) + '</div>' +
      '<div class="card__actions" style="justify-content:center">' +
        '<button class="btn btn--ghost btn--sm" data-act="room-copy">' + ICON('link') + ' انسخ كود الغرفة</button>' +
        '<button class="btn btn--ghost btn--sm" data-act="room-leave">' + ICON('logout') + ' خروج من الغرفة</button>' +
      '</div>' +
      (isHost
        ? '<div class="roomsetup">' +
            '<div class="field"><span>عدد أفراد كل فريق</span><div class="chips">' +
              ROOM_SETUP.sizes.map((s) => '<button class="fchip' + (size === s ? ' is-on' : '') + '" data-act="room-size" data-v="' + s + '">' + s + ' ضد ' + s + '</button>').join('') +
            '</div></div>' +
            '<div class="field"><span>وقت السؤال</span><div class="chips">' +
              ROOM_SETUP.secs.map((s) => '<button class="fchip' + (Number(meta.secs || 30) === s ? ' is-on' : '') + '" data-act="room-secs" data-v="' + s + '">' + s + ' ثانية</button>').join('') +
            '</div></div>' +
          '</div>'
        : '') +
      '<div class="roomgrid">' + teamCard('a', a, 'أ') + teamCard('b', b, 'ب') + '</div>' +
      '<div class="roomrules">' +
        '<h2>القواعد</h2>' +
        '<ul class="ul">' +
          '<li>كل فريق بيتنزّل له ' + num(ROOM_QUESTIONS) + ' سؤال مختلف، والفريقين بيبدأوا مع بعض.</li>' +
          '<li>إجابة واحدة نهائية لكل سؤال (مفيش تصحيح)، والوقت ' + num(Number(meta.secs || 30)) + ' ثانية للسؤال.</li>' +
          '<li>الوقت بيقفل السؤال — والسؤال اللي ميتجاوبش بيتحسب غلط.</li>' +
          '<li>مفيش خروج بدري: اللي يخلص الـ٤٠ سؤال بتوعه بيستنى الفريق التاني لحد ما يخلص.</li>' +
          '<li>الفايز: أعلى مكسب مضمون. ولو النتيجتين متساويتين → تعادل.</li>' +
        '</ul>' +
      '</div>' +
      (isHost
        ? '<button class="btn btn--primary btn--lg btn--block" data-act="room-start" style="margin-top:18px">' + ICON('play') + ' ابدأ التحدي</button>'
        : '<p class="hint" style="text-align:center;margin-top:18px">استنى المنشئ يبدأ…</p>') +
    '</section>';
  }

  function roomPlayHTML() {
    const meta = roomMeta();
    const pr = myProgress() || { q: 0, ok: 0, amount: 0, done: false };
    const nq = ROOM_QUESTIONS;

    /* خلصت أو خرجت */
    if (pr.done) {
      const both = roomBothDone();
      const win = roomWinner();
      const label = (t) => (t === 'a' ? 'الفريق أ' : 'الفريق ب');
      const otherT = myTeam() === 'a' ? 'b' : 'a';
      const otherPr = teamProgress(otherT);
      const otherLeft = Math.max(0, ROOM_QUESTIONS - Math.max.apply(null, [0].concat(
        teamMembers(otherT).map((p) => Number(roomProgressOf(p.uid).q || 0))
      )));
      return '<section class="wrap page roomplay">' +
        '<span class="chip chip--live">' + ICON('trophy') + ' مكسبك اتقفل</span>' +
        '<h1 class="page__title">' + num(Number(pr.amount || 0)) + ' جنيه</h1>' +
        '<p class="lead">' + (both
          ? (win === 'tie' ? 'تعادل! الفريقين وصلوا نفس المكسب.' : 'الفريق الفايز: ' + label(win))
          : 'خلصت الـ' + num(ROOM_QUESTIONS) + ' سؤال بتوعك — استنى الفريق التاني يخلص (فاضلله حوالي ' + num(otherLeft) + ' سؤال). مفيش خروج بدري.') + '</p>' +
        '<div class="roomgrid">' +
          '<div class="roomteam' + (myTeam() === 'a' ? ' is-mine' : '') + '"><div class="roomteam__head"><b>الفريق أ</b></div>' +
            teamProgress('a').list.map((x) => '<div class="roomrow"><span>' + esc(x.name) + '</span><b>' + (x.done ? num(x.amount) + ' جنيه' : 'بيكمّل…') + '</b></div>').join('') +
            '<div class="roomrow roomrow--total"><span>أعلى مكسب</span><b>' + num(teamProgress('a').amount) + '</b></div></div>' +
          '<div class="roomteam' + (myTeam() === 'b' ? ' is-mine' : '') + '"><div class="roomteam__head"><b>الفريق ب</b></div>' +
            teamProgress('b').list.map((x) => '<div class="roomrow"><span>' + esc(x.name) + '</span><b>' + (x.done ? num(x.amount) + ' جنيه' : 'بيكمّل…') + '</b></div>').join('') +
            '<div class="roomrow roomrow--total"><span>أعلى مكسب</span><b>' + num(teamProgress('b').amount) + '</b></div></div>' +
        '</div>' +
        '<div class="card__actions" style="justify-content:center">' +
          '<button class="btn btn--ghost" data-act="room-leave">' + ICON('back') + ' خروج من الغرفة</button>' +
        '</div>' +
      '</section>';
    }

    const view = roomQuestionView();
    if (!view) {
      return '<section class="wrap page"><div class="empty">' + ICON('check', 'ico--xl') + 'خلصت أسئلتك — مكسبك ' + num(Number(pr.amount || 0)) + ' جنيه</div></section>';
    }

    const keys = ['أ', 'ب', 'ج', 'د'];
    const safe = mzSafe(Number(pr.ok || 0));
    return '<section class="wrap page roomplay">' +
      '<div class="roomhead">' +
        '<span class="chip chip--live">' + ICON('users') + ' الفريق ' + (myTeam() === 'a' ? 'أ' : 'ب') + ' — سؤال ' + num(Number(pr.q || 0) + 1) + ' / ' + num(nq) + '</span>' +
        '<span class="chip">' + ICON('wallet') + ' مكسبك المضمون: <b>' + mzMoney(safe) + '</b></span>' +
      '</div>' +
      '<div class="quiz__bar" style="margin:14px 0 0"><i id="roomTimer" style="width:100%"></i></div>' +
      '<p class="hint" style="text-align:end;margin:6px 2px 0">فاضل <b id="roomTimerN">' + Math.ceil(Number(meta.secs || 30)) + '</b> ثانية</p>' +
      '<article class="qcard" style="margin-top:14px">' +
        '<h2 class="qtext">' + esc(view.t) + '</h2>' +
        '<div class="opts' + (view.opts.length === 2 ? ' opts--two' : '') + '">' +
          view.opts.map((o, i) => {
            const hidden = (view.hide || []).indexOf(i) > -1;
            const cls = 'opt' + (view.pick === i && view.phase === 'ask' ? ' is-on' : '') +
              (view.phase === 'wrong' && view.pick === i ? ' is-wrong' : '') +
              (view.phase === 'right' && i === view.ai ? ' is-right' : '');
            return '<button class="' + cls + '"' + (hidden || view.locked ? ' disabled' : '') +
              ' data-act="room-answer" data-i="' + i + '">' +
              '<span class="opt__key">' + keys[i] + '</span>' +
              '<span class="opt__label">' + (hidden ? '—' : esc(o.v)) + '</span></button>';
          }).join('') +
        '</div>' +
      '</article>' +
      '<div class="roomgrid" style="margin-top:16px">' +
        '<div class="roomteam' + (myTeam() === 'a' ? ' is-mine' : '') + '"><div class="roomteam__head"><b>الفريق أ</b><span>' + (teamProgress('a').done ? num(teamProgress('a').amount) : 'بيلعب') + '</span></div></div>' +
        '<div class="roomgrid"></div>' +
        '<div class="roomteam' + (myTeam() === 'b' ? ' is-mine' : '') + '"><div class="roomteam__head"><b>الفريق ب</b><span>' + (teamProgress('b').done ? num(teamProgress('b').amount) : 'بيلعب') + '</span></div></div>' +
      '</div>' +
      '<p class="hint" style="text-align:center;margin-top:14px">مفيش انسحاب في التحدي — كمّل الـ' + num(ROOM_QUESTIONS) + ' سؤال.</p>' +
    '</section>';
  }

  /* ---------- الأكثر تصويتًا ---------- */
  function viewTrending() {
    const list = allQuestions().map((q) => ({ q, n: realVotes(q) })).sort((a, b) => b.n - a.n);
    const voted = list.filter((x) => x.n > 0).length;
    const records = isRecord(DATA.board) ? DATA.board : {};
    const board = Object.keys(records).filter((uid) => validKey(uid) && isRecord(records[uid]))
      .map((uid) => {
        const p = records[uid];
        const score = (v, max) => Number.isFinite(v) && v >= 0 ? Math.min(Math.floor(v), max) : 0;
        return { uid, name: boundedText(p.name, 40), best: score(p.best, 1000000),
          wins: score(p.wins, Number.MAX_SAFE_INTEGER), plays: score(p.plays, Number.MAX_SAFE_INTEGER) };
      })
      .filter((p) => Number(p.best || 0) > 0)
      .sort((a, b) => Number(b.best || 0) - Number(a.best || 0))
      .slice(0, 10);
    return '<section class="wrap page">' +
      '<span class="eyebrow">لوحة الصدارة</span>' +
      '<h1 class="page__title">الأكثر تصويتًا</h1>' +
      '<p class="lead">الأسئلة اللي الناس اتفاعلت معاها أكتر — الأصوات دي حقيقية وبتتجمع من كل اللاعبين في قاعدة البيانات.</p>' +
      (voted
        ? '<div class="ranks">' + list.slice(0, 12).map((x, i) => rankRow(x.q, i, x.n)).join('') + '</div>'
        : '<div class="empty">' + ICON('chart', 'ico--xl') + 'لسه مفيش أصوات مسجّلة — صوّت في أول سؤال وابدأ اللوحة.</div>') +
      '<div class="sec-head"><div><h2>متصدرو المليون</h2></div><span class="chip">' + num(board.length) + ' لاعب</span></div>' +
      (board.length
        ? '<div class="ranks">' + board.map((p, i) =>
            '<div class="rank"><span class="rank__n' + (i < 3 ? ' rank__n--' + (i + 1) : '') + '">' + (i + 1) + '</span>' +
            '<span class="rank__body"><span class="rank__q">' + esc(p.name || 'لاعب') + '</span>' +
            '<span class="hint">' + num(p.wins || 0) + ' فوز · ' + num(p.plays || 0) + ' جولة</span></span>' +
            '<span class="rank__v">' + num(p.best || 0) + ' جنيه</span></div>').join('') + '</div>'
        : '<div class="empty">' + ICON('trophy', 'ico--xl') + 'لسه محدش سجّل نتيجة — العب مستوى ووصل للفلوس.</div>') +
      '<div class="sec-head"><div><h2>أسئلة الزوار</h2></div><span class="chip">' + num(customQuestions().length) + ' سؤال</span></div>' +
      (customQuestions().length
        ? '<div class="grid-cards">' + customQuestions().map(miniCard).join('') + '</div>'
        : '<div class="empty">' + ICON('pencil', 'ico--xl') + 'لسه مفيش أسئلة من الزوار — كن أول واحد.<br><a class="btn btn--primary btn--sm" style="margin-top:14px" href="#/create">أضف سؤالك</a></div>') +
      '</section>';
  }

  /* ---------- أضف سؤالك ---------- */
  function viewCreate() {
    return '<section class="wrap page" style="max-width:720px">' +
      '<span class="eyebrow">منكم وإليكم</span>' +
      '<h1 class="page__title">أضف سؤالك</h1>' +
      '<p class="lead">اكتب سؤال «ماذا لو خيّروك بين…» على مزاج شلتك. السؤال بيتنشر في قاعدة البيانات ويظهر لكل اللاعبين.</p>' +
      (AUTH.user ? '' : '<p class="hint">محتاج تسجّل دخول عشان تنشر سؤال. <a href="#/auth?tab=login">دخول</a></p>') +
      '<form class="card" id="createForm" novalidate autocomplete="off">' +
        '<label class="field"><span>السؤال</span>' +
          '<textarea class="inp" name="q" rows="3" maxlength="160" placeholder="ماذا لو خيّروك بين…؟"></textarea></label>' +
        '<label class="field"><span>الاختيار الأول</span><input class="inp" name="o0" maxlength="60" autocomplete="off" placeholder="مثال: مليون دلوقتي"></label>' +
        '<label class="field"><span>الاختيار التاني</span><input class="inp" name="o1" maxlength="60" autocomplete="off" placeholder="مثال: ٥ مليون بعد ٥ سنين"></label>' +
        '<label class="field"><span>القسم</span><select class="inp" name="c">' +
          CATS.map((c) => '<option value="' + c.id + '">' + esc(c.name) + '</option>').join('') + '</select></label>' +
        '<button class="btn btn--primary btn--block" type="submit">' + ICON('sparkle') + ' انشر السؤال</button>' +
      '</form>' +
      '<div id="createOut" style="margin-top:20px"></div>' +
    '</section>';
  }

  /* ---------- الألعاب ---------- */
  function viewGames() {
    const g = STATE.game;
    return '<section class="wrap page">' +
      '<span class="eyebrow">المرحلة الجاية</span>' +
      '<h1 class="page__title">ألعاب ماذا لو</h1>' +
      '<p class="lead">ألعاب سريعة للرحلة والقعدة.</p>' +
      '<div class="promos promos--2">' +
        '<a class="promo" href="#/games/who"><span class="promo__art">' + ICON('dice', 'ico--xl') + '</span>' +
          '<b>مين يبدأ؟</b><span>عجلة تختار واحد من الشلة عشوائيًا — للألعاب وللأحكام الصعبة.</span>' +
          '<span class="promo__go">' + ICON('play') + ' العب</span></a>' +
        '<a class="promo" href="#/games/quiz"><span class="promo__art">' + ICON('bolt', 'ico--xl') + '</span>' +
          '<b>تحدي ٢٠ ثانية</b><span>أكبر عدد من الأسئلة في ٢٠ ثانية — صاحب أعلى رقم يكسب.</span>' +
          '<span class="promo__go">' + ICON('play') + ' العب</span></a>' +
      '</div>' +
    '</section>';
  }

  function viewWho() {
    const names = (LS.get('names', 'أحمد,محمد,سارة,يوسف,منة,عمر,نور,كريم')).split(/[,،\n]/).map((s) => s.trim()).filter(Boolean);
    return '<section class="wrap page" style="max-width:720px">' +
      '<div class="play__bar"><a class="btn btn--ghost btn--sm" href="#/games">' + ICON('back') + ' الألعاب</a>' +
        '<span class="chip chip--live">' + ICON('dice') + ' مين يبدأ؟</span></div>' +
      '<h1 class="page__title">مين يبدأ؟</h1>' +
      '<p class="lead">اكتب أسماء الشلة (كل اسم في سطر)، ودوس الزرار — والعجلة تختار.</p>' +
      '<div class="wheel"><div class="wheel__stage"><div class="wheel__name" id="whoName">جاهز؟</div></div>' +
        '<button class="btn btn--primary btn--lg" data-act="who-spin" id="whoBtn">' + ICON('refresh') + ' اختار عشوائي</button></div>' +
      '<label class="field" style="margin-top:18px"><span>الأسماء</span>' +
        '<textarea class="inp" id="whoNames" rows="6">' + esc(names.join('\n')) + '</textarea></label>' +
    '</section>';
  }

  function viewQuiz() {
    const g = STATE.game;
    if (g.running) {
      const q = g.deck[g.i];
      return '<section class="wrap page" style="max-width:720px">' +
        '<div class="quiz__top"><div class="quiz__timer"><b id="qzLeft">' + num(g.left) + '</b><small>ثانية</small></div>' +
        '<div class="quiz__score">' + ICON('target') + ' <b id="qzScore">' + num(g.score) + '</b></div></div>' +
        '<div class="quiz__bar"><i id="qzBar" style="width:' + (g.left / 20) * 100 + '%"></i></div>' +
        '<article class="qcard"><h2 class="qtext">' + esc(q.q) + '</h2>' +
        '<div class="opts' + (q.o.length === 2 ? ' opts--two' : '') + '">' +
        q.o.map((o, i) => '<button class="opt" data-act="qz-answer" data-i="' + i + '">' +
          '<span class="opt__key">' + (i + 1) + '</span><span class="opt__label">' + esc(o) + '</span></button>').join('') +
        '</div></article></section>';
    }
    return '<section class="wrap page" style="max-width:720px">' +
      '<div class="play__bar"><a class="btn btn--ghost btn--sm" href="#/games">' + ICON('back') + ' الألعاب</a>' +
        '<span class="chip chip--live">' + ICON('bolt') + ' تحدي ٢٠ ثانية</span></div>' +
      '<h1 class="page__title">قد إيه سؤال في ٢٠ ثانية؟</h1>' +
      '<p class="lead">٢٠ ثانية، اختيارات سريعة، وكل صوت بنقطة. أعلى رقم عندك بيتسجل.</p>' +
      '<div class="hero__stats" style="justify-content:flex-start">' +
        '<div class="stat"><b>' + num(Math.floor(myStats().best / 1000)) + '</b><span>أعلى رقم ليك</span></div>' +
        '<div class="stat"><b>20</b><span>ثانية</span></div></div>' +
      '<button class="btn btn--primary btn--lg" data-act="qz-start" style="margin-top:18px">' + ICON('play') + ' ابدأ</button>' +
    '</section>';
  }

  function viewGameFrame() {
    return '<section class="wrap page" style="max-width:1100px">' +
      '<div class="play__bar"><a class="btn btn--ghost btn--sm" href="#/games">' + ICON('back') + ' الألعاب</a>' +
        '<span class="chip">' + ICON('gamepad') + ' لعبة Godot</span>' +
        '<a class="btn btn--ghost btn--sm" id="frameFull" href="game.html" target="_blank" rel="noopener">' + ICON('expand') + ' ملء الشاشة</a></div>' +
      '<div class="frame" id="gameFrame">' +
        '<div class="frame__load" id="frameLoad"><span class="spin"></span> بنحمّل اللعبة…</div>' +
      '</div>' +
      '<p class="hint">لو الإطار فاضي: حط ملفات اللعبة في مجلد ملف <code>game.html</code> جنب <code>index.html</code>.</p>' +
    '</section>';
  }

  /* بيتأكد إن ملف اللعبة موجود قبل ما يحمّل الإطار، ولو مش موجود يعرض مكان محجوز */
  function mountGameFrame() {
    const box = $('#gameFrame');
    if (!box) return;
    const done = (ok) => {
      if (ok) {
        box.innerHTML = '<iframe src="game.html" title="لعبة Godot" allow="autoplay; fullscreen; gamepad"></iframe>' +
          '<div class="frame__load" id="frameLoad"><span class="spin"></span> بنحمّل اللعبة…</div>';
        const ifr = box.querySelector('iframe');
        ifr.addEventListener('load', () => box.classList.add('is-ready'));
      } else {
        box.classList.remove('is-ready');
        box.innerHTML = '<div class="frame__empty">' +
          '<span class="frame__ico">' + ICON('gamepad', 'ico--xl') + '</span>' +
          '<b>مكان اللعبة محجوز</b>' +
          '<span>حط ملف <code>game.html</code> (تصدير Godot) جنب <code>index.html</code>، واللعبة هتظهر هنا على طول.</span>' +
          '</div>';
        const full = $('#frameFull');
        if (full) full.style.display = 'none';
      }
    };
    fetch('game.html', { method: 'HEAD' }).then((r) => done(r.ok)).catch(() => done(false));
  }

  /* ---------- الصور والرسومات ---------- */
  function viewArt() {
    const items = [
      { f: 'million', t: 'مسرح المسابقة وشيك المليون', d: '1279×709', cdn: 'https://i.ibb.co/nsSs2xXG/million.png', cdnL: 'https://i.ibb.co/Fb4HLGSN/million-light.png' },
      { f: 'talk', t: 'اتنين من الشلة بيتكلموا', d: '900×490', cdn: 'https://i.ibb.co/QvfHx64Z/talk.png', cdnL: 'https://i.ibb.co/MkB4pQ2k/talk-light.png' },
      { f: 'trip', t: 'الشلة في رحلة', d: '900×490', cdn: 'https://i.ibb.co/nNZRM4n5/trip.png', cdnL: 'https://i.ibb.co/RGGyqxsP/trip-light.png' },
      { f: 'whatif', t: 'طفل ماسك علامة استفهام', d: '486×692', cdn: 'https://i.ibb.co/tMytNffL/whatif.png', cdnL: 'https://i.ibb.co/nMk1KM0k/whatif-light.png' }
    ];
    const urlsRow = '<div class="arturls"><b>ملفات الصور في المشروع</b>' +
      items.map((it) => '<a href="' + it.cdn + '" download>' + esc(it.f) + '.png — ' + it.d + '</a>' +
        (it.cdnL !== it.cdn ? '<a href="' + it.cdnL + '" download>' + esc(it.f) + '-light.png</a>' : '')).join('') +
      '</div>';
    return '<section class="wrap page">' +
      '<span class="eyebrow">أصول جاهزة</span>' +
      '<h1 class="page__title">صور ورسومات</h1>' +
      '<p class="lead">رسومات بخط اليد بخلفية <b>شفافة تمامًا</b> (PNG). كل رسمة ليه نسختين: حبر غامق للخلفيات الفاتحة، وحبر فاتح للخلفيات الغامقة. اضغط «تحميل» وهاتلاقيها على جهازك جاهزة للقص.</p>' +
      '<div class="arts">' + items.map((it) => '<figure class="art">' +
        '<div class="art__box art__box--dark"><img referrerpolicy="no-referrer" src="' + (it.cdnL || it.cdn) + '" data-cdn="' + (it.cdnL || it.cdn) + '" alt="' + esc(it.t) + ' (حبر فاتح)" loading="lazy"></div>' +
        '<div class="art__box art__box--light"><img referrerpolicy="no-referrer" src="' + it.cdn + '" data-cdn="' + it.cdn + '" alt="' + esc(it.t) + ' (حبر غامق)" loading="lazy"></div>' +
        '<figcaption><b>' + esc(it.t) + '</b><span>' + it.d + ' • PNG بخلفية شفافة</span>' +
        '<span class="art__dl">' +
          '<a class="btn btn--ghost btn--sm" href="' + it.cdn + '" download>' + ICON('download') + ' حبر غامق</a>' +
          '<a class="btn btn--ghost btn--sm" href="' + (it.cdnL || it.cdn) + '" download>' + ICON('download') + ' حبر فاتح</a>' +
        '</span></figcaption></figure>').join('') + '</div>' +
    '</section>' + urlsRow;
  }

  /* ---------- صفحات نصية ---------- */
  function viewAbout() {
    return '<section class="wrap page">' +
      '<h1 class="page__title">عن الموقع</h1>' +
      '<p class="lead">«من سيربح المليون؟» لعبة أسئلة عربية: ٤٠ سؤال من السهل للصعب، وسائل مساعدة، وشيك مليون جنيه باسمك لو كسبت. وجانبها قسم «ماذا لو خيّروك» — أسئلة جدلية للشلة والرحلات.</p>' +
      '<h2>من سيربح المليون</h2>' +
      '<ul class="ul"><li>كل جولة بتسحب ٤٠ سؤال عشوائي من بنك أسئلة كبير: ١٠ من كل مستوى صعوبة، وكل لاعب بيقابل أسئلة مختلفة.</li>' +
      '<li>وسائل المساعدة: ٥٠:٥٠، اسأل الجمهور، اتصال بصديق، وبدّل السؤال — كل واحدة مرة في الجولة.</li>' +
      '<li>شبكات أمان عند المستويات ٥ و١٥ و٢٥ و٣٥. تنسحب في أي وقت وتاخد مبلغ مستواك.</li>' +
      '<li>لو وصلت للمليون، بيتولّد شيك باسمك وتاريخك وتنزّله صورة PNG.</li></ul>' +
      '<h2>إزاي تستخدمه</h2>' +
      '<ul class="ul"><li>افتح «اللعب» واختار قسم، صوّت، وشوف نسبة اختيار الجمهور.</li>' +
      '<li>في الرحلة: «وضع الشلة» — كل واحد يقول اختياره، واللي ماسك التليفون يزوّد العداد.</li>' +
      '<li>عندك سؤال أحلى؟ اكتبه من «أضف سؤالك» وشاركه مع الشلة.</li></ul>' +
      '<h2>الأصوات بتتحسب إزاي</h2>' +
      '<p>كل صوت بيتخزن على حسابك — صوت واحد لكل حساب لكل سؤال، والنِسب اللي بتشوفها مجمّعة من كل اللاعبين على الموقع.</p>' +
      '<h2>البيانات</h2>' +
      '<p>الحسابات بتتعمل بالإيميل وكلمة مرور أو بحساب جوجل. جولاتك وفوزك وأصواتك وأسئلتك محفوظة على حسابك، وتقدر تسجّل خروج في أي وقت.</p>' +
    '</section>';
  }

  function viewPrivacy() {
    return '<section class="wrap page">' +
      '<h1 class="page__title">سياسة الخصوصية</h1>' +
      '<p class="lead">باختصار: الحساب بيتعمل بالإيميل أو جوجل، وأصواتك وأسئلتك وجولاتك بتتخزن على حسابك.</p>' +
      '<h2>الحساب</h2>' +
      '<p>التسجيل بيحصل بالإيميل وكلمة مرور أو بحساب جوجل. كلمة المرور مش بنشوفها ومش بتتخزن عندنا — بتتحقق منها خدمة الدخول الآمن.</p>' +
      '<h2>البيانات في قاعدة البيانات</h2>' +
      '<p>بيتخزن على حسابك: اسمك وإيميلك (بروفايل)، عدد جولاتك وفوزك وأعلى مكسب، وأصواتك على أسئلة «ماذا لو»، والأسئلة اللي بتنشرها. التصويتات بتظهر بشكل مجمّع لكل الزوار، واسمك بيظهر في لوحة المتصدرين لو سجّلت نتيجة.</p>' +
      '<h2>البيانات على جهازك</h2>' +
      '<p>بنسيب في المتصفح حاجات تفضيلية بس: إعداد الصوت والستريك والجولة المفتوحة — مش بيانات حساب.</p>' +
      '<h2>الإعلانات</h2>' +
      '<p>الموقع بيعرض مساحات إعلانية. لو اشتغلنا مع شبكة إعلانات، قد تستخدم كوكيز لتخصيص الإعلانات وفق سياساتها.</p>' +
      '<h2>حذف بياناتك</h2>' +
      '<p><button class="btn btn--ghost btn--sm" data-act="wipe">' + ICON('trash') + ' امسح بياناتي</button></p>' +
    '</section>';
  }

  function viewNotFound() {
    return '<section class="wrap page" style="text-align:center">' +
      '<div class="empty">' + ICON('question', 'ico--xl') + 'الصفحة دي مش موجودة.</div>' +
      '<a class="btn btn--primary" href="#/play">' + ICON('dice') + ' يلا نلعب</a></section>';
  }

  /* ==========================================================
     9) الراوتر
     ========================================================== */
  const app = () => $('#app');

  function parse() {
    const h = (location.hash || '#/').replace(/^#\/?/, '');
    const parts = h.split('?');
    const seg = parts[0].split('/').filter(Boolean);
    const params = Object.create(null);
    if (parts[1]) new URLSearchParams(parts[1]).forEach((v, k) => {
      if (['tab', 'cat', 'q'].includes(k) && v.length <= 160) params[k] = v;
    });
    return { name: seg[0] || 'home', arg: seg[1] || '', params };
  }

  let timer = null;
  function render(scrollToTop) {
    const r = parse();
    let html = '';
    if (timer) { clearInterval(timer); timer = null; }
    switch (r.name) {
      case 'home': html = viewHome(); break;
      case 'play': html = viewPlay(r.params); break;
      case 'q': html = viewSingle(safeDecode(r.arg)); break;
      case 'party':
        if (r.arg) html = viewRoom(r.arg.toUpperCase());
        else html = viewParty();
        break;
      case 'trending': html = viewTrending(); break;
      case 'create': html = viewCreate(); break;
      case 'games':
        if (r.arg === 'who') html = viewWho();
        else if (r.arg === 'quiz') html = viewQuiz();
        else if (r.arg === 'play') html = viewGameFrame();
        else html = viewGames();
        break;
      case 'million': html = viewMillion(r); break;
      case 'auth': html = authCardHTML(r.params.tab); break;
      case 'art': html = viewArt(); break;
      case 'about': html = viewAbout(); break;
      case 'privacy': html = viewPrivacy(); break;
      default: html = viewNotFound();
    }
    app().innerHTML = html;
    if (scrollToTop !== false) window.scrollTo(0, 0);
    markNav(r.name);
    const titles = { auth: 'الحساب', home: 'من سيربح المليون', million: 'من سيربح المليون', play: 'اللعب', q: 'سؤال', party: 'تحدي الشلة', trending: 'الأكثر تصويتًا', create: 'أضف سؤالك', games: 'الألعاب', art: 'الصور', about: 'عن الموقع', privacy: 'الخصوصية' };
    document.title = (titles[r.name] || 'صفحة') + ' — من سيربح المليون؟';
    if (r.name === 'games' && r.arg === 'quiz' && STATE.game.running) startGameTimer();
    if (r.name === 'games' && r.arg === 'play') mountGameFrame();
    /* غرف تحدي الشلة: ربط/فك المزامنة اللحظية على حسب المسار */
    if (!(r.name === 'party' && r.arg) && ROOM.channel) {
      roomDetach();
      ROOM.code = ''; ROOM.data = null;
    }
    if (r.name === 'million' && MZ.g && MZ.g.stage === 'win') setTimeout(mzDrawCheque, 0);
    const lad = document.getElementById('mzLadder');
    if (lad && lad.open && window.innerWidth >= 900) { const cur = lad.querySelector('.mzl.is-now'); if (cur) lad.scrollTop = Math.max(0, cur.offsetTop - lad.clientHeight / 2); }
    if (lad && window.innerWidth < 900) lad.removeAttribute('open');
  }

  function markNav(name) {
    const key = name === 'q' ? 'play' : (name === 'million' && (location.hash || '').indexOf('/rules') > -1 ? 'million-rules' : name);
    $$('[data-nav]').forEach((a) => {
      if (a.dataset.nav === key) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  /* ==========================================================
     10) الأحداث
     ========================================================== */
  document.addEventListener('click', (e) => {
    const wa = e.target.closest('[data-wa]');
    if (wa) {
      e.preventDefault();
      const q = byId(wa.dataset.wa);
      if (q) window.open('https://wa.me/?text=' + encodeURIComponent(q.q + '\n' + qUrl(q.id)), '_blank', 'noopener');
      return;
    }
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const act = el.dataset.act;

    if (act === 'vote') {
      const q = byId(el.dataset.qid);
      const i = Number(el.dataset.i);
      if (!q || isNaN(i)) return;
      if (myVote(q.id) !== undefined) { toast('صوّتت قبل كده في السؤال ده'); return; }
      const r = el.getBoundingClientRect();
      castVote(q, i).then((ok) => {
        if (!ok) return;
        confetti(r.left + r.width / 2, r.top + r.height / 2, 14);
        SFX.reveal();
        render(false);
        toast('تم التصويت! شوف الشلة اختارت إيه');
      });
      return;
    }

    if (act === 'next') {
      const q = nextQuestion(STATE.play.cat);
      if (!q) return;
      STATE.play.q = q;
      const host = $('#playHost');
      if (host) {
        host.style.opacity = '0';
        setTimeout(() => { host.innerHTML = qCard(q, { counter: 'سؤال جديد' }); host.style.opacity = '1'; SFX.tick(); }, 160);
      }
      return;
    }

    if (act === 'share') {
      const q = byId(el.dataset.qid);
      if (!q) return;
      shareQuestion(q).then((r) => {
        if (r === 'copied') toast('اتنسخ الرابط — ابعته للشلة');
        else if (r === 'shared') toast('تمام');
      });
      return;
    }

    if (act === 'filter') {
      STATE.play.cat = el.dataset.cat;
      STATE.play.q = null;
      render(false);
      return;
    }

    /* ---------- غرف تحدي الشلة ---------- */
    if (act === 'room-create') {
      if (!AUTH.user) { roomNeedAuth(); return; }
      roomCreate(4, 20, 30);
      return;
    }
    if (act === 'room-join') {
      const inp = $('#roomCode');
      roomJoin(inp ? inp.value : '');
      return;
    }
    if (act === 'room-team') { roomSwitchTeam(el.dataset.team === 'b' ? 'b' : 'a'); return; }
    if (act === 'room-size' || act === 'room-secs') {
      if (!ROOM.code) return;
      const meta = roomMeta();
      if (meta.host !== AUTH.user.id) { toast('منشئ الغرفة بس'); return; }
      const v = Number(el.dataset.v);
      const patch = { p_code: ROOM.code };
      if (act === 'room-size') patch.p_size = v;
      if (act === 'room-secs') patch.p_secs = v;
      SB.client.rpc('update_room_settings', patch)
        .then(({ data, error }) => {
          if (error) { toast(sbWriteError(error)); return; }
          const res = isRecord(data) ? data : {};
          if (!res.ok) toast(res.error === 'host' ? 'منشئ الغرفة بس' : 'مش قادرين نحفظ الإعداد ده');
        })
        .catch((e) => toast(sbWriteError(e)));
      return;
    }
    if (act === 'room-start') { roomStart(); return; }
    if (act === 'room-copy') {
      copyText(ROOM.code).then((ok) => {
        toast(ok ? 'اتنسخ كود الغرفة — ابعته للشلة' : 'كود الغرفة: ' + ROOM.code);
      });
      return;
    }
    if (act === 'room-leave') { roomLeave(); return; }
    if (act === 'room-answer') {
      const v = roomQuestionView();
      const i = Number(el.dataset.i);
      if (!v || v.locked || (v.hide || []).indexOf(i) > -1) return;
      roomAnswer(i);
      return;
    }

    /* مين يبدأ */
    if (act === 'who-spin') {
      const ta = $('#whoNames');
      const names = (ta ? ta.value : '').split(/[,،\n]/).map((s) => s.trim()).filter(Boolean);
      if (names.length < 2) { toast('اكتب اسمين على الأقل'); return; }
      LS.set('names', names.join(','));
      const box = $('#whoName');
      let n = 0;
      el.disabled = true;
      const tick = setInterval(() => {
        box.textContent = pick(names);
        SFX.tick(); n++;
        if (n > 12) {
          clearInterval(tick);
          const w = pick(names);
          box.textContent = w;
          box.classList.add('is-win');
          el.disabled = false;
          SFX.win(); confetti(null, window.innerHeight * 0.35, 26);
          setTimeout(() => box.classList.remove('is-win'), 1400);
        }
      }, 90);
      return;
    }

    /* تحدي ٢٠ ثانية */
    if (act === 'qz-start') {
      const g = STATE.game;
      g.running = true; g.left = 20; g.score = 0; g.i = 0;
      g.deck = shuffle(allQuestions()).slice(0, 40);
      render(false); startGameTimer();
      return;
    }
    if (act === 'qz-answer') {
      const g = STATE.game;
      g.score += 1; g.i = (g.i + 1) % g.deck.length;
      SFX.pick(); render(false);
      return;
    }

    if (act === 'signup') { doSignup(); return; }
    if (act === 'login') { doLogin(); return; }
    if (act === 'google') { doGoogle(); return; }
    if (act === 'logout') {
      AUTH.logout();
      toast('تم تسجيل الخروج');
      location.hash = '#/';
      render(false);
      return;
    }
    if (act === 'pw-eye') {
      const inp = document.getElementById('auPass');
      if (!inp) return;
      const show = inp.type === 'password';
      inp.type = show ? 'text' : 'password';
      el.innerHTML = ICON(show ? 'eyeoff' : 'eye');
      el.setAttribute('aria-label', show ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور');
      return;
    }
    if (act === 'user-menu') {
      const m = document.getElementById('userMenu');
      if (!m) return;
      const open = m.classList.toggle('is-open');
      el.setAttribute('aria-expanded', open ? 'true' : 'false');
      return;
    }
    if (act === 'mz-quick' || act === 'mz-start') {
      if (typeof AUTH !== 'undefined' && !AUTH.user) {
        AUTH.afterAuth = '#/million'; MZ.pending = true;
        toast('سجّل دخول الأول عشان تبدأ اللعب');
        location.hash = '#/auth?tab=login';
        return;
      }
      const g = MZ.g;
      if (act === 'mz-quick' && g && g.deck && g.q && g.stage === 'q') { location.hash = '#/million'; return; }
      mzStart(MZ.name || '');
      return;
    }
    if (act === 'mz-pick') {
      const g = MZ.g;
      if (!g || !g.q || g.q.phase !== 'ask') return;
      const i = Number(el.dataset.i);
      if (g.q.hide.indexOf(i) > -1) return;
      g.q.pick = i;
      mzSaveGame(); SFX.tick(); render(false);
      return;
    }
    if (act === 'mz-ok') { mzAnswer(); return; }
    if (act === 'mz-f') { mzFifty(); return; }
    if (act === 'mz-a') { mzAudience(); return; }
    if (act === 'mz-p') { mzPhone(); return; }
    if (act === 'mz-s') { mzSwap(); return; }
    if (act === 'mz-take') {
      const g = MZ.g;
      if (!g || g.stage !== 'q') return;
      mzStop('take');
      toast('اتسحبت بـ ' + mzMoney(MZ.g.amount));
      return;
    }
    if (act === 'mz-again') {
      const g = MZ.g;
      mzStart((g && MZ.name) || MZ.name || '');
      return;
    }
    if (act === 'mz-dl') { mzDownload(); return; }
    if (act === 'mz-share') { nativeShare({ withImage: true }).then((r) => {
        if (r === 'copied') toast('اتنسخ النص — ابعته على واتساب أو أي تطبيق');
        else if (r === 'shared' || r === 'shared-file') toast('اختار التطبيق وابعت الفوز');
      }); return; }
    if (act === 'share-native') { mzShareAction('native'); return; }
    if (act === 'share-copy') { mzShareAction('copy'); return; }

    if (act === 'wipe') {
      ['votes', 'counts', 'custom', 'streak', 'names', 'mz_game', 'mz_name', 'mz_wins', 'mz_plays', 'mz_best', 'bestGame'].forEach((k) => LS.del(k));
      store.streak = { n: 0, last: '' }; store.save('streak');
      MZ.g = null; MZ.wins = 0; MZ.plays = 0; MZ.best = 0;
      toast('تم مسح بيانات الجهاز — بيانات حسابك زي ما هي'); render(false);
      return;
    }
  });

  /* فورم إضافة سؤال */
  document.addEventListener('submit', async (e) => {
    const f = e.target;
    if (!f.matches('#createForm')) return;
    e.preventDefault();
    if (!AUTH.user) {
      AUTH.afterAuth = '#/create';
      toast('سجّل دخول الأول عشان تنشر سؤالك');
      location.hash = '#/auth?tab=login';
      return;
    }
    const fd = new FormData(f);
    const q = String(fd.get('q') || '').trim();
    const o = [String(fd.get('o0') || '').trim(), String(fd.get('o1') || '').trim()].filter(Boolean);
    if (q.length < 8) { toast('اكتب سؤال أطول شوية'); return; }
    if (o.length < 2) { toast('محتاج اختيارين'); return; }
    const btn = f.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;
    try {
      const item = await addCustom({ q: q, o: o, c: String(fd.get('c') || 'weird'), custom: true });
      const out = $('#createOut');
      if (out) {
        out.innerHTML = qCard(item, {});
        out.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      f.reset();
      confetti(window.innerWidth / 2, window.innerHeight * 0.4, 20);
      toast('سؤالك اتنشر في قاعدة البيانات — شاركه مع الشلة');
    } catch (err) {
      toast(err && err.message ? err.message : sbWriteError(err));
    } finally {
      if (btn) btn.disabled = false;
    }
  });

  /* مؤقت التحدي */
  function startGameTimer() {
    const g = STATE.game;
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      g.left -= 1;
      const l = $('#qzLeft'), b = $('#qzBar');
      if (l) l.textContent = num(g.left);
      if (b) b.style.width = clamp((g.left / 20) * 100, 0, 100) + '%';
      if (g.left <= 5 && g.left > 0) SFX.tick();
      if (g.left <= 0) {
        clearInterval(timer); timer = null;
        g.running = false;
        const prevBest = myStats().best;
        if (g.score > 0) AUTH.recordBest(g.score * 1000);
        const best = Math.max(prevBest, g.score * 1000);
        app().innerHTML = '<section class="wrap page" style="max-width:700px;text-align:center">' +
          '<span class="eyebrow">خلص الوقت</span>' +
          '<h1 class="page__title">' + (g.score >= 15 ? 'وحش!' : g.score >= 8 ? 'تمام جدًا' : 'محاولة كويسة') + '</h1>' +
          '<div class="final"><b>' + num(g.score) + '</b><span>نقطة في ٢٠ ثانية</span></div>' +
          '<p class="lead">أعلى مكسب مسجّل في حسابك: ' + num(best) + ' جنيه' + (g.score * 1000 >= best && g.score > 0 ? ' — رقم قياسي جديد' : '') + '</p>' +
          '<div class="card__actions" style="justify-content:center">' +
            '<button class="btn btn--primary" data-act="qz-start">' + ICON('refresh') + ' العب تاني</button>' +
            '<a class="btn btn--ghost" href="#/games">' + ICON('back') + ' الألعاب</a>' +
          '</div></section>';
        SFX.win(); confetti(null, window.innerHeight * 0.3, 30);
      }
    }, 1000);
  }

  /* ==========================================================
     10.4) بنك أسئلة المليون — 1004 سؤال
     [النص, [4 اختيارات], رقم الصح, القسم, المستوى 1-4]
     ========================================================== */
  const MSTARS = [
["كم عدد أيام السنة الميلادية العادية؟", ["366 يومًا","350 يومًا","365 يومًا","360 يومًا"], 2, "عام", 1],
["كم عدد أيام الأسبوع؟", ["5 أيام","6 أيام","8 أيام","7 أيام"], 3, "عام", 1],
["كم عدد أشهر السنة؟", ["10 أشهر","11 شهرًا","12 شهرًا","13 شهرًا"], 2, "عام", 1],
["كم عدد ساعات اليوم؟", ["12 ساعة","20 ساعة","36 ساعة","24 ساعة"], 3, "عام", 1],
["كم دقيقة في الساعة الواحدة؟", ["60 دقيقة","45 دقيقة","90 دقيقة","100 دقيقة"], 0, "عام", 1],
["كم ثانية في الدقيقة الواحدة؟", ["30 ثانية","60 ثانية","100 ثانية","90 ثانية"], 1, "عام", 1],
["كم عدد ألوان قوس قزح؟", ["5 ألوان","6 ألوان","8 ألوان","7 ألوان"], 3, "عام", 1],
["كم عدد حروف اللغة العربية؟", ["26 حرفًا","28 حرفًا","30 حرفًا","25 حرفًا"], 1, "عام", 1],
["كم عدد حروف اللغة الإنجليزية؟", ["24 حرفًا","25 حرفًا","26 حرفًا","27 حرفًا"], 2, "عام", 1],
["ما اسم أقرب نجم إلى الأرض؟", ["الشمس","القمر","نجم الشمال","الشعرى"], 0, "عام", 1],
["ما اسم مجرة الأرض؟", ["مجرة أندروميدا","مجرة درب التبانة","مجرة سومبريرو","مجرة اللولب"], 1, "عام", 2],
["كم عدد الدقائق في اليوم كاملًا؟", ["1200 دقيقة","960 دقيقة","1440 دقيقة","2400 دقيقة"], 2, "عام", 2],
["في أي سنة تأتي السنة الكبيسة عادةً؟", ["كل سنة ثالثة","كل سنة خامسة","كل سنة سادسة","كل أربع سنوات"], 3, "عام", 2],
["أي شهر ميلادي عدد أيامه 28 يومًا في السنة العادية؟", ["مارس","فبراير","يناير","أبريل"], 1, "عام", 2],
["ما عدد الأشهر الميلادية التي عدد أيامها 30 يومًا؟", ["4 أشهر","3 أشهر","5 أشهر","6 أشهر"], 0, "عام", 2],
["ما اسم أول شهر في السنة القبطية المصرية؟", ["بابه","هاتور","توت","كيهك"], 2, "عام", 2],
["كم عدد النقاط الظاهرة على كل أوجه زهر النرد الستة؟", ["18","20","24","21"], 3, "عام", 2],
["ما وحدة قياس الزمن الأصغر من الثانية؟", ["الدقيقة","الميلي ثانية","الساعة","الديسي ثانية"], 1, "عام", 2],
["ما الشيء الذي يحدث كل 4 سنوات ويضيف يومًا للسنة؟", ["الخسوف","الاعتدال","السنة الكبيسة","الانقلاب"], 2, "عام", 2],
["ما اسم أعلى درجة على مقياس ريختر للزلازل من حيث الشدة؟", ["لا يوجد سقف محدد","10 درجات","12 درجة","9 درجات"], 0, "عام", 2],
["ما أطول يوم في السنة في نصف الكرة الشمالي؟", ["21 مارس","21 يونيو","21 سبتمبر","21 ديسمبر"], 1, "عام", 3],
["ما اسم التقويم الذي يعتمد على دورة القمر؟", ["التقويم الشمسي","التقويم القمري","التقويم اليولياني","التقويم الميلادي"], 1, "عام", 3],
["كم عدد الكيلومترات في الميل الواحد تقريبًا؟", ["1.6 كيلومتر","2.5 كيلومتر","1 كيلومتر","3.2 كيلومتر"], 0, "عام", 3],
["ما اسم أبرد مكان مسجل على وجه الأرض؟", ["القارة القطبية الجنوبية","سيبيريا","جرينلاند","ألاسكا"], 0, "عام", 3],
["ما اسم أول شهر في التقويم الهجري؟", ["صفر","محرم","ربيع الأول","شعبان"], 1, "عام", 3],
["كم عدد الكواكب في المجموعة الشمسية؟", ["7","10","8","9"], 2, "عام", 3],
["ما اسم الظاهرة التي تجعل السماء زرقاء نهارًا؟", ["الانعكاس الكلي","تشتت رايلي","الانكسار الجوي","الانحراف الضوئي"], 1, "عام", 4],
["ما اسم الجهاز الذي يقيس الرطوبة الجوية؟", ["البارومتر","الترمومتر","الهيجرومتر","الأنيمومتر"], 2, "عام", 4],
["كم عدد الكروموسومات في الخلية الجنسية البشرية؟", ["46","23","22","44"], 1, "عام", 4],
["ما اسم العلم الذي يدرس توزيع السكان؟", ["الديموغرافيا","الجيولوجيا","الإحصاء الرياضي","الأنثروبولوجيا"], 0, "عام", 4],
["كم عدد الأصفار في المليون؟", ["5","6","7","9"], 1, "عام", 4],
["ما اسم وحدة قياس شدة الصوت؟", ["الهرتز","الديسيبل","الواط","النيوتن"], 1, "عام", 4],
["ما اسم أطول عظمة في جسم الإنسان؟", ["عظمة الفخذ","عظمة الساق","الترقوة","الحوض"], 0, "عام", 4],
["ما هي عاصمة مصر؟", ["الإسكندرية","القاهرة","الجيزة","بورسعيد"], 1, "جغرافيا", 1],
["ما هي عاصمة السعودية؟", ["جدة","مكة المكرمة","الرياض","الدمام"], 2, "جغرافيا", 1],
["ما أكبر محيط في العالم؟", ["المحيط الهندي","المحيط الأطلسي","المحيط المتجمد","المحيط الهادي"], 3, "جغرافيا", 1],
["ما هي عاصمة اليابان؟", ["أوساكا","طوكيو","كيوتو","ناجويا"], 1, "جغرافيا", 1],
["ما هي عاصمة فرنسا؟", ["ليون","مرسيليا","باريس","نيس"], 2, "جغرافيا", 1],
["في أي قارة توجد مصر؟", ["آسيا","أوروبا","إفريقيا","أستراليا"], 2, "جغرافيا", 1],
["ما أكبر قارة في العالم مساحة؟", ["إفريقيا","آسيا","أوروبا","أمريكا الشمالية"], 1, "جغرافيا", 1],
["في أي بلد يوجد برج إيفل؟", ["إيطاليا","بلجيكا","فرنسا","إسبانيا"], 2, "جغرافيا", 1],
["ما هي عاصمة تونس؟", ["صفاقس","سوسة","تونس العاصمة","بنزرت"], 2, "جغرافيا", 1],
["ما البحر الواقع شرق مصر؟", ["البحر المتوسط","البحر الأحمر","البحر الأسود","بحر قزوين"], 1, "جغرافيا", 1],
["ما هي عاصمة المغرب؟", ["الدار البيضاء","الرباط","فاس","مراكش"], 1, "جغرافيا", 2],
["ما هي عاصمة الأردن؟", ["إربد","الزرقاء","عمّان","العقبة"], 2, "جغرافيا", 2],
["ما هي عاصمة لبنان؟", ["طرابلس","صيدا","زحلة","بيروت"], 3, "جغرافيا", 2],
["ما هي عاصمة العراق؟", ["البصرة","بغداد","الموصل","أربيل"], 1, "جغرافيا", 2],
["ما هي عاصمة كندا؟", ["تورونتو","مونتريال","أوتاوا","فانكوفر"], 2, "جغرافيا", 2],
["ما هي عاصمة أستراليا؟", ["سيدني","ملبورن","كانبيرا","بيرث"], 2, "جغرافيا", 2],
["ما أطول نهر في إفريقيا؟", ["نهر الكونغو","نهر النيجر","نهر النيل","نهر الزمبيزي"], 2, "جغرافيا", 2],
["في أي بلد يوجد تمثال الحرية؟", ["فرنسا","الولايات المتحدة","كندا","المكسيك"], 1, "جغرافيا", 2],
["ما هي عاصمة إسبانيا؟", ["برشلونة","فالنسيا","مدريد","إشبيلية"], 2, "جغرافيا", 2],
["ما هي عاصمة البرازيل؟", ["ريو دي جانيرو","ساو باولو","برازيليا","سالفادور"], 2, "جغرافيا", 3],
["ما هي عاصمة تركيا؟", ["إسطنبول","إزمير","بورصة","أنقرة"], 3, "جغرافيا", 3],
["ما هي عاصمة اليمن؟", ["عدن","صنعاء","تعز","الحديدة"], 1, "جغرافيا", 3],
["ما أصغر دولة في العالم مساحةً؟", ["موناكو","الفاتيكان","سان مارينو","مالطا"], 1, "جغرافيا", 3],
["ما أكبر دولة عربية مساحةً؟", ["السعودية","الجزائر","السودان","ليبيا"], 1, "جغرافيا", 3],
["ما اسم المضيق الذي يفصل مصر عن السعودية؟", ["مضيق هرمز","مضيق تيران","مضيق جبل طارق","مضيق باب المندب"], 1, "جغرافيا", 3],
["ما اسم أعلى قمة جبلية في إفريقيا؟", ["جبل كينيا","جبل كليمنجارو","جبل راس داشن","جبل تبستي"], 1, "جغرافيا", 3],
["بحر يقع بين السعودية ومصر؟", ["البحر الأحمر","الخليج العربي","البحر المتوسط","بحر العرب"], 0, "جغرافيا", 3],
["ما هي عاصمة نيوزيلندا؟", ["أوكلاند","ويلينغتون","كرايستشيرش","دنيدن"], 1, "جغرافيا", 3],
["أي دولة عربية ليس لها سواحل؟", ["السودان","تشاد","الجزائر","الصومال"], 1, "جغرافيا", 3],
["ما اسم أعمق نقطة في المحيطات؟", ["خندق ماريانا","خندق تونغا","خندق بورتو ريكو","خندق جاوة"], 0, "جغرافيا", 4],
["ما اسم أعلى شلال في العالم؟", ["شلالات نياجرا","شلالات فيكتوريا","شلالات آنجل","شلالات إجوازو"], 2, "جغرافيا", 4],
["ما أكبر جزيرة في العالم؟", ["مدغشقر","جرينلاند","بورنيو","غينيا الجديدة"], 1, "جغرافيا", 4],
["ما اسم البحر الذي تنخفض أرضه عن سطح البحر بأكثر من 400 متر؟", ["البحر الميت","البحر الأحمر","بحر قزوين","البحر الأسود"], 0, "جغرافيا", 4],
["ما هي عاصمة كازاخستان؟", ["ألماتي","نور سلطان (أستانا)","شيمكنت","أكتوبي"], 1, "جغرافيا", 4],
["ما اسم أطول سلسلة جبال في العالم على اليابسة؟", ["جبال الأنديز","جبال الهيمالايا","جبال روكي","جبال الألب"], 0, "جغرافيا", 4],
["أي دولة بها أكبر عدد من الجزر؟", ["إندونيسيا","الفلبين","السويد","فنلندا"], 2, "جغرافيا", 4],
["ما اسم النهر الذي يمر بأكبر عدد من الدول؟", ["النيل","الأمازون","الدانوب","الراين"], 2, "جغرافيا", 4],
["ما اسم الصحراء التي تقع في تشيلي؟", ["أتاكاما","ناميب","غوبي","ثار"], 0, "جغرافيا", 4],
["ما اسم أكبر بحيرة عذبة في العالم مساحةً؟", ["بحيرة فيكتوريا","بحيرة سوبيريور","بحيرة بايكال","بحيرة ميشيغان"], 1, "جغرافيا", 4],
["من هي الحضارة التي بنت الأهرامات في الجيزة؟", ["الحضارة الرومانية","الحضارة المصرية القديمة","الحضارة الفينيقية","الحضارة السومرية"], 1, "تاريخ", 1],
["من أول رئيس لجمهورية مصر العربية؟", ["جمال عبد الناصر","أنور السادات","محمد نجيب","حسني مبارك"], 2, "تاريخ", 1],
["في أي عام هبط الإنسان على سطح القمر لأول مرة؟", ["1959","1965","1972","1969"], 3, "تاريخ", 1],
["من هو الفرعون الذي بنى الهرم الأكبر في الجيزة؟", ["خوفو","خفرع","منقرع","سنفرو"], 0, "تاريخ", 1],
["في أي عام قامت الثورة الفرنسية؟", ["1776","1789","1804","1815"], 1, "تاريخ", 2],
["من كان قائد المسلمين في معركة حطين؟", ["عمرو بن العاص","صلاح الدين الأيوبي","خالد بن الوليد","قطز"], 1, "تاريخ", 2],
["في أي عام انتهت الحرب العالمية الثانية؟", ["1939","1941","1945","1950"], 2, "تاريخ", 2],
["في أي عام بدأت الحرب العالمية الأولى؟", ["1905","1914","1918","1929"], 1, "تاريخ", 2],
["من فتح مصر في عهد الخليفة عمر بن الخطاب؟", ["خالد بن الوليد","عمرو بن العاص","سعد بن أبي وقاص","أبو عبيدة بن الجراح"], 1, "تاريخ", 2],
["من بنى سد مأرب؟", ["السبأيون في اليمن","الفراعنة","الرومان","الفينيقيون"], 0, "تاريخ", 3],
["في أي عام هاجر الرسول محمد ﷺ من مكة إلى المدينة؟", ["622 م","610 م","632 م","600 م"], 0, "تاريخ", 2],
["أي حضارة اخترعت الكتابة المسمارية؟", ["المصرية","السومرية","اليونانية","الرومانية"], 1, "تاريخ", 2],
["في أي عام اكتشف كريستوفر كولومبوس أمريكا؟", ["1492 م","1498 م","1400 م","1510 م"], 0, "تاريخ", 2],
["من أحفاد صلاح الدين الذي واجه الصليبيين في معركة عين جالوت؟", ["المماليك بقيادة قطز","الأيوبيون بقيادة الكامل","العثمانيون","المغول"], 0, "تاريخ", 3],
["في أي عام تأمم الرئيس جمال عبد الناصر قناة السويس؟", ["1952","1954","1956","1967"], 2, "تاريخ", 3],
["من هو أول خليفة أموي؟", ["عبد الملك بن مروان","معاوية بن أبي سفيان","الوليد بن عبد الملك","عمر بن عبد العزيز"], 1, "تاريخ", 3],
["من هي الملكة المصرية الشهيرة المتزوجة من يوليوس قيصر ومارك أنطونيو؟", ["نفرتيتي","حتشبسوت","كليوباترا","تي"], 2, "تاريخ", 2],
["ما اسم المدينة التي كانت عاصمة الدولة العباسية؟", ["دمشق","القاهرة","بغداد","الكوفة"], 2, "تاريخ", 2],
["في أي عام وقعت معركة واترلو؟", ["1799","1805","1815","1821"], 2, "تاريخ", 3],
["من هو أول من دار حول الأرض بحرًا؟", ["كريستوفر كولومبوس","فاسكو دا جاما","ماجلان","جيمس كوك"], 2, "تاريخ", 3],
["في أي عام وقعت نكبة فلسطين؟", ["1936","1948","1956","1967"], 1, "تاريخ", 3],
["من أسس الدولة السعودية الأولى؟", ["الملك عبد العزيز","الإمام محمد بن سعود","الإمام تركي بن عبد الله","الملك فيصل"], 1, "تاريخ", 3],
["ما اسم الحضارة التي شيدت مدينة البتراء؟", ["الأنباط","الرومان","الفراعنة","الآشوريون"], 0, "تاريخ", 3],
["من هو الخليفة العباسي الذي بنى بيت الحكمة؟", ["المأمون","المنصور","هارون الرشيد","المعتصم"], 0, "تاريخ", 3],
["ما اسم أول جامعة في العالم ما زالت تعمل حتى اليوم؟", ["جامعة الأزهر","جامعة القرويين","جامعة بولونيا","جامعة أكسفورد"], 1, "تاريخ", 3],
["من قائد المسلمين في معركة القادسية؟", ["سعد بن أبي وقاص","خالد بن الوليد","المثنى بن حارثة","عمرو بن العاص"], 0, "تاريخ", 3],
["في أي عام سقطت الأندلس نهائيًا بسقوط غرناطة؟", ["1453","1492","1517","1258"], 1, "تاريخ", 3],
["في أي عام سقطت القسطنطينية في يد العثمانيين؟", ["1453","1492","1517","1402"], 0, "تاريخ", 4],
["ما اسم الحملة التي قادها نابليون على مصر؟", ["الحملة الفرنسية","الحملة البريطانية","الحملة الإيطالية","الحملة العثمانية"], 0, "تاريخ", 4],
["في أي عام احتلت بريطانيا مصر رسميًا؟", ["1882","1914","1922","1956"], 0, "تاريخ", 4],
["من هو الملك المصري الذي وحد القطرين لأول مرة؟", ["مينا (نارمر)","خوفو","رمسيس الثاني","أحمس"], 0, "تاريخ", 4],
["من هو الخليفة الذي أمر بجمع القرآن في مصحف واحد أول مرة؟", ["أبو بكر الصديق","عثمان بن عفان","علي بن أبي طالب","عمر بن الخطاب"], 0, "تاريخ", 4],
["في أي عام سقطت بغداد في يد هولاكو؟", ["1200","1236","1258","1300"], 2, "تاريخ", 4],
["ما اسم أول بعثة فرعونية ذهبت إلى بلاد بونت؟", ["بعثة حتشبسوت","بعثة رمسيس","بعثة تحتمس","بعثة سنوسرت"], 0, "تاريخ", 4],
["من هو مؤسس الدولة الأيوبية؟", ["صلاح الدين الأيوبي","نور الدين محمود","سيف الدين قطز","الظاهر بيبرس"], 0, "تاريخ", 4],
["ما هي أقدم حضارة معروفة في بلاد الرافدين؟", ["الأكادية","السومرية","البابلية","الآشورية"], 1, "تاريخ", 4],
["من هو شاعر النيل؟", ["أحمد شوقي","حافظ إبراهيم","المتنبي","البحتري"], 1, "أدب", 1],
["من هو أمير الشعراء؟", ["حافظ إبراهيم","أحمد شوقي","نزار قباني","إيليا أبو ماضي"], 1, "أدب", 2],
["من هو أول أديب عربي يفوز بجائزة نوبل في الأدب؟", ["طه حسين","نجيب محفوظ","توفيق الحكيم","أدونيس"], 1, "أدب", 2],
["من يُلقّب بعميد الأدب العربي؟", ["عباس العقاد","طه حسين","المازني","أحمد أمين"], 1, "أدب", 2],
["من صاحب رواية «أولاد حارتنا»؟", ["يوسف السباعي","نجيب محفوظ","إحسان عبد القدوس","توفيق الحكيم"], 1, "أدب", 3],
["من صاحب قصيدة «على قدر أهل العزم تأتي العزائم»؟", ["أبو تمام","البحتري","المتنبي","جرير"], 2, "أدب", 3],
["من قال «الخيل والليل والبيداء تعرفني»؟", ["عنترة بن شداد","امرؤ القيس","المتنبي","أبو فراس الحمداني"], 2, "أدب", 3],
["من هو شاعر فلسطين صاحب «سجل أنا عربي»؟", ["سميح القاسم","توفيق زياد","محمود درويش","إبراهيم طوقان"], 2, "أدب", 3],
["من صاحب كتاب «كليلة ودمنة» بالعربية (المترجم)؟", ["الجاحظ","ابن المقفع","الأصمعي","سيبويه"], 1, "أدب", 3],
["من صاحب «مقدمة» في علم العمران البشري؟", ["ابن بطوطة","ابن خلدون","ابن رشد","ابن سينا"], 1, "أدب", 2],
["من صاحب «رسالة الغفران»؟", ["الجاحظ","أبو العلاء المعري","ابن قتيبة","التوحيدي"], 1, "أدب", 4],
["من صاحب كتاب «البخلاء»؟", ["ابن المقفع","الجاحظ","التوحيدي","الأصمعي"], 1, "أدب", 3],
["من صاحب «حي بن يقظان»؟", ["ابن طفيل","ابن رشد","الفارابي","ابن سينا"], 0, "أدب", 4],
["من الشاعر الملقب بـ«شاعر الحكمة»؟", ["المتنبي","أبو العتاهية","زهير بن أبي سلمى","لبيد"], 0, "أدب", 4],
["من صاحب «الأيام» وهي سيرة ذاتية؟", ["العقاد","طه حسين","توفيق الحكيم","المازني"], 1, "أدب", 2],
["من صاحب مسرحية «أهل الكهف»؟", ["توفيق الحكيم","صلاح عبد الصبور","نجيب محفوظ","يوسف إدريس"], 0, "أدب", 3],
["من صاحب رواية «الحرافيش»؟", ["نجيب محفوظ","يوسف القعيد","إحسان عبد القدوس","خيري شلبي"], 0, "أدب", 3],
["من هي الشاعرة العربية الملقبة بـ«الخنساء» لرثائها؟", ["الخنساء نفسها","ولادة بنت المستكفي","رابعة العدوية","ليلى الأخيلية"], 0, "أدب", 2],
["من صاحب «تهافت الفلاسفة»؟", ["ابن رشد","الغزالي","ابن سينا","الفارابي"], 1, "أدب", 4],
["من هو الشاعر الجاهلي صاحب معلقة «قفا نبك»؟", ["طرفة بن العبد","امرؤ القيس","زهير بن أبي سلمى","عنترة"], 1, "أدب", 3],
["من هو صاحب المعلقة التي مطلعها «هل غادر الشعراء من متردم»؟", ["عنترة بن شداد","امرؤ القيس","لبيد بن ربيعة","عمرو بن كلثوم"], 0, "أدب", 4],
["من الشاعر الذي لُقّب بـ«شاعر الرسول»؟", ["كعب بن زهير","حسان بن ثابت","عبد الله بن رواحة","كعب بن مالك"], 1, "أدب", 2],
["من صاحب قصيدة «ألا ليت الشباب يعود يومًا»؟", ["أبو العتاهية","أبو نواس","المتنبي","أبو فراس"], 0, "أدب", 4],
["من صاحب «نهج البلاغة» من حيث الجمع؟", ["الشريف الرضي","الجاحظ","ابن أبي الحديد","سيد قطب"], 0, "أدب", 4],
["من مؤلف «عبقرية عمر»؟", ["العقاد","طه حسين","أحمد أمين","المازني"], 0, "أدب", 3],
["من صاحب ديوان «أغاني الحياة»؟", ["إيليا أبو ماضي","أبو القاسم الشابي","جبران خليل جبران","ميخائيل نعيمة"], 1, "أدب", 4],
["من الشاعر السوري صاحب «قارئة الفنجان»؟", ["نزار قباني","بدر شاكر السياب","أدونيس","ممدوح عدوان"], 0, "أدب", 2],
["من مؤلف «رجال في الشمس»؟", ["غسان كنفاني","إميل حبيبي","محمود درويش","جبرا إبراهيم جبرا"], 0, "أدب", 4],
["ما اسم الشاعر الذي قال: «وما نيل المطالب بالتمني»؟", ["أحمد شوقي","حافظ إبراهيم","المتنبي","إيليا أبو ماضي"], 0, "أدب", 4],
["من قال: «إذا الشعب يومًا أراد الحياة»؟", ["أبو القاسم الشابي","أحمد شوقي","معروف الرصافي","حافظ إبراهيم"], 0, "أدب", 3],
["من صاحب «حديث عيسى بن هشام»؟", ["محمد المويلحي","المنفلوطي","طه حسين","جبران"], 0, "أدب", 4],
["من الشاعر الملقب بـ«شاعر مصر القومي» وصاحب «قم يا مصري»؟", ["فؤاد حداد","صلاح جاهين","بيرم التونسي","أمل دنقل"], 1, "أدب", 4],
["من مؤلف رواية «ذاكرة الجسد»؟", ["أحلام مستغانمي","غادة السمان","حنان الشيخ","رضوى عاشور"], 0, "أدب", 3],
["من صاحب قصيدة «لا تصالح»؟", ["أمل دنقل","صلاح عبد الصبور","فاروق جويدة","نجيب سرور"], 0, "أدب", 4],
["ما اسم فن الشعر الذي يقوم على وحدة القافية والوزن في بيتين؟", ["الموشح","المثنوي","الرباعية","الزجل"], 1, "أدب", 4],
["من صاحب «أنا لا أكذب ولكني أتجمل»؟", ["إبراهيم عبد القادر المازني","العقاد","طه حسين","توفيق الحكيم"], 0, "أدب", 4],
["من مؤلف «ذاكرة الجسد» و«فوضى الحواس»؟", ["أحلام مستغانمي","غادة السمان","سحر خليفة","رضوى عاشور"], 0, "أدب", 3],
["من الشاعر الملقب بـ«شاعر الهجاء» في العصر العباسي؟", ["جرير","الفرزدق","الأخطل","بشار بن برد"], 0, "أدب", 4],
["ما اسم البحر الذي منه تفعيلة «مستفعلن»؟", ["الرجز","الكامل","الوافر","الطويل"], 0, "أدب", 4],
["من صاحب ديوان «اللزوميات»؟", ["المتنبي","أبو العلاء المعري","أبو تمام","البحتري"], 1, "أدب", 4],
["من قائل «أنا الذي نظر الأعمى إلى أدبي»؟", ["أبو نواس","المتنبي","البحتري","أبو تمام"], 1, "أدب", 2],
["من مؤلف رواية «الطريق» و«اللص والكلاب»؟", ["نجيب محفوظ","يوسف إدريس","عبد الرحمن الشرقاوي","فتحي غانم"], 0, "أدب", 3],
["ما اسم أول رواية عربية نُشرت في مصر عام 1914؟", ["زينب","عودة الروح","الأيام","حديث عيسى بن هشام"], 0, "أدب", 4],
["من صاحب مسرحية «مصرع كليوباترا» الشعرية؟", ["أحمد شوقي","عزيز أباظة","توفيق الحكيم","صلاح عبد الصبور"], 0, "أدب", 4],
["من الشاعر الذي كتب نشيد «بلادي بلادي»؟", ["محمد يونس القاضي","أحمد شوقي","حافظ إبراهيم","صلاح جاهين"], 0, "أدب", 3],
["كم عدد سور القرآن الكريم؟", ["100 سورة","112 سورة","114 سورة","120 سورة"], 2, "دين", 1],
["كم عدد أجزاء القرآن الكريم؟", ["20 جزءًا","30 جزءًا","40 جزءًا","60 جزءًا"], 1, "دين", 1],
["كم عدد أركان الإسلام؟", ["3","4","5","6"], 2, "دين", 1],
["كم عدد أركان الإيمان؟", ["4","5","6","7"], 2, "دين", 1],
["كم عدد ركعات صلاة المغرب؟", ["2","3","4","5"], 1, "دين", 1],
["في أي سورة توجد آية الكرسي؟", ["سورة آل عمران","سورة البقرة","سورة النساء","سورة المائدة"], 1, "دين", 2],
["ما اسم أطول سورة في القرآن الكريم؟", ["سورة النساء","سورة البقرة","سورة آل عمران","سورة الأعراف"], 1, "دين", 1],
["ما اسم أقصر سورة في القرآن الكريم؟", ["سورة الإخلاص","سورة الناس","سورة الكوثر","سورة العصر"], 2, "دين", 2],
["كم عدد الصلوات المفروضة في اليوم؟", ["3","4","5","6"], 2, "دين", 1],
["في أي شهر هجري فرض الصيام؟", ["شعبان","رجب","رمضان","شوال"], 2, "دين", 1],
["أي سورة تُسمّى قلب القرآن؟", ["سورة البقرة","سورة يس","سورة الكهف","سورة الرحمن"], 1, "دين", 2],
["في أي ليلة أُنزل القرآن؟", ["ليلة النصف من شعبان","ليلة القدر","ليلة الإسراء والمعراج","ليلة الجمعة"], 1, "دين", 2],
["من هو أول الخلفاء الراشدين؟", ["عمر بن الخطاب","أبو بكر الصديق","عثمان بن عفان","علي بن أبي طالب"], 1, "دين", 1],
["في أي غزوة انتصر المسلمون على قريش في السنة الثانية للهجرة؟", ["غزوة أحد","غزوة بدر","غزوة الخندق","غزوة حنين"], 1, "دين", 2],
["كم عدد الأشهر الحرم؟", ["2","3","4","5"], 2, "دين", 3],
["في أي سورة ذُكرت قصة أصحاب الكهف؟", ["سورة مريم","سورة الكهف","سورة طه","سورة الأنبياء"], 1, "دين", 2],
["ما اسم السورة التي لا تبدأ بالبسملة؟", ["سورة التوبة","سورة الأنفال","سورة الفتح","سورة الحجر"], 0, "دين", 3],
["كم عدد سور القرآن التي تبدأ بـ«حم»؟", ["3","5","7","9"], 2, "دين", 4],
["ما اسم السورة التي تُسمّى «العروس»؟", ["سورة الرحمن","سورة يوسف","سورة مريم","سورة النور"], 0, "دين", 3],
["ما اسم أول سورة نزلت في القرآن؟", ["سورة الفاتحة","سورة العلق","سورة المدثر","سورة البقرة"], 1, "دين", 2],
["كم سنة استمرت الدعوة الإسلامية في مكة؟", ["10 سنوات","13 سنة","15 سنة","20 سنة"], 1, "دين", 3],
["من هو الصحابي المُلقّب بـ«سيف الله المسلول»؟", ["خالد بن الوليد","عمر بن الخطاب","القعقاع بن عمرو","المثنى بن حارثة"], 0, "دين", 3],
["ما اسم أطول آية في القرآن الكريم؟", ["آية الكرسي","آية الدين","آية المواريث","آية النور"], 1, "دين", 4],
["كم عدد السجدات في القرآن الكريم (سجدات التلاوة)؟", ["11","13","15","17"], 2, "دين", 4],
["ما اسم السورة التي ذُكر فيها اسم «محمد» لأول مرة؟", ["سورة البقرة","سورة آل عمران","سورة محمد","سورة الفتح"], 1, "دين", 4],
["من هو الصحابي الذي جمع القرآن في مصحف واحد في عهد عثمان؟", ["زيد بن ثابت","أبي بن كعب","عبد الله بن مسعود","معاذ بن جبل"], 0, "دين", 4],
["ما اسم الغزوة التي تسمى «غزوة الأحزاب»؟", ["غزوة بدر","غزوة الخندق","غزوة حنين","غزوة تبوك"], 1, "دين", 3],
["كم عدد السور المكية تقريبًا؟", ["60","76","86","100"], 2, "دين", 4],
["ما اسم السورة التي بدأت بـ«تبارك»؟", ["سورة الملك","سورة الفرقان","سورة المؤمنون","سورة القلم"], 0, "دين", 3],
["ما هي أول قبلة للمسلمين في الصلاة؟", ["الكعبة","المسجد الأقصى","المسجد النبوي","مسجد قباء"], 1, "دين", 3],
["كم عدد آيات سورة البقرة؟", ["276 آية","286 آية","296 آية","300 آية"], 1, "دين", 4],
["ما اسم السورة التي تُعدل ثلث القرآن؟", ["سورة الفاتحة","سورة الإخلاص","سورة الكافرون","سورة يس"], 1, "دين", 3],
["كم عدد القراءات المتواترة للقرآن الكريم؟", ["7 قراءات","10 قراءات","14 قراءة","20 قراءة"], 1, "دين", 4],
["ما اسم أول مسجد بني في الإسلام؟", ["المسجد النبوي","مسجد قباء","المسجد الحرام","المسجد الأقصى"], 1, "دين", 3],
["من هو الصحابي الذي لُقّب بـ«أبو هريرة» لكثرة ملازمته للهررة؟", ["عبد الرحمن بن صخر","أنس بن مالك","أبو ذر الغفاري","سلمان الفارسي"], 0, "دين", 3],
["ما اسم السورة التي ذُكر فيها «بسم الله الرحمن الرحيم» مرتين؟", ["سورة النمل","سورة الفاتحة","سورة هود","سورة يونس"], 0, "دين", 4],
["في أي سنة هجرية فُرض الحج؟", ["السنة الخامسة","السنة السادسة","السنة التاسعة","السنة الحادية عشرة"], 2, "دين", 4],
["من هو الصحابي الذي روى أكثر أحاديث عن النبي ﷺ؟", ["أبو هريرة","عبد الله بن عمر","أنس بن مالك","عائشة"], 0, "دين", 3],
["ما اسم الكتاب الذي ألّفه الإمام البخاري؟", ["صحيح البخاري","صحيح مسلم","الموطأ","سنن أبي داود"], 0, "دين", 2],
["ما الغاز الذي يحتاجه الإنسان للتنفس؟", ["النيتروجين","الأكسجين","ثاني أكسيد الكربون","الهيدروجين"], 1, "علوم", 1],
["ما الرمز الكيميائي للماء؟", ["CO2","H2O","O2","NaCl"], 1, "علوم", 1],
["ما الكوكب الأحمر في المجموعة الشمسية؟", ["الزهرة","المريخ","عطارد","نبتون"], 1, "علوم", 1],
["ما العضو المسؤول عن ضخ الدم في الجسم؟", ["الكبد","الرئة","القلب","الكلية"], 2, "علوم", 1],
["ما أكبر حيوان على وجه الأرض؟", ["الفيل الإفريقي","الحوت الأزرق","الزرافة","القرش الأبيض"], 1, "علوم", 1],
["ما أكبر كوكب في المجموعة الشمسية؟", ["زحل","المشتري","أورانوس","نبتون"], 1, "علوم", 2],
["ما الفيتامين الذي يُصنّع في الجسم بمساعدة أشعة الشمس؟", ["فيتامين C","فيتامين A","فيتامين D","فيتامين B12"], 2, "علوم", 2],
["ما أكبر عضو في جسم الإنسان؟", ["الكبد","الجلد","الرئة","المخ"], 1, "علوم", 2],
["ما وحدة قياس القوة؟", ["الجول","الواط","النيوتن","الباسكال"], 2, "علوم", 2],
["ما اسم العلم الذي يدرس النجوم والكواكب؟", ["الجيولوجيا","الفلك","الأحياء","الكيمياء"], 1, "علوم", 2],
["كم عدد عظام جسم الإنسان البالغ؟", ["180 عظمة","206 عظمة","250 عظمة","300 عظمة"], 1, "علوم", 3],
["ما العنصر الأكثر وفرة في الغلاف الجوي للأرض؟", ["الأكسجين","النيتروجين","الأرجون","ثاني أكسيد الكربون"], 1, "علوم", 3],
["ما الغاز الذي ينتج عن عملية البناء الضوئي؟", ["ثاني أكسيد الكربون","الأكسجين","النيتروجين","الهيدروجين"], 1, "علوم", 2],
["كم عدد الكروموسومات في الخلية البشرية الطبيعية؟", ["23","44","46","48"], 2, "علوم", 3],
["ما العالم الذي وضع قوانين الحركة الثلاثة؟", ["أينشتاين","نيوتن","غاليليو","أرخميدس"], 1, "علوم", 2],
["ما اسم العملية التي يتحول فيها السائل إلى غاز؟", ["التجمد","التبخر","التكاثف","التسامي"], 1, "علوم", 2],
["ما وحدة قياس شدة التيار الكهربائي؟", ["الفولت","الأمبير","الأوم","الواط"], 1, "علوم", 3],
["ما اسم أكبر غدة في جسم الإنسان؟", ["البنكرياس","الكبد","الغدة الدرقية","الغدة النخامية"], 1, "علوم", 3],
["كم عدد الأسنان اللبنية عند الطفل؟", ["16","20","24","32"], 1, "علوم", 3],
["ما سرعة الضوء في الفراغ تقريبًا؟", ["30 ألف كم/ث","300 ألف كم/ث","3 ملايين كم/ث","1000 كم/ث"], 1, "علوم", 3],
["ما اسم أصغر وحدة بنائية للكائن الحي؟", ["النسيج","الخلية","العضو","الجهاز"], 1, "علوم", 2],
["ما اسم أقسى مادة طبيعية معروفة؟", ["الحديد","الألماس","الجرانيت","الكوارتز"], 1, "علوم", 3],
["ما اسم العملية التي تنقسم بها الخلية إلى خليتين متطابقتين؟", ["الانقسام المنصف","الانقسام المتساوي","التبرعم","الإخصاب"], 1, "علوم", 4],
["ما اسم الجزيء الذي يحمل الصفات الوراثية؟", ["البروتين","الـ DNA","الدهون","الكربوهيدرات"], 1, "علوم", 3],
["كم عدد الغرف في قلب الإنسان؟", ["2","3","4","5"], 2, "علوم", 2],
["ما اسم الجهاز الذي يقيس الضغط الجوي؟", ["الترمومتر","البارومتر","الهيجرومتر","الأنيمومتر"], 1, "علوم", 3],
["ما اسم وحدة قياس الطاقة في الغذاء؟", ["الكالوري","النيوتن","الأمبير","اللتر"], 0, "علوم", 2],
["ما اسم العنصر الكيميائي الذي رمزه Fe؟", ["الفضة","الحديد","الزنك","النحاس"], 1, "علوم", 3],
["ما اسم الظاهرة التي تنكسر فيها أشعة الضوء عند انتقالها بين وسطين؟", ["الانعكاس","الانكسار","التشتت","الامتصاص"], 1, "علوم", 3],
["ما اسم العالم الذي اكتشف البنسلين؟", ["لويس باستور","ألكسندر فلمنج","روبرت كوخ","إدوارد جينر"], 1, "علوم", 4],
["ما اسم الطاقة التي تنتج عن حركة الأجسام؟", ["طاقة الوضع","الطاقة الحركية","الطاقة الكيميائية","الطاقة النووية"], 1, "علوم", 3],
["كم عدد الأزواج الكروموسومية في الإنسان؟", ["21","22","23","24"], 2, "علوم", 4],
["ما اسم العنصر الأكثر تفاعلًا في الجدول الدوري؟", ["الأكسجين","الفلور","الصوديوم","الكلور"], 1, "علوم", 4],
["ما اسم القانون الذي ينص على أن لكل فعل رد فعل مساوٍ له في المقدار ومضاد في الاتجاه؟", ["قانون الجذب","قانون نيوتن الثالث","قانون بقاء الطاقة","قانون أرخميدس"], 1, "علوم", 3],
["ما اسم الجهاز المسؤول عن تنقية الدم من السموم؟", ["الكلية","الكبد","الطحال","الرئة"], 1, "علوم", 3],
["ما اسم العالم الذي صاغ نظرية النسبية؟", ["نيوتن","أينشتاين","بلانك","بور"], 1, "علوم", 2],
["ما اسم أكبر شريان في جسم الإنسان؟", ["الوريد الأجوف","الشريان الأورطي","الشريان الرئوي","الشريان السباتي"], 1, "علوم", 4],
["ما اسم العملية التي تمتص بها الجذور الماء من التربة؟", ["النتح","الأسموزية","البناء الضوئي","التنفس"], 1, "علوم", 4],
["ما اسم أصغر كواكب المجموعة الشمسية؟", ["عطارد","المريخ","الزهرة","بلوتو"], 0, "علوم", 4],
["كم لاعبًا في فريق كرة القدم داخل الملعب؟", ["10","11","12","9"], 1, "رياضة", 1],
["كم عدد أشواط مباراة كرة القدم؟", ["شوط واحد","شوطان","ثلاثة أشواط","أربعة أشواط"], 1, "رياضة", 1],
["كم دقيقة مدة المباراة في كرة القدم؟", ["60 دقيقة","80 دقيقة","90 دقيقة","120 دقيقة"], 2, "رياضة", 1],
["كل كم سنة تقام كأس العالم لكرة القدم؟", ["كل سنتين","كل ثلاث سنوات","كل أربع سنوات","كل خمس سنوات"], 2, "رياضة", 1],
["كم لاعبًا في فريق كرة السلة داخل الملعب؟", ["4","5","6","7"], 1, "رياضة", 2],
["في أي رياضة يستخدم المضرب والكرة الصفراء على ملعب عشبي؟", ["التنس","الاسكواش","كرة الطاولة","الريشة الطائرة"], 0, "رياضة", 1],
["ما اسم النادي المصري الملقب بـ«القلعة الحمراء»؟", ["الزمالك","الأهلي","الإسماعيلي","المصري"], 1, "رياضة", 1],
["في أي رياضة يوجد «الكوبري» و«الخنق»؟", ["الملاكمة","المصارعة","الجودو","الكاراتيه"], 1, "رياضة", 3],
["كم لاعبًا في فريق الكرة الطائرة داخل الملعب؟", ["5","6","7","11"], 1, "رياضة", 2],
["في أي دولة نشأت رياضة الجودو؟", ["الصين","اليابان","كوريا","تايلاند"], 1, "رياضة", 2],
["من المنتخب الذي فاز بكأس العالم 2022؟", ["فرنسا","البرازيل","الأرجنتين","ألمانيا"], 2, "رياضة", 2],
["أي منتخب فاز بكأس العالم أكثر من غيره؟", ["ألمانيا","إيطاليا","البرازيل","الأرجنتين"], 2, "رياضة", 2],
["من هو اللاعب البرازيلي الملقب بـ«الظاهرة»؟", ["مارادونا","رونالدو","بيليه","روماريو"], 1, "رياضة", 2],
["في أي رياضة تُستخدم كلمة «سلام دانك»؟", ["كرة السلة","كرة القدم","التنس","السباحة"], 0, "رياضة", 3],
["ما اسم البطولة الأهم للأندية الأوروبية في كرة القدم؟", ["الدوري الأوروبي","دوري أبطال أوروبا","كأس السوبر","كأس العالم للأندية"], 1, "رياضة", 2],
["كم عدد لاعبي فريق كرة اليد داخل الملعب؟", ["5","6","7","11"], 2, "رياضة", 3],
["كم مترًا طول حوض السباحة الأولمبي؟", ["25 مترًا","50 مترًا","75 مترًا","100 متر"], 1, "رياضة", 3],
["من هي الدولة الأولى عربيًا التي استضافت كأس العالم؟", ["المغرب","قطر","مصر","السعودية"], 1, "رياضة", 2],
["ما اسم الملعب الذي لُعب فيه نهائي كأس العالم 2022؟", ["لوسيل","البيت","الجنوب","974"], 0, "رياضة", 3],
["في أي رياضة تُستخدم كلمة «باتر»؟", ["الجولف","التنس","الكريكيت","البيسبول"], 3, "رياضة", 4],
["من الهداف التاريخي لكأس العالم؟", ["رونالدو","ميروسلاف كلوزه","بيليه","جيرد مولر"], 1, "رياضة", 4],
["من فاز بأول نسخة من كأس العالم عام 1930؟", ["البرازيل","الأوروغواي","الأرجنتين","إيطاليا"], 1, "رياضة", 4],
["كم عدد لاعبي فريق الكريكيت داخل الملعب؟", ["9","11","13","15"], 1, "رياضة", 3],
["ما اسم البطولة التي يشارك فيها أفضل لاعبي التنس على الملاعب الترابية في فرنسا؟", ["ويمبلدون","رولان غاروس","أستراليا المفتوحة","أمريكا المفتوحة"], 1, "رياضة", 3],
["من هو اللاعب الحاصل على أكبر عدد من الكرات الذهبية؟", ["كريستيانو رونالدو","ليونيل ميسي","ميشيل بلاتيني","ماركو فان باستن"], 1, "رياضة", 3],
["كم عدد حلقات شعار الألعاب الأولمبية؟", ["4","5","6","7"], 1, "رياضة", 2],
["أين أقيمت أول دورة أولمبية حديثة عام 1896؟", ["باريس","أثينا","لندن","روما"], 1, "رياضة", 4],
["في أي رياضة يوجد «الضربة الساحقة»؟", ["الكرة الطائرة","التنس","كرة السلة","الهوكي"], 0, "رياضة", 3],
["ما هو أكثر نادٍ تتويجًا بدوري أبطال إفريقيا في مصر؟", ["الزمالك","الأهلي","الإسماعيلي","المصري"], 1, "رياضة", 2],
["من رسم لوحة «الموناليزا»؟", ["مايكل أنجلو","ليوناردو دافنشي","بابلو بيكاسو","فينسنت فان جوخ"], 1, "فنون", 2],
["كم عدد أوتار الجيتار الكلاسيكي؟", ["4","5","6","7"], 2, "فنون", 2],
["من يلقّب بـ«كوكب الشرق»؟", ["فيروز","أم كلثوم","أسمهان","نجاة الصغيرة"], 1, "فنون", 2],
["من يلقّب بـ«العندليب الأسمر»؟", ["محمد عبد الوهاب","عبد الحليم حافظ","فريد الأطرش","محمد منير"], 1, "فنون", 2],
["ما اسم الآلة الموسيقية ذات 88 مفتاحًا؟", ["الأورغ","البيانو","الأكورديون","الهارب"], 1, "فنون", 2],
["في أي بلد نشأت البيتزا؟", ["فرنسا","إيطاليا","إسبانيا","اليونان"], 1, "فنون", 1],
["ما اسم الرقصة الشعبية المصرية الشهيرة بالعصا؟", ["التنورة","التحطيب","السامبا","الفلامنكو"], 1, "فنون", 3],
["من يلقّب بـ«موسيقار الأجيال»؟", ["محمد عبد الوهاب","بليغ حمدي","رياض السنباطي","زكريا أحمد"], 0, "فنون", 3],
["ما اسم المطربة اللبنانية الملقبة بـ«جارة القمر»؟", ["صباح","فيروز","نجاح سلام","ماجدة الرومي"], 1, "فنون", 3],
["كم عدد حروف السلم الموسيقي الغربي؟", ["5","6","7","8"], 2, "فنون", 2],
["من رسم سقف كنيسة سيستين في الفاتيكان؟", ["رافائيل","مايكل أنجلو","دافنشي","دوناتيلو"], 1, "فنون", 3],
["من رسم لوحة «ليلة النجوم»؟", ["كلود مونيه","فينسنت فان جوخ","بول سيزان","بول غوغان"], 1, "فنون", 3],
["ما اسم الحركة الفنية التي أسسها بيكاسو؟", ["السريالية","التكعيبية","التعبيرية","الانطباعية"], 1, "فنون", 3],
["من مؤلف رواية «عمارة يعقوبيان»؟", ["نجيب محفوظ","علاء الأسواني","أحمد مراد","يوسف إدريس"], 1, "فنون", 3],
["من مخرج فيلم «الأرض» المصري؟", ["يوسف شاهين","صلاح أبو سيف","محمد خان","داود عبد السيد"], 1, "فنون", 4],
["ما اسم الآلة التي تُعزف بالنفخ ولها صمامات نحاسية؟", ["الترومبيت","الكلارينيت","الناي","الساكسفون"], 0, "فنون", 3],
["ما اسم الفن الياباني القائم على طي الورق؟", ["أوريغامي","إيكيبانا","كاليجرافي","مانغا"], 0, "فنون", 3],
["من صاحب أغنية «ألف ليلة وليلة»؟", ["أم كلثوم","فيروز","نجاة الصغيرة","وردة الجزائرية"], 0, "فنون", 2],
["من رسم لوحة «الصرخة»؟", ["إدفارد مونك","بيكاسو","دالي","ماتيس"], 0, "فنون", 4],
["من رسم «العشاء الأخير»؟", ["مايكل أنجلو","ليوناردو دافنشي","رافائيل","تيتيان"], 1, "فنون", 3],
["ما اسم الحركة الفنية التي رسم فيها دالي ساعاته الذائبة؟", ["التكعيبية","السريالية","الانطباعية","الوحشية"], 1, "فنون", 3],
["ما اسم الفرقة المصرية التي غنّت «شبابيك»؟", ["المصريين","بلاك تيما","واما","كايروكي"], 0, "فنون", 4],
["من هو ملحّن «أنت عمري» لأم كلثوم؟", ["بليغ حمدي","محمد عبد الوهاب","رياض السنباطي","زكريا أحمد"], 1, "فنون", 3],
["ما اسم أول فيلم ناطق بالعربية؟", ["أولاد الذوات","ليلى","بابا عريس","شباب امرأة"], 0, "فنون", 4],
["في أي بلد نشأ فن الفلامنكو؟", ["البرتغال","إسبانيا","المكسيك","الأرجنتين"], 1, "فنون", 3],
["من مؤلف «موسيقى النهر الخالد»؟", ["محمد عبد الوهاب","رياض السنباطي","بليغ حمدي","فريد الأطرش"], 2, "فنون", 4],
["ما اسم أكبر متحف في العالم؟", ["متحف اللوفر","المتحف البريطاني","المتروبوليتان","الإرميتاج"], 0, "فنون", 3],
["في أي بلد يوجد سور الصين العظيم؟", ["اليابان","الصين","الهند","كوريا"], 1, "حول العالم", 1],
["ما عملة الولايات المتحدة؟", ["الجنيه","الدولار","اليورو","الفرنك"], 1, "حول العالم", 1],
["ما العملة المستخدمة في معظم دول الاتحاد الأوروبي؟", ["الجنيه الإسترليني","اليورو","الدولار","الكرونة"], 1, "حول العالم", 1],
["ما عاصمة إيطاليا؟", ["ميلانو","روما","نابولي","تورينو"], 1, "حول العالم", 1],
["ما عاصمة ألمانيا؟", ["ميونخ","برلين","هامبورغ","كولونيا"], 1, "حول العالم", 1],
["في أي بلد يوجد الكولوسيوم؟", ["اليونان","إيطاليا","إسبانيا","تركيا"], 1, "حول العالم", 2],
["ما اسم أكبر هرم في مصر؟", ["هرم خفرع","الهرم الأكبر خوفو","هرم منقرع","هرم سقارة"], 1, "حول العالم", 2],
["في أي قارة توجد البرازيل؟", ["أمريكا الشمالية","أمريكا الجنوبية","إفريقيا","آسيا"], 1, "حول العالم", 1],
["ما اسم البلد الذي يشتهر بأبراج ساغرادا فاميليا؟", ["إيطاليا","إسبانيا","البرتغال","فرنسا"], 1, "حول العالم", 2],
["كم عدد الدول العربية تقريبًا؟", ["15","22","30","10"], 1, "حول العالم", 2],
["ما عاصمة اليونان؟", ["سالونيك","أثينا","باتراس","هيراكليون"], 1, "حول العالم", 2],
["ما عاصمة البرتغال؟", ["بورتو","لشبونة","فارو","براغا"], 1, "حول العالم", 3],
["ما عاصمة الأرجنتين؟", ["قرطبة","بوينس آيرس","روساريو","مندوزا"], 1, "حول العالم", 2],
["ما أكبر دولة في العالم مساحة؟", ["كندا","روسيا","الصين","الولايات المتحدة"], 1, "حول العالم", 2],
["ما أصغر دولة عربية مساحة؟", ["قطر","البحرين","الكويت","لبنان"], 1, "حول العالم", 3],
["ما أكبر دولة عربية مساحة؟", ["السعودية","الجزائر","السودان","ليبيا"], 1, "حول العالم", 3],
["ما اسم أعلى برج في العالم؟", ["برج خليفة","برج شنغهاي","برج إيفل","برج المملكة"], 0, "حول العالم", 2],
["ما العلم الذي يتكون من لونين فقط؟", ["العلم المصري","العلم السعودي","العلم الإماراتي","العلم الفرنسي"], 1, "حول العالم", 3],
["في أي مدينة يوجد مطار هيثرو؟", ["نيويورك","لندن","باريس","دبي"], 1, "حول العالم", 2],
["ما أكثر دولة سكانًا في العالم حاليًا؟", ["الصين","الهند","الولايات المتحدة","إندونيسيا"], 1, "حول العالم", 3],
["ما أكثر دولة منتجة للنفط في العالم من حيث الاحتياطي؟", ["السعودية","فنزويلا","روسيا","العراق"], 1, "حول العالم", 4],
["ما اسم أكبر جزيرة في البحر المتوسط؟", ["صقلية","سردينيا","قبرص","كريت"], 0, "حول العالم", 4],
["ما اسم أول دولة في العالم منحت النساء حق التصويت؟", ["بريطانيا","نيوزيلندا","أمريكا","السويد"], 1, "حول العالم", 4],
["ما اسم البلد الذي تقع فيه مدينة البتراء؟", ["الأردن","سوريا","لبنان","العراق"], 0, "حول العالم", 2],
["ما أكثر مدينة سكانًا في إفريقيا؟", ["القاهرة","لاغوس","كينشاسا","جوهانسبرغ"], 1, "حول العالم", 4],
["ما اسم المضيق الذي يفصل بين آسيا وأفريقيا؟", ["مضيق هرمز","مضيق باب المندب","مضيق جبل طارق","مضيق البوسفور"], 1, "حول العالم", 4],
["ما البلد الذي ينتمي إليه جبل طارق من حيث السيادة؟", ["إسبانيا","بريطانيا","المغرب","البرتغال"], 1, "حول العالم", 4],
["ما اسم أطول سور دفاعي في أوروبا في العصر الروماني؟", ["سور هادريان","سور برلين","سور الصين","سور ماجينو"], 0, "حول العالم", 4],
["ما العملة الرسمية لليابان؟", ["اليوان","الين","الوون","البات"], 1, "حول العالم", 3],
["ما عاصمة كازاخستان؟", ["ألماتي","أستانا (نور سلطان)","شيمكنت","أكتوبي"], 1, "حول العالم", 4],
["في أي دولة تقع مدينة اسطنبول؟", ["اليونان","تركيا","بلغاريا","سوريا"], 1, "حول العالم", 2],
["ما اسم الدولة التي لها أكبر عدد من الجيران؟", ["روسيا","الصين","البرازيل","ألمانيا"], 1, "حول العالم", 4],
["ما اسم المدينة المقدسة عند المسلمين والمسيحيين واليهود؟", ["مكة","القدس","المدينة","بيت لحم"], 1, "حول العالم", 2],
["ما اسم أكبر بحيرة في إفريقيا؟", ["بحيرة تشاد","بحيرة فيكتوريا","بحيرة تنجانيقا","بحيرة مالاوي"], 1, "حول العالم", 4],
["ما اسم البلد الذي يمتلك أكبر عدد من السدود المائية؟", ["الصين","الولايات المتحدة","البرازيل","مصر"], 0, "حول العالم", 4],
["ما اللون الذي يعني «قف» في إشارات المرور؟", ["الأخضر","الأصفر","الأحمر","الأزرق"], 2, "حياة يومية", 1],
["ما اللي بيتعمل من القمح؟", ["الزيت","الخبز","السكر","الشاي"], 1, "حياة يومية", 1],
["ما المشروب الأكثر شعبية في مصر بعد الشاي؟", ["القهوة","العصير","اللبن","الينسون"], 0, "حياة يومية", 1],
["ما المكون الأساسي للطعمية المصرية؟", ["العدس","الفول المدشوش","الحمص","القمح"], 1, "حياة يومية", 1],
["ما رقم الإسعاف في مصر؟", ["122","123","180","121"], 1, "حياة يومية", 2],
["ما رقم الشرطة في مصر؟", ["123","122","180","121"], 1, "حياة يومية", 2],
["أكلة الكشري فيها أساسًا؟", ["أرز وسمك","أرز وعدس ومكرونة","لحمة وبطاطس","دجاج وأرز"], 1, "حياة يومية", 1],
["ما الفاكهة الصيفية الشهيرة الحمراء من الداخل؟", ["البرتقال","البطيخ","التفاح","العنب"], 1, "حياة يومية", 1],
["ما الشيء الذي يستخدم لتنظيف الأسنان؟", ["المشط","الفرشاة والمعجون","الصابون","المنشفة"], 1, "حياة يومية", 1],
["ماذا تعني كلمة «أوضة» بالمصرية؟", ["مطبخ","غرفة","صالة","حمام"], 1, "حياة يومية", 1],
["ما ترتيب إشارات المرور من الأعلى للأسفل؟", ["أحمر، أصفر، أخضر","أخضر، أصفر، أحمر","أصفر، أحمر، أخضر","أحمر، أخضر، أصفر"], 0, "حياة يومية", 2],
["ما الفيتامين الموجود بكثرة في البرتقال؟", ["فيتامين A","فيتامين C","فيتامين D","فيتامين K"], 1, "حياة يومية", 2],
["كم مرة يُنصح بغسل الأسنان يوميًا؟", ["مرة","مرتين","أربع مرات","أسبوعيًا"], 1, "حياة يومية", 2],
["ما أفضل تصرف عند حدوث حريق بسيط في المنزل؟", ["فتح الغاز","فصل الكهرباء والاتصال بالمطافئ","الانتظار","فتح النوافذ فقط"], 1, "حياة يومية", 3],
["ما اللي بيستخدم لتحلية الشاي؟", ["الملح","السكر","الفلفل","الكمون"], 1, "حياة يومية", 2],
["ما اسم الوثيقة التي تثبت هوية الشخص في مصر؟", ["جواز السفر","بطاقة الرقم القومي","رخصة القيادة","شهادة الميلاد"], 1, "حياة يومية", 2],
["ما اسم الجهاز المستخدم لقياس درجة حرارة الجسم؟", ["البارومتر","الترمومتر","الجلوكومتر","الميلانومتر"], 1, "حياة يومية", 2],
["ما المادة التي تُستخدم لإشعال عود الثقاب؟", ["الفوسفور الأحمر","الحديد","الرصاص","الزنك"], 0, "حياة يومية", 3],
["ما اسم أول وجبة يتناولها الناس في رمضان؟", ["السحور","الفطور","الغداء","العشاء"], 1, "حياة يومية", 2],
["ما اسم الغاز المضاف للمياه الغازية لإعطائها الفقاعات؟", ["الأكسجين","ثاني أكسيد الكربون","النيتروجين","الهيدروجين"], 1, "حياة يومية", 3],
["ما المادة الكيميائية المستخدمة في مكافحة الحشرات بالمنازل؟", ["المبيدات الحشرية","الكلور","السكر","الملح"], 0, "حياة يومية", 2],
["كم لترًا يتسع جالون أمريكي واحد تقريبًا؟", ["3.8 لتر","5 لترات","2 لتر","10 لترات"], 0, "حياة يومية", 4],
["ما اسم الضريبة التي تُضاف على السلع في مصر وتبلغ 14%؟", ["ضريبة الدخل","ضريبة القيمة المضافة","الجمارك","ضريبة العقارات"], 1, "حياة يومية", 4],
["ما اسم اليوم العالمي للمرأة؟", ["8 مارس","1 مايو","21 مارس","1 يونيو"], 0, "حياة يومية", 3],
["ما اسم العيد الذي يحتفل به المصريون في 6 أكتوبر؟", ["عيد العمال","عيد القوات المسلحة","عيد الفطر","عيد الربيع"], 1, "حياة يومية", 2],
["ما اسم الجهاز الذي يقلّد صوت الطبيب عند فحص الصدر؟", ["السماعة الطبية","المنظار","الميزان","المجهر"], 0, "حياة يومية", 3],
["ما اسم أطول نهر في أوروبا؟", ["نهر الفولغا","نهر الدانوب","نهر الراين","نهر السين"], 0, "جغرافيا", 3],
["ما هي عاصمة النرويج؟", ["أوسلو","ستوكهولم","كوبنهاغن","هلسنكي"], 0, "جغرافيا", 3],
["ما هي عاصمة السويد؟", ["ستوكهولم","أوسلو","كوبنهاغن","هلسنكي"], 0, "جغرافيا", 3],
["ما هي عاصمة الدنمارك؟", ["كوبنهاغن","ستوكهولم","أوسلو","أمستردام"], 0, "جغرافيا", 3],
["ما هي عاصمة هولندا؟", ["أمستردام","بروكسل","كوبنهاغن","برلين"], 0, "جغرافيا", 3],
["ما هي عاصمة بلجيكا؟", ["بروكسل","أمستردام","لوكسمبورغ","باريس"], 0, "جغرافيا", 3],
["ما هي عاصمة سويسرا؟", ["برن","زيوريخ","جنيف","بازل"], 0, "جغرافيا", 4],
["ما هي عاصمة النمسا؟", ["فيينا","زيوريخ","براغ","بودابست"], 0, "جغرافيا", 3],
["ما هي عاصمة بولندا؟", ["وارسو","براغ","فيينا","بودابست"], 0, "جغرافيا", 3],
["ما هي عاصمة المجر؟", ["بودابست","وارسو","براغ","بوخارست"], 0, "جغرافيا", 4],
["في أي مدينة يونانية يوجد الأكروبول الشهير؟", ["أثينا","سالونيك","باتراس","هيراكليون"], 0, "جغرافيا", 2],
["ما هي عاصمة الصين؟", ["بكين","شنغهاي","هونغ كونغ","غوانغجو"], 0, "جغرافيا", 2],
["ما هي عاصمة كوريا الجنوبية؟", ["سول","بوسان","طوكيو","بكين"], 0, "جغرافيا", 2],
["ما هي عاصمة الهند؟", ["نيودلهي","مومباي","كلكتا","بنغالور"], 0, "جغرافيا", 2],
["ما هي عاصمة باكستان؟", ["إسلام آباد","كراتشي","لاهور","بيشاور"], 0, "جغرافيا", 3],
["ما هي أكبر مدينة في إندونيسيا؟", ["جاكرتا","بالي","سورابايا","باندونغ"], 0, "جغرافيا", 3],
["ما هي عاصمة ماليزيا؟", ["كوالالمبور","سنغافورة","بانكوك","جاكرتا"], 0, "جغرافيا", 3],
["ما هي عاصمة تايلاند؟", ["بانكوك","كوالالمبور","هانوي","مانيلا"], 0, "جغرافيا", 3],
["ما هي عاصمة فيتنام؟", ["هانوي","هو تشي منه","بانكوك","بنوم بنه"], 0, "جغرافيا", 4],
["ما هي عاصمة الفلبين؟", ["مانيلا","جاكرتا","بانكوك","كوالالمبور"], 0, "جغرافيا", 3],
["ما هي عاصمة المكسيك؟", ["مكسيكو سيتي","غوادالاخارا","مونتيري","كانكون"], 0, "جغرافيا", 2],
["ما هي عاصمة كوبا؟", ["هافانا","سانتياغو","كاماغوي","ميامي"], 0, "جغرافيا", 3],
["ما هي عاصمة تشيلي؟", ["سانتياغو","ليما","بوينس آيرس","بوغوتا"], 0, "جغرافيا", 3],
["ما هي عاصمة بيرو؟", ["ليما","سانتياغو","بوغوتا","كيتو"], 0, "جغرافيا", 3],
["ما هي عاصمة كولومبيا؟", ["بوغوتا","ليما","كاراكاس","كيتو"], 0, "جغرافيا", 4],
["ما هي عاصمة فنزويلا؟", ["كاراكاس","بوغوتا","ليما","كيتو"], 0, "جغرافيا", 4],
["ما هي عاصمة مصر القديمة التي بناها عمرو بن العاص؟", ["الفسطاط","الإسكندرية","منف","طيبة"], 0, "تاريخ", 4],
["ما هي عاصمة مصر في عهد الفاطميين التي أسسها جوهر الصقلي؟", ["القاهرة","الفسطاط","الإسكندرية","القطائع"], 0, "تاريخ", 4],
["ما هي عاصمة الإمبراطورية البيزنطية؟", ["القسطنطينية","روما","أثينا","الإسكندرية"], 0, "تاريخ", 3],
["ما هي عاصمة الأمويين؟", ["دمشق","بغداد","الكوفة","مكة"], 0, "تاريخ", 2],
["ما هي عاصمة العباسيين؟", ["بغداد","دمشق","القاهرة","سامراء"], 0, "تاريخ", 2],
["ما هي عاصمة الدولة الفاطمية في المغرب قبل القاهرة؟", ["المهدية","القيروان","فاس","مراكش"], 0, "تاريخ", 4],
["ما هي عاصمة الأندلس في عهد الأمويين؟", ["قرطبة","غرناطة","إشبيلية","طليطلة"], 0, "تاريخ", 4],
["أي مدينة تُلقّب بـ«عروس النيل»؟", ["القاهرة","أسوان","الإسكندرية","المنيا"], 0, "جغرافيا", 2],
["أي مدينة تُلقّب بـ«عروس البحر المتوسط»؟", ["الإسكندرية","بورسعيد","دمياط","الغردقة"], 0, "جغرافيا", 2],
["أي مدينة مصرية تشتهر بمتحفها الفرعوني الجديد؟", ["الجيزة","أسوان","الأقصر","الإسماعيلية"], 0, "جغرافيا", 2],
["أي مدينة مصرية تُعرف بـ«مدينة الألف مئذنة»؟", ["القاهرة","الإسكندرية","أسيوط","طنطا"], 0, "جغرافيا", 4],
["في أي محافظة مصرية يوجد معبد أبو سمبل؟", ["أسوان","الأقصر","قنا","سوهاج"], 0, "جغرافيا", 3],
["في أي محافظة مصرية توجد وادي الملوك؟", ["الأقصر","أسوان","قنا","المنيا"], 0, "جغرافيا", 3],
["في أي مدينة مصرية يوجد جامع الأزهر؟", ["القاهرة","الإسكندرية","طنطا","المنصورة"], 0, "جغرافيا", 2],
["في أي مدينة مصرية يوجد قصر المنتزه؟", ["الإسكندرية","بورسعيد","السويس","دمياط"], 0, "جغرافيا", 3],
["ما اسم النهر الذي يمر في دمشق؟", ["بردى","الليطاني","الأردن","العاصي"], 0, "جغرافيا", 4],
["ما اسم النهر الذي يمر في بغداد؟", ["دجلة","الفرات","شط العرب","الكارون"], 0, "جغرافيا", 3],
["ما اسم النهر الذي يمر في القاهرة؟", ["النيل","الفرات","دجلة","الأردن"], 0, "جغرافيا", 1],
["ما اسم البحر الذي يطل عليه لبنان؟", ["البحر المتوسط","البحر الأحمر","البحر الأسود","بحر قزوين"], 0, "جغرافيا", 2],
["ما اسم الدولة التي تطل على البحر الأحمر وخليج عدن؟", ["اليمن","عمان","السعودية","مصر"], 0, "جغرافيا", 3],
["ما اسم أصغر دول الخليج مساحة؟", ["البحرين","قطر","الكويت","عمان"], 0, "جغرافيا", 3],
["ما اسم أكبر دولة في الخليج مساحة؟", ["السعودية","عمان","اليمن","الإمارات"], 0, "جغرافيا", 2],
["ما اسم العاصمة التي توجد بها الكعبة؟", ["مكة المكرمة","المدينة المنورة","الرياض","الطائف"], 0, "جغرافيا", 1],
["ما اسم المدينة التي هاجر إليها النبي ﷺ؟", ["المدينة المنورة","الطائف","خيبر","مكة"], 0, "دين", 1],
["ما اسم المسجد الذي أسسه النبي ﷺ عند وصوله للمدينة؟", ["مسجد قباء","المسجد النبوي","المسجد الأقصى","مسجد القبلتين"], 0, "دين", 3],
["ما اسم المدينة التي فيها المسجد الأقصى؟", ["القدس","دمشق","عمان","غزة"], 0, "جغرافيا", 2],
["ما اسم الدولة التي تقع فيها مدينة إستانبول الأوروبية والآسيوية؟", ["تركيا","اليونان","بلغاريا","جورجيا"], 0, "جغرافيا", 2],
["ما اسم المضيق الذي يقسم إستانبول؟", ["البوسفور","الدردنيل","جبل طارق","هرمز"], 0, "جغرافيا", 4],
["ما اسم الدولة التي تشتهر بمدينة البتراء الوردية؟", ["الأردن","لبنان","سوريا","مصر"], 0, "جغرافيا", 2],
["ما اسم البحر الذي يفصل إفريقيا عن أوروبا؟", ["البحر المتوسط","البحر الأحمر","البحر الأسود","البحر العربي"], 0, "جغرافيا", 1],
["ما اسم القارة التي يوجد بها أكبر عدد من الدول العربية؟", ["إفريقيا","آسيا","أوروبا","أمريكا الجنوبية"], 0, "جغرافيا", 3],
["ما اسم أكبر بحيرة صناعية في مصر؟", ["بحيرة ناصر","بحيرة قارون","المنزلة","البردويل"], 0, "جغرافيا", 3],
["ما اسم أعمق بحيرة في العالم؟", ["بايكال","فيكتوريا","سوبيريور","تنجانيقا"], 0, "جغرافيا", 4],
["أي جزيرة يمنية تشتهر بمزارع اللبان؟", ["سقطرى","مصيرة","فرسان","دلمون"], 0, "جغرافيا", 4],
["ما عدد الدول التي يتكون منها الاتحاد الأوروبي بعد خروج بريطانيا؟", ["27","28","30","25"], 0, "حول العالم", 4],
["ما هي العملة الرسمية في السعودية؟", ["الريال","الدينار","الدرهم","الجنيه"], 0, "حول العالم", 1],
["ما هي العملة الرسمية في الكويت؟", ["الدينار","الريال","الدرهم","الجنيه"], 0, "حول العالم", 2],
["ما هي العملة الرسمية في مصر؟", ["الجنيه المصري","الدينار","الريال","الدرهم"], 0, "حول العالم", 1],
["ما هي العملة الرسمية في الإمارات؟", ["الدرهم","الريال","الدينار","الجنيه"], 0, "حول العالم", 2],
["ما هي العملة الرسمية في تركيا؟", ["الليرة التركية","اليورو","الدولار","الدرهم"], 0, "حول العالم", 3],
["ما هي العملة الرسمية في روسيا؟", ["الروبل","اليورو","اليوان","الليرة"], 0, "حول العالم", 3],
["ما هي العملة الرسمية في الصين؟", ["اليوان","الين","الوون","الروبل"], 0, "حول العالم", 3],
["ما هي العملة الرسمية في بريطانيا؟", ["الجنيه الإسترليني","اليورو","الدولار","الفرنك"], 0, "حول العالم", 2],
["ما هي أطول سورة مدنية في القرآن الكريم؟", ["سورة البقرة","سورة آل عمران","سورة النساء","سورة المائدة"], 0, "دين", 4],
["ما عدد السور التي تبدأ بـ«الم»؟", ["6","4","5","7"], 0, "دين", 4],
["ما اسم السورة التي ذُكر فيها الذباب في مثل؟", ["سورة الحج","سورة البقرة","سورة النحل","سورة العنكبوت"], 0, "دين", 4],
["في أي سورة ورد وصف الجنة بـ«تجري من تحتها الأنهار» أول مرة؟", ["سورة البقرة","سورة الكهف","سورة الرحمن","سورة الواقعة"], 0, "دين", 4],
["ما اسم السورة التي تُسمّى «الفاضحة»؟", ["سورة التوبة","سورة النور","سورة الأحزاب","سورة المنافقون"], 0, "دين", 4],
["ما اسم السورة التي نزلت في صلح الحديبية؟", ["سورة الفتح","سورة النصر","سورة الأنفال","سورة التوبة"], 0, "دين", 3],
["كم عدد ركعات صلاة الفجر؟", ["2","3","4","5"], 0, "دين", 1],
["كم عدد ركعات صلاة العشاء؟", ["4","3","2","5"], 0, "دين", 1],
["كم عدد ركعات صلاة الظهر؟", ["4","2","3","5"], 0, "دين", 1],
["كم عدد التكبيرات في صلاة الجنازة؟", ["4","3","5","2"], 0, "دين", 3],
["في أي شهر هجري تُؤدى مناسك الحج؟", ["ذو الحجة","ذو القعدة","رمضان","محرم"], 0, "دين", 2],
["ما اسم اليوم الذي يقف فيه الحجاج على عرفة؟", ["9 ذو الحجة","10 ذو الحجة","1 محرم","27 رمضان"], 0, "دين", 3],
["ما اسم عيد المسلمين الذي يأتي بعد رمضان؟", ["عيد الفطر","عيد الأضحى","المولد النبوي","يوم عرفة"], 0, "دين", 1],
["كم عدد أشواط الطواف حول الكعبة؟", ["7","5","3","9"], 0, "دين", 2],
["كم عدد أشواط السعي بين الصفا والمروة؟", ["7","5","3","9"], 0, "دين", 2],
["في أي سنة هجرية كان فتح مكة؟", ["السنة الثامنة","السنة السادسة","السنة العاشرة","السنة الخامسة"], 0, "دين", 4],
["كم كان عمر النبي ﷺ عند البعثة؟", ["40","35","45","50"], 0, "دين", 3],
["من هي أول زوجة للنبي ﷺ؟", ["خديجة بنت خويلد","عائشة بنت أبي بكر","حفصة بنت عمر","أم سلمة"], 0, "دين", 1],
["من هو الصحابي الذي ذكر اسمه صريحًا في القرآن؟", ["زيد بن حارثة","أبو بكر","عمر","علي"], 0, "دين", 4],
["من أول من أسلم من الرجال؟", ["أبو بكر الصديق","علي بن أبي طالب","عمر بن الخطاب","عثمان بن عفان"], 0, "دين", 3],
["من أول من أسلم من الصبيان؟", ["علي بن أبي طالب","أبو بكر","زيد بن حارثة","عمر"], 0, "دين", 4],
["من أول من أسلم من النساء؟", ["خديجة","عائشة","فاطمة","سمية"], 0, "دين", 3],
["ما اسم أول شهيد في الإسلام؟", ["سمية بنت خياط","بلال بن رباح","ياسر بن عامر","حمزة"], 0, "دين", 4],
["ما اسم الصحابي الذي كان يؤذن في عهد النبي ﷺ؟", ["بلال بن رباح","زيد بن ثابت","أبو ذر","عمار بن ياسر"], 0, "دين", 2],
["ما اسم غزوة سميت أيضًا «غزوة العسرة»؟", ["تبوك","بدر","أحد","الخندق"], 0, "دين", 4],
["في أي غزوة شُجّ النبي ﷺ في رأسه وكُسرت رباعيته؟", ["أحد","بدر","حنين","خيبر"], 0, "دين", 3],
["كم عدد المسلمين في غزوة بدر تقريبًا؟", ["313","1000","700","1500"], 0, "دين", 3],
["كم عدد المشركين في غزوة بدر تقريبًا؟", ["1000","313","500","3000"], 0, "دين", 4],
["ما اسم الخليفة الذي وضع التأريخ الهجري؟", ["عمر بن الخطاب","أبو بكر","عثمان","علي"], 0, "دين", 4],
["من هو الصحابي الملقب بـ«ذو النورين»؟", ["عثمان بن عفان","علي بن أبي طالب","أبو بكر","عمر"], 0, "دين", 3],
["كم سنة حكم أبو بكر الصديق؟", ["سنتان","5 سنوات","10 سنوات","سنة واحدة"], 0, "دين", 3],
["من هو الخليفة الذي قُتل في بيته وهو يقرأ القرآن؟", ["عثمان بن عفان","عمر بن الخطاب","علي بن أبي طالب","أبو بكر"], 0, "دين", 3],
["ما اسم أول غزوة في الإسلام؟", ["غزوة بدر","غزوة أحد","غزوة الخندق","غزوة خيبر"], 0, "دين", 2],
["ما اسم السورة التي تُسمّى بـ«بني إسرائيل»؟", ["سورة الإسراء","سورة الكهف","سورة النمل","سورة يونس"], 0, "دين", 4],
["ما اسم الملك الذي يوحى إلى الأنبياء؟", ["جبريل","ميكائيل","إسرافيل","عزرائيل"], 0, "دين", 1],
["ما اسم الملك الموكَّل بالمطر؟", ["ميكائيل","جبريل","إسرافيل","مالك"], 0, "دين", 3],
["ما اسم الملك الموكَّل بالنفخ في الصور؟", ["إسرافيل","جبريل","ميكائيل","رضوان"], 0, "دين", 3],
["ما اسم كتاب المسيحيين المقدس؟", ["الإنجيل","التوراة","الزبور","القرآن"], 0, "دين", 2],
["ما اسم الكتاب الذي أُنزل على موسى؟", ["التوراة","الإنجيل","الزبور","القرآن"], 0, "دين", 2],
["ما اسم الكتاب الذي أُنزل على داود؟", ["الزبور","التوراة","الإنجيل","القرآن"], 0, "دين", 3],
["من هو أبو الأنبياء؟", ["إبراهيم عليه السلام","نوح","آدم","موسى"], 0, "دين", 3],
["من هو أول الأنبياء؟", ["آدم عليه السلام","نوح","إبراهيم","إدريس"], 0, "دين", 2],
["من النبي الذي بنى السفينة؟", ["نوح عليه السلام","موسى","هود","صالح"], 0, "دين", 1],
["من النبي الذي ألقاه الله في النار فكانت بردًا وسلامًا؟", ["إبراهيم عليه السلام","موسى","يوسف","يونس"], 0, "دين", 2],
["من النبي الذي ابتلعه الحوت؟", ["يونس عليه السلام","موسى","يوسف","أيوب"], 0, "دين", 2],
["من النبي الذي ابتُلي بالمرض سنوات طويلة؟", ["أيوب عليه السلام","يونس","يعقوب","زكريا"], 0, "دين", 3],
["من النبي الذي أُعطي ملكًا وسخرت له الريح؟", ["سليمان عليه السلام","داود","موسى","يوسف"], 0, "دين", 3],
["من النبي الذي كان يفهم لغة الطير؟", ["سليمان عليه السلام","داود","يوسف","عيسى"], 0, "دين", 2],
["من النبي الذي أُنجي من الجب وأصبح عزيزًا في مصر؟", ["يوسف عليه السلام","يونس","موسى","هارون"], 0, "دين", 2],
["من النبي الذي شُفي من مرضه بعد صبر طويل وأُعيد إليه أهله؟", ["أيوب عليه السلام","يوسف","يونس","زكريا"], 0, "دين", 3],
["كم عدد السور التي ذُكرت فيها قصة موسى؟", ["أكثر من 20 سورة","سورة واحدة","خمس سور","عشر سور"], 0, "دين", 4],
["ما وحدة قياس درجة الحرارة في النظام الدولي؟", ["الكلفن","السيلزيوس","الفهرنهايت","الرينيوم"], 0, "علوم", 3],
["كم عدد أضلاع الشكل السداسي؟", ["6","5","7","8"], 0, "علوم", 1],
["كم عدد أضلاع المثلث؟", ["3","4","5","6"], 0, "علوم", 1],
["ما مجموع زوايا المثلث؟", ["180 درجة","90 درجة","360 درجة","270 درجة"], 0, "علوم", 2],
["ما مجموع زوايا المربع؟", ["360 درجة","180 درجة","270 درجة","540 درجة"], 0, "علوم", 2],
["كم عدد أضلاع الشكل الثماني؟", ["8","6","10","12"], 0, "علوم", 1],
["ما اسم الرقم الذي لا يقبل القسمة إلا على نفسه وواحد؟", ["العدد الأولي","العدد الزوجي","العدد الكسري","العدد السالب"], 0, "علوم", 2],
["كم عدد الأصابع في يد الإنسان؟", ["5","4","6","10"], 0, "علوم", 1],
["كم عدد أسنان الشخص البالغ؟", ["32","28","24","36"], 0, "علوم", 3],
["ما أكثر عنصر كيميائي وفرة في القشرة الأرضية؟", ["الأكسجين","الحديد","السيليكون","الألومنيوم"], 0, "علوم", 4],
["ما أكثر معدن وفرة في القشرة الأرضية من حيث الوزن؟", ["الألومنيوم","الحديد","النحاس","الذهب"], 0, "علوم", 4],
["ما اسم الحالة الثالثة للمادة إلى جانب الصلب والسائل؟", ["الغاز","البلازما","البلوري","الغرواني"], 0, "علوم", 4],
["ما اسم أسرع حيوان بري؟", ["الفهد","الأسد","الحصان","الغزال"], 0, "علوم", 2],
["ما اسم أكبر طائر في العالم؟", ["النعامة","النسر","البطريق","الإيمو"], 0, "علوم", 2],
["ما اسم الطائر الذي لا يطير ويعيش في القطب؟", ["البطريق","النعامة","الطاووس","البجع"], 0, "علوم", 2],
["ما اسم الحشرة التي تنتج العسل؟", ["النحلة","الفراشة","الدبور","الجرادة"], 0, "علوم", 1],
["كم عدد قلوب الأخطبوط؟", ["3","1","2","4"], 0, "علوم", 4],
["ما اسم أكبر حيوان بري؟", ["الفيل الإفريقي","الزرافة","وحيد القرن","فرس النهر"], 0, "علوم", 2],
["ما اسم أطول حيوان في العالم؟", ["الزرافة","الفيل","الجمل","الحصان"], 0, "علوم", 1],
["ما اسم الحيوان الذي يُعرف بسنام على ظهره؟", ["الجمل","الحصان","الثور","الحمار"], 0, "علوم", 1],
["ما اسم أسرع طائر في العالم عند الانقضاض؟", ["الشاهين","النسر","السنونو","الغراب"], 0, "علوم", 4],
["ما اسم أكبر سمكة في العالم؟", ["القرش الحوتي","القرش الأبيض","الحوت الأزرق","سمكة الشمس"], 0, "علوم", 4],
["ما اسم الحيوان الثديي الذي يطير؟", ["الخفاش","السنجاب الطائر","البومة","الطاووس"], 0, "علوم", 2],
["كم عدد أرجل العنكبوت؟", ["8","6","10","4"], 0, "علوم", 2],
["كم عدد أرجل الحشرات؟", ["6","8","4","10"], 0, "علوم", 2],
["ما اسم العملية التي يصنع بها النبات غذاءه؟", ["البناء الضوئي","التنفس","النتح","الهضم"], 0, "علوم", 2],
["ما الغاز الذي يمتصه النبات من الهواء؟", ["ثاني أكسيد الكربون","الأكسجين","النيتروجين","الهيدروجين"], 0, "علوم", 2],
["ما اسم الجزء الذي يمتص الماء من النبات؟", ["الجذر","الساق","الورقة","الزهرة"], 0, "علوم", 1],
["ما اسم أكبر صحراء في العالم من حيث المساحة (غير القطبية)؟", ["الصحراء الكبرى","الربع الخالي","غوبي","كالاهاري"], 0, "علوم", 4],
["ما اسم الجهاز الذي يضخ الدم في الجسم؟", ["القلب","المعدة","الكبد","الرئة"], 0, "علوم", 1],
["ما اسم العضو الذي يفرز الأنسولين؟", ["البنكرياس","الكبد","الكلية","المعدة"], 0, "علوم", 4],
["ما اسم المرض الذي ينتج عن نقص الأنسولين؟", ["السكري","الأنيميا","الكساح","الزكام"], 0, "علوم", 3],
["ما اسم الفيتامين الذي يمنع مرض الأسقربوط؟", ["فيتامين سي","فيتامين د","فيتامين أ","فيتامين ب"], 0, "علوم", 4],
["ما اسم الفيتامين الذي يمنع العشى الليلي؟", ["فيتامين أ","فيتامين سي","فيتامين د","فيتامين ك"], 0, "علوم", 4],
["ما اسم العنصر الذي يعطي الدم لونه الأحمر؟", ["الحديد","النحاس","الزنك","الكالسيوم"], 0, "علوم", 3],
["كم لترًا من الدم في جسم الإنسان البالغ تقريبًا؟", ["5 لترات","2 لتر","10 لترات","8 لترات"], 0, "علوم", 3],
["ما اسم المادة التي تجعل العظام صلبة؟", ["الكالسيوم","الحديد","الصوديوم","البوتاسيوم"], 0, "علوم", 3],
["ما اسم الجهاز المسؤول عن التخلص من فضلات الجسم عبر البول؟", ["الكلية","الكبد","الرئة","الجلد"], 0, "علوم", 3],
["ما اسم العالم الذي وضع قانون الطفو؟", ["أرخميدس","نيوتن","غاليليو","أينشتاين"], 0, "علوم", 4],
["ما اسم العالم الذي اكتشف الجاذبية بعد سقوط تفاحة؟", ["نيوتن","أينشتاين","غاليليو","كبلر"], 0, "علوم", 2],
["ما اسم أول إنسان صعد للفضاء؟", ["يوري غاغارين","نيل أرمسترونج","جون جلين","ألان شيبرد"], 0, "علوم", 4],
["ما اسم أول رائدة فضاء في العالم؟", ["فالنتينا تيريشكوفا","سالي رايد","ماي جيمسون","كريستا مكوليف"], 0, "علوم", 4],
["ما اسم المركبة التي هبطت على القمر عام 1969؟", ["أبولو 11","أبولو 13","فوستوك 1","مير"], 0, "علوم", 3],
["ما اسم التلسكوب الفضائي الذي أُطلق عام 1990؟", ["هابل","جيمس ويب","كبلر","سبيتزر"], 0, "علوم", 4],
["ما اسم الكوكب الذي له حلقات شهيرة؟", ["زحل","المشتري","أورانوس","نبتون"], 0, "علوم", 2],
["ما اسم الكوكب الأبعد عن الشمس؟", ["نبتون","أورانوس","زحل","المشتري"], 0, "علوم", 3],
["ما اسم الكوكب الذي يمتلك أكبر قمر في المجموعة الشمسية؟", ["المشتري","زحل","نبتون","أورانوس"], 0, "علوم", 4],
["ما اسم أكبر قمر لكوكب المشتري؟", ["غانيميد","تيتان","القمر","أوروبا"], 0, "علوم", 4],
["ما اسم الكوكب الذي يُعرف بتوأم الأرض؟", ["الزهرة","المريخ","عطارد","نبتون"], 0, "علوم", 4],
["كم يستغرق ضوء الشمس للوصول إلى الأرض تقريبًا؟", ["8 دقائق","1 دقيقة","30 دقيقة","ساعة"], 0, "علوم", 4],
["ما اسم العلم الذي يدرس الزلازل؟", ["علم الزلازل","الجيولوجيا","الأرصاد","الجغرافيا"], 0, "علوم", 4],
["ما اسم الجهاز الذي يقيس الزلازل؟", ["السيزموغراف","البارومتر","الترمومتر","الهيجرومتر"], 0, "علوم", 4],
["ما اسم حاسة يرتبط بها الأنف؟", ["الشم","التذوق","السمع","البصر"], 0, "علوم", 1],
["ما اسم العضو الذي يتحكم في جميع أجهزة الجسم؟", ["المخ","القلب","الكبد","المعدة"], 0, "علوم", 1],
["من هو صاحب قصيدة «ولا تسل عن ديار الحي أين مضت»؟", ["أبو تمام","المتنبي","البحتري","الشريف الرضي"], 0, "أدب", 4],
["من صاحب «معلقة» مطلعها «عفت الديار محلها فمقامها»؟", ["زهير بن أبي سلمى","امرؤ القيس","طرفة","لبيد"], 0, "أدب", 4],
["من هو الشاعر الذي يُقال إنه أشعر أهل الجاهلية في الوصف؟", ["امرؤ القيس","عنترة","النابغة","زهير"], 0, "أدب", 4],
["من هو الشاعر الذي حكّم في سوق عكاظ وأُعليت له قبة؟", ["النابغة الذبياني","امرؤ القيس","طرفة","الأعشى"], 0, "أدب", 4],
["من صاحب قصيدة «إذا غامرت في شرف مروم»؟", ["المتنبي","أبو تمام","البحتري","ابن زيدون"], 0, "أدب", 3],
["من صاحب رسالة «الرسالة الحميرية»؟", ["الجاحظ","ابن المقفع","التوحيدي","أبو حيان"], 0, "أدب", 4],
["من مؤلف كتاب «الحيوان»؟", ["الجاحظ","ابن قتيبة","الأصمعي","الدامغي"], 0, "أدب", 4],
["من مؤلف كتاب «البيان والتبيين»؟", ["الجاحظ","ابن جني","سيبويه","الخليل"], 0, "أدب", 4],
["من واضع علم العروض؟", ["الخليل بن أحمد الفراهيدي","سيبويه","ابن جني","أبو الأسود الدؤلي"], 0, "أدب", 4],
["من واضع علم النحو الأول؟", ["أبو الأسود الدؤلي","سيبويه","الخليل","الكسائي"], 0, "أدب", 4],
["ما اسم عدد التفعيلات في بحر الطويل؟", ["أربع تفعيلات","ثلاث تفعيلات","خمس تفعيلات","ست تفعيلات"], 0, "أدب", 4],
["كم عدد بحور الشعر العربي في علم العروض؟", ["16","12","20","10"], 0, "أدب", 3],
["ما اسم الشاعر الملقب بـ«شاعر الرسول»؟", ["حسان بن ثابت","كعب بن زهير","عبد الله بن رواحة","كعب بن مالك"], 0, "أدب", 2],
["من صاحب قصيدة «بانت سعاد»؟", ["كعب بن زهير","حسان بن ثابت","جرير","الفرزدق"], 0, "أدب", 3],
["من الشاعر الملقب بـ«أبي نواس» وشهرته في وصف الخمر والحكمة؟", ["أبو نواس","أبو العتاهية","بشار بن برد","المتنبي"], 0, "أدب", 2],
["من الشاعر العباسي الملقب بـ«المتنبي» واسمه أحمد بن الحسين؟", ["المتنبي","البحتري","أبو تمام","ابن الرومي"], 0, "أدب", 3],
["من الشاعر الأندلسي صاحب قصيدة «لما تذكرت بالمجتبى»؟", ["ابن زيدون","لسان الدين بن الخطيب","ابن عبد ربه","المعتمد بن عباد"], 0, "أدب", 4],
["من مؤلف كتاب «طوق الحمامة»؟", ["ابن حزم الأندلسي","ابن رشد","ابن خلدون","ابن حيان"], 0, "أدب", 4],
["من صاحب «ألف ليلة وليلة» أول من ترجمها للفرنسية؟", ["أنطوان غالان","لويس شيخو","رفاعة الطهطاوي","جبران"], 0, "أدب", 4],
["من مؤلف رواية «زينب» أول رواية مصرية؟", ["محمد حسين هيكل","طه حسين","نجيب محفوظ","المازني"], 0, "أدب", 4],
["من مؤلف رواية «عودة الروح»؟", ["توفيق الحكيم","نجيب محفوظ","محمد حسين هيكل","يوسف السباعي"], 0, "أدب", 4],
["من مؤلف رواية «الحرافيش» و«أولاد حارتنا»؟", ["نجيب محفوظ","يوسف إدريس","توفيق الحكيم","عبد الرحمن الشرقاوي"], 0, "أدب", 2],
["من مؤلف «مجنون ليلى» أوبريت «مجنون ليلى»؟", ["أحمد شوقي","عزيز أباظة","بيرم التونسي","صلاح جاهين"], 0, "أدب", 4],
["من صاحب مسرحية «السلطان الحائر»؟", ["توفيق الحكيم","صلاح عبد الصبور","سعد الله ونوس","نجيب سرور"], 0, "أدب", 4],
["من صاحب قصيدة «أغنية للبائع المتجول»؟", ["فؤاد حداد","صلاح جاهين","أحمد فؤاد نجم","أمل دنقل"], 0, "أدب", 4],
["من مؤلف «العصفور الأزرق» في الطفولة؟", ["طه حسين","توفيق الحكيم","عبد التواب يوسف","كامل كيلاني"], 0, "أدب", 4],
["من مؤلف «قصص الأنبياء» المشهورة للشباب؟", ["كامل كيلاني","أحمد شوقي","حافظ إبراهيم","عبد الله بن المقفع"], 0, "أدب", 4],
["ما اسم الكتاب الذي يجمع قصائد شوقي؟", ["الشوقيات","ديوان حافظ","الأيام","حديث عيسى بن هشام"], 0, "أدب", 3],
["ما اسم الكتاب الذي يجمع قصائد حافظ إبراهيم؟", ["ديوان حافظ","الشوقيات","مقامات الحريري","الأيام"], 0, "أدب", 3],
["من مؤلف «قصة حياة» أو «أنا» لسيرة العقاد؟", ["عباس محمود العقاد","طه حسين","المازني","أحمد أمين"], 0, "أدب", 4],
["من مؤلف «فجر الإسلام» و«ضحى الإسلام»؟", ["أحمد أمين","العقاد","طه حسين","المازني"], 0, "أدب", 4],
["من مؤلف «في الشعر الجاهلي» مما أثار معركة أدبية؟", ["طه حسين","العقاد","المازني","شكري"], 0, "أدب", 4],
["من هي الأديبة اللبنانية صاحبة «أوراق الورد»؟", ["مي زيادة","غادة السمان","أحلام مستغانمي","عائشة تيمور"], 0, "أدب", 4],
["من مؤلف رواية «ذاكرة الجسد» الجزائرية؟", ["أحلام مستغانمي","غادة السمان","حنان الشيخ","سحر خليفة"], 0, "أدب", 3],
["من مؤلف «موسم الهجرة إلى الشمال»؟", ["الطيب صالح","غسان كنفاني","إميل حبيبي","جبرا"], 0, "أدب", 4],
["من صاحب قصيدة «على هذه الأرض ما يستحق الحياة»؟", ["محمود درويش","سميح القاسم","نزار قباني","أدونيس"], 0, "أدب", 3],
["من الشاعر السوري صاحب «قصائد حب» وقصيدة «أحبيني»؟", ["نزار قباني","أدونيس","ممدوح عدوان","بدر شاكر السياب"], 0, "أدب", 2],
["من رائد الشعر الحر العراقي صاحب «أنشودة المطر»؟", ["بدر شاكر السياب","نازك الملائكة","الجواهري","السياب وأدونيس"], 0, "أدب", 2],
["من رائدة الشعر الحر مع السياب؟", ["نازك الملائكة","غادة السمان","فدوى طوقان","عائشة التيمورية"], 0, "أدب", 4],
["من الشاعرة الفلسطينية صاحبة «أخي لن تغيب عني»؟", ["فدوى طوقان","محمود درويش","سميح القاسم","ليلى عثمان"], 0, "أدب", 4],
["من مؤلف «النبي» بالإنجليزية؟", ["جبران خليل جبران","ميخائيل نعيمة","إيليا أبو ماضي","أمين الريحاني"], 0, "أدب", 3],
["من صاحب كتاب «الغربان» والشاعر المعاصر؟", ["أحمد عبد المعطي حجازي","أدونيس","أمل دنقل","فاروق شوشة"], 0, "أدب", 4],
["من مؤلف «الأرض» الرواية المصرية؟", ["عبد الرحمن الشرقاوي","نجيب محفوظ","يوسف إدريس","خيري شلبي"], 0, "أدب", 4],
["من مؤلف رواية «اللص والكلاب»؟", ["نجيب محفوظ","يوسف إدريس","فتحي غانم","توفيق الحكيم"], 0, "أدب", 2],
["من مؤلف «أنا حرة» و«لا أنام»؟", ["إحسان عبد القدوس","يوسف السباعي","نجيب محفوظ","فتحي غانم"], 0, "أدب", 3],
["من مؤلف رواية «الطريق»؟", ["نجيب محفوظ","توفيق الحكيم","عبد الحكيم قاسم","يوسف القعيد"], 0, "أدب", 3],
["من مؤلف «عمارة يعقوبيان»؟", ["علاء الأسواني","أحمد مراد","نجيب محفوظ","بهاء طاهر"], 0, "أدب", 3],
["من مؤلف رواية «يوتوبيا»؟", ["أحمد خالد توفيق","أحمد مراد","علاء الأسواني","محمد صادق"], 0, "أدب", 4],
["من مؤلف سلسلة «ما وراء الطبيعة»؟", ["أحمد خالد توفيق","نبيل فاروق","أحمد مراد","جورج حنين"], 0, "أدب", 3],
["من مؤلف سلسلة «رجل المستحيل»؟", ["نبيل فاروق","أحمد خالد توفيق","محمد صادق","محمود سالم"], 0, "أدب", 3],
["من صاحب «أرني الله» و«ملائكة وشياطين»؟", ["يوسف زيدان","بهاء طاهر","علاء الأسواني","محمد حسنين هيكل"], 0, "أدب", 4],
["من مؤلف رواية «عزازيل»؟", ["يوسف زيدان","بهاء طاهر","إبراهيم عيسى","أحمد خالد توفيق"], 0, "أدب", 3],
["من مؤلف رواية «واحة الغروب»؟", ["بهاء طاهر","يوسف زيدان","خيري شلبي","إبراهيم عبد المجيد"], 0, "أدب", 4],
["من مؤلف رواية «ذات»؟", ["صنع الله إبراهيم","بهاء طاهر","علاء الأسواني","إبراهيم عبد المجيد"], 0, "أدب", 4],
["من مؤلف «الحب في المنفى»؟", ["بهاء طاهر","صنع الله إبراهيم","إبراهيم عبد المجيد","يوسف زيدان"], 0, "أدب", 4],
["من مؤلف رواية «شيكاغو»؟", ["علاء الأسواني","أحمد مراد","بهاء طاهر","صنع الله إبراهيم"], 0, "أدب", 4],
["من مؤلف «الأسود يليق بك»؟", ["أحلام مستغانمي","غادة السمان","حنان الشيخ","رضوى عاشور"], 0, "أدب", 4],
["من مؤلف «ذاكرة الجسد» و«نسيان»؟", ["أحلام مستغانمي","حنان الشيخ","سحر خليفة","مي زيادة"], 0, "أدب", 3],
["من مؤلف رواية «فرانكشتاين في بغداد»؟", ["أحمد سعداوي","سنع الله إبراهيم","أحمد مراد","علي بدر"], 0, "أدب", 4],
["من الشاعر الهندي صاحب «غيتانجالي»؟", ["طاغور","إقبال","جبران","حافظ"], 0, "أدب", 4],
["من صاحب مسرحية «روميو وجولييت»؟", ["وليام شكسبير","تشارلز ديكنز","فيكتور هوجو","تولستوي"], 0, "أدب", 2],
["من مؤلف رواية «أوليفر تويست»؟", ["تشارلز ديكنز","فيكتور هوجو","تولستوي","شكسبير"], 0, "أدب", 4],
["من مؤلف «البؤساء»؟", ["فيكتور هوجو","ديكنز","تولستوي","دوستويفسكي"], 0, "أدب", 3],
["من مؤلف «الجريمة والعقاب»؟", ["دوستويفسكي","تولستوي","تشيخوف","غوغول"], 0, "أدب", 4],
["من مؤلف «الحرب والسلام»؟", ["تولستوي","دوستويفسكي","تورجينيف","تشيخوف"], 0, "أدب", 3],
["من مؤلف «الأمير الصغير»؟", ["أنطوان دو سانت إكزوبيري","فيكتور هوجو","جول فيرن","إكزوبيري وديكنز"], 0, "أدب", 4],
["من مؤلف «حول العالم في ثمانين يومًا»؟", ["جول فيرن","ألكسندر دوما","فيكتور هوجو","هرمان ميلفيل"], 0, "أدب", 4],
["في أي سنة أُعلنت الجمهورية العربية المتحدة؟", ["1958","1952","1961","1971"], 0, "تاريخ", 4],
["في أي سنة انفصلت سوريا عن الجمهورية العربية المتحدة؟", ["1961","1958","1967","1970"], 0, "تاريخ", 4],
["في أي سنة توفي جمال عبد الناصر؟", ["1970","1967","1974","1965"], 0, "تاريخ", 3],
["في أي سنة حصلت مصر على استقلالها الاسمي من بريطانيا؟", ["1922","1919","1936","1952"], 0, "تاريخ", 4],
["في أي سنة وقعت معاهدة 1936 بين مصر وبريطانيا؟", ["1936","1922","1919","1954"], 0, "تاريخ", 4],
["في أي سنة قامت ثورة 23 يوليو؟", ["1952","1948","1956","1967"], 0, "تاريخ", 1],
["في أي سنة وقعت حرب أكتوبر؟", ["1973","1967","1956","1948"], 0, "تاريخ", 1],
["في أي سنة وقعت نكسة 1967؟", ["1967","1973","1956","1948"], 0, "تاريخ", 1],
["في أي سنة عادت طابا لمصر؟", ["1989","1979","1982","1990"], 0, "تاريخ", 4],
["في أي سنة وقعت مصر وإسرائيل اتفاقية كامب ديفيد؟", ["1978","1979","1973","1982"], 0, "تاريخ", 3],
["ما اسم المدينة التي وُقع فيها اتفاق السلام المصري الإسرائيلي عام 1979؟", ["واشنطن","كامب ديفيد","جنيف","مدريد"], 0, "تاريخ", 3],
["ما اسم السد الذي بنته مصر في الستينيات على النيل؟", ["السد العالي","سد أسوان القديم","سد قناطر الخيرية","سد إسنا"], 0, "تاريخ", 2],
["في أي سنة افتُتح السد العالي؟", ["1971","1960","1956","1980"], 0, "تاريخ", 4],
["في أي سنة اندلعت الحرب العالمية الثانية؟", ["1939","1945","1941","1914"], 0, "تاريخ", 2],
["في أي سنة انتهت الحرب العالمية الأولى؟", ["1918","1914","1920","1939"], 0, "تاريخ", 2],
["كم سنة استمرت حرب المئة عام تقريبًا؟", ["أكثر من 100","100 بالضبط","50","30"], 0, "تاريخ", 4],
["من ملك بريطانيا الذي تنازل عن العرش عام 1936؟", ["إدوارد الثامن","جورج السادس","هنري الثامن","تشارلز الثالث"], 0, "تاريخ", 4],
["في أي سنة سقط جدار برلين؟", ["1989","1991","1985","1993"], 0, "تاريخ", 3],
["في أي سنة انهار الاتحاد السوفيتي؟", ["1991","1989","1993","1985"], 0, "تاريخ", 3],
["في أي سنة حدثت أحداث 11 سبتمبر في أمريكا؟", ["2001","2003","1999","2005"], 0, "تاريخ", 2],
["في أي سنة بدأت الأزمة السورية؟", ["2011","2009","2013","2015"], 0, "تاريخ", 3],
["في أي سنة كانت الثورة في تونس ومصر المعروفة بالربيع العربي؟", ["2011","2009","2013","2005"], 0, "تاريخ", 2],
["في أي سنة توحدت الإمارات العربية المتحدة؟", ["1971","1968","1975","1961"], 0, "تاريخ", 4],
["في أي سنة تأسست المملكة العربية السعودية الحديثة؟", ["1932","1925","1945","1918"], 0, "تاريخ", 3],
["في أي سنة استقلت الجزائر؟", ["1962","1954","1958","1965"], 0, "تاريخ", 3],
["في أي سنة استقلت المغرب؟", ["1956","1962","1952","1960"], 0, "تاريخ", 4],
["في أي سنة استقلت ليبيا؟", ["1951","1945","1960","1969"], 0, "تاريخ", 4],
["من أول ملك لليبيا بعد الاستقلال؟", ["الملك إدريس السنوسي","معمر القذافي","الملك فؤاد","الملك فيصل"], 0, "تاريخ", 4],
["في أي سنة قامت ثورة الفاتح في ليبيا؟", ["1969","1951","1975","1961"], 0, "تاريخ", 3],
["في أي سنة استقل السودان؟", ["1956","1952","1960","1965"], 0, "تاريخ", 3],
["في أي سنة وقعت مذبحة دير ياسين؟", ["1948","1946","1956","1967"], 0, "تاريخ", 4],
["في أي سنة وقعت انتفاضة الأقصى الثانية؟", ["2000","1996","2005","2010"], 0, "تاريخ", 4],
["في أي سنة وقعت حرب الخليج الثانية لتحرير الكويت؟", ["1991","1990","1988","1993"], 0, "تاريخ", 3],
["في أي سنة غزت العراق الكويت؟", ["1990","1991","1988","1993"], 0, "تاريخ", 3],
["في أي سنة وقعت معركة العلمين في مصر؟", ["1942","1939","1945","1948"], 0, "تاريخ", 4],
["من قاد الحملة الفرنسية على مصر؟", ["نابليون بونابرت","لويس الرابع عشر","شارل ديغول","فرانسوا الأول"], 0, "تاريخ", 2],
["في أي سنة رحلت الحملة الفرنسية عن مصر؟", ["1801","1798","1805","1517"], 0, "تاريخ", 4],
["من محمد علي الكبير الذي حكم مصر وأسس أسرة حاكمة؟", ["محمد علي باشا","إبراهيم باشا","سعيد باشا","الخديوي إسماعيل"], 0, "تاريخ", 2],
["من الخديوي الذي افتتح قناة السويس؟", ["الخديوي إسماعيل","سعيد باشا","عباس الأول","توفيق"], 0, "تاريخ", 3],
["في أي سنة افتُتحت قناة السويس؟", ["1869","1859","1875","1882"], 0, "تاريخ", 3],
["من مهندس قناة السويس الفرنسي؟", ["فرديناند ديليسبس","غوستاف إيفل","نابليون الثالث","شارل ديغول"], 0, "تاريخ", 4],
["في أي سنة استولت بريطانيا على مصر؟", ["1882","1885","1900","1914"], 0, "تاريخ", 3],
["ما اسم الحركة التي قادها أحمد عرابي؟", ["الحركة العرابية","الثورة العرابية الثانية","حركة 1919","الثورة العربية"], 0, "تاريخ", 3],
["ما اسم أول رئيس وزراء لمصر بعد الاحتلال؟", ["نوبار باشا","سعد زغلول","مصطفى النحاس","فتحي باشا"], 0, "تاريخ", 4],
["من قائد ثورة 1919 في مصر؟", ["سعد زغلول","مصطفى كامل","محمد فريد","أحمد عرابي"], 0, "تاريخ", 2],
["من زعيم الحزب الوطني ومؤسس الجامعة المصرية القديمة؟", ["مصطفى كامل","سعد زغلول","محمد عبده","قاسم أمين"], 0, "تاريخ", 4],
["من بنى جامع الأزهر في القاهرة؟", ["جوهر الصقلي","صلاح الدين","الظاهر بيبرس","محمد علي"], 0, "تاريخ", 4],
["من باني القاهرة الفاطمية؟", ["جوهر الصقلي","صلاح الدين","عمرو بن العاص","محمد علي"], 0, "تاريخ", 4],
["من الذي أزال الدولة الفاطمية؟", ["صلاح الدين الأيوبي","نور الدين محمود","قطز","بيبرس"], 0, "تاريخ", 4],
["في أي سنة سيطر العثمانيون على مصر؟", ["1517","1453","1492","1600"], 0, "تاريخ", 4],
["من قائد المماليك في معركة مرج دابق؟", ["قنصوه الغوري","قطز","بيبرس","برقوق"], 0, "تاريخ", 4],
["في أي سنة وقعت معركة مرج دابق بين العثمانيين والمماليك؟", ["1516","1517","1520","1510"], 0, "تاريخ", 4],
["من السلطان العثماني الذي فتح مصر؟", ["سليم الأول","سليمان القانوني","محمد الفاتح","مراد الثاني"], 0, "تاريخ", 4],
["من السلطان العثماني الذي فتح القسطنطينية؟", ["محمد الفاتح","سليمان القانوني","سليم الأول","بايزيد"], 0, "تاريخ", 3],
["في أي سنة انتصر المسلمون في معركة الزلاقة؟", ["1086","1090","1100","1075"], 0, "تاريخ", 4],
["من قائد المرابطين في معركة الزلاقة؟", ["يوسف بن تاشفين","طارق بن زياد","صلاح الدين","عقبة بن نافع"], 0, "تاريخ", 4],
["من قائد فتح الأندلس؟", ["طارق بن زياد","عقبة بن نافع","موسى بن نصير","يوسف بن تاشفين"], 0, "تاريخ", 3],
["ما اسم الدولة التي ألغت الخلافة العثمانية؟", ["تركيا","مصر","العراق","سوريا"], 0, "تاريخ", 3],
["من مؤسس تركيا الحديثة؟", ["مصطفى كمال أتاتورك","عبد الحميد الثاني","محمد السادس","رضا شاه"], 0, "تاريخ", 3],
["في أي سنة أُلغيت الخلافة العثمانية؟", ["1924","1918","1930","1922"], 0, "تاريخ", 4],
["في أي سنة قُتلت ملكة فرنسا ماري أنطوانيت؟", ["1793","1789","1800","1785"], 0, "تاريخ", 4],
["من القائد القرطاجي الذي عبر جبال الألب؟", ["هانيبال","يوليوس قيصر","الإسكندر","نابليون"], 0, "تاريخ", 4],
["من القائد المقدوني الذي فتح فارس ومصر؟", ["الإسكندر الأكبر","يوليوس قيصر","نابليون","هانيبال"], 0, "تاريخ", 2],
["من أول إمبراطور روماني؟", ["أغسطس","يوليوس قيصر","نيرون","تراجان"], 0, "تاريخ", 4],
["في أي سنة سقطت الإمبراطورية الرومانية الغربية؟", ["476 م","1453 م","330 م","622 م"], 0, "تاريخ", 4],
["من آخر ملكة في مصر البطلمية؟", ["كليوباترا السابعة","نفرتيتي","حتشبسوت","أحمس"], 0, "تاريخ", 2],
["من فرعون مصر الذي خطّق معاهدة قادش؟", ["رمسيس الثاني","تحتمس الثالث","خوفو","أخناتون"], 0, "تاريخ", 4],
["من الملكة المصرية التي حكمت كرجل ومثلت بلحية؟", ["حتشبسوت","نفرتيتي","كليوباترا","نيتوكريس"], 0, "تاريخ", 3],
["من الملك الفرعوني الذي دعا للتوحيد ودعا لعبادة آتون؟", ["أخناتون","توت عنخ آمون","رمسيس","خوفو"], 0, "تاريخ", 4],
["من الفرعون الشهير الذي وُجد مقبرته كاملة عام 1922؟", ["توت عنخ آمون","خوفو","رمسيس","سيتي الأول"], 0, "تاريخ", 3],
["ما اسم الحجر الذي ساعد في فك رموز الهيروغليفية؟", ["حجر رشيد","حجر باليرمو","حجر المغرة","حجر الجرانيت"], 0, "تاريخ", 3],
["من العالم الفرنسي الذي فك رموز حجر رشيد؟", ["شامبليون","نابليون","ديليسبس","ماسبيرو"], 0, "تاريخ", 3],
["كم لاعبًا يبدأ به فريق كرة القدم في الشوط الأول؟", ["11","10","9","12"], 0, "رياضة", 1],
["كم عدد التبديلات المسموحة في مباراة رسمية حاليًا؟", ["5","3","6","4"], 0, "رياضة", 3],
["ما اسم اللاعب الذي يخدع الحكم بالسقوط؟", ["المتساقط","المدافع","الحارس","الجناح"], 0, "رياضة", 4],
["ما اسم البطاقة التي تطرد اللاعب؟", ["الحمراء","الصفراء","الزرقاء","الخضراء"], 0, "رياضة", 1],
["ما اسم البطاقة التي تُنذر اللاعب؟", ["الصفراء","الحمراء","الزرقاء","الخضراء"], 0, "رياضة", 1],
["ما اسم البطولة المحلية للدوري المصري لكرة القدم؟", ["الدوري المصري الممتاز","الدوري العربي","دوري أبطال أفريقيا","كأس الاتحاد"], 0, "رياضة", 2],
["كم مرة فاز الأهلي المصري بدوري أبطال إفريقيا (تقريبًا حتى 2024)؟", ["أكثر من 10 مرات","3 مرات","5 مرات","مرة واحدة"], 0, "رياضة", 3],
["من هو النادي المصري الملقب بـ«القلعة البيضاء»؟", ["الزمالك","الأهلي","الإسماعيلي","المصري"], 0, "رياضة", 2],
["من هو النادي المصري الملقب بـ«الدراويش»؟", ["الإسماعيلي","المصري","الزمالك","الاتحاد"], 0, "رياضة", 3],
["من النادي المصري الملقب بـ«النسور الخضر»؟", ["المصري البورسعيدي","الإسماعيلي","الاتحاد السكندري","سموحة"], 0, "رياضة", 4],
["ما اسم الملعب الذي يلعب فيه الأهلي والزمالك مبارياتهما الكبرى بالقاهرة؟", ["استاد القاهرة الدولي","ملعب السلام","ستاد برج العرب","ملعب الدفاع الجوي"], 0, "رياضة", 2],
["في أي مدينة يوجد ملعب برج العرب؟", ["الإسكندرية","القاهرة","بورسعيد","السويس"], 0, "رياضة", 3],
["من لاعبي مصر الملقب بـ«الجنرال»؟", ["حسام غالي","محمد صلاح","حسام حسن","أحمد حسن"], 0, "رياضة", 4],
["من الهداف التاريخي لمنتخب مصر؟", ["حسام حسن","محمد صلاح","أحمد حسن","حازم إمام"], 0, "رياضة", 3],
["من اللاعب المصري الذي فاز بالكرة الذهبية الأفريقية أكثر من مرة؟", ["محمد صلاح","حسام حسن","أحمد حسن","محمود تريزيجيه"], 0, "رياضة", 3],
["ما اسم النادي الإنجليزي الذي لعب له محمد صلاح؟", ["ليفربول","مانشستر يونايتد","تشيلسي","آرسنال"], 0, "رياضة", 1],
["ما اسم النادي الإسباني الذي لعب له محمد صلاح لفترة قصيرة؟", ["لا يوجد","ريال مدريد","برشلونة","إشبيلية"], 0, "رياضة", 4],
["كم مرة فاز المنتخب البرازيلي بكأس العالم؟", ["5","4","3","6"], 0, "رياضة", 2],
["كم مرة فاز المنتخب الألماني بكأس العالم؟", ["4","3","5","2"], 0, "رياضة", 3],
["كم مرة فاز المنتخب الإيطالي بكأس العالم؟", ["4","3","2","5"], 0, "رياضة", 3],
["كم مرة فاز المنتخب الأرجنتيني بكأس العالم؟", ["3","2","4","1"], 0, "رياضة", 3],
["كم مرة فازت فرنسا بكأس العالم؟", ["2","1","3","4"], 0, "رياضة", 3],
["من فاز بكأس العالم 2018؟", ["فرنسا","كرواتيا","ألمانيا","البرازيل"], 0, "رياضة", 2],
["من فاز بكأس العالم 2014؟", ["ألمانيا","الأرجنتين","البرازيل","هولندا"], 0, "رياضة", 3],
["من فاز بكأس العالم 2010؟", ["إسبانيا","هولندا","ألمانيا","إيطاليا"], 0, "رياضة", 3],
["من فاز بكأس العالم 2006؟", ["إيطاليا","فرنسا","ألمانيا","البرتغال"], 0, "رياضة", 3],
["من فاز بكأس العالم 2002؟", ["البرازيل","ألمانيا","إيطاليا","تركيا"], 0, "رياضة", 3],
["في أي دولة أقيمت كأس العالم 2010؟", ["جنوب أفريقيا","البرازيل","ألمانيا","روسيا"], 0, "رياضة", 2],
["في أي دولة أقيمت كأس العالم 2014؟", ["البرازيل","جنوب أفريقيا","روسيا","قطر"], 0, "رياضة", 2],
["في أي دولة أقيمت كأس العالم 2018؟", ["روسيا","قطر","البرازيل","فرنسا"], 0, "رياضة", 2],
["في أي دولة أقيمت كأس العالم 2022؟", ["قطر","روسيا","الإمارات","السعودية"], 0, "رياضة", 1],
["من هداف كأس العالم 2022؟", ["كيليان مبابي","ليونيل ميسي","جوليان ألفاريز","أوليفييه جيرو"], 0, "رياضة", 2],
["من أفضل لاعب في كأس العالم 2022؟", ["ليونيل ميسي","كيليان مبابي","لوكا مودريتش","نيمار"], 0, "رياضة", 2],
["ما اسم اللاعب البرتغالي صاحب أكثر أهداف دولية؟", ["كريستيانو رونالدو","يوسيبيو","لويس فيغو","ريفالدو"], 0, "رياضة", 3],
["ما اسم اللاعب الأرجنتيني الملقب بـ«البرغوث»؟", ["ليونيل ميسي","دييغو مارادونا","سيرجيو أغويرو","أنخل دي ماريا"], 0, "رياضة", 1],
["ما اسم اللاعب البرازيلي الملقب بـ«بيليه» الحقيقي؟", ["إدسون أرانتيس دو ناسيمنتو","رونالدو","روماريو","نيمار"], 0, "رياضة", 4],
["ما اسم اللاعب الأرجنتيني صاحب «هدف القرن» عام 1986؟", ["دييغو مارادونا","ليونيل ميسي","ماريو كيمبس","غابرييل باتيستوتا"], 0, "رياضة", 2],
["من هو حارس المرمى الملقب بـ«الأسطورة» في مصر؟", ["عصام الحضري","أحمد شوبير","نادر السيد","محمد الشناوي"], 0, "رياضة", 3],
["كم عدد لاعبي فريق كرة القدم الأمريكية داخل الملعب من كل فريق؟", ["11","12","10","9"], 0, "رياضة", 3],
["ما عدد نقاط الهدف في كرة السلة من خارج القوس؟", ["3","2","4","1"], 0, "رياضة", 2],
["ما عدد نقاط الرمية الحرة في كرة السلة؟", ["1","2","3","4"], 0, "رياضة", 2],
["كم مدة المباراة في كرة السلة NBA؟", ["48 دقيقة","40 دقيقة","60 دقيقة","36 دقيقة"], 0, "رياضة", 4],
["في أي دولة نشأت كرة السلة؟", ["الولايات المتحدة","إنجلترا","كندا","أستراليا"], 0, "رياضة", 3],
["من أشهر لاعب في تاريخ كرة السلة؟", ["مايكل جوردان","بيليه","محمد علي","فيدرر"], 0, "رياضة", 2],
["من أشهر لاعب تنس في التاريخ بعدد ألقاب جراند سلام (رجال)؟", ["نوفاك ديوكوفيتش","روجر فيدرر","رافائيل نادال","بيت سامبراس"], 0, "رياضة", 3],
["من اللاعبة التي فازت بأكبر عدد من ألقاب جراند سلام في التنس؟", ["مارجريت كورت","سيرينا ويليامز","شتيفي غراف","مارتينا نافراتيلوفا"], 0, "رياضة", 4],
["من أشهر ملاكم في التاريخ الملقب بـ«الأعظم»؟", ["محمد علي كلاي","مايك تايسون","جو فريزر","راكي مارسيانو"], 0, "رياضة", 2],
["كم عدد أشواط مباراة الملاكمة الاحترافية الشهيرة في الوزن الثقيل؟", ["12","10","15","9"], 0, "رياضة", 4],
["في أي رياضة يوجد «الكيمونو» و«الحزام»؟", ["الجودو","الكاراتيه","التايكوندو","الملاكمة"], 0, "رياضة", 3],
["في أي رياضة يوجد «الإنقاذ» و«الغطس» و«الفراشة»؟", ["السباحة","الغطس","الجمباز","التجديف"], 0, "رياضة", 2],
["كم عدد اللاعبين في فريق الرغبي؟", ["15","11","7","13"], 0, "رياضة", 4],
["في أي بلد نشأت كرة القدم الحديثة؟", ["إنجلترا","البرازيل","إيطاليا","الأرجنتين"], 0, "رياضة", 2],
["ما اسم الاتحاد الدولي لكرة القدم؟", ["فيفا","يويفا","اللجنة الأولمبية","كاف"], 0, "رياضة", 1],
["ما اسم الاتحاد الأفريقي لكرة القدم؟", ["كاف","فيفا","يويفا","أفكا"], 0, "رياضة", 3],
["ما اسم البطولة الأفريقية للمنتخبات؟", ["كأس الأمم الأفريقية","دوري أبطال أفريقيا","كأس الكونفدرالية","كأس السوبر"], 0, "رياضة", 1],
["كم مرة فازت مصر بكأس الأمم الأفريقية؟", ["7","5","3","4"], 0, "رياضة", 2],
["في أي سنة فازت مصر بكأس الأمم الأفريقية ثلاث مرات متتالية؟", ["2006 و2008 و2010","1998 و2000 و2002","2010 و2012 و2013","1986 و1988 و1990"], 0, "رياضة", 3],
["من مدرب مصر الذي فاز بثلاث نسخ متتالية من كأس الأمم؟", ["حسن شحاتة","محمود الجوهري","حسام البدري","كابتن رجب"], 0, "رياضة", 4],
["من حكم مباراة نهائي كأس العالم 2022؟", ["سيمون مارتشينياك","أنطوني تايلور","فيكتور كاساي","دانييل أورساتو"], 0, "رياضة", 4],
["ما اسم أول محرك بحث على الإنترنت؟", ["آركي","جوجل","ياهو","بينغ"], 0, "علوم", 4],
["من مؤسس شركة أبل؟", ["ستيف جوبز","بيل غيتس","مارك زوكربيرغ","إيلون ماسك"], 0, "علوم", 2],
["من مؤسس شركة مايكروسوفت؟", ["بيل غيتس","ستيف جوبز","جيف بيزوس","لاري بيج"], 0, "علوم", 2],
["من مؤسس شركة فيسبوك؟", ["مارك زوكربيرغ","جاك دورسي","إيلون ماسك","بيل غيتس"], 0, "علوم", 2],
["من مؤسس شركة أمازون؟", ["جيف بيزوس","إيلون ماسك","مارك زوكربيرغ","ستيف جوبز"], 0, "علوم", 3],
["من مؤسس شركة تسلا وسبيس إكس؟", ["إلون ماسك","جيف بيزوس","بيل غيتس","مارك زوكربيرغ"], 0, "علوم", 2],
["ما اسم أول هاتف ذكي أطلقته أبل؟", ["آيفون","آيباد","آيبود","ماك بوك"], 0, "علوم", 2],
["في أي سنة أُطلق أول آيفون؟", ["2007","2005","2010","2003"], 0, "علوم", 4],
["ما اختصار HTTP؟", ["بروتوكول نقل النص التشعبي","بروتوكول نقل الملفات","نظام تحديد المواقع","بروتوكول البريد"], 0, "علوم", 3],
["ما اسم لغة البرمجة التي تعتمد على المتصفح وتُنفَّذ داخل الصفحة؟", ["جافاسكريبت","بايثون","سي شارب","جافا"], 0, "علوم", 2],
["ما اسم الشركة المالكة ليوتيوب؟", ["جوجل","مايكروسوفت","ميتا","أمازون"], 0, "علوم", 2],
["ما اسم الشركة المالكة لإنستغرام وواتساب؟", ["ميتا","جوجل","أبل","أمازون"], 0, "علوم", 2],
["كم عدد البايتات في الكيلوبايت الواحد؟", ["1024","1000","512","2048"], 0, "علوم", 3],
["ما اسم وحدات قياس سرعة الإنترنت؟", ["بت في الثانية","هرتز","فولت","أمبير"], 0, "علوم", 3],
["ما اسم نظام تشغيل الهواتف من جوجل؟", ["أندرويد","آي أو إس","ويندوز","لينكس"], 0, "علوم", 1],
["ما اسم نظام تشغيل هواتف آيفون؟", ["آي أو إس","أندرويد","ويندوز","أوبونتو"], 0, "علوم", 2],
["ما اسم أول حاسوب شخصي شهير صنعته أبل؟", ["أبل 2","أبل 1","ماكنتوش","ليزا"], 0, "علوم", 4],
["ما اسم العالم الذي وضع أسس الحوسبة وخوارزميات الآلة؟", ["آلان تورينج","نيوتن","أينشتاين","بيل غيتس"], 0, "علوم", 3],
["ما اسم الاختبار الشهير لذكاء الآلة؟", ["اختبار تورينج","اختبار تلقائي","اختبار منطقي","اختبار الاستنتاج"], 0, "علوم", 4],
["ما اسم الذكاء الاصطناعي الذي فاز على كاسباروف في الشطرنج عام 1997؟", ["ديب بلو","ألفاغو","ألفازيرو","واطسون"], 0, "علوم", 4],
["ما اسم البرنامج الذي فاز على لي سي دول في لعبة غو؟", ["ألفاغو","ديب بلو","واطسون","آلفا زيرو"], 0, "علوم", 4],
["كم عدد المربعات في رقعة الشطرنج؟", ["64","49","81","100"], 0, "علوم", 1],
["كم عدد قطع الشطرنج لكل لاعب في البداية؟", ["16","15","18","20"], 0, "علوم", 2],
["ما اسم أقدم لعبة لوحية معروفة في مصر القديمة؟", ["سينيت","الشطرنج","الداما","الطاولة"], 0, "علوم", 4],
["كم عدد سور القرآن الكريم من الجزء الأول حتى الأخير في مصحف؟", ["114","110","120","112"], 0, "دين", 1],
["ما اسم أول آية نزلت من القرآن الكريم؟", ["اقرأ باسم ربك الذي خلق","الحمد لله","بسم الله","سبح اسم ربك"], 0, "دين", 2],
["في أي سورة أول آية نزلت؟", ["العلق","المدثر","الفاتحة","البقرة"], 0, "دين", 2],
["ما اسم السورة التي ذُكرت فيها أطول كلمة في القرآن؟", ["سورة الحجر","سورة البقرة","سورة النساء","سورة الأنعام"], 0, "دين", 4],
["ما اسم أول سورة في المصحف؟", ["الفاتحة","البقرة","العلق","الناس"], 0, "دين", 1],
["ما اسم آخر سورة في المصحف؟", ["الناس","الفلق","الإخلاص","النصر"], 0, "دين", 2],
["ما اسم سورة تُعرف بـ«المعوذتين»؟", ["الفلق والناس","الفاتحة والإخلاص","الكوثر والنصر","النور والفرقان"], 0, "دين", 3],
["كم عدد السور التي سميت بأسماء أنبياء؟", ["6","4","8","10"], 0, "دين", 4],
["ما اسم النبي الذي سُميت باسمه سورة وهي أطول سورة ذكرت قصة؟", ["يوسف","يونس","هود","نوح"], 0, "دين", 2],
["ما اسم السورة التي تبدأ بـ«سورة أنزلناها»؟", ["النور","البقرة","المائدة","الطلاق"], 0, "دين", 4],
["ما اسم أول سورة نزلت في المدينة (على قول الجمهور)؟", ["البقرة","الفاتحة","العلق","المدثر"], 0, "دين", 4],
["ما اسم السورة التي تُسمى بـ«الطلاق» والتي تبين أحكام الطلاق بشكل رئيسي؟", ["سورة الطلاق","سورة البقرة","سورة النساء","سورة المجادلة"], 0, "دين", 3],
["ما اسم السورة التي تحدثت عن الإيلاء والظهار؟", ["سورة المجادلة","سورة الطلاق","سورة النساء","النور"], 0, "دين", 4],
["كم عدد السور التي تبدأ بـ«الحمد لله»؟", ["5","3","7","2"], 0, "دين", 4],
["ما اسم السورة التي اشتملت على آية «اليوم أكملت لكم دينكم»؟", ["سورة المائدة","سورة البقرة","سورة النور","سورة الأحزاب"], 0, "دين", 4],
["أي غزوة ذُكر اسمها صريحًا في سورة آل عمران؟", ["غزوة بدر","غزوة أحد","غزوة الخندق","غزوة حنين"], 0, "دين", 4],
["ما اسم الشهر الذي وقعت فيه غزوة بدر؟", ["رمضان","شعبان","شوال","رجب"], 0, "دين", 3],
["من أول من جهر بالقرآن بمكة؟", ["عبد الله بن مسعود","أبو بكر","بلال","عمر"], 0, "دين", 4],
["من الصحابي الذي فدى النبي بنفسه في الهجرة ونام في فراشه؟", ["علي بن أبي طالب","أبو بكر","عمر","زيد بن حارثة"], 0, "دين", 3],
["من رافق النبي ﷺ في هجرة المدينة؟", ["أبو بكر الصديق","عمر","علي","عثمان"], 0, "دين", 1],
["ما اسم الغار الذي مكث فيه النبي ﷺ وأبو بكر ثلاث ليال في الهجرة؟", ["غار ثور","غار حراء","غار الكهف","غار بدر"], 0, "دين", 3],
["ما اسم الغار الذي نزل فيه أول الوحي؟", ["غار حراء","غار ثور","غار الكهف","غار جبل النور"], 0, "دين", 2],
["في أي شهر نزل أول الوحي؟", ["رمضان","شعبان","رجب","محرم"], 0, "دين", 3],
["كم كان عمر النبي ﷺ عند وفاته؟", ["63","60","65","70"], 0, "دين", 3],
["في أي سنة هجرية توفي النبي ﷺ؟", ["11","10","12","13"], 0, "دين", 3],
["ما اسم أول من جمع القرآن في مصحف مكتوب في عهد أبي بكر؟", ["زيد بن ثابت","عمر","عثمان","علي"], 0, "دين", 4],
["من الصحابي الملقب بـ«ترجمان القرآن»؟", ["عبد الله بن عباس","عبد الله بن عمر","ابن مسعود","أبو هريرة"], 0, "دين", 3],
["من فقهاء الصحابة الملقب بـ«حبر الأمة»؟", ["عبد الله بن عباس","أبو هريرة","زيد بن ثابت","معاذ بن جبل"], 0, "دين", 4],
["من الصحابي الملقب بـ«أمين الأمة»؟", ["أبو عبيدة بن الجراح","أبو بكر","عمر","علي"], 0, "دين", 3],
["من الصحابي الملقب بـ«حوارى رسول الله»؟", ["الزبير بن العوام","أبو بكر","عبد الرحمن بن عوف","طلحة"], 0, "دين", 4],
["من الصحابي الذي كان قاضيًا لأهل المدينة وأكثر الصحابة فتوى؟", ["زيد بن ثابت","عبد الله بن عباس","أبو هريرة","عائشة"], 0, "دين", 4],
["من رسم لوحة «فتاة بقرط اللؤلؤ»؟", ["يوهانس فيرمير","فان جوخ","رامبرانت","مونيه"], 0, "فنون", 4],
["من رسم لوحة «الجدار» أو «غرنيكا»؟", ["بابلو بيكاسو","سلفادور دالي","خوان ميرو","ماتيس"], 0, "فنون", 3],
["من رسم «حديقة المتعة الأرضية»؟", ["هيرونيموس بوش","فان جوخ","دافنشي","مايكل أنجلو"], 0, "فنون", 4],
["من رسم لوحة «ميلاد فينوس»؟", ["ساندرو بوتيتشيلي","ليوناردو دافنشي","مايكل أنجلو","رافائيل"], 0, "فنون", 4],
["من رسم لوحة «سانت جورج والتنين» أو «آدم وحواء» في كنيسة سيستين؟", ["مايكل أنجلو","رافائيل","تيتيان","بوتيتشيلي"], 0, "فنون", 4],
["من رسم «مدرسة أثينا»؟", ["رافائيل","مايكل أنجلو","دافنشي","تيتيان"], 0, "فنون", 4],
["من النحات صاحب تمثال «داوود» في فلورنسا؟", ["مايكل أنجلو","دوناتيلو","رودان","بيرنيني"], 0, "فنون", 3],
["من صاحب تمثال «المفكر»؟", ["أوغست رودان","مايكل أنجلو","بيرنيني","برانكوزي"], 0, "فنون", 3],
["من صاحب تمثال «أبو الهول»؟", ["المصريون القدماء","الإغريق","الرومان","الفرس"], 0, "فنون", 2],
["ما اسم أشهر تمثال ضخم في البرازيل؟", ["تمثال المسيح الفادي","تمثال الحرية","برج إيفل","الكولوسيوم"], 0, "فنون", 3],
["ما اسم المتحف الذي يحتوي «الموناليزا»؟", ["اللوفر","المتحف البريطاني","متحف أورسيه","متحف برلين"], 0, "فنون", 3],
["في أي مدينة يوجد متحف اللوفر؟", ["باريس","لندن","نيويورك","روما"], 0, "فنون", 1],
["في أي مدينة يوجد متحف «متحف الفن الحديث» موما؟", ["نيويورك","باريس","لندن","برلين"], 0, "فنون", 4],
["في أي مدينة يوجد «متحف البرغامون»؟", ["برلين","لندن","باريس","فيينا"], 0, "فنون", 4],
["في أي مدينة يقع المتحف المصري الكبير؟", ["الجيزة","القاهرة","الإسكندرية","الأقصر"], 0, "فنون", 2],
["في أي مدينة يوجد المتحف المصري القديم بالتحرير؟", ["القاهرة","الجيزة","أسوان","الأقصر"], 0, "فنون", 2],
["في أي مدينة يوجد متحف النوبة؟", ["أسوان","الأقصر","القاهرة","الجيزة"], 0, "فنون", 4],
["من مخرج سلسلة «حرب النجوم»؟", ["جورج لوكاس","ستيفن سبيلبرغ","مارتن سكورسيزي","كريستوفر نولان"], 0, "فنون", 3],
["من مخرج فيلم «تايتانيك»؟", ["جيمس كاميرون","ستيفن سبيلبرغ","كريستوفر نولان","ريدلي سكوت"], 0, "فنون", 2],
["من مخرج فيلم «إنسيبشن» و«إنترستيلار»؟", ["كريستوفر نولان","جيمس كاميرون","ريدلي سكوت","كوينتن تارانتينو"], 0, "فنون", 3],
["من مخرج فيلم «العراب»؟", ["فرانسيس فورد كوبولا","مارتن سكورسيزي","سبيلبرغ","ريدلي سكوت"], 0, "فنون", 4],
["من مخرج فيلم «الفك المفترس» و«إي تي»؟", ["ستيفن سبيلبرغ","كريستوفر نولان","جيمس كاميرون","تارانتينو"], 0, "فنون", 3],
["ما اسم أول فيلم رسوم متحركة طويل لديزني؟", ["سنو وايت والأقزام السبعة","سندريلا","بينوكيو","فانتازيا"], 0, "فنون", 4],
["ما اسم الشركة التي أنتجت «توي ستوري»؟", ["بيكسار","ديزني","دريم ووركس","إليومينيشن"], 0, "فنون", 3],
["من صنع شخصية «ميكي ماوس»؟", ["والت ديزني","تشاك جونز","ستان لي","جورج لوكاس"], 0, "فنون", 2],
["من مبتكر شخصيات «سبايدرمان» و«أيرون مان»؟", ["ستان لي","جاك كيربي","بوب كين","بيل فينجر"], 0, "فنون", 2],
["من مؤلف قصة «ألف ليلة وليلة» الأصلية؟", ["مجهول/تراث شعبي","الجاحظ","ابن المقفع","الحريري"], 0, "فنون", 3],
["ما اسم أول فيلم مصري ناطق؟", ["أولاد الذوات","ليلى","بابا عريس","عنتر ولبلب"], 0, "فنون", 4],
["من رائد المسرح المصري الحديث صاحب «أهل الكهف»؟", ["توفيق الحكيم","يعقوب صنوع","جورج أبيض","يوسف وهبي"], 0, "فنون", 3],
["من مؤسس المسرح المصري الحديث ورائد المسرح الغنائي؟", ["يعقوب صنوع","جورج أبيض","يوسف وهبي","توفيق الحكيم"], 0, "فنون", 4],
["من الملقب بـ«عميد المسرح العربي»؟", ["يوسف وهبي","جورج أبيض","توفيق الحكيم","نجيب الريحاني"], 0, "فنون", 3],
["من صاحب مسرحية «الدخول لسعادة» أو «الشخص»؟", ["نجيب الريحاني","يوسف وهبي","توفيق الحكيم","جورج أبيض"], 0, "فنون", 4],
["من أول من أدخل السينما لمصر؟", ["عزيز بندك","محمد كريم","توجو مزراحي","حسين فوزي"], 0, "فنون", 4],
["من مخرج أول فيلم مصري طويل «ليلى» عام 1927؟", ["وداد عرفي وستيفان روستي","عزيز بندك","محمد كريم","توجو مزراحي"], 0, "فنون", 4],
["من المطرب الملقب بـ«كروان الإذاعة»؟", ["محمد عبد المطلب","محمد فوزي","عبد الحليم حافظ","كارم محمود"], 0, "فنون", 4],
["من المطرب الملقب بـ«فنان الشعب»؟", ["سيد درويش","محمد عبد الوهاب","عبد الحليم","فريد الأطرش"], 0, "فنون", 3],
["من مجدد الموسيقى العربية وصاحب «الأطلال»؟", ["رياض السنباطي","بليغ حمدي","محمد عبد الوهاب","زكريا أحمد"], 0, "فنون", 3],
["من ملحن أغنية «ألف ليلة وليلة» لأم كلثوم؟", ["بليغ حمدي","رياض السنباطي","محمد عبد الوهاب","زكريا أحمد"], 0, "فنون", 3],
["من ملحن «الأطلال» لأم كلثوم؟", ["رياض السنباطي","بليغ حمدي","محمد عبد الوهاب","زكريا أحمد"], 0, "فنون", 4],
["من كاتب كلمات «الأطلال»؟", ["إبراهيم ناجي","أحمد رامي","بيرم التونسي","صلاح جاهين"], 0, "فنون", 4],
["من شاعر أغاني أم كلثوم الأشهر وصاحب «أنت عمري»؟", ["أحمد شفيق كامل","أحمد رامي","بيرم التونسي","صلاح جاهين"], 0, "فنون", 4],
["من ملحن «أنت عمري»؟", ["محمد عبد الوهاب","بليغ حمدي","رياض السنباطي","زكريا أحمد"], 0, "فنون", 3],
["من مؤلف أغنية «شمس» و«الصهبجية»؟", ["صلاح جاهين","بيرم التونسي","فؤاد حداد","أحمد فؤاد نجم"], 0, "فنون", 4],
["من شاعر العامية المصرية صاحب «على اسم مصر»؟", ["صلاح جاهين","فؤاد حداد","بيرم التونسي","أحمد فؤاد نجم"], 0, "فنون", 3],
["من الملحن المصري صاحب «تخاريف» و«ألف ليلة وليلة» الموسيقية؟", ["عمر خيرت","محمد عبد الوهاب","بليغ حمدي","هاني شنودة"], 0, "فنون", 3],
["ما اسم أول فيلم سعودي طويل عرض عالميًا؟", ["وجدة","بركة يقابل بركة","عاصفة الرمال","المرشحة"], 0, "فنون", 4],
["ما الفواكه الأكثر احتواءً على فيتامين C؟", ["الجوافة","التفاح","الموز","العنب"], 0, "حياة يومية", 3],
["ما المشروب الذي يصنع من أوراق الكاميليا؟", ["الشاي","القهوة","الكاكاو","المتة"], 0, "حياة يومية", 3],
["ما الشجرة التي تعطي حبوب القهوة؟", ["شجرة البن","شجرة الكاكاو","شجرة الشاي","شجرة الزيتون"], 0, "حياة يومية", 2],
["ما البلد الأكثر إنتاجًا للبن في العالم؟", ["البرازيل","كولومبيا","إثيوبيا","فيتنام"], 0, "حياة يومية", 3],
["ما البلد الذي نشأت فيه القهوة؟", ["إثيوبيا","البرازيل","اليمن","تركيا"], 0, "حياة يومية", 3],
["ما نوع الطعام الذي يُحفظ بالتبريد عند درجة حرارة أقل من 18-؟", ["اللحوم المجمدة","الأرز","الخبز","البسكويت"], 0, "حياة يومية", 3],
["ما المادة التي تُستخدم لرفع العجين (الخبز)؟", ["الخميرة","الملح","السكر","الزيت"], 0, "حياة يومية", 2],
["ما الغاز الذي ينتج عن تخمر العجين؟", ["ثاني أكسيد الكربون","الأكسجين","النيتروجين","الميثان"], 0, "حياة يومية", 4],
["ما المادة التي تعطي الطعم الحلو في الحلوى؟", ["السكر","الملح","الفانيليا","النشا"], 0, "حياة يومية", 1],
["ما اسم التوابل الأكثر غلاءً في العالم؟", ["الزعفران","الفلفل الأسود","القرفة","الكمون"], 0, "حياة يومية", 3],
["ما نوع الطعام المصري «الرنجة»؟", ["سمك مملح ومدخن","لحم مجفف","جبنة","خبز"], 0, "حياة يومية", 2],
["ما نوع السمك المستخدم في الفسيخ؟", ["البوري","البلطي","الدنيس","القرموط"], 0, "حياة يومية", 4],
["ما اسم الخبز المصري الرقيق الذي يُخبز في الفرن البلدي؟", ["العيش البلدي","العيش الفينو","التورتيلا","الباغيت"], 0, "حياة يومية", 2],
["ما المكون الرئيسي في الملوخية؟", ["أوراق الملوخية","السبانخ","البامية","الجرجير"], 0, "حياة يومية", 1],
["ما المكون الرئيسي في البامية؟", ["البامية الخضراء","الملوخية","السبانخ","الفاصوليا"], 0, "حياة يومية", 1],
["ما اسم الطبق المصري الشهير من الرقاق واللحم؟", ["الرقاق","الفتة","الممبار","الحواوشي"], 0, "حياة يومية", 3],
["ما اسم الطبق المصري الشهير من الأرز واللحم والصلصة؟", ["الفتة","الكشري","الرقاق","المحشي"], 0, "حياة يومية", 2],
["ما اسم الحلوى المصرية التي تُصنع من السمسم؟", ["الطحينة والحلاوة الطحينية","البسبوسة","الكحك","البقلاوة"], 0, "حياة يومية", 2],
["ما اسم حلوى رمضان المصرية الشهيرة؟", ["الكنافة والقطايف","البسبوسة","أم علي","الكحك"], 0, "حياة يومية", 2],
["ما اسم الحلوى المصرية التي تُصنع من الرقاق واللبن والمكسرات؟", ["أم علي","الكحك","البسبوسة","الكنافة"], 0, "حياة يومية", 2],
["ما المناسبة المصرية التي يُصنع فيها الكحك؟", ["عيد الفطر","عيد الأضحى","المولد النبوي","شم النسيم"], 0, "حياة يومية", 2],
["ما المناسبة المصرية التي تشتهر فيها «الفسيخ»؟", ["شم النسيم","عيد الفطر","عيد الأضحى","المولد"], 0, "حياة يومية", 2],
["في أي يوم من السنة يُحتفل بشم النسيم في مصر؟", ["الاثنين بعد عيد القيامة القبطي","1 مايو","21 مارس","10 أبريل"], 0, "حياة يومية", 4],
["ما اسم عيد المصريين الذي يحتفلون فيه بالخضرة والبيض الملوّن؟", ["شم النسيم","المولد","عيد الفطر","وقفة عرفات"], 0, "حياة يومية", 2],
["ما اسم المهرجان المصري الذي يُحتفل فيه بالمولد النبوي بالحلاوة؟", ["المولد النبوي","شم النسيم","عيد الفطر","عيد الميلاد"], 0, "حياة يومية", 2],
["ما اسم أشهر حلوى في المولد النبوي؟", ["عروسة المولد","الكحك","البسبوسة","القطايف"], 0, "حياة يومية", 2],
["كم مرة في السنة يُحتفل بعيد الفطر؟", ["مرة","مرتين","ثلاث مرات","أربع مرات"], 0, "حياة يومية", 1],
["كم يومًا عيد الفطر في مصر رسميًا؟", ["3 أيام","يوم واحد","5 أيام","7 أيام"], 0, "حياة يومية", 2],
["كم يومًا عيد الأضحى في مصر رسميًا؟", ["4 أيام","3 أيام","يومان","5 أيام"], 0, "حياة يومية", 3],
["ما اسم البنك المركزي في مصر؟", ["البنك المركزي المصري","البنك الأهلي","بنك مصر","بنك القاهرة"], 0, "حياة يومية", 3],
["ما اسم أكبر بنك حكومي في مصر؟", ["البنك الأهلي المصري","بنك مصر","بنك القاهرة","البنك التجاري"], 0, "حياة يومية", 3],
["ما اسم الجهة المسؤولة عن مياه الشرب في مصر؟", ["الشركة القابضة لمياه الشرب","وزارة الكهرباء","البريد المصري","شركة الغاز"], 0, "حياة يومية", 4],
["ما اسم الجهة التي تصدر الرقم القومي في مصر؟", ["مصلحة الأحوال المدنية","البريد","الشهر العقاري","المحكمة"], 0, "حياة يومية", 4],
["ما اسم الوثيقة التي تُستخرج عند الميلاد؟", ["شهادة الميلاد","بطاقة الرقم القومي","جواز السفر","الفيش"], 0, "حياة يومية", 1],
["ما اسم الوثيقة الرسمية للسفر خارج البلاد؟", ["جواز السفر","بطاقة الرقم القومي","رخصة القيادة","شهادة الميلاد"], 0, "حياة يومية", 1],
["كم سنة صلاحية جواز السفر المصري للبالغين؟", ["7 سنوات","5 سنوات","10 سنوات","3 سنوات"], 0, "حياة يومية", 3],
["ما اسم مصلحة الضرائب المصرية المسؤولة عن إقرار الدخل؟", ["مصلحة الضرائب المصرية","مصلحة الجمارك","الشهر العقاري","مصلحة الأحوال"], 0, "حياة يومية", 4],
["ما اسم الجهة المسؤولة عن جمع الجمارك في مصر؟", ["مصلحة الجمارك","مصلحة الضرائب","البنك المركزي","البريد"], 0, "حياة يومية", 3],
["ما اسم أول خط مترو أنفاق في مصر؟", ["الخط الأول","الخط الثاني","الخط الثالث","الخط الرابع"], 0, "حياة يومية", 4],
["في أي سنة افتُتح أول خط مترو في القاهرة؟", ["1987","1990","1995","2000"], 0, "حياة يومية", 4],
["ما اسم الشركة التي تدير مترو القاهرة؟", ["الشركة المصرية لإدارة وتشغيل المترو","هيئة النقل العام","الشركة الوطنية","هيئة السكة الحديد"], 0, "حياة يومية", 4],
["ما رقم المطافي في مصر؟", ["180","123","122","121"], 0, "حياة يومية", 2],
["ما رقم الخط الساخن لشكاوى الحكومة في مصر؟", ["16528","19468","16000","19999"], 0, "حياة يومية", 4],
["كم عدد أيام شهر رمضان في التقويم الهجري؟", ["29 أو 30","30 دائمًا","28","31"], 0, "دين", 2],
["كم عدد أيام السنة الهجرية تقريبًا؟", ["354","365","360","380"], 0, "عام", 3],
["كم عدد أشهر السنة الهجرية؟", ["12","10","11","13"], 0, "عام", 1],
["ما اسم الشهر الأول في السنة الميلادية؟", ["يناير","فبراير","مارس","ديسمبر"], 0, "عام", 1],
["ما اسم أطول شهر في عدد الأيام؟", ["لا يوجد شهر أطول من 31","فبراير","يناير","أغسطس"], 0, "عام", 2],
["كم عدد أسابيع السنة تقريبًا؟", ["52","48","50","56"], 0, "عام", 2],
["كم عدد أيام شهر فبراير في السنة الكبيسة؟", ["29","28","30","31"], 0, "عام", 1],
["كم عدد الأيام في الربع الأول من السنة (يناير وفبراير ومارس)؟", ["90 أو 91","89","88","92"], 0, "عام", 3],
["ما اسم الليلة التي تسبق أول أيام السنة الميلادية؟", ["ليلة رأس السنة","ليلة النصف","ليلة القدر","ليلة الشتاء"], 0, "عام", 1],
["ما اسم أكبر عدد من الخانات في لعبة اللوتو المصرية؟", ["90","75","80","100"], 0, "عام", 4],
["كم عدد الحروف في كلمة «مليون» بالإنجليزية؟", ["7","6","8","5"], 0, "عام", 3],
["كم عدد الأصفار في المليار؟", ["9","6","12","8"], 0, "عام", 2],
["كم عدد الأصفار في الترليون؟", ["12","9","15","10"], 0, "عام", 4],
["كم يساوي الروماني X؟", ["10","5","50","1"], 0, "عام", 2],
["ما الرقم الروماني الذي يمثل 50؟", ["L","V","X","C"], 0, "عام", 3],
["ما الرقم الروماني الذي يمثل 100؟", ["C","L","D","M"], 0, "عام", 3],
["ما الرقم الروماني الذي يمثل 1000؟", ["M","C","D","L"], 0, "عام", 3],
["كم ضلعًا في المضلع الخماسي؟", ["5","4","6","8"], 0, "عام", 1],
["كم قطرًا في المربع؟", ["2","1","4","3"], 0, "عام", 3],
["كم وجهًا في مكعب؟", ["6","4","8","12"], 0, "عام", 1],
["كم حرفًا في كلمة «Egypt»؟", ["5","4","6","7"], 0, "عام", 2],
["كم دولة تقع في قارة أوروبا تقريبًا؟", ["44","60","30","20"], 0, "حول العالم", 4],
["كم عدد الدول الأعضاء في الأمم المتحدة؟", ["193","180","200","150"], 0, "حول العالم", 4],
["في أي مدينة يوجد مقر الأمم المتحدة الرئيسي؟", ["نيويورك","جنيف","باريس","فيينا"], 0, "حول العالم", 3],
["في أي مدينة يوجد مقر منظمة الصحة العالمية؟", ["جنيف","نيويورك","باريس","روما"], 0, "حول العالم", 4],
["في أي مدينة يوجد مقر اليونسكو؟", ["باريس","جنيف","نيويورك","روما"], 0, "حول العالم", 4],
["في أي مدينة يوجد مقر الاتحاد الأفريقي؟", ["أديس أبابا","القاهرة","نيروبي","جوهانسبرغ"], 0, "حول العالم", 3],
["في أي مدينة يوجد مقر جامعة الدول العربية؟", ["القاهرة","تونس","عمّان","الرياض"], 0, "حول العالم", 2],
["ما اسم اليوم العالمي للأمم المتحدة؟", ["24 أكتوبر","1 يناير","8 مارس","10 ديسمبر"], 0, "حول العالم", 4],
["ما اسم أجمل جائزة دولية للسلام؟", ["نوبل للسلام","أوسكار","بوكر","نوبل للأدب"], 0, "حول العالم", 2],
["في أي بلد تُمنح جائزة نوبل؟", ["النرويج (السلام) والسويد","الدنمارك","سويسرا","فنلندا"], 0, "حول العالم", 4],
["ما اسم البلد الذي تُقام فيه جوائز الأوسكار؟", ["الولايات المتحدة","بريطانيا","فرنسا","كندا"], 0, "حول العالم", 1],
["في أي مدينة تُقام جوائز الأوسكار؟", ["لوس أنجلوس","نيويورك","شيكاغو","لاس فيغاس"], 0, "حول العالم", 3],
["ما اسم أطول سور في العالم؟", ["سور الصين العظيم","سور هادريان","سور برلين","سور أنطونين"], 0, "حول العالم", 2],
["في أي دولة يوجد «تاج محل»؟", ["الهند","باكستان","إيران","تركيا"], 0, "حول العالم", 3],
["في أي دولة يوجد «برج بيزا المائل»؟", ["إيطاليا","اليونان","إسبانيا","فرنسا"], 0, "حول العالم", 2],
["في أي دولة يوجد «برج إيفل»؟", ["فرنسا","إيطاليا","بلجيكا","سويسرا"], 0, "حول العالم", 1],
["في أي دولة يوجد «الكولوسيوم»؟", ["إيطاليا","اليونان","تركيا","إسبانيا"], 0, "حول العالم", 2],
["في أي دولة يوجد «ستونهنج»؟", ["بريطانيا","أيرلندا","فرنسا","الدنمارك"], 0, "حول العالم", 4],
["في أي دولة يوجد «ماتشو بيتشو»؟", ["بيرو","المكسيك","البرازيل","تشيلي"], 0, "حول العالم", 3],
["في أي دولة توجد «أهرامات تشيتشن إيتزا»؟", ["المكسيك","بيرو","غواتيمالا","هندوراس"], 0, "حول العالم", 4],
["في أي دولة يوجد «معبد البارثينون»؟", ["اليونان","إيطاليا","تركيا","مصر"], 0, "حول العالم", 3],
["في أي دولة يوجد «تمثال رودس» قديمًا؟", ["اليونان","تركيا","إيطاليا","قبرص"], 0, "حول العالم", 4],
["في أي بلد توجد «قلعة نويشفانشتاين»؟", ["ألمانيا","النمسا","سويسرا","التشيك"], 0, "حول العالم", 4],
["في أي بلد توجد «بحيرة كومو»؟", ["إيطاليا","سويسرا","النمسا","فرنسا"], 0, "حول العالم", 4],
["في أي بلد توجد «مدينة البندقية»؟", ["إيطاليا","كرواتيا","اليونان","مالطا"], 0, "حول العالم", 2],
["ما اسم أكبر برج في العالم حاليًا؟", ["برج خليفة","برج شنغهاي","برج مكة","برج تايبيه"], 0, "حول العالم", 2],
["في أي مدينة يوجد برج خليفة؟", ["دبي","أبو ظبي","الدوحة","الرياض"], 0, "حول العالم", 1],
["في أي مدينة يوجد «برج المملكة»؟", ["الرياض","جدة","دبي","الكويت"], 0, "حول العالم", 3],
["في أي مدينة يوجد «أبراج الكويت»؟", ["الكويت","المنامة","الدوحة","مسقط"], 0, "حول العالم", 2],
["في أي مدينة يوجد «المسجد النبوي»؟", ["المدينة المنورة","مكة","الرياض","الطائف"], 0, "حول العالم", 1],
["في أي مدينة يوجد «المسجد الحرام»؟", ["مكة المكرمة","المدينة","القدس","الطائف"], 0, "حول العالم", 1],
["في أي مدينة يوجد «جامع الأزهر»؟", ["القاهرة","الإسكندرية","دمشق","بغداد"], 0, "حول العالم", 2],
["في أي مدينة يوجد «جامع قرطبة»؟", ["قرطبة","غرناطة","إشبيلية","طليطلة"], 0, "حول العالم", 4],
["في أي مدينة يوجد «قصر الحمراء»؟", ["غرناطة","قرطبة","إشبيلية","مدريد"], 0, "حول العالم", 3],
["في أي مدينة يوجد «تاج محل»؟", ["أغرا","دلهي","مومباي","جايبور"], 0, "حول العالم", 4],
["في أي مدينة يوجد «دار أوبرا سيدني»؟", ["سيدني","ملبورن","كانبيرا","بيرث"], 0, "حول العالم", 2],
["في أي مدينة يوجد «تمثال الحرية»؟", ["نيويورك","واشنطن","بوسطن","شيكاغو"], 0, "حول العالم", 1],
["في أي مدينة يوجد «البنتاغون»؟", ["واشنطن","نيويورك","لوس أنجلوس","هيوستن"], 0, "حول العالم", 3],
["في أي مدينة يوجد «البيت الأبيض»؟", ["واشنطن","نيويورك","فيلادلفيا","شيكاغو"], 0, "حول العالم", 2],
["في أي مدينة يوجد «قصر باكنغهام»؟", ["لندن","باريس","برلين","روما"], 0, "حول العالم", 2],
["في أي مدينة يوجد «برج لندن»؟", ["لندن","أدنبرة","دبلن","كارديف"], 0, "حول العالم", 2],
["في أي مدينة يوجد «الكولوسيوم»؟", ["روما","أثينا","ميلانو","نابولي"], 0, "حول العالم", 1],
["في أي مدينة يوجد «برج بيزا»؟", ["بيزا","روما","فلورنسا","البندقية"], 0, "حول العالم", 2],
["في أي مدينة يوجد «تمثال المسيح الفادي»؟", ["ريو دي جانيرو","ساو باولو","بوينس آيرس","ليما"], 0, "حول العالم", 3],
["في أي مدينة يوجد «قناة بنما»؟", ["بنما","كولومبيا","كوستاريكا","نيكاراغوا"], 0, "حول العالم", 3],
["في أي بلد توجد «بطرسبرغ» بشوارعها المائية؟", ["روسيا","أوكرانيا","بولندا","ليتوانيا"], 0, "حول العالم", 3],
["ما اسم أطول شريان مائي صنعه الإنسان؟", ["قناة السويس","قناة بنما","قناة كيل","قناة كورنث"], 0, "حول العالم", 4],
["أي قارة لا يوجد بها سكان أصليون دائمون؟", ["أنتاركتيكا","أستراليا","أمريكا الجنوبية","إفريقيا"], 0, "حول العالم", 3],
["ما اسم أكبر قارة في عدد السكان؟", ["آسيا","إفريقيا","أوروبا","أمريكا الشمالية"], 0, "حول العالم", 2],
["ما اسم أكثر قارة في عدد الدول؟", ["إفريقيا","آسيا","أوروبا","أمريكا الجنوبية"], 0, "حول العالم", 3],
["ما اسم أطول حدود برية في العالم بين دولتين؟", ["بين كندا وأمريكا","بين روسيا والصين","بين الهند والصين","بين مصر وليبيا"], 0, "حول العالم", 4],
["ما اسم أصغر قارة من حيث عدد السكان؟", ["أنتاركتيكا","أستراليا","أوروبا","أمريكا الجنوبية"], 0, "حول العالم", 3],
["ما اسم أكبر جزيرة في البحر الأحمر؟", ["جزر فرسان","سقطرى","جوبال","الزبرجد"], 0, "حول العالم", 4],
["ما اسم الدولة التي تمتلك أكبر عدد من الجزر؟", ["السويد","إندونيسيا","الفلبين","فنلندا"], 0, "حول العالم", 4],
["ما اسم أعلى درجة على مقياس موهس للصلابة؟", ["الألماس","الكوارتز","الحديد","الجرانيت"], 0, "علوم", 4],
["ما اسم أطول عظمة في الجسم؟", ["عظمة الفخذ","عظمة الساق","عظمة العضد","الترقوة"], 0, "علوم", 3],
["ما اسم العظمة التي تحمي المخ؟", ["الجمجمة","الفقرة","القص","الترقوة"], 0, "علوم", 1],
["كم عدد فقرات العمود الفقري عند الإنسان البالغ؟", ["33","30","24","40"], 0, "علوم", 4],
["ما اسم أصغر عظمة في جسم الإنسان؟", ["الركاب","الفخذ","الترقوة","أصابع اليد"], 0, "علوم", 4],
["ما اسم السائل الذي يحمي المخ والحبل الشوكي؟", ["السائل النخاعي","الدم","البلازما","الليمف"], 0, "علوم", 4],
["ما اسم الجهاز الذي يضخ الدم من القلب إلى الجسم؟", ["الشرايين","الأوردة","الشعيرات","اللمف"], 0, "علوم", 3],
["ما اسم الشعيرات التي تنقل الدم من القلب للرئتين؟", ["الشريان الرئوي","الوريد الرئوي","الشريان الأورطي","الوريد الأجوف"], 0, "علوم", 4],
["ما عدد حجرات القلب؟", ["4","2","3","5"], 0, "علوم", 2],
["ما اسم الخلايا التي تنقل الأكسجين في الدم؟", ["كريات الدم الحمراء","كريات الدم البيضاء","الصفائح","البلازما"], 0, "علوم", 3],
["ما اسم الخلايا المسؤولة عن المناعة؟", ["كريات الدم البيضاء","كريات الدم الحمراء","الصفائح","البلازما"], 0, "علوم", 3],
["ما اسم الفصيلة التي تُعدّ «المعطي العام» في نقل الدم؟", ["O سالب","AB موجب","A موجب","B سالب"], 0, "علوم", 4],
["ما اسم الفصيلة التي تُعدّ «المستقبل العام» في نقل الدم؟", ["AB موجب","O سالب","A","B"], 0, "علوم", 4],
["ما الأنسولين وما وظيفته؟", ["هرمون ينظم السكر في الدم","إنزيم يهضم الدهون","فيتامين","معدن"], 0, "علوم", 3],
["ما الغدة التي تتحكم في النمو وهرمون النمو؟", ["الغدة النخامية","الدرقية","الكظرية","البنكرياس"], 0, "علوم", 4],
["ما الغدة التي تفرز هرموني الأدرينالين؟", ["الكظرية","النخامية","الدرقية","التيموس"], 0, "علوم", 4],
["ما اسم الغدة التي تنظم الأيض؟", ["الدرقية","النخامية","الكظرية","البنكرياس"], 0, "علوم", 4],
["ما العنصر الذي يعانون نقصه عند مرض الغدة الدرقية (تضخم الغدة)؟", ["اليود","الحديد","الكالسيوم","الزنك"], 0, "علوم", 4],
["ما المرض الذي ينتج عن نقص الحديد؟", ["الأنيميا","السكري","الكساح","الإسقربوط"], 0, "علوم", 3],
["ما المرض الذي ينتج عن نقص فيتامين د؟", ["الكساح","الأنيميا","الإسقربوط","العشى الليلي"], 0, "علوم", 3],
["ما اسم أهم مصدر لفيتامين د؟", ["الشمس","الليمون","اللحم","الخبز"], 0, "علوم", 2],
["ما اسم غاز الضحك؟", ["أكسيد النيتروز","الأكسجين","النيتروجين","الهيليوم"], 0, "علوم", 4],
["ما اسم الغاز المستخدم في البالونات التي تطير؟", ["الهيليوم","الأكسجين","النيتروجين","الهيدروجين"], 0, "علوم", 3],
["ما اسم العنصر ذي الرمز Au؟", ["الذهب","الفضة","الألومنيوم","النحاس"], 0, "علوم", 3],
["ما اسم العنصر ذي الرمز Ag؟", ["الفضة","الذهب","الرصاص","القصدير"], 0, "علوم", 3],
["ما اسم العنصر ذي الرمز O؟", ["الأكسجين","الذهب","الحديد","النيتروجين"], 0, "علوم", 2],
["ما اسم العنصر ذي الرمز Na؟", ["الصوديوم","النيتروجين","النيكل","النيون"], 0, "علوم", 3],
["ما اسم العنصر ذي الرمز K؟", ["البوتاسيوم","الكالسيوم","الكبريت","الكريبتون"], 0, "علوم", 4],
["ما اسم العنصر ذي الرمز C؟", ["الكربون","الكالسيوم","الكلور","النحاس"], 0, "علوم", 3],
["ما اسم العنصر ذي الرمز H؟", ["الهيدروجين","الهيليوم","الهافنيوم","الحديد"], 0, "علوم", 2],
["ما أثقل عنصر طبيعي معروف على الأرض؟", ["اليورانيوم","الرصاص","الذهب","البلاتين"], 0, "علوم", 4],
["ما اسم أشهر معدن سام استخدم قديمًا في مواسير المياه؟", ["الرصاص","الحديد","النحاس","الزنك"], 0, "علوم", 4],
["ما اسم أشهر سبيكة من النحاس والزنك؟", ["النحاس الأصفر (الصفر)","البرونز","الفولاذ","الفضة الإسترلينية"], 0, "علوم", 4],
["ما اسم أشهر سبيكة من النحاس والقصدير؟", ["البرونز","الصفر","الفولاذ","الحديد المطاوع"], 0, "علوم", 4],
["ما نسبة الأكسجين في الهواء تقريبًا؟", ["21%","50%","78%","10%"], 0, "علوم", 3],
["ما نسبة النيتروجين في الهواء تقريبًا؟", ["78%","21%","50%","10%"], 0, "علوم", 3],
["ما الغاز الذي يستخدم في إطفاء الحرائق؟", ["ثاني أكسيد الكربون","الأكسجين","الهيدروجين","الميثان"], 0, "علوم", 3],
["ما الغاز الذي يستخدم في الطبخ في المنازل؟", ["البروبان/البوتان","الأكسجين","النيتروجين","ثاني أكسيد الكربون"], 0, "علوم", 2],
["ما اسم العملية التي تتحول فيها المادة الصلبة مباشرة للغاز؟", ["التسامي","التبخر","الانصهار","التكاثف"], 0, "علوم", 4],
["ما اسم التغير الحاصل في المادة عند تسخينها من الحالة الصلبة للسائلة؟", ["الانصهار","التجمد","التبخر","التكاثف"], 0, "علوم", 2],
["ما نقطة تجمد الماء في المقياس السيلزيوس؟", ["0","32","100","-1"], 0, "علوم", 2],
["ما نقطة غليان الماء في المقياس السيلزيوس؟", ["100","0","212","50"], 0, "علوم", 2],
["ما وحدة قياس الكتلة في النظام الدولي؟", ["الكيلوجرام","المتر","الثانية","اللتر"], 0, "علوم", 3],
["ما وحدة قياس الطول في النظام الدولي؟", ["المتر","الكيلو","الجرام","اللتر"], 0, "علوم", 1],
["كم سنتيمترًا في المتر؟", ["100","10","1000","50"], 0, "علوم", 1],
["كم مترًا في الكيلومتر؟", ["1000","100","10","10000"], 0, "علوم", 2],
["كم جرامًا في الكيلوجرام؟", ["1000","100","10","500"], 0, "علوم", 1],
["كم مليلتر في اللتر؟", ["1000","100","10","500"], 0, "علوم", 2],
["في أي سنة انضمت مصر لمنظمة التجارة العالمية؟", ["1995","1990","2000","1998"], 0, "حول العالم", 4],
["في أي سنة تأسست منظمة الأمم المتحدة؟", ["1945","1919","1950","1939"], 0, "حول العالم", 4],
["في أي سنة تأسست جامعة الدول العربية؟", ["1945","1948","1950","1936"], 0, "حول العالم", 4],
["كم عدد أعضاء مجلس الأمن الدائمين؟", ["5","10","15","3"], 0, "حول العالم", 3],
["ما اسم الدول الخمس دائمة العضوية في مجلس الأمن؟", ["أمريكا وروسيا والصين وبريطانيا وفرنسا","أمريكا وروسيا والصين وألمانيا واليابان","أمريكا وروسيا والهند وفرنسا وبريطانيا","أمريكا والصين وألمانيا واليابان والبرازيل"], 0, "حول العالم", 4],
["كم عدد أعضاء مجلس الأمن الكلي؟", ["15","10","20","5"], 0, "حول العالم", 4],
["ما اسم المنظمة الدولية التي تُعنى بالصحة؟", ["منظمة الصحة العالمية","اليونيسيف","اليونسكو","الفاو"], 0, "حول العالم", 2],
["ما اسم المنظمة الدولية التي تُعنى بالطفولة؟", ["اليونيسيف","اليونسكو","الصحة العالمية","الفاو"], 0, "حول العالم", 3],
["ما اسم المنظمة الدولية التي تُعنى بالتعليم والثقافة؟", ["اليونسكو","اليونيسيف","الفاو","الصحة العالمية"], 0, "حول العالم", 3],
["ما اختصار منظمة الفاو التابعة للأمم المتحدة؟", ["منظمة الأغذية والزراعة","منظمة العمل","منظمة الصحة","منظمة الثقافة"], 0, "حول العالم", 4],
["ما اسم أقدم جامعة في العالم ما زالت تعمل؟", ["القرويين","الأزهر","أكسفورد","بولونيا"], 0, "تاريخ", 4],
["في أي مدينة توجد جامعة القرويين؟", ["فاس","مراكش","القاهرة","قرطبة"], 0, "تاريخ", 4],
["في أي سنة تأسست جامعة القاهرة (الجامعة المصرية)؟", ["1908","1925","1882","1952"], 0, "تاريخ", 4],
["ما اسم أول جامعة أُنشئت في مصر الحديثة؟", ["الجامعة المصرية (القاهرة)","الأزهر","عين شمس","الإسكندرية"], 0, "تاريخ", 4],
["في أي سنة تأسست جامعة الدول العربية في القاهرة؟", ["1945","1948","1950","1942"], 0, "تاريخ", 4],
["ما اسم أول مجمع للغة العربية في العصر الحديث؟", ["مجمع اللغة العربية بالقاهرة","مجمع دمشق","مجمع بغداد","مجمع عمّان"], 0, "تاريخ", 4],
["في أي سنة أُنشئ مجمع اللغة العربية بالقاهرة؟", ["1932","1900","1950","1920"], 0, "تاريخ", 4],
["ما عاصمة دولة الإمارات العربية المتحدة؟", ["أبوظبي","دبي","الشارقة","عجمان"], 0, "جغرافيا", 1],
["كم عدد سور القرآن الكريم؟", ["112","113","114","115"], 2, "دين", 1],
["في أي قارة تقع دولة البرازيل؟", ["إفريقيا","أمريكا الجنوبية","أمريكا الشمالية","آسيا"], 1, "جغرافيا", 1],
["ما هو الحيوان الذي يُسمى 'سفينة الصحراء'؟", ["الحصان","الفيل","الجمل","الأسد"], 2, "عام", 1],
["كم عدد ركعات صلاة الفجر؟", ["ركعتان","ثلاث ركعات","أربع ركعات","ركعة واحدة"], 0, "دين", 1],
["ما هو المعدن السائل في درجة حرارة الغرفة؟", ["الحديد","النحاس","الزئبق","الذهب"], 2, "علوم", 2],
["في أي عام هبط الإنسان على سطح القمر لأول مرة؟", ["1965","1969","1973","1980"], 1, "تاريخ", 3],
["من هو مؤلف رواية 'بين القصرين'؟", ["توفيق الحكيم","نجيب محفوظ","طه حسين","عباس العقاد"], 1, "أدب", 2],
["ما هي الدولة الأكثر سكاناً في العالم؟", ["الهند","الصين","الولايات المتحدة","إندونيسيا"], 0, "جغرافيا", 2],
["ما هو الغاز الأكثر وجوداً في مكونات الغلاف الجوي للأرض؟", ["الأكسجين","النيتروجين","ثاني أكسيد الكربون","الهيدروجين"], 1, "علوم", 2],
["في أي دولة تقع مدينة طهران؟", ["إيران","العراق","تركيا","أذربيجان"], 0, "جغرافيا", 2],
["ما هي عاصمة إيطاليا؟", ["روما","ميلانو","فلورنسا","نابولي"], 0, "جغرافيا", 1],
["كم عدد أضلاع المثلث؟", ["3","4","5","6"], 0, "علوم", 1],
["ما هو أكبر كوكب في المجموعة الشمسية؟", ["المريخ","زحل","المشتري","الزهرة"], 2, "علوم", 2],
["من هو النبي الذي لُقّب بكليم الله؟", ["إبراهيم","موسى","عيسى","نوح"], 1, "دين", 2],
["ما هي عاصمة إسبانيا؟", ["برشلونة","مدريد","إشبيلية","فالنسيا"], 1, "جغرافيا", 1],
["ما هو العنصر الكيميائي الذي يُمثَّل بالرمز 'O'؟", ["الذهب","الأكسجين","الهيدروجين","الفضة"], 1, "علوم", 1],
["في أي عام قامت الثورة الفرنسية؟", ["1789","1804","1750","1820"], 0, "تاريخ", 3],
["ما هي عاصمة اليابان؟", ["طوكيو","كيوتو","أوساكا","هيروشيما"], 0, "جغرافيا", 1],
["من هو مكتشف قانون الجاذبية العام؟", ["ألبرت أينشتاين","إسحاق نيوتن","جاليليو جاليلي","نيكولاس كوبرنيكوس"], 1, "علوم", 3],
["ما هو أطول نهر في العالم؟", ["نهر النيل","نهر الأمازون","نهر المسيسيبي","نهر اليانغتسي"], 0, "جغرافيا", 2],
["كم عدد ألوان العلم اللبناني؟", ["ثلاثة","أربعة","اثنان","خمسة"], 0, "جغرافيا", 2],
["ما هي عاصمة ألمانيا؟", ["ميونخ","فرانكفورت","برلين","هامبورغ"], 2, "جغرافيا", 1],
["من هو مخترع المصباح الكهربائي؟", ["توماس إديسون","نيكولا تسلا","ألكسندر جراهام بيل","ألبرت أينشتاين"], 0, "علوم", 2],
["ما هي العملة الرسمية للمملكة المتحدة؟", ["الدولار","اليورو","الجنيه الإسترليني","الفرنك"], 2, "عام", 2],
["ما هو الكوكب المعروف بالكوكب الأحمر؟", ["عطارد","المريخ","المشتري","الزهرة"], 1, "علوم", 1],
["من هو مؤسس علم الجبر؟", ["الخوارزمي","ابن الهيثم","ابن سينا","البيروني"], 0, "تاريخ", 3],
["ما هي عاصمة تركيا؟", ["إسطنبول","أنقرة","إزمير","بورصة"], 1, "جغرافيا", 2],
["ما هو الحيوان البري الأسرع في العالم؟", ["الأسد","النمر","الفهد","الغزال"], 2, "عام", 2],
["في أي قارة تقع أستراليا؟", ["أستراليا/أوقيانوسيا","آسيا","إفريقيا","أمريكا الجنوبية"], 0, "جغرافيا", 1],
["ما هو العضو المسؤول عن ضخ الدم في جسم الإنسان؟", ["المخ","الكبد","القلب","الرئتان"], 2, "علوم", 1],
["ما هي عاصمة الهند؟", ["مومباي","نيودلهي","كولكاتا","بنغالور"], 1, "جغرافيا", 2],
["من هو أول خلفاء المسلمين الراشدين؟", ["عمر بن الخطاب","أبو بكر الصديق","عثمان بن عفان","علي بن أبي طالب"], 1, "دين", 2],
["ما هي عاصمة روسيا؟", ["سانت بطرسبرغ","موسكو","كازان","سيبيريا"], 1, "جغرافيا", 2],
["كم عدد اللاعبين الأساسيين في فريق كرة القدم؟", ["9","10","11","12"], 2, "رياضة", 1],
["ما هو أسرع طائر في العالم؟", ["الصقر","العقاب","النعامة","البطريق"], 0, "عام", 3],
["ما هي عاصمة الصين؟", ["شانغهاي","بكين","شينزين","غوانغجو"], 1, "جغرافيا", 2],
["من هو شاعر رسول الله صلى الله عليه وسلم؟", ["حسان بن ثابت","عبد الله بن رواحة","كعب بن مالك","خالد بن الوليد"], 0, "دين", 3],
["ما هو أصغر قارة في العالم مساحة؟", ["أوروبا","أنتاركتيكا","أستراليا/أوقيانوسيا","أمريكا الجنوبية"], 2, "جغرافيا", 2],
["في أي عام انتهت الحرب العالمية الثانية؟", ["1943","1945","1950","1939"], 1, "تاريخ", 3],
["ما هي عاصمة الجزائر؟", ["وهران","عنابة","الجزائر العاصمة","قسنطينة"], 2, "جغرافيا", 1],
["ما هو السمك الذي يتنفس بالرئات بدلاً من الخياشيم؟", ["القرش","الحوت","السمك الرئوي","السلمون"], 2, "علوم", 4],
["من هو صاحب كتاب 'الكافي' في الحديث الشريف؟", ["الكليني","الصدوق","الطوسي","المفيد"], 0, "دين", 4],
["ما هي عاصمة الأرجنتين؟", ["بوينس آيرس","قرطبة","روزاريو","مندوزا"], 0, "جغرافيا", 2],
["ما هي أثقل عنصر طبيعي موجود على الأرض؟", ["اليورانيوم","الرصاص","البلوتونيوم","الذهب"], 0, "علوم", 4],
["في أي سنة هجرية وقعت غزوة بدر الكبرى؟", ["السنة 2هـ","السنة 3هـ","السنة 4هـ","السنة 5هـ"], 0, "دين", 3],
["ما هي عاصمة كوريا الجنوبية؟", ["بوسان","سيول","إنشيون","دايجو"], 1, "جغرافيا", 2],
["من هو مكتشف الدورة الدموية الصغرى؟", ["ابن النفيس","ابن سينا","الرازي","الزهراوي"], 0, "علوم", 3],
["ما هي عاصمة كولومبيا؟", ["بوغوتا","ميديلين","كالي","كارتاخينا"], 0, "جغرافيا", 3],
["ما هو أطول جسر بحري في العالم حالياً؟", ["جسر هونغ كونغ - تشوهاي - مكاو","جسر ليك باتشارتري","جسر بانج نا","جسر دانيانغ - كونشان"], 0, "علوم", 4],
["ما هي عاصمة كندا؟", ["تورونتو","مونتريال","أوتاوا","فانكوفر"], 2, "جغرافيا", 2],
["من هو الكاتب المصري الذي نال جائزة نوبل في الأدب؟", ["توفيق الحكيم","نجيب محفوظ","طه حسين","يحيى حقي"], 1, "أدب", 2],
["ما هو أسرع حيوان بري في العالم؟", ["الأسد","النمر","الفهد","الغزال"], 2, "عام", 1],
["كم عدد أركان الإسلام؟", ["4","5","6","3"], 1, "دين", 1],
["في أي عام تأسست الأمم المتحدة؟", ["1945","1939","1950","1919"], 0, "تاريخ", 3],
["ما هي عاصمة السويد؟", ["ستوكهولم","أوسلو","كوبنهاغن","هلسنكي"], 0, "جغرافيا", 2],
["ما هو العنصر الكيميائي الذي يرمز له بـ 'Au'؟", ["الفضة","الذهب","النحاس","الحديد"], 1, "علوم", 2],
["من هو قائد المعركة التي انتصر فيها المسلمون في عين جالوت؟", ["قطز","بيبرس","صلاح الدين","خالد بن الوليد"], 0, "تاريخ", 3],
["ما هي عاصمة النمسا؟", ["فيينا","سالزبورغ","غراتس","إنسبروك"], 0, "جغرافيا", 2],
["كم عدد أوتار العود التقليدي؟", ["4","5","6","7"], 1, "فنون", 3],
["ما هو أصغر كوكب في المجموعة الشمسية؟", ["عطارد","المريخ","المشتري","الزهرة"], 0, "علوم", 2],
["في أي دولة توجد مدينة الأقصر التاريخية؟", ["العراق","مصر","سوريا","اليونان"], 1, "تاريخ", 1],
["ما هي عاصمة البرازيل؟", ["ريو دي جانيرو","برازيليا","ساو باولو","سالفادور"], 1, "جغرافيا", 3],
["من هو مكتشف البنسلين؟", ["ألكسندر فليمينج","لويس باستور","روبرت كوخ","إدوارد جينر"], 0, "علوم", 3],
["ما هي عاصمة أستراليا؟", ["سيدني","ملبورن","كانبيرا","بريزبان"], 2, "جغرافيا", 3],
["كم عدد مقاطعات كندا؟", ["10 مقاطعات","8 مقاطعات","12 مقاطعة","6 مقاطعات"], 0, "جغرافيا", 3],
["ما هو الحيوان الذي لديه ثلاثة قلوب؟", ["الأخطبوط","الحوت","القرش","الدلفين"], 0, "علوم", 3],
["في أي عام أقيمت أول بطولة كأس عالم لكرة القدم؟", ["1930","1934","1950","1928"], 0, "رياضة", 3],
["ما هي عاصمة نيوزيلندا؟", ["أوكلاند","ويلينغتون","كرايستشيرش","هاميلتون"], 1, "جغرافيا", 3],
["من هو مؤلف كتاب 'مقدمة ابن خلدون'؟", ["ابن خلدون","ابن سينا","الطبري","ابن بطوطة"], 0, "أدب", 2],
["ما هي عاصمة اليونان؟", ["أثينا","سالونيك","باتراس","الإسكندرية"], 0, "جغرافيا", 1],
["ما هو الغاز الذي يشكل النسبة الأكبر من الشمس؟", ["الهيدروجين","الهيليوم","الأكسجين","النيتروجين"], 0, "علوم", 3],
["في أي مدينة عربية يقع المسجد الأقصى؟", ["القدس","مكة","المدينة","دمشق"], 0, "دين", 1],
["ما هي عاصمة البرتغال؟", ["لشبونة","بورتو","كويمبرا","فارو"], 0, "جغرافيا", 2],
["من هو الرسام الذي رسم لوحة 'الموناليزا'؟", ["فان جوخ","ليوناردو دا فينشي","بابلو بيكاسو","ميكيلانجلو"], 1, "فنون", 1],
["ما هي عاصمة النرويج؟", ["أوسلو","بيرغن","تروندهايم","ستوكهولم"], 0, "جغرافيا", 2],
["كم عدد الأيام في السنة الكبيسة؟", ["365","366","364","367"], 1, "عام", 1],
["من هو مؤسس الدولة العثمانية؟", ["عثمان الأول","أرطغرل","أورخان","بايزيد"], 0, "تاريخ", 3],
["ما هي عاصمة الدنمارك؟", ["كوبنهاغن","أودنسه","آرهوس","آلبورغ"], 0, "جغرافيا", 2],
["ما هو الكوكب الذي يدور حول الشمس بسرعة أكبر؟", ["عطارد","الزهرة","الأرض","المريخ"], 0, "علوم", 4],
["ما هي عاصمة فنلندا؟", ["هلسنكي","توركو","تامبيري","إسبو"], 0, "جغرافيا", 2],
["من هو صاحب معلقة 'قف نبكِ من ذكرى حبيب ومنزلِ'؟", ["امرؤ القيس","زهير بن أبي سلمى","طرفة بن العبد","لبيد بن ربيعة"], 0, "أدب", 3],
["ما هي عاصمة المجر (هنجاريا)؟", ["بودابست","براغ","فيينا","بوخارست"], 0, "جغرافيا", 3],
["ما هو أكبر بحر مغلق في العالم؟", ["بحر قزوين","البحر الأسود","البحر الميت","بحر عمان"], 0, "جغرافيا", 3],
["في أي عام تم توقيع اتفاقية كامب ديفيد بين مصر وإسرائيل؟", ["1978","1979","1981","1973"], 0, "تاريخ", 3],
["ما هي عاصمة بولندا؟", ["وارسو","كراكوف","غدانسك","فروتسواف"], 0, "جغرافيا", 2],
["ما هو المعدن الأكثر استخراجاً في العالم؟", ["الحديد","الذهب","النحاس","الألومنيوم"], 0, "علوم", 2],
["من هو النبي الذي ابتلعه الحوت؟", ["يونس عليه السلام","موسى","يوسف","إبراهيم"], 0, "دين", 1],
["ما هي عاصمة تشيلي؟", ["سانتياغو","فالبارايسو","كونثيبثيون","أنتوفاغاستا"], 0, "جغرافيا", 3],
["كم عدد لاعبين فريق كرة السلة على الملعب لكل فريق؟", ["5","6","7","4"], 0, "رياضة", 1],
["ما هي عاصمة أيرلندا؟", ["دبلن","كورك","غالواي","ليمريك"], 0, "جغرافيا", 2],
["من هو رائد الفضاء الأول الذي صعد إلى الفضاء الخارجي؟", ["يوري جاجارين","نيل أرمسترونج","باز ألدرين","فالنتينا تيريشكوفا"], 0, "تاريخ", 3],
["ما هي عاصمة رومانيا؟", ["بوخارست","كلوج","تيميشوارا","كرايوفا"], 0, "جغرافيا", 3],
["ما هي عاصمة أوكرانيا؟", ["كييف","خاركيف","أوديسا","لفيف"], 0, "جغرافيا", 2],
["من هو مؤلف كتاب 'الشفا'؟", ["ابن سينا","الغزالي","الفارابي","ابن رشد"], 0, "أدب", 4],
["ما هي عاصمة الفلبين؟", ["مانيلا","سيبو","دافاو","كويزون"], 0, "جغرافيا", 3],
["ما هو الحيوان البري الذي يعتبر رمزاً لدولة أستراليا؟", ["الكنغر","الكوالا","الدينغو","التمساح"], 0, "عام", 2],
["ما هي عاصمة ماليزيا؟", ["كوالالمبور","بينانغ","جوهور باهرو","بوتراجايا"], 0, "جغرافيا", 2],
["من هو رفيق النبي صلى الله عليه وسلم في الهجرة؟", ["أبو بكر الصديق","عمر بن الخطاب","علي بن أبي طالب","عثمان بن عفان"], 0, "دين", 1],
["ما هي عاصمة تايلاند؟", ["بانكوك","بوكيت","تشيانغ ماي","باتايا"], 0, "جغرافيا", 2]
  ];

  /* ==========================================================
     10.5) من سيربح المليون — المحرك
     ========================================================== */

  /* سلّم الجوائز: 40 مستوى → مليون جنيه */
  const MZ_LADDER = [100, 200, 300, 500, 1000, 2000, 3000, 5000, 8000, 12000,
    20000, 30000, 40000, 50000, 75000, 100000, 125000, 150000, 175000, 200000,
    250000, 300000, 350000, 400000, 450000, 500000, 550000, 600000, 650000, 700000,
    750000, 800000, 850000, 880000, 910000, 940000, 960000, 980000, 990000, 1000000];
  const MZ_TOTAL = MZ_LADDER.length;          /* 40 */
  const MZ_SAFE = [5, 15, 25, 35];            /* مستويات شبكة الأمان */
  const MZ_KEYS = ['أ', 'ب', 'ج', 'د'];

  const MZ_CATS = { 'عام': '#7b5cff', 'جغرافيا': '#22d3ee', 'تاريخ': '#ffb03a', 'أدب': '#ff8fab', 'دين': '#2ec4b6', 'علوم': '#a3e635', 'رياضة': '#ff5c7a', 'فنون': '#c084fc', 'عالم': '#4cc9f0', 'يومي': '#f59e0b', 'حياة يومية': '#f59e0b', 'حول العالم': '#4cc9f0' };

  /* أيقونات خاصة بالمليون */
  Object.assign(PATHS, {
    fifty: '<circle cx="12" cy="12" r="8.4"/><path d="M12 3.6a8.4 8.4 0 0 1 0 16.8z" fill="currentColor" stroke="none"/>',
    crowd: '<circle cx="12" cy="7.4" r="2.6"/><circle cx="5.4" cy="9.4" r="2"/><circle cx="18.6" cy="9.4" r="2"/><path d="M7.6 19.4c0-2.7 2-4.4 4.4-4.4s4.4 1.7 4.4 4.4"/><path d="M2.4 17.6c.1-2.1 1.3-3.4 3-3.6M21.6 17.6c-.1-2.1-1.3-3.4-3-3.6"/>',
    swap: '<path d="M4.6 8.6h12.2l-2.6-2.6"/><path d="M19.4 15.4H7.2l2.6 2.6"/>',
    money: '<rect x="2.8" y="6.4" width="18.4" height="11.2" rx="2.4"/><circle cx="12" cy="12" r="2.8"/><path d="M6.4 9.2v5.6M17.6 9.2v5.6"/>',
    idcard: '<rect x="2.8" y="5.4" width="18.4" height="13.2" rx="2.6"/><circle cx="8.6" cy="11" r="2"/><path d="M5 16.2c.4-1.6 1.8-2.4 3.6-2.4s3.2.8 3.6 2.4"/><path d="M15.4 10h3.6M15.4 13.4h3.6"/>',
    ticket: '<path d="M3.4 8.2a2 2 0 0 1 2-2h13.2a2 2 0 0 1 2 2v1.4a2.4 2.4 0 0 0 0 4.8v1.4a2 2 0 0 1-2 2H5.4a2 2 0 0 1-2-2v-1.4a2.4 2.4 0 0 0 0-4.8z"/><path d="M12 8.6v6.8"/>',
    crown: '<path d="M3.6 17.6h16.8l1.2-9.2-4.6 3.2L12 5.2 6.6 11.6 2 8.4z"/><path d="M3.6 20.4h16.8"/>',
    send: '<path d="M20.8 3.6 3.4 10.4l6.6 2.8 2.8 6.6z"/><path d="M10 13.2 20.8 3.6"/>',
    facebook: '<path d="M14.4 8.4h2.8V5.2h-2.8c-2.3 0-4 1.7-4 4v2H8v3.2h2.4v6.4h3.2v-6.4h2.6l.6-3.2h-3.2V9.6c0-.7.4-1.2 1.2-1.2z"/>',
    chat: '<path d="M20.4 12.2c0 3.8-3.8 6.8-8.4 6.8-1 0-2-.14-2.9-.4L4 20.6l1.3-3.6c-1.2-1.2-1.9-2.9-1.9-4.8 0-3.8 3.8-6.8 8.6-6.8s8.4 3 8.4 6.8z"/>',
    mail: '<rect x="2.8" y="5.2" width="18.4" height="13.6" rx="2.6"/><path d="M3.6 7 12 13.4 20.4 7"/>',
    lock: '<rect x="4.6" y="10.4" width="14.8" height="9.6" rx="2.6"/><path d="M8.2 10.4V7.8a3.8 3.8 0 0 1 7.6 0v2.6"/><circle cx="12" cy="15.2" r="1.3" fill="currentColor" stroke="none"/>',
    eye: '<path d="M2.6 12S6 6.6 12 6.6 21.4 12 21.4 12 18 17.4 12 17.4 2.6 12 2.6 12z"/><circle cx="12" cy="12" r="3"/>',
    eyeoff: '<path d="M4 4l16 16"/><path d="M9.9 5.2A9.7 9.7 0 0 1 12 5c6 0 9.4 7 9.4 7a17 17 0 0 1-3 3.8"/><path d="M6.3 7.4A16.7 16.7 0 0 0 2.6 12S6 19 12 19a9.6 9.6 0 0 0 3.2-.5"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    login: '<path d="M14.4 4.6H6.4a2 2 0 0 0-2 2v10.8a2 2 0 0 0 2 2h8"/><path d="M16.4 8.6 20.4 12l-4 3.4"/><path d="M20 12H9.4"/>',
    logout: '<path d="M9.6 4.6H5.4a2 2 0 0 0-2 2v10.8a2 2 0 0 0 2 2h4.2"/><path d="M15.4 8.6 19.4 12l-4 3.4"/><path d="M19 12H8.6"/>',
    chevron: '<path d="M6.6 9.4 12 14.6l5.4-5.2"/>',
    link: '<path d="M9.6 14.4 14.4 9.6"/><path d="M12.8 6.4l1.2-1.2a4 4 0 0 1 5.6 5.6l-1.2 1.2"/><path d="M11.2 17.6l-1.2 1.2a4 4 0 0 1-5.6-5.6l1.2-1.2"/>'
  });

  /* ---------- البنك ---------- */
  const MBANK = MSTARS.map((r, i) => ({ id: i, t: r[0], o: r[1], a: r[2], c: r[3], l: r[4] }));
  const MZ_BY_ID = {};
  MBANK.forEach((q) => { MZ_BY_ID[q.id] = q; });

  /* ---------- الحالة ---------- */
  const MZ = {
    name: (typeof AUTH !== 'undefined' && AUTH.user && AUTH.user.name) || LS.get('mz_name', ''),
    g: LS.get('mz_game', null),
    pending: false
  };
  const mzSaveGame = () => LS.set('mz_game', MZ.g);
  const mzSafe = (n) => { let v = 0; MZ_SAFE.forEach((l) => { if (n >= l) v = MZ_LADDER[l - 1]; }); return v; };
  const mzMoney = (v) => num(v) + ' جنيه';

  /* سحب 40 سؤال: 10 من كل مستوى صعوبة، بترتيب من السهل للصعب */
  function mzDraw() {
    const bands = [1, 2, 3, 4];
    const deck = [];
    bands.forEach((lv) => {
      const pool = shuffle(MBANK.filter((q) => q.l === lv));
      pool.slice(0, 10).forEach((q) => deck.push(q.id));
    });
    /* لو مستوى ناقص، نكمّل من الأقرب */
    if (deck.length < MZ_TOTAL) {
      const rest = shuffle(MBANK.filter((q) => deck.indexOf(q.id) === -1));
      while (deck.length < MZ_TOTAL && rest.length) deck.push(rest.pop().id);
    }
    return deck.slice(0, MZ_TOTAL);
  }

  /* تجهيز سؤال: خلط الاختيارات + تحديد الصح */
  function mzPrep(id) {
    const q = MZ_BY_ID[id];
    if (!q) return null;
    const opts = shuffle(q.o.map((v, i) => ({ v: v, i: i })));
    return { id: id, t: q.t, c: q.c, l: q.l, opts: opts, ai: opts.findIndex((x) => x.i === q.a), hide: [], pick: null, shot: null, aud: null, ph: null, locked: false, phase: 'ask' };
  }

  function mzStart(name) {
    const nm = String(name || (AUTH.user ? AUTH.user.name : '') || '').trim().slice(0, 40);
    MZ.name = nm; LS.set('mz_name', nm);
    if (typeof AUTH !== 'undefined' && AUTH.recordPlay) AUTH.recordPlay();
    const deck = mzDraw();
    MZ.g = { deck: deck, i: 0, correct: 0, used: { f: false, a: false, p: false, s: false }, q: mzPrep(deck[0]), stage: 'q', amount: 0, started: Date.now() };
    mzSaveGame();
    if ((location.hash || '').indexOf('#/million') !== 0) { location.hash = '#/million'; return; }
    render(false);
    toast('بالتوفيق يا ' + (nm || 'بطل') + ' — أول سؤال بـ ١٠٠ جنيه');
  }

  function mzNext() {
    const g = MZ.g; if (!g) return;
    if (g.correct >= MZ_TOTAL) { mzWin(); return; }
    g.i = g.correct;
    g.q = mzPrep(g.deck[g.i]);
    g.stage = 'q';
    mzSaveGame();
    render(false);
  }

  function mzWin() {
    const g = MZ.g;
    g.stage = 'win'; g.amount = 1000000;
    if (typeof AUTH !== 'undefined' && AUTH.recordWin) AUTH.recordWin();
    mzSaveGame();
    render(false);
    setTimeout(() => { SFX.win(); confetti(null, window.innerHeight * 0.28, 46); }, 120);
  }

  function mzStop(kind) {
    const g = MZ.g; if (!g) return;
    if (kind === 'take') {
      g.amount = g.correct > 0 ? MZ_LADDER[g.correct - 1] : 0;
      g.stage = 'out';
      SFX.reveal();
    } else {
      let safe = 0;
      MZ_SAFE.forEach((l) => { if (g.correct >= l) safe = MZ_LADDER[l - 1]; });
      g.amount = safe;
      g.stage = 'lose';
    }
    if (g.amount > 0 && typeof AUTH !== 'undefined' && AUTH.recordBest) AUTH.recordBest(g.amount);
    mzSaveGame();
    render(false);
  }

  function mzAnswer() {
    const g = MZ.g; if (!g || !g.q || g.q.phase !== 'ask' || g.q.pick == null) return;
    const q = g.q;
    q.locked = true;
    if (q.pick === q.ai) {
      q.phase = 'right';
      g.correct += 1;
      SFX.pick();
      const btn = document.querySelector('.mzopt[data-i="' + q.pick + '"]');
      if (btn) { const r = btn.getBoundingClientRect(); confetti(r.left + r.width / 2, r.top + r.height / 2, 16); }
      mzSaveGame();
      render(false);
      setTimeout(() => { if (MZ.g && MZ.g.q === q) mzNext(); }, 1150);
    } else {
      q.phase = 'wrong';
      SFX.blip(160, 0.35, 'sawtooth', 0.05);
      mzSaveGame();
      render(false);
      setTimeout(() => { if (MZ.g && MZ.g.q === q) mzStop('lose'); }, 1700);
    }
  }

  /* وسائل المساعدة */
  function mzFifty() {
    const g = MZ.g, q = g && g.q;
    if (!q || q.phase !== 'ask' || g.used.f) return;
    const wrong = q.opts.map((_, i) => i).filter((i) => i !== q.ai);
    q.hide = shuffle(wrong).slice(0, 2);
    if (q.pick != null && q.hide.indexOf(q.pick) > -1) q.pick = null;
    g.used.f = true; mzSaveGame(); SFX.tick(); render(false);
  }

  function mzAudience() {
    const g = MZ.g, q = g && g.q;
    if (!q || q.phase !== 'ask' || g.used.a) return;
    const lv = q.l;
    const acc = [0.82, 0.66, 0.48, 0.34][lv - 1];
    let vals = q.opts.map(() => Math.random() * 22);
    vals[q.ai] += acc * 100;
    const t = vals.reduce((x, y) => x + y, 0);
    vals = vals.map((v) => Math.round((v / t) * 100));
    const diff = 100 - vals.reduce((x, y) => x + y, 0);
    vals[q.ai] += diff;
    g.used.a = true;
    q.aud = vals;
    mzSaveGame(); SFX.reveal(); render(false);
  }

  function mzPhone() {
    const g = MZ.g, q = g && g.q;
    if (!q || q.phase !== 'ask' || g.used.p) return;
    const lv = q.l;
    const acc = [0.95, 0.85, 0.7, 0.55][lv - 1];
    const guess = Math.random() < acc ? q.ai : pick(q.opts.map((_, i) => i).filter((i) => i !== q.ai));
    const letters = MZ_KEYS.slice(0, q.opts.length);
    const sure = [100, 90, 80, 70, 60][rnd(5)];
    const line = guess === q.ai
      ? 'أنا شبه متأكد إن الإجابة ' + letters[guess] + ' — نسبة تأكدي ' + sure + '٪'
      : 'صراحة مش متأكد… بس حاسس إنها ' + letters[guess] + '، يمكن ' + (100 - sure) + '٪ بس';
    g.used.p = true;
    q.ph = { by: pick(['محمد', 'سارة', 'أحمد', 'منى', 'يوسف', 'نور', 'كريم', 'هبة']), line: line };
    mzSaveGame(); SFX.pick(); render(false);
  }

  function mzSwap() {
    const g = MZ.g, q = g && g.q;
    if (!q || q.phase !== 'ask' || g.used.s) return;
    const rest = MBANK.filter((x) => x.l === q.l && g.deck.indexOf(x.id) === -1 && (!q || x.id !== q.id));
    if (!rest.length) { toast('مفيش سؤال بديل متاح'); return; }
    const nq = pick(rest);
    g.deck[g.i] = nq.id;
    g.q = mzPrep(nq.id);
    g.used.s = true;
    mzSaveGame(); SFX.tick(); render(false);
    toast('اتغيّر السؤال — نفس المستوى');
  }

  /* ---------- الشيك ---------- */
  function mzArDate(d) {
    const dt = d instanceof Date ? d : new Date(d);
    if (isNaN(dt)) return '';
    const p = (n) => (n < 10 ? '0' + n : '' + n);
    return p(dt.getDate()) + ' / ' + p(dt.getMonth() + 1) + ' / ' + dt.getFullYear();
  }

  function mzDrawCheque() {
    const cv = document.getElementById('mzCheque');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    const nameEl = document.getElementById('mzName');
    const dateEl = document.getElementById('mzDate');
    const who = ((nameEl && nameEl.value) || MZ.name || (AUTH.user && AUTH.user.name) || 'بطل المليون').trim().slice(0, 40);
    const when = dateEl && dateEl.value ? mzArDate(dateEl.value) : mzArDate(new Date());

    ctx.clearRect(0, 0, W, H);

    /* الورق */
    const paper = ctx.createLinearGradient(0, 0, W, H);
    paper.addColorStop(0, '#fbf6e8'); paper.addColorStop(.55, '#f4ebd5'); paper.addColorStop(1, '#efe3c8');
    ctx.fillStyle = paper; ctx.fillRect(0, 0, W, H);

    /* نقشة أمان (خطوط مقوّسة) */
    ctx.save();
    ctx.globalAlpha = .10; ctx.strokeStyle = '#0b6b53'; ctx.lineWidth = 1.4;
    for (let i = 0; i < 26; i++) {
      ctx.beginPath(); ctx.arc(W * .5, H * .52, 60 + i * 26, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();

    /* إطار */
    ctx.strokeStyle = '#0b6b53'; ctx.lineWidth = 10; ctx.strokeRect(18, 18, W - 36, H - 36);
    ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 2.5; ctx.strokeRect(38, 38, W - 76, H - 76);
    ctx.strokeStyle = 'rgba(11,107,83,.45)'; ctx.lineWidth = 1; ctx.strokeRect(48, 48, W - 96, H - 96);

    /* علامة مائية */
    ctx.save();
    ctx.globalAlpha = .07;
    ctx.fillStyle = '#0b6b53';
    ctx.beginPath(); ctx.arc(W * .5, H * .54, 150, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    ctx.direction = 'rtl';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0b6b53';
    ctx.font = '900 56px "Segoe UI", Tahoma, Arial, sans-serif';
    ctx.fillText('بنك المليون المصري', W / 2, 128);
    ctx.font = '700 22px "Segoe UI", Tahoma, Arial, sans-serif';
    ctx.fillStyle = '#8a6d1f';
    ctx.fillText('شيك جائزة — مسابقة «من سيربح المليون»', W / 2, 168);

    /* السيريال والتاريخ */
    ctx.font = '700 22px "Segoe UI", Tahoma, Arial, sans-serif';
    ctx.textAlign = 'left'; ctx.fillStyle = '#6b5a2a';
    ctx.fillText('رقم الشيك: ' + (1000000 + Math.floor(Math.random() * 8999999)), 72, 232);
    ctx.textAlign = 'right';
    ctx.fillText('التاريخ: ' + when, W - 72, 232);

    /* ادفعوا لأمر */
    ctx.textAlign = 'right';
    ctx.fillStyle = '#6b5a2a';
    ctx.font = '700 26px "Segoe UI", Tahoma, Arial, sans-serif';
    ctx.fillText('ادفعوا لأمر:', W - 92, 320);

    ctx.fillStyle = '#14210f';
    let nfs = 60;
    ctx.font = '900 ' + nfs + 'px "Segoe UI", Tahoma, Arial, sans-serif';
    while (nfs > 26 && ctx.measureText(who).width > W * 0.62) {
      nfs -= 4;
      ctx.font = '900 ' + nfs + 'px "Segoe UI", Tahoma, Arial, sans-serif';
    }
    ctx.textAlign = 'center';
    ctx.fillText(who, W / 2, 316);

    ctx.strokeStyle = 'rgba(11,107,83,.55)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W * .12, 348); ctx.lineTo(W * .88, 348); ctx.stroke();

    /* المبلغ */
    ctx.textAlign = 'right';
    ctx.font = '700 26px "Segoe UI", Tahoma, Arial, sans-serif';
    ctx.fillStyle = '#6b5a2a';
    ctx.fillText('مبلغ وقدره:', W - 92, 418);
    ctx.font = '900 44px "Segoe UI", Tahoma, Arial, sans-serif';
    ctx.fillStyle = '#14210f';
    ctx.fillText('مليون جنيه مصري فقط لا غير', W - 250, 418);

    /* خانة الرقم */
    ctx.fillStyle = 'rgba(11,107,83,.08)';
    ctx.fillRect(78, 380, 300, 84);
    ctx.strokeStyle = '#0b6b53'; ctx.lineWidth = 2.5;
    ctx.strokeRect(78, 380, 300, 84);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0b6b53';
    ctx.font = '900 44px "Courier New", monospace';
    ctx.direction = 'ltr';
    ctx.fillText('EGP 1,000,000', 228, 438);
    ctx.direction = 'rtl';

    /* توقيع */
    ctx.strokeStyle = '#14210f'; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(W - 400, 560);
    ctx.bezierCurveTo(W - 370, 505, W - 330, 610, W - 290, 548);
    ctx.bezierCurveTo(W - 260, 505, W - 240, 590, W - 200, 552);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(11,107,83,.5)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W - 430, 580); ctx.lineTo(W - 180, 580); ctx.stroke();
    ctx.textAlign = 'center'; ctx.fillStyle = '#6b5a2a';
    ctx.font = '700 20px "Segoe UI", Tahoma, Arial, sans-serif';
    ctx.fillText('توقيع الأمين', W - 305, 614);

    /* ختم */
    ctx.save();
    ctx.translate(210, 560); ctx.rotate(-0.14);
    ctx.strokeStyle = 'rgba(180,30,70,.75)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(0, 0, 68, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(0, 0, 58, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(180,30,70,.85)';
    ctx.font = '900 19px "Segoe UI", Tahoma, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('معتمد', 0, -6);
    ctx.fillText('١٠٠٠٠٠٠', 0, 22);
    ctx.restore();

    /* شعار صغير */
    ctx.beginPath();
    const gx = W - 190, gy = 118;
    const grd = ctx.createLinearGradient(gx - 30, gy - 30, gx + 30, gy + 30);
    grd.addColorStop(0, '#7b5cff'); grd.addColorStop(.55, '#ff2d92'); grd.addColorStop(1, '#ffb03a');
    ctx.fillStyle = grd;
    if (ctx.roundRect) { ctx.roundRect(gx - 34, gy - 34, 68, 68, 18); ctx.fill(); }
    else ctx.fillRect(gx - 34, gy - 34, 68, 68);
    ctx.fillStyle = '#150a1e';
    ctx.font = '900 40px "Segoe UI", Tahoma, Arial, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('؟', gx, gy + 2);
    ctx.textBaseline = 'alphabetic';
  }

  /* ---------- الواجهات ---------- */
  function mzLadderHTML(g) {
    let out = '<details class="mzladder" id="mzLadder" open><summary class="mzladder__t">' +
      '<span>سلّم الجوائز</span><b>سؤال ' + num(g ? g.i + 1 : 1) + ' / ' + num(MZ_TOTAL) + ' — ' + mzMoney(g ? MZ_LADDER[g.i] : MZ_LADDER[0]) + '</b></summary><ol>';
    for (let i = MZ_TOTAL - 1; i >= 0; i--) {
      const lv = i + 1;
      const val = MZ_LADDER[i];
      const isNow = g && g.stage === 'q' && g.i === i;
      const done = g && i < g.correct;
      const safe = MZ_SAFE.indexOf(lv) > -1;
      out += '<li class="mzl' + (isNow ? ' is-now' : '') + (done ? ' is-done' : '') + (safe ? ' is-safe' : '') + '">' +
        '<span class="mzl__n">' + num(lv) + '</span>' +
        '<span class="mzl__v">' + num(val) + '</span>' +
        (safe ? '<span class="mzl__s">أمان</span>' : '') + '</li>';
    }
    out += '</ol></details>';
    return out;
  }

  function mzQuestionHTML(g, q) {
    const lv = g.i + 1;
    const val = MZ_LADDER[g.i];
    const cat = MZ_CATS[q.c] || '#7b5cff';
    const letters = MZ_KEYS.slice(0, q.opts.length);
    const opts = q.opts.map((o, i) => {
      let cls = 'mzopt';
      if (q.hide.indexOf(i) > -1) cls += ' is-off';
      if (q.pick === i) cls += ' is-pick';
      if (q.phase === 'right' && i === q.ai) cls += ' is-right';
      if (q.phase === 'wrong') {
        if (i === q.ai) cls += ' is-right';
        else if (i === q.pick) cls += ' is-wrong';
      }
      const aud = q.aud ? '<span class="mzopt__aud" style="--p:' + q.aud[i] + '%"><i></i><b>' + q.aud[i] + '٪</b></span>' : '';
      return '<button class="' + cls + '" data-act="mz-pick" data-i="' + i + '"' + (q.phase !== 'ask' || q.hide.indexOf(i) > -1 ? ' disabled' : '') + ' aria-pressed="' + (q.pick === i) + '">' +
        '<span class="mzopt__k">' + letters[i] + '</span>' +
        '<span class="mzopt__t">' + esc(o.v) + '</span>' +
        '<span class="mzopt__mark">' + (q.phase === 'right' && i === q.ai ? ICON('check') : q.phase === 'wrong' && i === q.pick ? ICON('minus') : '') + '</span>' +
        aud + '</button>';
    }).join('');

    const lifeline = (key, icon, label) => '<button class="mzlife' + (g.used[key] ? ' is-used' : '') + '" data-act="mz-' + key + '" type="button"' + (g.used[key] || q.phase !== 'ask' ? ' disabled' : '') + '>' + ICON(icon) + '<span>' + label + '</span></button>';

    const phone = q.ph ? '<div class="mzmsg"><span class="mzmsg__by">' + ICON('phone') + ' صديقك ' + esc(q.ph.by) + ':</span><p>' + esc(q.ph.line) + '</p></div>' : '';
    const audNote = q.aud ? '<div class="mzmsg mzmsg--aud"><span class="mzmsg__by">' + ICON('crowd') + ' رأي الجمهور:</span><p>الأعمدة فوق كل اختيار — النسبة مش مضمونة تكون صح.</p></div>' : '';

    return '<div class="mzhead">' +
        '<span class="mzchip" style="--c:' + cat + '">' + esc(q.c) + '</span>' +
        '<span class="mzchip mzchip--lv">سؤال ' + num(lv) + ' من ' + num(MZ_TOTAL) + '</span>' +
        '<span class="mzchip mzchip--money">' + ICON('money') + ' ' + mzMoney(val) + '</span>' +
      '</div>' +
      '<div class="mzprog"><i style="width:' + Math.round(((lv - 1) / MZ_TOTAL) * 100) + '%"></i></div>' +
      '<div class="mzq">' + esc(q.t) + '</div>' +
      '<div class="mzopts' + (q.opts.length === 2 ? ' mzopts--two' : '') + '">' + opts + '</div>' +
      audNote + phone +
      '<div class="mzlifelines">' +
        lifeline('f', 'fifty', '٥٠:٥٠') +
        lifeline('a', 'crowd', 'اسأل الجمهور') +
        lifeline('p', 'phone', 'اتصال بصديق') +
        lifeline('s', 'swap', 'بدّل السؤال') +
      '</div>' +
      '<div class="mzactions">' +
        (q.phase === 'ask'
          ? '<button class="btn btn--primary btn--lg" data-act="mz-ok"' + (q.pick == null ? ' disabled' : '') + '>' + ICON('check') + ' إجابة نهائية</button>' +
            '<button class="btn btn--ghost" data-act="mz-take">' + ICON('wallet') + ' ' + (g.correct ? 'انسحب بـ ' + mzMoney(MZ_LADDER[g.correct - 1]) : 'انسحاب') + '</button>'
          : '<span class="mzphase">' + (q.phase === 'right' ? 'إجابة صحيحة، مبروك!' : 'الإجابة غلط…') + '</span>') +
      '</div>';
  }

  function mzChequeHTML() {
    const g = MZ.g || {};
    const today = new Date().toISOString().slice(0, 10);
    return '<section class="wrap mzwin">' +
      '<div class="mzwin__top"><span class="chip chip--live">' + ICON('crown') + ' فوز بالمليون</span></div>' +
      '<h1 class="mzwin__title">مبروك! أنت كسبت <span class="grad">مليون جنيه</span></h1>' +
      '<div class="mzwinstats">' +
        '<span class="chip">' + ICON('check') + ' ٤٠ إجابة صح</span>' +
        '<span class="chip">' + ICON('money') + ' ١,٠٠٠,٠٠٠ جنيه</span>' +
        '<span class="chip">' + ICON('crown') + ' ' + (myStats().wins > 1 ? 'فوز رقم ' + num(myStats().wins) : 'أول فوز ليك') + '</span>' +
      '</div>' +
      '<p class="lead">الشيك جاهز باسمك. اكتب الاسم والتاريخ اللي تحبهم، ونزّل الصورة وشاركها مع الشلة.</p>' +
      '<div class="mzcheque"><canvas id="mzCheque" width="1400" height="700" role="img" aria-label="شيك مليون جنيه باسم اللاعب"></canvas></div>' +
      '<div class="mzform" role="group" aria-label="بيانات الشيك">' +
        '<label class="field" for="mzName"><span>' + ICON('idcard') + ' الاسم على الشيك</span>' +
          '<input id="mzName" name="player" type="text" inputmode="text" autocomplete="off" autocapitalize="words" spellcheck="false" maxlength="40" placeholder="اكتب اسمك هنا" value="' + esc(MZ.name || '') + '"></label>' +
        '<label class="field" for="mzDate"><span>' + ICON('clock') + ' التاريخ</span>' +
          '<input id="mzDate" name="d" type="date" autocomplete="off" value="' + today + '"></label>' +
      '</div>' +
      '<p class="hint">بيانات الشيك بتتكتب على الصورة بس — مش بتتبعت لأي سيرفر ومحتاجة تسجيل.</p>' +
      '<div class="mzactions mzactions--center">' +
        '<button class="btn btn--primary btn--lg" data-act="mz-dl" type="button">' + ICON('download') + ' نزّل الشيك PNG</button>' +
        '<button class="btn btn--ghost" data-act="mz-share" type="button">' + ICON('share') + ' شارك الفوز</button>' +
      '</div>' +
      '<div class="mzshare-apps">' +
        '<span class="mzshare-apps__t">ابعت الفوز على التطبيقات:</span>' +
        '<div class="mzshare-apps__row">' + mzShareButtons() + '</div>' +
      '</div>' +
      '<div class="mzactions mzactions--center">' +
        '<button class="btn btn--ghost" data-act="mz-again" type="button">' + ICON('refresh') + ' العب تاني</button>' +
      '</div>' +
      '<p class="hint">الشيك ده صورة تذكارية للجائزة — مش شيك بنكي حقيقي. ' + num(g.correct || MZ_TOTAL) + ' إجابة صح من ' + num(MZ_TOTAL) + '.</p>' +
      adSlot() +
    '</section>';
  }

  function mzEndHTML(kind) {
    const g = MZ.g || {};
    const won = kind === 'out';
    const amt = g.amount || 0;
    const title = won ? 'انسحبت بـ ' + mzMoney(amt) : 'خسرت هذه الجولة';
    const sub = won
      ? 'قرار ذكي — فلوس مضمونة وخرجت قبل ما تقع. المبلغ اللي خدته هو قيمة آخر مستوى عدّيته (' + num(g.correct) + ' إجابة صح).'
      : (amt > 0
        ? 'إجابتك غلط، بس شبكة الأمان نجّتك — بتاخد ' + mzMoney(amt) + ' قيمة أعلى مستوى أمان وصلته.'
        : 'إجابتك غلط ومكسبتش حاجة هذه المرة. جرّب تاني، البنك كبير والأسئلة بتتغير كل جولة.');
    return '<section class="wrap mzend">' +
      '<div class="mzend__badge ' + (won ? 'is-win' : 'is-lose') + '">' + ICON(won ? 'wallet' : 'minus') + '</div>' +
      '<h1 class="mzend__title">' + title + '</h1>' +
      '<p class="lead">' + sub + '</p>' +
      '<div class="mzend__stats">' +
        '<div class="stat"><b>' + num(g.correct || 0) + '</b><span>إجابة صحيحة</span></div>' +
        '<div class="stat"><b>' + mzMoney(amt) + '</b><span>' + (won ? 'المبلغ المسحوب' : 'المبلغ المكتسب') + '</span></div>' +
        '<div class="stat"><b>' + num(myStats().best) + '</b><span>أفضل نتيجة ليك</span></div>' +
      '</div>' +
      '<div class="mzactions mzactions--center">' +
        '<button class="btn btn--primary btn--lg" data-act="mz-again" type="button">' + ICON('refresh') + ' جولة جديدة</button>' +
        '<button class="btn btn--ghost" data-act="mz-share" type="button">' + ICON('share') + ' تحدى صحابك</button>' +
        '<a class="btn btn--ghost" href="#/million/rules">' + ICON('book') + ' القواعد</a>' +
      '</div>' +
      '<div class="mzshare-apps">' +
        '<span class="mzshare-apps__t">ابعت التحدي على:</span>' +
        '<div class="mzshare-apps__row">' + mzShareButtons() + '</div>' +
      '</div>' + adSlot() +
    '</section>';
  }

  function mzLobbyHTML() {
    const n = MBANK.length;
    const byLv = [1, 2, 3, 4].map((l) => MBANK.filter((q) => q.l === l).length);
    return '<section class="wrap mzhero">' +
      '<div class="mzhero__badge"><span class="chip chip--live">' + ICON('crown') + ' اللعبة الرسمية</span></div>' +
      '<h1 class="mzhero__title">من سيربح <span class="grad">المليون؟</span></h1>' +
      '<p class="mzhero__sub">٤٠ سؤال من السهل للصعب، مليون جنيه في الآخر، و٤ وسائل مساعدة. مفيش مؤقت — خد وقتك وفكّر.</p>' +
      '<div class="hero__cta">' +
        '<button class="btn btn--primary btn--lg" data-act="mz-start" type="button">' + ICON('play') + ' ابدأ اللعب</button>' +
        '<a class="btn btn--ghost btn--lg" href="#/million/rules">' + ICON('book') + ' القواعد</a>' +
      '</div>' +
      (AUTH.user
          ? '<p class="mzhero__note">' + ICON('check') + ' سجّلت دخولك باسم ' + esc(AUTH.user.name) + ' — اسمك هيظهر على الشيك تلقائيًا.</p>'
          : '<p class="mzhero__note">' + ICON('idcard') + ' التسجيل بالإيميل أو جوجل بيحفظ جولاتك وإحصائياتك. <a href="#/auth" data-nav="auth">سجّل دخول</a></p>') +
      '<div class="mzhero__stats">' +
        '<div class="stat"><b>' + num(n) + '</b><span>سؤال في البنك</span></div>' +
        '<div class="stat"><b>' + num(MZ_TOTAL) + '</b><span>مستوى للجائزة</span></div>' +
        '<div class="stat"><b>' + num(myStats().wins) + '</b><span>مرات فوزك</span></div>' +
      '</div>' +
      '<div class="mzrules">' +
        '<div class="mzrule">' + ICON('trophy') + '<b>٤٠ مستوى</b><span>من ١٠٠ جنيه لحد مليون جنيه.</span></div>' +
        '<div class="mzrule">' + ICON('fifty') + '<b>٤ وسائل مساعدة</b><span>٥٠:٥٠، الجمهور، صديق، وبدّل السؤال — كل واحدة مرة.</span></div>' +
        '<div class="mzrule">' + ICON('wallet') + '<b>شبكة أمان</b><span>مستويات ٥ و١٥ و٢٥ و٣٥ مضمونة لو غلطت.</span></div>' +
        '<div class="mzrule">' + ICON('crown') + '<b>شيك باسمك</b><span>لو كسبت، شيك مليون جنيه جاهز للتحميل.</span></div>' +
      '</div>' +
      '<div class="mzbands">' +
        '<div class="mzband"><i style="--c:#a3e635"></i><b>سهل</b><span>' + num(byLv[0]) + ' سؤال</span></div>' +
        '<div class="mzband"><i style="--c:#22d3ee"></i><b>متوسط</b><span>' + num(byLv[1]) + ' سؤال</span></div>' +
        '<div class="mzband"><i style="--c:#ffb03a"></i><b>صعب</b><span>' + num(byLv[2]) + ' سؤال</span></div>' +
        '<div class="mzband"><i style="--c:#ff2d92"></i><b>صعب جدًا</b><span>' + num(byLv[3]) + ' سؤال</span></div>' +
      '</div>' +
      '<div class="mzhero__art mzhero__art--small"><img referrerpolicy="no-referrer" src="https://i.ibb.co/Fb4HLGSN/million-light.png" alt="مسرح المسابقة وشيك المليون" width="1279" height="709" loading="lazy"></div>' +
      '<p class="hint">كل جولة بتسحب ١٠ أسئلة من كل مستوى بشكل عشوائي — يعني كل لاعب بيقابل أسئلة مختلفة.</p>' +
      adSlot() +
    '</section>';
  }

  function mzRulesHTML() {
    const rows = MZ_LADDER.map((v, i) => '<li><span>' + num(i + 1) + '</span><b>' + num(v) + '</b>' + (MZ_SAFE.indexOf(i + 1) > -1 ? '<i>أمان</i>' : '') + '</li>').join('');
    return '<section class="wrap page">' +
      '<span class="eyebrow">إزاي تلعب</span>' +
      '<h1 class="page__title">قواعد «من سيربح المليون»</h1>' +
      '<div class="rulesbox">' +
        '<h2>الجولة</h2><p>٤٠ سؤال متتالية من السهل للصعب. كل سؤال صح بتطلع لمستوى أعلى، ولحد ما توصل للمليون.</p>' +
        '<h2>مفيش مؤقت</h2><p>خد وقتك في التفكير — الضغط كله في الاختيار نفسه.</p>' +
        '<h2>الانسحاب</h2><p>تقدر تنسحب في أي لحظة وتاخد مبلغ آخر مستوى صح عدّيته.</p>' +
        '<h2>الخسارة</h2><p>لو غلطت، بتاخد مبلغ أعلى مستوى أمان وصلته (٥، ١٥، ٢٥، ٣٥). لو ما وصلتش لأي مستوى أمان، بتاخد صفر.</p>' +
        '<h2>وسائل المساعدة</h2><p>٥٠:٥٠ يشيل إجابتين غلط. اسأل الجمهور يوريك نسبة التصويت (بتقل دقتها في الأسئلة الصعبة). اتصال بصديق يديك رأيه (مش مضمون). بدّل السؤال يجيب سؤال تاني بنفس المستوى.</p>' +
        '<h2>الشيك</h2><p>لو وصلت للمليون، بيتولّد شيك باسمك وتاريخ تختاره، وتنزّله صورة PNG.</p>' +
      '</div>' +
      '<h2 class="page__title" style="font-size:24px">سلّم الجوائز</h2>' +
      '<ol class="ladderlist">' + rows + '</ol>' +
      '<div class="mzactions mzactions--center"><a class="btn btn--primary btn--lg" href="#/million">' + ICON('play') + ' يلا نبدأ</a></div>' +
    '</section>';
  }

  function viewMillion(r) {
    if (r && r.arg === 'rules') return mzRulesHTML();
    const g = MZ.g;
    if (MZ.pending && AUTH.user && !g) {
      /* المستخدم كان داس «ابدأ» قبل الدخول — نبدأ له على طول */
      MZ.pending = false;
      setTimeout(() => { if (AUTH.user && !MZ.g) mzStart(MZ.name || ''); }, 30);
    }
    if (!g || !g.deck || !g.q) return mzLobbyHTML();
    if (g.stage === 'win') { setTimeout(mzDrawCheque, 0); return mzChequeHTML(); }
    if (g.stage === 'out' || g.stage === 'lose') return mzEndHTML(g.stage);

    /* لو الجولة قديمة جدًا، نظّفها */
    if (g.started && Date.now() - g.started > 1000 * 60 * 60 * 12) {
      MZ.g = null; LS.del('mz_game'); return mzLobbyHTML();
    }
    return '<section class="wrap mz">' +
      '<div class="mzgrid">' +
        '<div class="mzmain">' +
          '<div class="mzplayer"><span class="mzplayer__n">' + esc(MZ.name || 'لاعب') + '</span>' +
            '<span class="mzplayer__m">مكسبك المضمون: <b>' + mzMoney(mzSafe(g.correct)) + '</b> · لو غلطت بتاخده</span></div>' +
          mzQuestionHTML(g, g.q) +
        '</div>' +
        mzLadderHTML(g) +
      '</div>' +
      adSlot() +
    '</section>';
  }

  function mzDownload() {
    const cv = document.getElementById('mzCheque');
    if (!cv) return;
    const name = ((document.getElementById('mzName') || {}).value || MZ.name || 'شيك').trim();
    try {
      const url = cv.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cheque-million-' + name.replace(/[\\/:*?"<>|]/g, '-') + '.png';
      document.body.appendChild(a); a.click(); a.remove();
      toast('اتنزّل الشيك — بص على التنزيلات');
      SFX.win();
    } catch (e) { toast('مش قادر أنزّل الصورة هنا — جرّب من المتصفح'); }
  }

  /* ==========================================================
     11) الإقلاع
     ========================================================== */
  /* الصور الخارجية من i.ibb.co — الروابط الجديدة بدل الملفات المحلية المكسورة */
  function brokenImageGuard() {
    document.addEventListener('error', (ev) => {
      const img = ev.target;
      if (img && img.tagName === 'IMG') {
        if (img.dataset.broken) return;
        img.dataset.broken = '1';
        img.classList.add('is-broken');
        // لو الصورة الأساسية i.ibb.co فشلت، جرّب مرة تانية بدون referrer أو اخفيها بلطف
        const src = img.getAttribute('src') || '';
        if (src.includes('i.ibb.co') && !img.dataset.retried) {
          img.dataset.retried = '1';
          // بعض متصفحات تمنع ibb بسبب referrer — جرّب بدون باراميتر
          setTimeout(() => { img.src = src; }, 400);
          return;
        }
        // إخفاء مكسور بشكل جميل: نحط placeholder بسيط
        if (!img.closest('.art__box')) {
          img.style.opacity = '0.35';
          img.style.filter = 'grayscale(0.8) blur(1px)';
        }
      }
    }, true);
  }

  function syncChrome() {
    const b = $('#btnSound');
    if (b) {
      const on = !!store.settings.sound;
      b.innerHTML = ICON(on ? 'sound' : 'mute');
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    const sh = $('#btnShare');
    if (sh) sh.innerHTML = ICON('share');
    const brand = $('#brand');
    if (brand) brand.innerHTML = LOGO_LOCKUP(window.innerWidth < 520 ? 34 : 38);
    const fl = $('#footerLogo');
    if (fl) fl.innerHTML = LOGO_MARK(30) + '<span>من سيربح المليون؟</span>';
    $$('.tabbar [data-ico]').forEach((i) => { i.innerHTML = ICON(i.dataset.ico); });
    if (typeof renderUserBox === 'function') renderUserBox();
  }

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const t = e.target;
    if (!t || !t.id) return;
    if (t.id === 'auName' || t.id === 'auEmail' || t.id === 'auPass') {
      e.preventDefault();
      const r = parse();
      if (r.name !== 'auth') return;
      if (r.params.tab === 'signup') doSignup(); else doLogin();
    }
  });

  /* قفل القائمة عند الضغط برّه */
  document.addEventListener('click', (e) => {
    const menu = document.getElementById('userMenu');
    if (!menu || !menu.classList.contains('is-open')) return;
    if (e.target.closest('#userChip')) return;
    menu.classList.remove('is-open');
  });

  document.addEventListener('input', (e) => {
    if (e.target && (e.target.id === 'mzName' || e.target.id === 'mzDate')) mzDrawCheque();
  });

  document.addEventListener('DOMContentLoaded', () => {
    syncChrome();
    AUTH.init().then(() => {
      renderUserBox();
      render(false);
      /* التشخيص الحقيقي في الـ console بس — الزائر بيشوف رسالة عامة */
      if (!SB.ready) {
        try { console.warn('[service] unavailable:', SB.error, SB_CONFIG && SB_CONFIG.url); } catch (e) {}
        toast('الخدمة مش متاحة دلوقتي — حدّث الصفحة أو جرّب بعد شوية', 4200);
      }
    }).catch(() => {});
    AUTH.on(() => renderUserBox());
    $('#btnSound').addEventListener('click', () => {
      const on = SFX.toggle();
      syncChrome();
      toast(on ? 'الصوت شغال' : 'الصوت مقفول', 1200);
    });
    $('#btnShare').addEventListener('click', () => {
      nativeShare({ text: 'العب «من سيربح المليون؟» — ' + num(MZ_TOTAL) + ' سؤال من السهل للصعب لحد مليون جنيه.\n' + APP_URL() })
        .then((r) => { if (r === 'copied') toast('اتنسخ الرابط — ابعته على واتساب أو أي تطبيق'); });
    });
    brokenImageGuard();
    window.addEventListener('hashchange', () => render(true));
    render(false);
  });
})();
