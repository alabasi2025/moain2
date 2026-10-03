# محرك الطباعة والتصدير

> الطباعة ليست ميزة ثانوية — هي **المخرج الفيزيائي الوحيد** الذي يراه العمال والمشرفون. يجب أن تبدو كوثيقة رسمية من شركة محترمة، لا كصفحة ويب مطبوعة.

## 1. المبدأ: HTML/CSS هو مصدر الحقيقة للمستند

كل نموذج مطبوع = مكوّن React يُصيَّر إلى HTML ثابت + CSS طباعة مخصص. **نفس الـ HTML** يُستخدم لـ:
1. المعاينة على الشاشة (`/print` route بخلفية رمادية وورقة بيضاء).
2. `window.print()` من المتصفح → طابعة أو "حفظ PDF" (M1 — مجاني، فوري).
3. Browser Rendering API على الخادم → PDF (M2 — للإرسال والأرشفة والجوال).

لماذا لا مكتبات PDF (pdfmake, react-pdf, jsPDF)؟ لأن **تشكيل العربية والـ RTL والكشيدة والأرقام** تحتاج محرك نص كامل. المتصفح يملكه؛ المكتبات تحاكيه بجودة متفاوتة (مشاكل موثقة مع Cairo وIBM Plex Arabic).

## 2. النماذج (Templates)

| # | النموذج | الاستخدام | الحجم | الاتجاه |
|---|---|---|---|---|
| T1 | **أمر إنتاج — مجمّع** | ورقة المعمل الرئيسية: كل الأصناف × الفروع × الإجمالي | A4 | عمودي (≤ 4 فروع) / أفقي (> 4) |
| T2 | **أمر إنتاج — حسب القسم** | ورقة لكل تصنيف (معجنات، كيك...) للمشرف المختص | A4 | عمودي |
| T3 | **أمر إنتاج — حسب الفرع** (ورقة تجهيز) | ورقة لكل فرع: أصنافه وكمياته + خانات التحقق والتوقيع | A4 / A5 | عمودي |
| T4 | **إيصال تسليم** | عند التسليم: ما سُلِّم فعلياً + توقيع المُسلِّم والمستلم | A5 / حراري 80mm | عمودي |
| T5 | **سند توريد** | من المورد للمخزن | A5 | عمودي |
| T6 | **سند صرف** | من المخزن للساحب | A5 | عمودي |
| T7 | **تقرير حالة المخزون** | الأعمدة الـ 11 لفترة | A4 أفقي | |
| T8 | **ورقة جرد** | فارغة للعدّ اليدوي، أو بالفروقات بعد الاعتماد | A4 | عمودي |
| T9 | **كشف حركة مادة** | ledger مادة واحدة لفترة | A4 | عمودي |
| T10 | **ملصق فرع** (اختياري) | ملصق صغير يُلصق على صندوق التوصيل: الفرع + QR | 100×50mm | |

## 3. تشريح المستند (Anatomy) — مشترك لكل النماذج

```
┌─────────────────────────────────────────────────────────────┐
│ [شعار]  اسم الشركة                     رقم المستند: PO-2026-00123 │  ← Header (يتكرر كل صفحة)
│         العنوان · الهاتف                التاريخ: الجمعة 4 أكتوبر 2026 │
├─────────────────────────────────────────────────────────────┤
│                    أمر إنتاج — الطلبية اليومية                  │  ← Title band (لون العلامة)
│         المعمل: المعمل المركزي   ·   تاريخ التسليم: 4/10/2026     │
├─────────────────────────────────────────────────────────────┤
│ ┌─ معلومات ─────────────────────────────────────────────┐   │
│ │ المسؤول: ________________  الوقت المتوقع: ____:____     │   │  ← Meta box (حقول يدوية أو مملوءة)
│ │ عدد الفروع: 3   عدد الأصناف: 23   إجمالي الوحدات: 1,240  │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ ▌المعجنات                                                   │  ← Section header (شريط ملوّن بلون التصنيف)
│ ┌────┬──────────────┬──────┬───────┬───────┬───────┬───────┐ │
│ │ #  │ الصنف         │الوحدة│ الستين │ حدة   │ شميلة │الإجمالي│ │  ← Table (thead يتكرر)
│ ├────┼──────────────┼──────┼───────┼───────┼───────┼───────┤ │
│ │ 1  │ كرواسون زبدة  │ حبة  │  40   │  50   │  30   │ **120**│ │
│ │    │ ↳ حدة: بدون سمسم                                    │ │  ← Line note (مائل، رمادي)
│ │ 2  │ فطيرة جبن     │ حبة  │  25   │  —    │  20   │ **45** │ │
│ ├────┴──────────────┴──────┼───────┼───────┼───────┼───────┤ │
│ │ إجمالي المعجنات          │  65   │  50   │  50   │ **165**│ │  ← Section total
│ └──────────────────────────┴───────┴───────┴───────┴───────┘ │
│                                                             │
│ ▌الكيك ...                                                  │
│                                                             │
│ ┌─ ملاحظات الفروع ──────────────────────────────────────┐   │
│ │ • الستين: التسليم قبل 7 صباحاً لو سمحتم                │   │  ← Order notes box
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │
│ │ مسؤول الإنتاج│ │ مشرف الجودة  │ │ مسؤول التسليم│          │  ← Signature blocks
│ │              │ │              │ │              │          │
│ │ الاسم: _____ │ │ الاسم: _____ │ │ الاسم: _____ │          │
│ │ التوقيع:     │ │ التوقيع:     │ │ التوقيع:     │          │
│ └──────────────┘ └──────────────┘ └──────────────┘          │
├─────────────────────────────────────────────────────────────┤
│ [QR]  طُبع بواسطة: أحمد · 3/10/2026 11:42 م · نسخة 1    صفحة 1 من 2 │  ← Footer (يتكرر)
│       نص التذييل من الإعدادات                                │
└─────────────────────────────────────────────────────────────┘
```

## 4. CSS الطباعة — القواعد التقنية

```css
/* styles/print.css — يُحمَّل في مسارات /print فقط */
@page {
  size: A4 portrait;
  margin: 14mm 12mm 16mm 12mm;
}
@page landscape { size: A4 landscape; }

:root {
  --print-brand: var(--tenant-primary, #8B5E3C);
  --print-ink: #111;
  --print-muted: #666;
  --print-rule: #bbb;
  --print-zebra: #f6f6f6;
}

html { direction: rtl; }
body {
  font-family: 'IBM Plex Sans Arabic', 'Cairo', system-ui, sans-serif;
  font-size: 10.5pt; line-height: 1.45; color: var(--print-ink);
  -webkit-print-color-adjust: exact; print-color-adjust: exact;   /* الألوان تُطبع */
  font-variant-numeric: tabular-nums;                              /* الأرقام تصطف */
}
body.font-large { font-size: 13pt; }                                /* وضع العمال */

.doc-header, .doc-footer { position: fixed; inset-inline: 0; }     /* يتكرر كل صفحة */
.doc-header { top: 0; height: 22mm; }
.doc-footer { bottom: 0; height: 12mm; font-size: 8pt; color: var(--print-muted); }
.doc-body { margin-top: 24mm; margin-bottom: 14mm; }

table { width: 100%; border-collapse: collapse; }
thead { display: table-header-group; }                              /* رأس الجدول يتكرر */
tfoot { display: table-footer-group; }
tr, .signature-block, .meta-box { break-inside: avoid; }
.section { break-inside: avoid-page; }                              /* القسم القصير لا ينقسم */
.section-header { break-after: avoid; }                             /* العنوان لا يُترك وحيداً */
th { background: var(--print-brand); color: #fff; font-weight: 600; padding: 2.2mm 2mm; }
td { padding: 1.8mm 2mm; border-bottom: 0.3pt solid var(--print-rule); }
tbody tr:nth-child(even) td { background: var(--print-zebra); }
td.num { text-align: center; font-weight: 600; }
td.total, tr.total td { font-weight: 700; border-top: 1pt solid var(--print-ink); }
.note { font-style: italic; color: var(--print-muted); font-size: 0.9em; }

.signature-block { display: inline-block; width: 30%; height: 28mm; border: 0.5pt solid var(--print-rule); border-radius: 2mm; padding: 2mm 3mm; vertical-align: top; }

/* صفحة لكل فرع في T3 */
.page-per-branch { break-after: page; }
.page-per-branch:last-child { break-after: auto; }

/* إخفاء كل عناصر الواجهة */
.no-print, nav, button, .app-shell { display: none !important; }
```

### قرارات
- **الخط**: IBM Plex Sans Arabic 10.5pt للجدول (كثافة + وضوح)، Cairo للعناوين. وضع "خط كبير" 13pt للعمال.
- **الأرقام**: `tabular-nums` إلزامي. العربية الغربية افتراضياً. فواصل الآلاف.
- **الألوان**: شريط العلامة + رؤوس الجداول بلون المستأجر؛ الباقي أبيض/رمادي. تطبع جيداً بالأبيض والأسود (التباين محسوب).
- **لا ألوان خلفية كبيرة** (توفير حبر؛ المخابز تطبع كثيراً).
- **التكرار**: header/footer بـ `position: fixed` (يعمل في Chrome/Edge print و Browser Rendering). `thead` يتكرر.
- **QR** في التذييل: يفتح `/production-orders/:id` (للمعمل) أو `/receive/:token` (للفرع في T3/T4). يُولَّد SVG محلياً (مكتبة `qrcode` ~10KB).
- **"طُبع بواسطة/متى/نسخة"**: كل طباعة مُتتبَّعة — تمنع "أي نسخة هي الصحيحة؟".
- **رقم الإصدار (snapshot version)**: إن قُفل الأمر ثم أُضيف استثناء → "نسخة 2" تظهر بوضوح + شارة "مُحدَّث".

## 5. التنفيذ

### M1: طباعة من المتصفح
```
/print/production-orders/:id?layout=consolidated&font=normal
→ React route بدون app shell، يحمّل print.css
→ يعرض معاينة (ورقة على خلفية رمادية) + شريط علوي `no-print`: [طباعة] [PDF] [تخطيط ▾] [خط كبير ☐] [إغلاق]
→ "طباعة" = window.print()
→ "PDF" (M1) = نفس window.print() مع تلميح "اختر حفظ كـ PDF"
```
- على الجوال: المعاينة تعمل، والطباعة عبر "مشاركة → طباعة" (iOS) أو Print service (Android). الجودة جيدة لكن الكمبيوتر أفضل → نرشد المستخدم.

### M2: PDF على الخادم
```
GET /api/v1/production-orders/:id/pdf?layout=...
→ Worker: يبني نفس HTML (SSR بـ renderToStaticMarkup) + inline CSS + fonts base64 (subset ~120KB)
→ Browser Rendering API: page.setContent(html); page.pdf({ format:'A4', printBackground:true, displayHeaderFooter:false })
→ يحفظ في R2 `pdf/{tenant}/{type}/{number}-v{version}.pdf` (كاش — نفس المدخلات = نفس الملف)
→ يُرجع الملف أو رابطاً موقّعاً (TTL 1 ساعة)
```
- يُفعّل: "إرسال عبر واتساب" (رابط)، "إرسال بالبريد"، أرشفة تلقائية لكل أمر مقفل.
- التكلفة: Browser Rendering ~ مجاني حتى حدود معقولة؛ > 1000/يوم → خدمة Puppeteer مستقلة.

## 6. تصدير Excel (ExcelJS)

### المبدأ
كل جدول/تقرير في النظام له زر "Excel". الملف **ليس** نسخة خام — هو تقرير مُنسَّق يمكن للعميل أن يرسله لمحاسبه مباشرة.

### القالب الموحد
```ts
// reporting/excel/base-workbook.ts
async function buildWorkbook(opts: { tenant: Branding; title: string; subtitle?: string; generatedBy: string; sheets: SheetSpec[] }) {
  const wb = new ExcelJS.Workbook();
  wb.creator = opts.tenant.company_name; wb.created = new Date();

  for (const spec of opts.sheets) {
    const ws = wb.addWorksheet(spec.name, { views: [{ rightToLeft: true, state: 'frozen', ySplit: spec.headerRow }] });

    // 1. الشعار (إن وُجد) — صورة في A1:B4
    if (opts.tenant.logo_url) { const img = wb.addImage({ buffer: await fetchLogo(), extension: 'png' }); ws.addImage(img, 'A1:B4'); }

    // 2. العنوان
    ws.mergeCells('C1:H2'); ws.getCell('C1').value = opts.title;
    ws.getCell('C1').font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF' + brand } };
    ws.getCell('C3').value = opts.subtitle;          // "الفترة: 1/10/2026 – 31/10/2026"
    ws.getCell('C4').value = `أُنشئ بواسطة ${opts.generatedBy} · ${formatDateTime(now, tz)}`;

    // 3. رأس الجدول (الصف 6)
    const headerRow = ws.getRow(6);
    spec.columns.forEach((c, i) => {
      const cell = headerRow.getCell(i + 1);
      cell.value = c.label_ar; cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + brand } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = thinBorder;
      ws.getColumn(i + 1).width = c.width ?? 14;
    });

    // 4. البيانات
    spec.rows.forEach((r, ri) => {
      const row = ws.getRow(7 + ri);
      spec.columns.forEach((c, ci) => {
        const cell = row.getCell(ci + 1);
        cell.value = r[c.key];
        cell.numFmt = c.type === 'money' ? '#,##0.00' : c.type === 'qty' ? '#,##0.##' : c.type === 'date' ? 'yyyy-mm-dd' : undefined;
        cell.alignment = { horizontal: c.type === 'text' ? 'right' : 'center' };
        cell.border = thinBorder;
        if (ri % 2) cell.fill = zebraFill;
      });
    });

    // 5. صف الإجماليات — صيغ حقيقية (لا قيم ثابتة) حتى يتحقق المحاسب
    const totalRow = ws.getRow(7 + spec.rows.length);
    totalRow.getCell(1).value = 'الإجمالي';
    spec.columns.forEach((c, ci) => {
      if (c.sum) { const col = colLetter(ci + 1); totalRow.getCell(ci + 1).value = { formula: `SUM(${col}7:${col}${6 + spec.rows.length})` }; }
      totalRow.getCell(ci + 1).font = { bold: true }; totalRow.getCell(ci + 1).border = thickTopBorder;
    });

    // 6. فلتر تلقائي + طباعة
    ws.autoFilter = { from: { row: 6, column: 1 }, to: { row: 6, column: spec.columns.length } };
    ws.pageSetup = { orientation: spec.columns.length > 8 ? 'landscape' : 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0, printTitlesRow: '6:6' };
    ws.headerFooter.oddFooter = `&L${opts.tenant.company_name}&C${opts.title}&Rصفحة &P من &N`;
  }
  return wb.xlsx.writeBuffer();
}
```

### ما يميّز التصدير
- `rightToLeft: true` — الورقة تُفتح بالاتجاه الصحيح في Excel.
- تجميد رأس الجدول.
- **صيغ SUM حقيقية** — المحاسب يثق بها ويعدّلها.
- فلتر تلقائي.
- إعداد الطباعة جاهز (يناسب الصفحة، تكرار الرأس).
- الشعار والعنوان والفترة والمُولِّد.
- اسم الملف: `مُعين_حالة-المخزون_2026-10.xlsx` (عربي صالح).

### أين يعمل التصدير؟
- **M1**: في المتصفح (ExcelJS يعمل client-side، ~300KB lazy chunk). يُولَّد وينزل فوراً. لا حمل على الخادم.
- **M2**: على الخادم أيضاً (`/export.xlsx`) للتقارير الكبيرة والإرسال.

## 7. الاختبارات
- **بصرية**: Playwright يلتقط PDF لكل نموذج ببيانات ثابتة ويقارن بـ snapshot (فروق > 0.5% تفشل).
- **عربية**: نص يحتوي "لا"، تشكيل، أرقام مختلطة، أسماء طويلة → لا كسر، لا مربعات.
- **كثافة**: أمر إنتاج بـ 8 فروع × 60 صنفاً → أفقي، 3 صفحات، الرأس يتكرر.
- **Excel**: فتح الملف بـ ExcelJS reader والتحقق من `rightToLeft`, الصيغ, عدد الصفوف.
