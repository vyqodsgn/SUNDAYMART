'use client'

import React from 'react'
import Link from 'next/link'
import { Phone, Mail, MapPin, ShoppingBag } from 'lucide-react'
import { useApp } from '@/context/AppContext'

export default function Footer() {
  const { settings } = useApp()

  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-[#09090b] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Logo & Intro */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              {settings.church_logo ? (
                <img 
                  src={settings.church_logo} 
                  alt={settings.church_name} 
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0071e3] to-[#2997ff] flex items-center justify-center text-white font-bold text-sm">
                  <ShoppingBag className="w-4.5 h-4.5 text-white m-auto" />
                </div>
              )}
              <span className="font-bold text-md tracking-tight">
                {settings.church_name} <span className="font-light text-muted">Mart</span>
              </span>
            </Link>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">
              A community marketplace event hosted by the parish. Supporting local families, homemade products, and organic spices.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-4 pt-2">
              {settings.facebook_link && (
                <a 
                  href={settings.facebook_link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-zinc-400 hover:text-[#0071e3] transition-colors"
                  aria-label="Facebook Page"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
              )}
              {settings.instagram_link && (
                <a 
                  href={settings.instagram_link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-zinc-400 hover:text-[#e1306c] transition-colors"
                  aria-label="Instagram Profile"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
              )}
              {settings.youtube_link && (
                <a 
                  href={settings.youtube_link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-zinc-400 hover:text-[#ff0000] transition-colors"
                  aria-label="YouTube Channel"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" />
                    <polygon points="9.7 15 9.7 9 15 12 9.7 15" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
                  Home Page
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
                  Explore Products
                </Link>
              </li>
              <li>
                <Link href="/submit" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
                  Submit Product
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
                  About Event
                </Link>
              </li>
            </ul>
          </div>

          {/* More Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
                  Get in Touch
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Contact Info</h3>
            <ul className="space-y-3">
              {settings.contact_number && (
                <li className="flex items-start gap-2.5 text-sm text-zinc-600 dark:text-zinc-400">
                  <Phone className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                  <span>{settings.contact_number}</span>
                </li>
              )}
              {settings.email && (
                <li className="flex items-start gap-2.5 text-sm text-zinc-600 dark:text-zinc-400">
                  <Mail className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                  <a href={`mailto:${settings.email}`} className="hover:underline break-all">{settings.email}</a>
                </li>
              )}
              {settings.address && (
                <li className="flex items-start gap-2.5 text-sm text-zinc-600 dark:text-zinc-400">
                  <MapPin className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                  <span className="leading-tight">{settings.address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <hr className="my-10 border-zinc-200 dark:border-zinc-900" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            &copy; {currentYear} {settings.church_name}. All rights reserved.
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-500 flex items-center gap-1">
            Made with love by the Parish Community.
          </p>
        </div>
      </div>
    </footer>
  )
}
