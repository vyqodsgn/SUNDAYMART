-- ============================================================
-- Admin Account Creation for SUNDAYMART
-- Run this in: Supabase Dashboard → SQL Editor
--
-- Username : adminsjck
-- Password : sjck1985  (change on first login!)
-- ============================================================

-- Step 1: Insert admin into auth.users (only if not already there)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  aud,
  role,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
)
SELECT
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'adminsjck@sjck.internal',
  crypt('sjck1985', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"username":"adminsjck","role":"administrator"}'::jsonb,
  now(),
  now(),
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  ''
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'adminsjck@sjck.internal'
);

-- Step 2: Insert the identity record (needed for email/password login)
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  created_at,
  updated_at,
  provider_id
)
SELECT
  gen_random_uuid(),
  u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email),
  'email',
  now(),
  now(),
  u.id::text
FROM auth.users u
WHERE u.email = 'adminsjck@sjck.internal'
  AND NOT EXISTS (
    SELECT 1 FROM auth.identities i
    WHERE i.user_id = u.id AND i.provider = 'email'
  );
