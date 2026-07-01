-- ============================================================
-- Admin Account Creation for SUNDAYMART
-- 
-- Run this in: Supabase Dashboard → SQL Editor
--
-- Username: adminsjck
-- Password: sjck1985  (change on first login!)
-- Internal email: adminsjck@sjck.internal
-- ============================================================

DO $$
DECLARE
  v_user_id uuid;
BEGIN

  -- Check if admin user already exists
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'adminsjck@sjck.internal';

  IF v_user_id IS NOT NULL THEN
    RAISE NOTICE 'Admin user already exists (id: %)', v_user_id;
  ELSE
    -- Generate a new UUID for the user
    v_user_id := gen_random_uuid();

    -- Insert into auth.users
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
    ) VALUES (
      v_user_id,
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
    );

    -- Insert the identity record (required for email provider login)
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      created_at,
      updated_at,
      provider_id
    ) VALUES (
      gen_random_uuid(),
      v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', 'adminsjck@sjck.internal'),
      'email',
      now(),
      now(),
      v_user_id::text
    );

    RAISE NOTICE 'Admin user created successfully (id: %)', v_user_id;
    RAISE NOTICE 'Login at /admin/login with username: adminsjck, password: sjck1985';
  END IF;

END $$;
