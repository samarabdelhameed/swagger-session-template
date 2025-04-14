# 🔐 Swagger Session Template

A starter template for session-based authentication using **Astro + Elysia + Bun**.  
Includes secure cookie handling, in-memory session management, rate limiting, and passkey challenge setup — perfect for building WebAuthn-ready flows.

---

## 🚀 Features

- 🔐 **Session Management** ✅
- 🍪 **Cookie Handling** (secure, HTTP-only) ✅
- 🛡️ **Rate Limiting** (IP-based) ✅
- ⚙️ **Elysia Middleware** (HTTPS + CSRF protection) ✅
- 🔑 **Passkey Challenge Generation** (via `/api/register/start`) ✅
- ✅ **Credential Saving** (via `/api/register/finish`)
- 🔁 Fully **tested in browser + Postman**

---

## 📊 Project Completion Status

| Feature                             | Status   |
|------------------------------------|----------|
| Astro + Bun Setup                  | ✅ Done  |
| TailwindCSS + Styling              | ✅ Done  |
| Middleware (`security.ts`)         | ✅ Done  |
| Session Storage (`storage.ts`)     | ✅ Done  |
| GET `/api/register/start`          | ✅ Done  |
| POST `/api/register/finish`        | ✅ Done  |
| Cookie Writing & Validation        | ✅ Done  |
| Basic UI                           | ✅ Done  |
| DevTools & Postman Testing         | ✅ Passed ✅ |

**Testing Notes:**
- ✅ Cookies are correctly set (HttpOnly, secure, sameSite=strict)
- ✅ Sessions stored and deleted successfully
- ✅ PublicKeyCredential challenge returned properly
- ✅ Finish endpoint saves credentials after verifying session

---

## 🧭 Project Structure

```
swagger-session/
├── public/                    # Static assets
├── src/
│   ├── components/            # UI components (coming soon)
│   ├── layouts/               # Optional layout
│   ├── lib/
│   │   └── storage.ts         # sessions, rateLimitStore, credentials
│   ├── middleware/
│   │   └── security.ts        # CSRF + HTTPS protection
│   ├── pages/
│   │   ├── api/
│   │   │   ├── register/
│   │   │   │   ├── start.ts   # GET: generate challenge
│   │   │   │   └── finish.ts  # POST: validate and save credentials
│   │   └── index.astro        # Main UI
│   └── styles/                # Tailwind / custom styles
├── astro.config.mjs
├── bun.lockb
├── package.json
├── tsconfig.json
├── README.md
```

---

## 🧪 API Endpoints

### `GET /api/register/start`

- Sets a `sessionId` cookie
- Returns `challenge`, `rp`, and `user` details

### `POST /api/register/finish`

- Validates session from cookie
- Expects `credentialId` & `userId` in body
- Stores credential + deletes session

---

## ⚙️ Technologies Used

| Tool        | Purpose                      |
|-------------|------------------------------|
| **Astro**   | Project structure + UI       |
| **Elysia**  | REST API routes              |
| **Bun**     | Runtime & dev server         |
| **Tailwind**| Styling                      |
| **crypto**  | Challenge generation         |
| **cookie**  | Session handling             |
| **Postman** | API testing                  |

---

## 📌 Setup Instructions

```bash
bun install
bun run dev
```

Then open [http://localhost:4321](http://localhost:4321) in your browser.

---

## 📈 Next Steps

- 🔐 Integrate real **Passkey/WebAuthn** (client-side JS)
- 🧾 Add `POST /api/login` endpoint (to verify credentials)
- 🧠 Add persistent DB (SQLite, PostgreSQL, etc.)
- 🎨 Improve UI with React/Svelte (optional)
