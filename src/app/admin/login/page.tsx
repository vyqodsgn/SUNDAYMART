'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, User, Loader2, ArrowLeft, ShoppingBag, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/context/ToastContext'
import { createClient } from '@/lib/supabase/client'
import { useApp } from '@/context/AppContext'

// The internal Supabase Auth email mapped from the admin username.
// This is NOT displayed anywhere — it's the email used for Supabase Auth.
const ADMIN_EMAIL = 'adminsjck@sjck.internal'

export default function AdminLoginPage() {
  const router = useRouter()
  const { showToast, dismissToast } = useToast()
  const { settings } = useApp()
  // Form states
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Password change modal states
  const [showChangeModal, setShowChangeModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user && user.email === ADMIN_EMAIL) {
          router.push('/admin/dashboard')
        } else if (user) {
          // Logged in user is NOT the admin — sign them out and show error
          await supabase.auth.signOut()
        }
      } catch (err) {
        // Silently ignore auth check errors
        console.error('Auth check error:', err)
      }
    }
    checkUser()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim() || !password.trim()) {
      showToast('Please enter both username and password', 'error')
      return
    }

    // Only the administrator username is allowed
    if (username.trim().toLowerCase() !== 'adminsjck') {
      showToast('Invalid credentials. Access denied.', 'error')
      return
    }
    setLoading(true)
    const loadingId = showToast('Signing in', 'loading')

    try {
      const supabase = createClient()
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: password.trim()
      })

      dismissToast(loadingId)

      if (error) {
        throw error
      }

      // Dismiss loading toast
      dismissToast(loadingToastId)
      setLoading(false)

      // Check if this is first-time login with default password
      const isDefaultPassword = password.trim() === 'sjck1985'
      
      if (isDefaultPassword) {
        // Prompt to change password
        setShowChangeModal(true)
        showToast('Login successful! Please change your default password.', 'success')
        return
      }

      showToast('Login successful! Redirecting', 'success')
      router.push('/admin/dashboard')
      router.refresh()
    } catch (err: any) {
      dismissToast(loadingId)
      console.error('Authentication error:', err)
      dismissToast(loadingToastId)
      showToast(err.message || 'Invalid credentials. Please try again.', 'error')
      setLoading(false)
    }  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newPassword.trim() || newPassword.length < 8) {
      showToast('New password must be at least 8 characters', 'error')
      return
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error')
      return
    }
    if (newPassword === 'sjck1985') {
      showToast('Please choose a different password from the default', 'error')
      return
    }

    setChangingPassword(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: newPassword })

      if (error) throw error

      showToast('Password changed successfully! Redirecting to dashboard...', 'success')
      setShowChangeModal(false)
      setTimeout(() => {
        router.push('/admin/dashboard')
        router.refresh()
      }, 1500)
    } catch (err: any) {
      showToast(err.message || 'Failed to update password', 'error')
    } finally {
      setChangingPassword(false)
    }
  }

  const handleSkipPasswordChange = () => {
    setShowChangeModal(false)
    showToast('Password change skipped. You will be prompted again next login.', 'info')
    setTimeout(() => {
      router.push('/admin/dashboard')
      router.refresh()
    }, 1000)
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
              Restricted access. Authorised personnel only.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4" id="admin-login-form">
            {/* Username Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Username</label>
              <div className="relative">
                <input
                  id="admin-username"
                  type="text"
                  placeholder="Enter admin username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  autoComplete="username"
                  className="w-full text-sm px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950/50 focus:outline-none focus:ring-1 focus:ring-blue-500 pl-10 disabled:opacity-50"
                />
                <User className="w-4.5 h-4.5 absolute left-3.5 top-3.5 text-zinc-400" />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Password</label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
                  className="w-full text-sm px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950/50 focus:outline-none focus:ring-1 focus:ring-blue-500 pl-10 pr-10 disabled:opacity-50"
                />
                <Lock className="w-4.5 h-4.5 absolute left-3.5 top-3.5 text-zinc-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="admin-login-submit"
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

        {/* Security note */}
        <p className="text-center text-[10px] text-zinc-400 font-light">
          This portal is for authorised administrators only. All access attempts are logged.
        </p>
      </div>

      {/* Password Change Modal */}
      {showChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-zinc-200/50 dark:border-white/10 shadow-2xl bg-white dark:bg-zinc-950">
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg tracking-tight">Change Default Password</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  For security, please update your password before continuing.
                </p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4" id="password-change-form">
              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">New Password</label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Minimum 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={changingPassword}
                    autoComplete="new-password"
                    className="w-full text-sm px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950/50 focus:outline-none focus:ring-1 focus:ring-blue-500 pr-10 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                    tabIndex={-1}
                    aria-label="Toggle new password visibility"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Confirm New Password</label>
                <input
                  id="confirm-password"
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={changingPassword}
                  autoComplete="new-password"
                  className="w-full text-sm px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950/50 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  id="change-password-submit"
                  type="submit"
                  disabled={changingPassword}
                  className="flex-1 py-3 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  Update Password
                </button>
                <button
                  type="button"
                  onClick={handleSkipPasswordChange}
                  disabled={changingPassword}
                  className="px-5 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-semibold text-zinc-500 hover:text-black dark:hover:text-white hover:border-zinc-400 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Skip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
