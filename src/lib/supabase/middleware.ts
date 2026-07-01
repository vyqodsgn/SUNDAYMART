import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// The single administrator email. Must match what is registered in Supabase Auth.
const ADMIN_EMAIL = 'adminsjck@sjck.internal'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do NOT remove this. This refreshes the session if expired.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Protection logic for admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/settings')) {
    // Exclude the login page from authentication check
    if (pathname !== '/admin/login') {
      if (!user) {
        // Not logged in — redirect to login
        const url = request.nextUrl.clone()
        url.pathname = '/admin/login'
        return NextResponse.redirect(url)
      }

      // Logged in, but NOT the administrator — redirect to access denied
      if (user.email !== ADMIN_EMAIL) {
        const url = request.nextUrl.clone()
        url.pathname = '/access-denied'
        return NextResponse.redirect(url)
      }
    } else {
      // If the administrator is already logged in and tries to access /admin/login,
      // redirect to dashboard
      if (user && user.email === ADMIN_EMAIL) {
        const url = request.nextUrl.clone()
        url.pathname = '/admin/dashboard'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
