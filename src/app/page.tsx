'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Calendar, MapPin, Tag, ShoppingBag, ArrowRight, Eye, Package, User, Clock, AlertCircle } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES } from '@/lib/catalog'

interface Product {
  id: string
  name: string
  price: number
  quantity_option: string
  seller_name: string
  status: string
  is_featured: boolean
  created_at: string
  categories: {
    name: string
  }
}

interface Announcement {
  id: string
  content: string
  is_active: boolean
}

export default function Home() {
  const router = useRouter()
  const { settings, eventDetails } = useApp()
  const [searchQuery, setSearchQuery] = useState('')
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [latestProducts, setLatestProducts] = useState<Product[]>([])
  const [stats, setStats] = useState({ totalApproved: 0, totalSold: 0, totalItems: 0 })
  const [formattedEventDate, setFormattedEventDate] = useState('')

  // Fetch home page data
  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      
      // Fetch announcements
      const { data: annData } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      if (annData) setAnnouncements(annData)

      // Fetch featured products
      const { data: featData } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('status', 'approved')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(6)
      if (featData) setFeaturedProducts(featData as unknown as Product[])

      // Fetch latest products
      const { data: latData } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(4)
      if (latData) setLatestProducts(latData as unknown as Product[])

      // Fetch statistics (only approved and sold counts)
      const { data: allProdData } = await supabase
        .from('products')
        .select('status')
      
      if (allProdData) {
        const approved = allProdData.filter(p => p.status === 'approved').length
        const sold = allProdData.filter(p => p.status === 'sold').length
        setStats({
          totalApproved: approved,
          totalSold: sold,
          totalItems: approved + sold
        })
      }
    }

    fetchData()
  }, [])

  // Format event date
  useEffect(() => {
    if (eventDetails.event_date) {
      setFormattedEventDate(
        new Date(eventDetails.event_date).toLocaleDateString(undefined, { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      )
    }
  }, [eventDetails.event_date])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  // Predefined church gallery images
  const galleryImages = [
    { url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop', caption: 'Home-grown Spices preparation' },
    { url: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=600&auto=format&fit=crop', caption: 'Delicious home-made traditional snacks' },
    { url: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?q=80&w=600&auto=format&fit=crop', caption: 'Community harvest celebrations' },
    { url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=600&auto=format&fit=crop', caption: 'Volunteers planning the event' },
  ]

  return (
    <div className="w-full flex flex-col items-center">
      {/* Announcements Bar */}
      {announcements.length > 0 && (
        <div className="w-full bg-[#0071e3] dark:bg-[#2997ff] text-white py-2.5 px-4 text-center text-sm font-medium relative overflow-hidden">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">New</span>
            <span className="truncate">{announcements[0].content}</span>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="w-full relative overflow-hidden py-16 md:py-28 flex flex-col items-center justify-center text-center">
        {/* Background gradient effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 dark:bg-blue-500/20 blur-[120px] pointer-events-none animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 dark:bg-purple-500/20 blur-[120px] pointer-events-none animate-pulse-slow"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center">
          {/* Logo badge */}
          {settings.church_logo ? (
            <img 
              src={settings.church_logo} 
              alt={settings.church_name} 
              className="w-16 h-16 rounded-full object-cover border-2 border-white/20 shadow-lg mb-6"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#0071e3] to-[#2997ff] flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 mb-6">
              <ShoppingBag className="w-8 h-8 text-white m-auto" />
            </div>
          )}

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Explore and Shop at <br />
            <span className="text-gradient-primary">{eventDetails.title}</span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mb-10 leading-relaxed font-light">
            Browse organic spices, fresh local snacks, traditional food items, and more, submitted by members of <span className="font-semibold text-zinc-700 dark:text-zinc-200">{settings.church_name}</span>.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="w-full max-w-lg mb-8">
            <div className="relative glass-card p-1 rounded-full flex items-center shadow-lg border border-zinc-200/50 dark:border-white/10">
              <div className="flex items-center pl-4 pr-2 flex-grow">
                <Search className="w-5 h-5 text-zinc-400 mr-2 flex-shrink-0" />
                <input 
                  type="text" 
                  placeholder="Search Chilli powder, chips, pappadam..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm w-full focus:outline-none border-none text-zinc-800 dark:text-zinc-100 py-2.5"
                />
              </div>
              <button 
                type="submit" 
                className="px-6 py-2.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] dark:bg-[#2997ff] dark:hover:bg-[#54aeff] text-white text-sm font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>

          {/* Quick Categories */}
          <div className="flex flex-wrap justify-center gap-2 max-w-xl">
            {CATEGORIES.slice(0, 5).map((cat) => (
              <Link 
                key={cat} 
                href={`/products?category=${encodeURIComponent(cat)}`}
                className="text-xs font-semibold px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                {cat}
              </Link>
            ))}
            <Link 
              href="/products" 
              className="text-xs font-semibold px-4 py-2 rounded-full bg-zinc-200/50 dark:bg-zinc-800/50 text-[#0071e3] dark:text-[#2997ff] flex items-center gap-1"
            >
              All Products <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Countdown Section */}
      {/* Event Details Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="glass-panel p-8 rounded-3xl grid grid-cols-1 lg:grid-cols-3 gap-8 items-center border border-zinc-200/50 dark:border-white/5">
          {/* Text details */}
          <div className="lg:col-span-2 space-y-3">
            <span className="text-[#0071e3] dark:text-[#2997ff] text-xs uppercase tracking-widest font-bold flex items-center gap-1.5">
              <Calendar className="w-4.5 h-4.5" /> Event Date & Location
            </span>
            <h2 className="text-2xl font-bold tracking-tight">{eventDetails.title}</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-light leading-relaxed">
              {eventDetails.description}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2 text-sm text-zinc-700 dark:text-zinc-300">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-zinc-400" />
                <span>{formattedEventDate}</span>
              </div>
              {settings.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                  <span>{settings.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Submission Action Box */}
          <div className="lg:col-span-1 flex flex-col justify-center items-stretch p-6 rounded-2xl border border-zinc-200/50 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-950/20 text-center gap-4">
            <span className="text-xs uppercase tracking-wider text-zinc-450 font-semibold">Participate in Event</span>
            {settings.submission_enabled ? (
              <>
                <p className="text-xs text-zinc-500 leading-relaxed font-light">
                  Product submissions are open! Add your homegrown crops or snacks to the catalog.
                </p>
                <Link 
                  href="/submit" 
                  className="w-full py-2.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Package className="w-4 h-4" /> Submit Product Details
                </Link>
              </>
            ) : (
              <>
                <p className="text-xs text-zinc-500 leading-relaxed font-light">
                  Submissions are closed for this marketplace event. Visitors can browse all listings.
                </p>
                <Link 
                  href="/products" 
                  className="w-full py-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  <ShoppingBag className="w-4 h-4" /> Browse Catalog
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-[#0071e3] dark:text-[#2997ff] text-xs uppercase tracking-widest font-bold">Recommended Picks</span>
              <h2 className="text-3xl font-extrabold tracking-tight">Featured Items</h2>
            </div>
            <Link 
              href="/products?featured=true" 
              className="text-sm font-semibold text-[#0071e3] dark:text-[#2997ff] hover:underline flex items-center gap-1"
            >
              See all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Latest Products */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-green-500 dark:text-green-400 text-xs uppercase tracking-widest font-bold">Just Added</span>
            <h2 className="text-3xl font-extrabold tracking-tight">Latest Submissions</h2>
          </div>
          <Link 
            href="/products" 
            className="text-sm font-semibold text-[#0071e3] dark:text-[#2997ff] hover:underline flex items-center gap-1"
          >
            Browse all catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {latestProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="glass-panel text-center py-12 px-6 rounded-3xl">
            <Package className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold">No products available yet</h3>
            <p className="text-sm text-zinc-500 max-w-xs mx-auto mt-2">
              Be the first to submit a product for sale on the upcoming Sunday Marketplace!
            </p>
            {settings.submission_enabled && (
              <Link 
                href="/submit" 
                className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0071e3] text-white text-sm font-semibold"
              >
                Submit Item
              </Link>
            )}
          </div>
        )}
      </section>

      {/* Statistics Section */}
      <section className="w-full bg-zinc-100 dark:bg-[#09090b] py-16 transition-colors border-y border-zinc-200 dark:border-zinc-900 mb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-[#0071e3] dark:text-[#2997ff] text-xs uppercase tracking-widest font-bold">Mart Stats</span>
            <h2 className="text-3xl font-extrabold tracking-tight mt-1">Community in Numbers</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { label: 'Approved Products', value: stats.totalApproved, desc: 'Ready for purchase' },
              { label: 'Sold Products', value: stats.totalSold, desc: 'Purchased during event' },
              { label: 'Total catalog items', value: stats.totalItems, desc: 'Unique listings submitted' }
            ].map((stat) => (
              <div key={stat.label} className="glass-card p-6 rounded-2xl border border-zinc-200/50 dark:border-white/5 text-center flex flex-col items-center">
                <span className="text-4xl font-extrabold tracking-tight text-gradient-primary mb-1">
                  {stat.value}
                </span>
                <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200 mb-0.5">{stat.label}</span>
                <span className="text-xs text-zinc-400">{stat.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="text-center mb-10">
          <span className="text-[#0071e3] dark:text-[#2997ff] text-xs uppercase tracking-widest font-bold">Visuals</span>
          <h2 className="text-3xl font-extrabold tracking-tight mt-1">Marketplace Gallery</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {galleryImages.map((img, idx) => (
            <div key={idx} className="group relative rounded-2xl overflow-hidden shadow-md aspect-square bg-zinc-200 dark:bg-zinc-800">
              <img 
                src={img.url} 
                alt={img.caption} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <p className="text-xs font-semibold text-[#2997ff] mb-1">Gallery Event</p>
                <p className="text-sm font-bold text-white leading-tight">{img.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

// Sub-Component: Product Card
function ProductCard({ product }: { product: Product }) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-zinc-200/50 dark:border-white/5 flex flex-col h-full bg-white dark:bg-[#161617]/50 relative transition-all duration-300 hover:translate-y-[-2px]">
      {/* Status Badge */}
      {product.status === 'sold' && (
        <span className="absolute top-3 right-3 z-10 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-500 text-white shadow-md">
          Sold Out
        </span>
      )}

      {/* Card Details */}
      <div className="p-6 flex flex-col flex-grow gap-2">
        {/* Category Tag & Icon */}
        <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#0071e3] dark:text-[#2997ff]">
          <Package className="w-3.5 h-3.5" />
          <span>{product.categories?.name}</span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-lg tracking-tight leading-tight line-clamp-2 mt-1">
          {product.name}
        </h3>

        {/* Info row */}
        <div className="flex items-center justify-between text-xs text-zinc-500 mt-2">
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-zinc-400" /> {product.seller_name}
          </span>
          <span className="bg-zinc-200/60 dark:bg-zinc-800/80 px-2 py-0.5 rounded font-mono font-semibold">
            {product.quantity_option}
          </span>
        </div>

        {/* Push to bottom spacer */}
        <div className="flex-grow min-h-[1.5rem]"></div>

        {/* Price & View button */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-150 dark:border-zinc-850 mt-2">
          <div>
            <span className="text-[10px] text-zinc-400 block leading-none uppercase tracking-wider font-bold">Price</span>
            <span className="text-lg font-extrabold text-zinc-850 dark:text-white">
              ₹{product.price}
            </span>
          </div>

          <Link 
            href={`/products/${product.id}`}
            className="flex items-center gap-1 px-4 py-2 rounded-full bg-[#0071e3]/10 hover:bg-[#0071e3]/20 text-[#0071e3] dark:text-[#2997ff] dark:bg-[#2997ff]/10 dark:hover:bg-[#2997ff]/20 transition-colors text-xs font-bold cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" /> Details
          </Link>
        </div>
      </div>
    </div>
  )
}
