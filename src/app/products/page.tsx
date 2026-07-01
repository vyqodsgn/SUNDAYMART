'use client'

import React, { Suspense } from 'react'
import ProductsContent from './ProductsContent'

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-32 text-center flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium">Loading products catalog...</p>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  )
}
