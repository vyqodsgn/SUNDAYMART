# Church Sunday Marketplace

A premium, production-ready full-stack web application designed for a **Church Sunday Shopping / Selling Event**. Church members can submit their home-grown crops, organic spices, homemade snacks, and traditional delicacies for sale. A single administrator manages the catalog, approves or rejects submissions, broadcasts announcements, and edits event date countdown parameters.

---

## 🚀 Key Features

* **Apple-Inspired Aesthetics:** Frosted glassmorphic cards, backdrop filters, sleek gradient text, modern typography, and native dark/light mode toggle.
* **Typo-Free Predefined Presets:** Searchable autocomplete dropdown on the submission form that automatically fills category name, package size options, and default prices for common church items (Chilli Powder, Chips, Pappadam, etc.).
* **Manual Input Fallback:** A dedicated "Other Product" manual entry option for unique items not listed in presets.
* **Client-Side Canvas Compression:** High-performance HTML5 Canvas utility that resizes and compresses submitted images to WebP format before uploading, enforcing the 5MB size limit and keeping pages fast.
* **Secure Phone Revelations:** Frosted dial buttons requiring visitor click interaction before displaying phone numbers, shielding sellers from automated phone-scraping spam bots. Toggling status to "Sold Out" immediately disables contact.
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
│   │   │   ├── settings/     # Event date & church info configurations
│   │   │   └── login/        # Glassmorphic admin sign-in form
│   │   ├── products/
│   │   │   ├── [id]/         # Product details page with secure contact details
│   │   │   └── page.tsx      # Searchable, filterable browse catalog page
│   │   ├── about/            # Marketplace guide
│   │   ├── contact/          # Feedbacks form
│   │   ├── faq/              # Collapsible accordions
│   │   ├── privacy/          # Public privacy policy
│   │   ├── globals.css       # Tailwind v4 directives & Apple glass templates
│   │   ├── layout.tsx        # Global layouts & Providers wrapper
│   │   └── page.tsx          # Homepage with countdown, announcements, and featured products
│   ├── components/           # Reusable UI widgets
│   │   ├── Navbar.tsx        # Responsive sticky glass header
│   │   ├── Footer.tsx        # Dynamic contact and quick link footer
│   │   └── AdminLayout.tsx   # Secured sidebar navigation wrapper
│   ├── context/              # Context Providers (Theme, Toast, App Settings)
│   └── lib/                  # Helper utilities (Supabase, presets data)
├── supabase/
│   └── migrations/           # Self-contained SQL migration script
├── .env.local                # Environment configurations (Supabase Keys)
└── tsconfig.json             # TypeScript compiler settings
```

---

## ⚙️ Local Setup Instructions

### 1. Prerequisites
Ensure you have **Node.js 18.17.0** or later installed.

### 2. Install Dependencies
Run the following command in the project root to install Next.js, Supabase, Tailwind, Lucide, and animation dependencies:
```bash
npm install
```

### 3. Setup Environment Variables
Create a file named `.env.local` in the root directory and configure the variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://pccqnxtrgughlmraguvl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_5mtK3qsWRyRIGZZJ_heXug_kABLKPW-
```

### 4. Database Schema Setup
Copy the contents of `supabase/migrations/20260701000000_init.sql` and run them in your **Supabase Dashboard SQL Editor**. This will automatically provision:
* All database tables (`products`, `categories`, `announcements`, `settings`, `event_details`, `catalog_products`, `contacts`).
* Performance database indexes.
* Row Level Security (RLS) policies.
* The `product-images` storage bucket with upload policies.
* Seed category names and predefined product catalog dropdown lists.

### 5. Running the App Locally
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to inspect the application.

---

## 🔒 Security & Roles

* **Public User:** Has no authentication credentials. Restricted by RLS policies to `SELECT` only approved/sold items, insert pending submissions, insert contact messages, and read category presets.
* **Parish Administrator:** Authenticates via Supabase Auth. Bypasses RLS constraints on all tables allowing full CRUD operations, csv exports, announcements broadcasting, and countdown configurations.
