'use client'

import React, { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Phone, Share2, Calendar, Tag, User, ShoppingBag, Check, ShieldAlert, Sparkles, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/context/ToastContext'

interface Product {
  id: string
  name: string
  price: number
  quantity_option: string
  description: string | null
  seller_name: string
  seller_phone: string
  seller_quantity: number
  notes: string | null
  image_url: string | null
  status: string
  is_featured: boolean
  created_at: string
  category_id: string
  categories: {
    name: string
  }
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ProductDetailsPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { showToast } = useToast()

  // State
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [revealedPhone, setRevealedPhone] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [formattedCreatedAt, setFormattedCreatedAt] = useState('')

  // Fetch product detail and related items
  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true)
      const supabase = createClient()

      // Fetch current product
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('id', id)
        .single()

      if (error || !data) {
        console.error('Error fetching product details:', error)
        setLoading(false)
        return
      }

      const currentProduct = data as unknown as Product
      setProduct(currentProduct)
      setFormattedCreatedAt(
        new Date(currentProduct.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
      )

      // Fetch related products in same category (excluding current product)
      const { data: relatedData } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('category_id', currentProduct.category_id)
        .eq('status', 'approved')
        .neq('id', id)
        .limit(3)

      if (relatedData) {
        setRelatedProducts(relatedData as unknown as Product[])
      }
      setLoading(false)
    }

    fetchProductDetails()
  }, [id])

  const handleShare = () => {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({
        title: product?.name || 'Sunday Mart Product',
        text: `Check out ${product?.name} from ${product?.seller_name} on Sunday Marketplace!`,
        url: url
      }).catch(err => console.log('Share canceled', err))
    } else {
      navigator.clipboard.writeText(url)
      setCopiedLink(true)
      showToast('Product link copied to clipboard', 'success')
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium">Loading details...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Product not found</h2>
        <p className="text-sm text-zinc-500 mt-2">
          The product you are looking for does not exist, has been removed, or is awaiting administrator approval.
        </p>
        <Link 
          href="/products"
          className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0071e3] text-white text-sm font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Back navigation */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-zinc-500 hover:text-black dark:hover:text-white text-sm font-medium mb-8 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to listings
      </button>

      {/* Main product display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
        {/* Left Column: Image Card */}
        <div className="relative rounded-3xl overflow-hidden glass-panel border border-zinc-200/50 dark:border-white/5 aspect-square flex items-center justify-center bg-zinc-100 dark:bg-zinc-950">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center text-zinc-400">
              <ShoppingBag className="w-16 h-16 opacity-30 mb-2" />
              <span className="text-xs uppercase tracking-wider font-semibold">No Image Provided</span>
            </div>
          )}

          {/* Status Badge */}
          {product.status === 'sold' && (
            <span className="absolute top-4 left-4 z-10 text-xs font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-red-500 text-white shadow-md">
              Sold Out
            </span>
          )}

          {/* Featured Badge */}
          {product.is_featured && (
            <span className="absolute top-4 right-4 z-10 text-xs font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Featured Pick
            </span>
          )}
        </div>

        {/* Right Column: Metadata & Seller Cards */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#0071e3] dark:text-[#2997ff] flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> {product.categories?.name}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-2 pt-1.5">
              <span className="text-2xl font-extrabold text-gradient-primary">
                ₹{product.price}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-zinc-200/60 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300">
                Pack Size: {product.quantity_option}
              </span>
            </div>
          </div>

          <hr className="border-zinc-200 dark:border-zinc-800" />

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Description</h3>
            <p className="text-zinc-650 dark:text-zinc-300 leading-relaxed font-light text-sm">
              {product.description || 'No description provided by the seller.'}
            </p>
          </div>

          {/* Seller Card */}
          <div className="glass-card p-6 rounded-2xl border border-zinc-200/50 dark:border-white/5 space-y-4 bg-zinc-100/30 dark:bg-zinc-900/10">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> Seller Information
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Contact Person</span>
                <span className="font-semibold text-zinc-850 dark:text-white">{product.seller_name}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Availability</span>
                <span className="font-semibold text-zinc-850 dark:text-white">
                  {product.seller_quantity} {product.seller_quantity > 1 ? 'Packs' : 'Pack'} available
                </span>
              </div>
              
              {product.notes && (
                <div className="pt-2 border-t border-zinc-200/30 dark:border-white/5 text-xs text-zinc-500">
                  <span className="font-semibold block mb-0.5 text-zinc-400">Seller Notes:</span>
                  <p className="italic font-light leading-relaxed">&ldquo;{product.notes}&rdquo;</p>
                </div>
              )}
            </div>

            {/* Secure Call-to-action button */}
            <div className="pt-2">
              {revealedPhone ? (
                <a 
                  href={`tel:${product.seller_phone}`}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold text-sm transition-all"
                >
                  <Phone className="w-4.5 h-4.5" /> Call {product.seller_phone}
                </a>
              ) : (
                <button 
                  onClick={() => setRevealedPhone(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-sm transition-all cursor-pointer"
                >
                  <Phone className="w-4.5 h-4.5" /> Show Seller Phone Number
                </button>
              )}
            </div>
          </div>

          {/* Social details & sharing */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Calendar className="w-4 h-4" />
              <span>Submitted on {formattedCreatedAt}</span>
            </div>
            
            <button 
              onClick={handleShare}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-xs font-semibold cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4 text-zinc-400" />}
              {copiedLink ? 'Copied' : 'Share Product'}
            </button>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 pt-10 border-t border-zinc-200 dark:border-zinc-900 space-y-6">
          <h2 className="text-2xl font-extrabold tracking-tight">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((item) => (
              <div key={item.id} className="glass-card rounded-2xl overflow-hidden border border-zinc-200/50 dark:border-white/5 flex flex-col h-full bg-white dark:bg-[#161617]/50 relative">
                {/* Status Badge */}
                {item.status === 'sold' && (
                  <span className="absolute top-3 left-3 z-10 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-500 text-white shadow-md">
                    Sold Out
                  </span>
                )}

                {/* Product Image */}
                <div className="aspect-video relative overflow-hidden bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center border-b border-zinc-200/30 dark:border-white/5">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-zinc-400">
                      <ShoppingBag className="w-8 h-8 opacity-40 mb-1" />
                      <span className="text-[10px] uppercase tracking-wider">No Image</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-5 flex flex-col flex-grow gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0071e3] dark:text-[#2997ff]">
                    {item.categories?.name}
                  </span>
                  <h3 className="font-bold text-md tracking-tight leading-tight line-clamp-1">
                    {item.name}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-zinc-500 mt-1">
                    <span>by {item.seller_name}</span>
                    <span className="bg-zinc-200/60 dark:bg-zinc-800/80 px-2 py-0.5 rounded font-mono">
                      {item.quantity_option}
                    </span>
                  </div>

                  <div className="flex-grow"></div>

                  <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-850 mt-2">
                    <span className="text-lg font-extrabold">₹{item.price}</span>
                    <Link 
                      href={`/products/${item.id}`}
                      className="flex items-center gap-1 px-4 py-2 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors text-xs font-semibold"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
