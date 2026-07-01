# Environment Variables Guide

This application uses Supabase for database storage, authentication, and product image hosting. All configurations are located in the `.env.local` file at the root of the project.

---

## 📋 Required Variables

Configure the following variables in your `.env.local` file:

| Variable Name | Required | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | `https://pccqnxtrgughlmraguvl.supabase.co` | The API URL of your Supabase project. Found in **Settings > API** in the Supabase console. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | `sb_publishable_5mtK3qsWRyRIGZZJ_heXug_kABLKPW-` | The public publishable/anonymous API key. Safe to expose client-side. Found in **Settings > API** in the Supabase console. |

---

## 🔒 Security Best Practices

### 1. Key Formatting
Supabase has upgraded its token structures:
* **Publishable Keys (`sb_publishable_...`):** These are public tokens used client-side. They are subject to database Row Level Security (RLS) policies.
* **Secret Keys (`sb_secret_...`):** Formerly `service_role` keys. These bypass RLS and grant full administrative root access to the database. **NEVER** expose secret keys in client-side code, `.env.local` (unless securely executed in server-only components), or public repositories.

### 2. Version Control Protection
The `.env.local` file contains configuration details. Ensure it is included in your `.gitignore` file so it is never pushed to GitHub:
```text
# local env files
.env*.local
```

### 3. Server Actions & SSR Compatibility
This project uses `@supabase/ssr` to configure clients dynamically based on request contexts:
* Public routes use `NEXT_PUBLIC_` prefixed keys for browser client builds.
* Authenticated admin dashboard screens execute in secure server-side environments, verifying session cookies in Next.js middleware and API boundaries.
