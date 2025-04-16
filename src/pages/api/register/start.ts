// src/pages/api/register/start.ts

import { Elysia } from "elysia";
import { randomBytes } from "crypto";
import { rateLimitStore } from "../../../lib/storage";
import { securityMiddleware } from "../../../middleware/security";
import { getXataClient } from "../../../xata";

export const prerender = false;

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 10;

const app = new Elysia()
  .use(securityMiddleware)
  .get("/api/register/start", async ({ request, cookie, set }) => {
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
    const challenge = randomBytes(32).toString("base64");
    const userId = crypto.randomUUID();

    // ✅ Store session in Xata
    const db = getXataClient();
    await db.passkey_sessions.create({
      sessionId,
      challenge,
      userId,
      expiresAt: new Date(now + 600_000), // 10 mins
      createdAt: new Date(),
    });

    // 🍪 Set sessionId in cookies (dynamic secure flag)
    const isProduction = process.env.NODE_ENV === "production";

    cookie.sessionId.set({
      value: sessionId,
      httpOnly: true,
      secure: isProduction, // ✅ only secure in production
      sameSite: "strict",
      maxAge: 600,
    });

    // ✅ Return challenge options
    return {
      challenge,
      rp: {
        name: "MyApp",
        id: "localhost", // required by WebAuthn
      },
      user: {
        id: Buffer.from(userId),
        name: "user@example.com",
        displayName: "User Name",
      },
      pubKeyCredParams: [{ type: "public-key", alg: -7 }],
      timeout: 60000,
      attestation: "none",
    };
  });

export const GET = (context) => app.handle(context.request);
