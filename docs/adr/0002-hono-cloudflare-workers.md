# ADR-0002: Hono على Cloudflare Workers

**الحالة:** مقبول

## السياق
نحتاج خادماً رخيصاً، سريع الاستجابة من اليمن، بسيط النشر، TypeScript.

## القرار
Hono كإطار HTTP على Cloudflare Workers، مع D1/KV/R2/Cron/Browser Rendering من نفس المنصة.

## البدائل المرفوضة
- **Next.js API routes / Vercel**: أثقل، Vercel أغلى، لا SQLite edge مدمج.
- **Fastify على VPS**: صيانة خادم، نسخ احتياطي يدوي، نقطة فشل واحدة.
- **Supabase فقط (بدون خادم)**: RLS قوية لكن منطق العمل (الترحيل، المتوسط المتحرك، آلات الحالة) يحتاج طبقة خادم حقيقية؛ Edge Functions الخاصة بهم أقل نضجاً.

## العواقب
- (+) تكلفة شبه صفر لحجم المخابز. Edge قريب. نشر بأمر واحد.
- (+) Hono يعمل على Node أيضاً → لو انتقلنا لـ VPS لاحقاً، الكود نفسه.
- (−) حدود Workers: 30s CPU للطلب (كافٍ)، لا WebSocket بدون Durable Objects (نستخدم SSE).
