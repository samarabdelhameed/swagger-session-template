# Swagger Session Template
This is a starting point for session-based authentication.
swagger-session/
├── public/                    ← لو فيه صور أو ملفات ستاتيكية
├── src/
│   ├── components/            ← مكونات الواجهة زي زرار التسجيل وغيره (لاحقًا)
│   ├── layouts/               ← Layout عام (لو حابة تضيفي Header/Footer لاحقًا)
│   ├── lib/
│   │   └── storage.ts         ← فيه: sessions, rateLimitStore, credentials
│   ├── middleware/
│   │   └── security.ts        ← حماية: HTTPS + CSRF + Cookie logic
│   ├── pages/
│   │   ├── [...slugs].ts      ← فيه logic للـ API: مثل `/api/register/start`
│   │   ├── index.astro        ← الواجهة الرئيسية (UI)
│   │   └── markdown-page.md   ← صفحة Markdown تجريبية
│   └── styles/                ← CSS أو Tailwind Styles
├── astro.config.mjs           ← إعدادات Astro
├── bun.lockb                  ← Lockfile لـ Bun
├── package.json               ← الديبندنسيز والسكريبتات
├── tsconfig.json              ← TypeScript config
├── README.md                  ← وصف المشروع
