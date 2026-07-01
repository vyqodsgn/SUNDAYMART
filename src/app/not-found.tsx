import React from 'react'
import Link from 'next/link'
import { MapPinOff } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex-grow flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mb-6">
        <MapPinOff className="w-8 h-8 text-zinc-500" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight mb-2">Page Not Found</h1>
      <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-sm mx-auto">
        We couldn't find the page you were looking for. It might have been moved or deleted.
      </p>
      <Link 
        href="/"
        className="px-6 py-3 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-sm transition-colors shadow-md"
      >
        Return to Homepage
      </Link>
    </div>
  )
}
