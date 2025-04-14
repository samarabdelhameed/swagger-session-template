// src/pages/api/register/start.ts

import { Elysia } from "elysia";
import { randomBytes } from "crypto";
import { sessions, rateLimitStore } from "../../../lib/storage";
import { securityMiddleware } from "../../../middleware/security";

// ✅ حل مشكلة Astro
export const prerender = false;

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 10;

const app = new Elysia()
  .use(securityMiddleware)
  .get("/api/register/start", ({ request, cookie, set }) => {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();

    // 📌 Rate limiting check
    if (!rateLimitStore[ip]) {
      rateLimitStore[ip] = { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS };
    } else {
      if (now > rateLimitStore[ip].resetTime) {
        rateLimitStore[ip] = {
          count: 1,
          resetTime: now + RATE_LIMIT_WINDOW_MS,
        };
      } else if (rateLimitStore[ip].count >= RATE_LIMIT_MAX) {
        set.status = 429;
        return "Too Many Requests";
      } else {
        rateLimitStore[ip].count += 1;
      }
    }

    // 🔐 Generate session + challenge
    const sessionId = crypto.randomUUID();
    const challenge = randomBytes(32);
    const userId = Buffer.from("user-id");

    // ⏱️ Store session in-memory
    sessions[sessionId] = {
      challenge,
      userId,
      expires: now + 600_000, // 10 mins
    };

    // ✅ Debug logs
    console.log("📦 New session created:", sessionId);
    console.log("🧠 All sessions now:", Object.keys(sessions));

    // 🍪 Set sessionId in cookies
    cookie.sessionId.set({
      value: sessionId,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 600,
    });

    // ✅ Return challenge options
    return {
      challenge: challenge.toString("base64"),
      rp: { name: "MyApp" },
      user: {
        id: userId,
        name: "user@example.com",
        displayName: "User Name",
      },
      pubKeyCredParams: [{ type: "public-key", alg: -7 }],
      timeout: 60000,
      attestation: "none",
    };
  });

// Export GET handler to be used by Astro
export const GET = (context) => app.handle(context.request);
