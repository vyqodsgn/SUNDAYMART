'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Mail, Loader2, ArrowLeft, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/context/ToastContext'
import { createClient } from '@/lib/supabase/client'
import { useApp } from '@/context/AppContext'

export default function AdminLoginPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const { settings } = useApp()

  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/admin/dashboard')
      }
    }
    checkUser()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim() || !password.trim()) {
      showToast('Please enter both email and password', 'error')
      return
    }

    setLoading(true)
    const loadToastId = showToast('Signing in...', 'loading')

    try {
      const supabase = createClient()
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      })

      if (error) {
        throw error
      }

      showToast('Login successful! Redirecting...', 'success')
      router.push('/admin/dashboard')
      router.refresh()
    } catch (err: any) {
      console.error('Authentication error:', err)
      showToast(err.message || 'Invalid credentials. Please try again.', 'error')
      setLoading(false)
    }
  }

  return (
    <div className="flex-grow flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 relative min-h-[80vh]">
      {/* Background gradients */}
      <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10 space-y-6">
        
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-black dark:hover:text-white transition-colors font-medium"
        >
          <ArrowLeft className="w-4.5 h-4.5" /> Back to public site
        </Link>

        {/* Form Container */}
        <div className="glass-panel p-8 rounded-3xl border border-zinc-200/50 dark:border-white/5 shadow-2xl bg-white/40 dark:bg-zinc-950/20">
          
          {/* Logo and header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-tr from-[#0071e3] to-[#2997ff] flex items-center justify-center text-white mb-4 shadow shadow-blue-500/10">
              <ShoppingBag className="w-6 h-6 text-white m-auto" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">Admin Portal</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-light">
              Log in to manage the {settings.church_name} Sunday Mart catalog, submissions, and homepage settings.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="admin@church.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full text-sm px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950/50 focus:outline-none focus:ring-1 focus:ring-blue-500 pl-10 disabled:opacity-50"
                />
                <Mail className="w-4.5 h-4.5 absolute left-3.5 top-3.5 text-zinc-400" />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full text-sm px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950/50 focus:outline-none focus:ring-1 focus:ring-blue-500 pl-10 disabled:opacity-50"
                />
                <Lock className="w-4.5 h-4.5 absolute left-3.5 top-3.5 text-zinc-400" />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-sm transition-all shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}
