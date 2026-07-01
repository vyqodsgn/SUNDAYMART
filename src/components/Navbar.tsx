'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, Sun, Moon, LogOut, LayoutDashboard, ShoppingBag } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { useApp } from '@/context/AppContext'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/context/ToastContext'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const { settings } = useApp()
  const { showToast } = useToast()
  
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    const loadingToast = showToast('Logging out...', 'loading')
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      showToast(error.message, 'error')
    } else {
      showToast('Logged out successfully', 'success')
      router.push('/')
      router.refresh()
    }
  }

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Submit Item', href: '/submit' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'FAQ', href: '/faq' },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header className={`sticky top-0 z-40 w-full transition-all duration-300 ${
      scrolled 
        ? 'glass-navbar py-3 shadow-md' 
        : 'bg-transparent py-5 border-b border-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo and title */}
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          {settings.church_logo ? (
            <img 
              src={settings.church_logo} 
              alt={settings.church_name} 
              className="w-9 h-9 rounded-full object-cover border border-white/20"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#0071e3] to-[#2997ff] flex items-center justify-between justify-center text-white font-bold shadow-md shadow-blue-500/10">
              <ShoppingBag className="w-5 h-5 text-white m-auto" />
            </div>
          )}
          <span className="font-semibold text-lg tracking-tight group-hover:opacity-80 transition-opacity">
            {settings.church_name} <span className="font-light text-muted">Mart</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? 'text-[#0071e3] dark:text-[#2997ff]'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Utility buttons */}
        <div className="hidden md:flex items-center gap-4">
          {/* Theme toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Admin link */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link 
                href="/admin/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-[#0071e3] dark:text-[#2997ff] hover:bg-blue-500/20 transition-all"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          ) : (
            <Link 
              href="/admin/login"
              className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
            >
              Admin Portal
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-3">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-600 dark:text-zinc-300"
            aria-label="Toggle mobile menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full glass-panel py-4 px-6 border-b border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col gap-4">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`text-base font-semibold py-1.5 transition-colors ${
                  isActive(link.href)
                    ? 'text-[#0071e3] dark:text-[#2997ff]'
                    : 'text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <hr className="border-zinc-200 dark:border-zinc-800" />

          {/* Mobile Admin links */}
          {user ? (
            <div className="flex flex-col gap-3">
              <Link 
                href="/admin/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 font-semibold text-sm text-[#0071e3] dark:text-[#2997ff]"
              >
                <LayoutDashboard className="w-4 h-4" />
                Admin Dashboard
              </Link>
              <button 
                onClick={() => {
                  setIsOpen(false)
                  handleLogout()
                }}
                className="flex items-center gap-2 font-semibold text-sm text-red-500 text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <Link 
              href="/admin/login"
              onClick={() => setIsOpen(false)}
              className="text-sm font-semibold text-zinc-500 hover:text-black dark:hover:text-white"
            >
              Admin Portal Login
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
