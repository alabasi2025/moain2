# ADR-0007: HTML→PDF للطباعة، ExcelJS للتصدير

**الحالة:** مقبول

## السياق
الطباعة مخرج أساسي. العربية تحتاج تشكيلاً صحيحاً وRTL. العميل يريد Excel أيضاً.

## القرار
- **PDF**: HTML/CSS (`@page`, `@media print`) → `window.print()` في M1 → Cloudflare Browser Rendering في M2. نفس القالب للشاشة والطباعة والـ PDF.
- **Excel**: ExcelJS (client-side في M1، server-side في M2) مع `rightToLeft`, تنسيق، شعار، صيغ SUM حقيقية.

## البدائل المرفوضة
- **pdfmake / pdfmake-rtl**: تشكيل عربي غير مثالي، تخطيط محدود.
- **@react-pdf/renderer**: مشاكل موثقة مع IBM Plex Arabic وCairo (ligatures).
- **jsPDF**: لا دعم عربي حقيقي بدون حيل.
- **SheetJS CE**: لا تنسيق في النسخة المجانية، RTL غير موثوق.

## العواقب
- (+) جودة عربية 100%، قالب واحد، معاينة حية مطابقة.
- (−) PDF على الخادم يحتاج Browser Rendering (حدود مجانية ثم تكلفة صغيرة).
- (−) ExcelJS ~300KB → lazy load عند الضغط على "تصدير" فقط.
