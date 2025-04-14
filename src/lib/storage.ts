// src/lib/storage.ts

// 📌 نوع بيانات الـ Session
type SessionData = {
    challenge: Buffer;
    userId: Buffer;
    expires: number;
  };
  
  // 📌 نوع بيانات الـ Credential
  type CredentialData = {
    userId: string;
    challenge: string;
    registeredAt: number;
  };
  
  // 📌 نوع بيانات الـ Rate Limiting
  type RateLimitData = {
    count: number;
    resetTime: number;
  };
  
  // ✅ تخزين الجلسات (Passkey registration)
  export const sessions: Record<string, SessionData> = {};
  
  // ✅ Rate limit لكل IP
  export const rateLimitStore: Record<string, RateLimitData> = {};
  
  // ✅ تخزين الـ Credentials بعد التسجيل
  export const credentials: Record<string, CredentialData> = {};
  