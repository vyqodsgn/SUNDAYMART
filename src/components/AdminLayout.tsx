'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, ShoppingBag, FolderHeart, ListPlus, Settings, Volume2, LogOut, Loader2, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/context/ToastContext'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { showToast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        router.push('/admin/login')
      } else {
        setUser(user)
      }
      setLoading(false)
    }
    checkAuth()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    showToast('Signing out...', 'loading')
    const { error } = await supabase.auth.signOut()
    if (error) {
      showToast(error.message, 'error')
    } else {
      showToast('Logged out successfully', 'success')
      router.push('/')
      router.refresh()
    }
  }

  const menuItems = [
    { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products Queue', href: '/admin/products', icon: ShoppingBag },
    { name: 'Predefined Catalog', href: '/admin/catalog', icon: ListPlus },
    { name: 'Categories', href: '/admin/categories', icon: FolderHeart },
    { name: 'Announcements', href: '/admin/announcements', icon: Volume2 },
    { name: 'General Settings', href: '/admin/settings', icon: Settings },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          <span className="text-xs text-zinc-500 font-semibold tracking-wider uppercase">Verifying Admin Session...</span>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-zinc-50 dark:bg-black w-full text-zinc-800 dark:text-zinc-100 transition-colors">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 flex flex-col p-6 gap-6 md:h-screen sticky top-0">
        <div>
          <h2 className="font-bold text-xs uppercase tracking-widest text-[#0071e3] dark:text-[#2997ff]">Admin Control Panel</h2>
          <span className="text-[10px] text-zinc-400 block truncate mt-1">{user.email}</span>
        </div>

        <hr className="border-zinc-200 dark:border-zinc-900" />

        <nav className="flex flex-col gap-1 flex-grow">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? 'bg-blue-500/10 text-[#0071e3] dark:text-[#2997ff]'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <hr className="border-zinc-200 dark:border-zinc-900" />

        <div className="flex flex-col gap-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 flex-shrink-0" /> Public Website
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-colors text-left cursor-pointer w-full"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-6xl w-full">
        {children}
      </main>
    </div>
  )
}
