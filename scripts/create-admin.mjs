import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createAdmin() {
  console.log('Creating admin user...')
  const { data, error } = await supabase.auth.signUp({
    email: 'adminsjck.mart@gmail.com',
    password: 'sjck1985',
  })

  if (error) {
    console.error('Error creating user:', error.message)
    process.exit(1)
  }

  console.log('Admin user created successfully!', data.user?.id)
}

createAdmin()
