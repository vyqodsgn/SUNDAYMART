# Deployment Guide

This guide details the steps required to deploy the **Church Sunday Marketplace** web application to **Vercel** and configure the database on **Supabase**.

---

## 📦 Step 1: Set Up Supabase

### 1. Execute SQL Migration
1. Go to the [Supabase Dashboard](https://supabase.com/dashboard) and open your project.
2. Navigate to the **SQL Editor** from the left-hand menu.
3. Click **New Query** to open a blank editor.
4. Copy the entire contents of the migration file `supabase/migrations/20260701000000_init.sql` from your project folder.
5. Paste the code into the SQL editor and click **Run**.
6. Verify that all tables, RLS policies, indexes, and storage buckets (`product-images`) have been created successfully.

### 2. Disable Self-Signup (Highly Recommended)
Since this site is managed by **only ONE administrator**, you should disable public registrations to prevent unauthorized sign-ups:
1. In the Supabase Dashboard, navigate to **Authentication > Providers > Email**.
2. Toggle **Disable self-signup** to **ON**.
3. Click **Save**.

### 3. Create the Administrator Account
Since public registrations are now disabled, create the administrator account manually:
1. Go to **Authentication > Users** in the Supabase Dashboard.
2. Click **Add User** and select **Create User**.
3. Enter the administrator's email and password.
4. Toggle **Auto-confirm User** to **ON** so they can log in immediately without verifying email.
5. Click **Create User**.
6. Use these credentials to log in at the `/admin/login` page of your deployed website.

---

## ⚡ Step 2: Deploy to Vercel

The application is built using Next.js 15, which is natively supported and optimized for deployment on Vercel.

### Option A: Using the Vercel Git Integration
1. Push your project code to a git repository (GitHub, GitLab, or Bitbucket).
2. Go to the [Vercel Dashboard](https://vercel.com).
3. Click **Add New** and select **Project**.
4. Import your repository.
5. Under **Environment Variables**, add the variables:
   * `NEXT_PUBLIC_SUPABASE_URL`: `https://pccqnxtrgughlmraguvl.supabase.co`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `sb_publishable_5mtK3qsWRyRIGZZJ_heXug_kABLKPW-`
6. Click **Deploy**. Vercel will build and deploy your application.

### Option B: Using the Vercel CLI
If you want to deploy directly from your local terminal:
1. Install the Vercel CLI globally (requires Node.js):
   ```bash
   npm install -g vercel
   ```
2. Run the login command and follow the instructions:
   ```bash
   vercel login
   ```
3. Link and deploy your project by running:
   ```bash
   vercel
   ```
4. Configure environment variables in the Vercel dashboard as described in Option A.
5. Promote the build to production:
   ```bash
   vercel --prod
   ```

---

## 🔍 Step 3: Verification Check list

Once the site is deployed, verify that the features are working correctly:
1. **Public browse:** Visit the `/products` page and verify that the preloaded seed items (Banana Chips, Spicy Chilli Powder, etc.) are visible.
2. **Submit listing:** Go to the `/submit` page. Choose a preset product from the searchable dropdown, complete the seller details, upload an image, and submit. Verify you are redirected back to the products catalog. The item should **not** yet appear in the browse catalog since its status is 'pending'.
3. **Admin Login:** Visit `/admin/login` and log in with your created admin email/password.
4. **Approve Submission:** Go to the **Products Queue** tab. Find your pending submission, check its details, and click the checkmark button to approve it.
5. **Verify Live Visibility:** Log out or return to the public `/products` list. The newly approved item and its image should now be visible publicly!
6. **Mark Sold Out:** As admin, toggle the item's status to **Sold**. Verify it displays a "Sold Out" badge on the public site and that the seller phone number can no longer be viewed.
