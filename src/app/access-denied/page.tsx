'use client'

import React from 'react'
import Link from 'next/link'
import { ShieldX, ArrowLeft } from 'lucide-react'

export default function AccessDeniedPage() {
  return (
    <div className="flex-grow flex items-center justify-center py-20 px-4 relative min-h-[80vh]">
      {/* Background gradients */}
      <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] rounded-full bg-red-500/5 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-orange-500/5 blur-[100px] pointer-events-none"></div>

      <div className="max-w-md w-full text-center relative z-10 space-y-6">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <ShieldX className="w-10 h-10 text-red-500" />
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight">Access Denied</h1>
          <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
            You do not have permission to access this page. This area is restricted to the site administrator only.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            href="/"
            id="access-denied-home"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-sm font-semibold transition-colors shadow"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Homepage
          </Link>
          <Link
            href="/admin/login"
            id="access-denied-login"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-zinc-200 dark:border-zinc-800 text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  )
}
