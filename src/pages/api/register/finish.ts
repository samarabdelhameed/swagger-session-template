// src/pages/api/register/finish.ts

export const prerender = false;

import { Elysia } from "elysia";
import { getXataClient } from "../../../xata";
import { securityMiddleware } from "../../../middleware/security";

const app = new Elysia().use(securityMiddleware);

app.post("/api/register/finish", async ({ request, cookie, set }) => {
  const sessionId = cookie.sessionId?.value;

  if (!sessionId) {
    set.status = 401;
    return { error: "No sessionId in cookie" };
  }

  const db = getXataClient();
  const sessionRecord = await db.passkey_sessions
    .filter({ sessionId })
    .getFirst();

  // 🔐 Check if session exists
  if (!sessionRecord) {
    set.status = 401;
    return { error: "Session not found or expired" };
  }

  try {
    const body = await request.json();
    const { credentialId, publicKey } = body;

    // ⛔ Validate input
    if (
      typeof credentialId !== "string" ||
      typeof publicKey !== "string"
    ) {
      set.status = 400;
      return {
        error: "Missing or invalid credentialId or publicKey.",
      };
    }

    // ✅ Store credential in users table
    const user = await db.users
      .filter({ xata_id: sessionRecord.userId })
      .getFirst();

    if (!user) {
      set.status = 404;
      return { error: "User not found for this session." };
    }

    await db.users.update(user.id, {
      credential_id: credentialId,
      public_key: publicKey,
      challenge: sessionRecord.challenge,
    });

    // 🧹 Delete session from Xata
    await db.passkey_sessions.delete(sessionRecord.id);

    return {
      success: true,
      message: "✅ Credential registered and user updated successfully.",
    };
  } catch (err) {
    console.error("❌ Error:", err);
    set.status = 500;
    return { error: "❌ Internal server error." };
  }
});

export const POST = (context) => app.handle(context.request);
