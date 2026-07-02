'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function SubmitProductPage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/products')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <span className="text-xs text-zinc-500 font-semibold tracking-wider uppercase">Redirecting to marketplace...</span>
      </div>
    </div>
  )
}
