import { Elysia } from "elysia";
import { randomBytes } from "crypto";
import { sessions, rateLimitStore } from "../../../lib/storage";
import { securityMiddleware } from "../../../middleware/security";

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 10;

const app = new Elysia()
  .use(securityMiddleware)
  .get("/api/register/start", ({ request, cookie, set }) => {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();

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

    const sessionId = crypto.randomUUID();
    const challenge = randomBytes(32);
    const userId = Buffer.from("user-id");

    sessions[sessionId] = { challenge, userId, expires: now + 600_000 };

    cookie.sessionId.set({
      value: sessionId,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 600,
    });

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

export const GET = (context) => app.handle(context.request);
