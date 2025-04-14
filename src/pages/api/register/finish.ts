// src/pages/api/register/finish.ts

export const prerender = false;

import { Elysia } from 'elysia';
import { sessions, credentials } from '../../../lib/storage';

const app = new Elysia();

app.post('/api/register/finish', async ({ request, cookie, set }) => {
  const sessionId = cookie.sessionId?.value;

  // 🔐 تأكد من وجود session صالحة
  const session = sessionId && sessions[sessionId];
  if (!session) {
    set.status = 401;
    return { error: 'Unauthorized. No session found.' };
  }

  try {
    const body = await request.json();
    const { credentialId, userId } = body;

    // ⛔ التحقق من صحة المدخلات
    if (typeof credentialId !== 'string' || typeof userId !== 'string') {
      set.status = 400;
      return { error: 'Missing or invalid credentialId or userId.' };
    }

    // 📝 تخزين بيانات الـ credential
    credentials[credentialId] = {
      userId,
      challenge: session.challenge.toString('base64'),
      registeredAt: Date.now(),
    };

    // 🧹 إزالة الجلسة بعد الاستخدام
    delete sessions[sessionId];

    return {
      success: true,
      message: '✅ Credential registered successfully',
    };
  } catch (err) {
    set.status = 500;
    return { error: '❌ Internal server error.' };
  }
});

// 🚀 ربط Elysia بالـ Astro handler
export const POST = (context) => app.handle(context.request);
