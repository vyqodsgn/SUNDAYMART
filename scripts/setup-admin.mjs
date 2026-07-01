#!/usr/bin/env node
/**
 * setup-admin.mjs
 * 
 * Creates the single administrator account in Supabase Auth.
 * Run this ONCE after setting up the project:
 *   node scripts/setup-admin.mjs
 * 
 * Requirements:
 *   - NEXT_PUBLIC_SUPABASE_URL must be set in .env.local
 *   - SUPABASE_SERVICE_ROLE_KEY must be set in .env.local
 * 
 * The SUPABASE_SERVICE_ROLE_KEY can be found in your Supabase Dashboard:
 *   Project Settings → API → Service Role (secret key)
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env.local manually
function loadEnv() {
  try {
    const envPath = resolve(__dirname, '../.env.local')
    const content = readFileSync(envPath, 'utf-8')
    const env = {}
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const idx = trimmed.indexOf('=')
      if (idx === -1) continue
      const key = trimmed.slice(0, idx).trim()
      const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
      env[key] = value
    }
    return env
  } catch (e) {
    console.error('Could not read .env.local:', e.message)
    process.exit(1)
  }
}

const env = loadEnv()
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL) {
  console.error('ERROR: NEXT_PUBLIC_SUPABASE_URL is not set in .env.local')
  process.exit(1)
}

if (!SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY is not set in .env.local')
  console.error('Add it from: Supabase Dashboard → Project Settings → API → service_role key')
  process.exit(1)
}

// Admin credentials
const ADMIN_EMAIL = 'adminsjck@sjck.internal'
const ADMIN_PASSWORD = 'sjck1985'

async function createAdmin() {
  console.log('\n🔐 SUNDAYMART Admin Account Setup\n')
  console.log('Supabase URL:', SUPABASE_URL)
  console.log('Admin email (internal):', ADMIN_EMAIL)
  console.log('Admin username (public):', 'adminsjck')
  console.log('')

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  // Check if admin already exists
  const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) {
    console.error('Failed to list users:', listError.message)
    process.exit(1)
  }

  const existingAdmin = existingUsers?.users?.find(u => u.email === ADMIN_EMAIL)
  if (existingAdmin) {
    console.log('✅ Administrator account already exists.')
    console.log('   Email:', existingAdmin.email)
    console.log('   Created at:', new Date(existingAdmin.created_at).toLocaleString())
    console.log('\n   To reset the password, run this script with --reset flag:')
    console.log('   node scripts/setup-admin.mjs --reset')
    
    if (process.argv.includes('--reset')) {
      console.log('\n🔄 Resetting admin password to default...')
      const { error: resetError } = await supabase.auth.admin.updateUserById(
        existingAdmin.id,
        { password: ADMIN_PASSWORD }
      )
      if (resetError) {
        console.error('Failed to reset password:', resetError.message)
        process.exit(1)
      }
      console.log('✅ Password reset to default: sjck1985')
      console.log('   Login at /admin/login with username: adminsjck')
    }
    return
  }

  // Create the admin user
  const { data, error } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true, // Skip email confirmation
    user_metadata: {
      username: 'adminsjck',
      role: 'administrator'
    }
  })

  if (error) {
    console.error('❌ Failed to create admin account:', error.message)
    process.exit(1)
  }

  console.log('✅ Administrator account created successfully!')
  console.log('')
  console.log('┌─────────────────────────────────────────┐')
  console.log('│         ADMIN LOGIN CREDENTIALS          │')
  console.log('├─────────────────────────────────────────┤')
  console.log('│  Username  : adminsjck                   │')
  console.log('│  Password  : sjck1985                    │')
  console.log('│  Login URL : /admin/login                │')
  console.log('└─────────────────────────────────────────┘')
  console.log('')
  console.log('⚠️  IMPORTANT: Change the password on first login!')
  console.log('   You will be prompted automatically after logging in.\n')
}

createAdmin().catch(err => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
