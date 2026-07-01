# Church Sunday Marketplace

A premium, production-ready full-stack web application designed for a **Church Sunday Shopping / Selling Event**. Church members can submit their home-grown crops, organic spices, homemade snacks, and traditional delicacies for sale. A single administrator manages the catalog, approves or rejects submissions, broadcasts announcements, and edits church branding and contact settings.

---

## 🚀 Key Features

* **Apple-Inspired Aesthetics:** Frosted glassmorphic cards, backdrop filters, sleek gradient text, modern typography, and native dark/light mode toggle.
* **Typo-Free Predefined Presets:** Searchable autocomplete dropdown on the submission form that automatically fills category name, package size options, and default prices for common church items (Chilli Powder, Chips, Pappadam, etc.).
* **Manual Input Fallback:** A dedicated "Other Product" manual entry option for unique items not listed in presets.
* **Client-Side Canvas Compression:** High-performance HTML5 Canvas utility that resizes and compresses submitted images to WebP format before uploading, enforcing the 5MB size limit and keeping pages fast.
* **Secure Phone Revelations:** Frosted dial buttons requiring visitor click interaction before displaying phone numbers, shielding sellers from automated phone-scraping spam bots.
* **Responsive Admin Panel:** Secure queue dashboard showing statistics cards, custom category SVG charts, recent activity grids, toggles for public submissions, inline listings CRUD, and full CSV exports.

---

## 🛠️ Technology Stack

* **Frontend:** Next.js 15 (App Router), React 19, TypeScript
* **Styling:** Tailwind CSS v4, Lucide Icons, Custom backdrop blurs
* **Backend Database:** Supabase PostgreSQL, Authentication, and Storage Buckets

---

## 📁 Folder Structure

```
SUNDAYMART/
├── src/
│   ├── app/                  # Next.js App Router (Routing and Pages)
│   │   ├── admin/
│   │   │   ├── dashboard/    # Admin Stats, SVGs, and controls
│   │   │   ├── products/     # Products management queue table & CSV exports
│   │   │   ├── categories/   # Categories CRUD list
│   │   │   ├── catalog/      # Preset catalog manager
│   │   │   ├── settings/     # Church branding & contact configurations
│   │   │   └── login/        # Glassmorphic admin sign-in form (username-based)
│   │   ├── access-denied/    # Shown to non-admin users who try to access /admin
│   │   ├── products/
│   │   │   ├── [id]/         # Product details page with secure contact details
│   │   │   └── page.tsx      # Searchable, filterable browse catalog page
│   │   ├── about/            # Marketplace guide
│   │   ├── contact/          # Feedbacks form
│   │   ├── faq/              # Collapsible accordions
│   │   ├── privacy/          # Public privacy policy
│   │   ├── globals.css       # Tailwind v4 directives & Apple glass templates
│   │   ├── layout.tsx        # Global layouts & Providers wrapper
│   │   └── page.tsx          # Homepage with announcements and featured products
│   ├── components/           # Reusable UI widgets
│   │   ├── Navbar.tsx        # Responsive sticky glass header
│   │   ├── Footer.tsx        # Dynamic contact and quick link footer
│   │   └── AdminLayout.tsx   # Secured sidebar navigation wrapper
│   ├── context/              # Context Providers (Theme, Toast, App Settings)
│   └── lib/                  # Helper utilities (Supabase, presets data)
├── supabase/
│   └── migrations/           # Self-contained SQL migration scripts
├── scripts/
│   └── setup-admin.mjs       # Script to create admin account (requires service key)
├── .env.local                # Environment configurations (Supabase Keys)
└── tsconfig.json             # TypeScript compiler settings
```

---

## ⚙️ Local Setup Instructions

### 1. Prerequisites
Ensure you have **Node.js 18.17.0** or later installed.

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a file named `.env.local` in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://pccqnxtrgughlmraguvl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_5mtK3qsWRyRIGZZJ_heXug_kABLKPW-
```

### 4. Database Schema Setup
Copy the contents of `supabase/migrations/20260701000000_init.sql` and run them in your **Supabase Dashboard SQL Editor**. This provisions all tables, RLS policies, indexes, and seed data.

### 5. Create Administrator Account

The admin account uses **Supabase Authentication** with a fixed internal email (`adminsjck@sjck.internal`). The login UI shows a **Username** field — no email is required from the admin.

**Option A — SQL Editor (Recommended):**
1. Open **Supabase Dashboard → SQL Editor**
2. Run the contents of `supabase/migrations/20260701100000_create_admin.sql`
3. This creates the admin user with email confirmation pre-approved.

**Option B — Node.js Script:**
1. Add your service role key to `.env.local`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
   *(Found at: Supabase Dashboard → Project Settings → API → service_role)*
2. Run:
   ```bash
   node scripts/setup-admin.mjs
   ```

**Initial Login Credentials:**
| Field    | Value      |
|----------|------------|
| Username | `adminsjck` |
| Password | `sjck1985`  |
| URL      | `/admin/login` |

> ⚠️ **You will be prompted to change the password on first login.**

### 6. Running the App Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## 🔒 Security & Admin Access

### How Admin Authentication Works

- The admin logs in with **username** `adminsjck`, which maps internally to the email `adminsjck@sjck.internal` in Supabase Auth.
- All `/admin` routes are protected at **two layers**:
  1. **Middleware** (`src/lib/supabase/middleware.ts`) — server-side, runs before every request
  2. **AdminLayout** (`src/components/AdminLayout.tsx`) — client-side, re-verifies on every page load
- Public users who navigate to `/admin/*` without a valid admin session are **redirected to `/admin/login`**.
- Any authenticated non-admin user is **redirected to `/access-denied`**.
- A logout button is available in the admin sidebar.
- Sessions are managed via Supabase Auth cookies (HTTP-only, secure).

### Changing the Administrator Password

**Method 1 — Via Admin Dashboard (Recommended):**
1. Log in to `/admin/login`
2. Navigate to **General Settings → Change Password** *(or change it directly after first-login prompt)*

**Method 2 — Via Supabase Dashboard:**
1. Open **Supabase Dashboard → Authentication → Users**
2. Find the user with email `adminsjck@sjck.internal`
3. Click ··· → **Reset Password** or **Send Reset Email**

**Method 3 — Reset to default via script:**
```bash
# First add SUPABASE_SERVICE_ROLE_KEY to .env.local, then:
node scripts/setup-admin.mjs --reset
```

### Changing the Administrator Username

The username is display-only (mapped to a fixed internal email). To change the display username:
1. Open `src/app/admin/login/page.tsx` and `src/lib/supabase/middleware.ts`
2. Update the `ADMIN_EMAIL` constant and the username check in `handleLogin`
3. Update `src/components/AdminLayout.tsx` — the `ADMIN_EMAIL` constant there too
4. Re-run the admin setup script to update the Supabase Auth user email

### Public User Roles

* **Public User:** No authentication credentials. RLS restricts to `SELECT` only approved/sold items, insert pending submissions, insert contact messages.
* **Parish Administrator:** Authenticates via Supabase Auth. Full CRUD on all tables.

---

## 🔧 Admin Panel Features

| Section | Description |
|---------|-------------|
| Overview Dashboard | Stats, revenue estimates, recent submissions, contact messages |
| Products Queue | Approve/reject/mark-sold submissions, inline editing, CSV export |
| Predefined Catalog | Manage product presets with default prices and sizes |
| Categories | CRUD list of product categories |
| Announcements | Broadcast scrolling announcement banners to homepage |
| General Settings | Church branding, contact info, social links |

---

## 🚫 Removing Admin Access

To permanently revoke admin access:
1. Open **Supabase Dashboard → Authentication → Users**
2. Delete the user with email `adminsjck@sjck.internal`
