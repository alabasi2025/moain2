# ADR-0004: Tailwind 4 + Radix Primitives + IBM Plex Sans Arabic/Cairo + Lucide

**الحالة:** مقبول

## السياق
"فخامة" لا تعني زخرفة — تعني اتساقاً، هدوءاً، تفاصيل مضبوطة، حركة طبيعية. العربية RTL أولاً. وصولية إلزامية (48dp، تباين، قارئ شاشة).

## القرار
- **Tailwind CSS 4** مع CSS variables كـ design tokens (`04-design/00-design-system.md`). Logical properties (`ps-`, `me-`, `start-`) لا `left/right`.
- **Radix Primitives** (Dialog, Sheet, Popover, Tabs, Switch, Toast...) headless → وصولية مضمونة، شكلنا الخاص فوقها.
- **IBM Plex Sans Arabic** للواجهة، **Cairo** للعناوين الكبيرة والطباعة.
- **Lucide** للأيقونات (outline، 24px، RTL-flip تلقائي للأسهم).
- حركة: **Motion (framer-motion)** للانتقالات بين الشاشات والـ sheets فقط؛ CSS transitions للباقي.

## البدائل المرفوضة
- **MUI / Ant Design**: شكل مفروض يبدو "قالباً"، RTL غير مثالي، حجم كبير.
- **shadcn/ui**: ممتاز وهو فعلياً Radix + Tailwind — **نستخدم نفس الفلسفة** مع tokens خاصة بنا؛ يمكن نسخ مكوناته كنقطة بداية.
- **Tajawal/Noto Kufi**: جيدة؛ IBM Plex Arabic أوضح للأرقام والجداول الكثيفة.

## العواقب
- (+) حجم صغير، RTL أصلي، وصولية، هوية خاصة.
- (−) بناء المكونات المركبة (DataTable, Stepper, NumberPad) علينا — مقبول ومرغوب.
