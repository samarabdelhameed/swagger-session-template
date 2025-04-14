// src/pages/api/register/finish.ts

// ✅ حل مشكلة Astro: لازم نمنع التوليد المسبق للصفحة (Static)
export const prerender = false;

import { Elysia } from 'elysia';
import { sessions, credentials } from '../../../lib/storage';

const app = new Elysia();

app.post('/api/register/finish', async ({ request, cookie, set }) => {
  const sessionId = cookie.sessionId?.value;

  // ❌ لو مفيش session
  if (!sessionId || !sessions[sessionId]) {
    set.status = 401;
    return { error: 'Unauthorized. No session found.' };
  }

  // ✅ جلب بيانات الـ session
  const session = sessions[sessionId];

  // 🧹 حذف الـ session بعد الاستخدام
  delete sessions[sessionId];

  // 📦 قراءة بيانات الـ credential من البودي
  const body = await request.json();
  const { credentialId, userId } = body;

  if (!credentialId || !userId) {
    set.status = 400;
    return { error: 'Missing credential data.' };
  }

  // 📝 حفظ الـ credential
  credentials[credentialId] = {
    userId,
    challenge: session.challenge.toString('base64'),
    registeredAt: Date.now(),
  };

  return { success: true, message: 'Credential registered successfully ✅' };
});

// 🚀 ربط Elysia بالـ route handler بتاع Astro
export const POST = (context) => app.handle(context.request);
