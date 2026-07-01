'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, Filter, SlidersHorizontal, ArrowUpDown, RefreshCw, X, ShoppingBag, Eye, User, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Category {
  id: string
  name: string
  slug: string
}

interface Product {
  id: string
  name: string
  price: number
  quantity_option: string
  seller_name: string
  status: string
  is_featured: boolean
  created_at: string
  category_id: string
  categories: {
    name: string
  }
}

export default function ProductsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // URL parameters
  const initialSearch = searchParams.get('search') || ''
  const initialCategory = searchParams.get('category') || ''
  const initialFeatured = searchParams.get('featured') === 'true'

  // State
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [featuredOnly, setFeaturedOnly] = useState(initialFeatured)
  const [availability, setAvailability] = useState('all') // 'all', 'available', 'sold'
  const [sortOption, setSortOption] = useState('newest') // 'newest', 'oldest', 'price-low', 'price-high'
  const [loading, setLoading] = useState(true)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })
      if (data) setCategories(data)
    }
    fetchCategories()
  }, [])

  // Sync state with URL params changes
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '')
    setSelectedCategory(searchParams.get('category') || '')
    setFeaturedOnly(searchParams.get('featured') === 'true')
  }, [searchParams])

  // Fetch products when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      const supabase = createClient()
      
      // Select product fields and join category name
      let query = supabase
        .from('products')
        .select('*, categories!inner(name)')
        .in('status', ['approved', 'sold'])

      // Apply category filter
      if (selectedCategory) {
        query = query.eq('categories.name', selectedCategory)
      }

      // Apply search filter (match product name, seller name, or description)
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,seller_name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      }

      // Apply featured filter
      if (featuredOnly) {
        query = query.eq('is_featured', true)
      }

      // Apply availability filter
      if (availability === 'available') {
        query = query.eq('status', 'approved')
      } else if (availability === 'sold') {
        query = query.eq('status', 'sold')
      }

      // Apply sorting
      if (sortOption === 'newest') {
        query = query.order('created_at', { ascending: false })
      } else if (sortOption === 'oldest') {
        query = query.order('created_at', { ascending: true })
      } else if (sortOption === 'price-low') {
        query = query.order('price', { ascending: true })
      } else if (sortOption === 'price-high') {
        query = query.order('price', { ascending: false })
      }

      const { data, error } = await query
      if (error) {
        console.error('Error fetching products:', error)
      } else if (data) {
        setProducts(data as unknown as Product[])
      }
      setLoading(false)
    }

    fetchProducts()
  }, [selectedCategory, searchQuery, featuredOnly, availability, sortOption])

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setFeaturedOnly(false)
    setAvailability('all')
    setSortOption('newest')
    router.push('/products')
  }

  const updateURLParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/products?${params.toString()}`)
  }

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName)
    updateURLParams('category', categoryName)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearchQuery(val)
    // Debounce/sync URL logic: wait for search submit or sync instantly
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateURLParams('search', searchQuery)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col w-full">
      {/* Header Title */}
      <div className="mb-8">
        <span className="text-[#0071e3] dark:text-[#2997ff] text-xs uppercase tracking-widest font-bold">Catalog</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">Browse Products</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 font-light">
          Discover spices, sweets, snacks, and traditional delicacies prepared with love by our community.
        </p>
      </div>

      {/* Main Grid: Filters Sidebar + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-zinc-200/50 dark:border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <Filter className="w-4 h-4 text-zinc-400" /> Filters
              </h2>
              <button 
                onClick={handleResetFilters}
                className="text-xs font-semibold text-[#0071e3] dark:text-[#2997ff] hover:underline"
              >
                Reset All
              </button>
            </div>

            <hr className="border-zinc-200 dark:border-zinc-800" />

            {/* Category Filter */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Category</h3>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => handleCategorySelect('')}
                  className={`text-left text-sm px-3 py-2 rounded-lg font-medium transition-colors ${
                    !selectedCategory 
                      ? 'bg-blue-500/10 text-[#0071e3] dark:text-[#2997ff]' 
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.name)}
                    className={`text-left text-sm px-3 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === cat.name 
                        ? 'bg-blue-500/10 text-[#0071e3] dark:text-[#2997ff]' 
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-zinc-200 dark:border-zinc-800" />

            {/* Availability Filter */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Availability</h3>
              <div className="flex flex-col gap-1.5">
                {[
                  { id: 'all', name: 'All Items' },
                  { id: 'available', name: 'Available only' },
                  { id: 'sold', name: 'Sold out only' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setAvailability(item.id)}
                    className={`text-left text-sm px-3 py-2 rounded-lg font-medium transition-colors ${
                      availability === item.id 
                        ? 'bg-blue-500/10 text-[#0071e3] dark:text-[#2997ff]' 
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-zinc-200 dark:border-zinc-800" />

            {/* Featured Picks */}
            <div className="flex items-center justify-between">
              <label htmlFor="featured-toggle" className="text-sm font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                Featured Picks Only
              </label>
              <input 
                id="featured-toggle"
                type="checkbox" 
                checked={featuredOnly}
                onChange={(e) => {
                  setFeaturedOnly(e.target.checked)
                  updateURLParams('featured', String(e.target.checked))
                }}
                className="w-4 h-4 rounded text-[#0071e3] focus:ring-blue-500 cursor-pointer"
              />
            </div>
          </div>
        </aside>

        {/* Products Results (3 cols on desktop) */}
        <section className="lg:col-span-3 space-y-6">
          {/* Search bar + Sort controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search Input Form */}
            <form onSubmit={handleSearchSubmit} className="w-full sm:max-w-md">
              <div className="relative glass-card p-0.5 rounded-full flex items-center shadow border border-zinc-200/50 dark:border-white/5">
                <input 
                  type="text" 
                  placeholder="Search products, seller..." 
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="bg-transparent text-sm w-full focus:outline-none pl-4 pr-10 py-2.5 text-zinc-800 dark:text-zinc-100"
                />
                <button 
                  type="submit" 
                  className="absolute right-1 top-1 p-2 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white transition-colors cursor-pointer"
                  aria-label="Search submit"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Sort & Mobile filter trigger */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {/* Mobile Filter toggle button */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4 text-zinc-400" /> Filters
              </button>

              {/* Sort Selector */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-zinc-400 hidden sm:block" />
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="text-sm font-medium px-4 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedCategory || searchQuery || featuredOnly || availability !== 'all') && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-zinc-400 font-medium mr-1">Active:</span>
              {selectedCategory && (
                <span className="flex items-center gap-1 bg-zinc-200/50 dark:bg-zinc-800/80 px-3 py-1 rounded-full">
                  Category: {selectedCategory}
                  <X className="w-3.5 h-3.5 hover:text-red-500 cursor-pointer" onClick={() => handleCategorySelect('')} />
                </span>
              )}
              {searchQuery && (
                <span className="flex items-center gap-1 bg-zinc-200/50 dark:bg-zinc-800/80 px-3 py-1 rounded-full">
                  Search: &quot;{searchQuery}&quot;
                  <X className="w-3.5 h-3.5 hover:text-red-500 cursor-pointer" onClick={() => { setSearchQuery(''); updateURLParams('search', '') }} />
                </span>
              )}
              {featuredOnly && (
                <span className="flex items-center gap-1 bg-zinc-200/50 dark:bg-zinc-800/80 px-3 py-1 rounded-full">
                  Featured Picks
                  <X className="w-3.5 h-3.5 hover:text-red-500 cursor-pointer" onClick={() => { setFeaturedOnly(false); updateURLParams('featured', '') }} />
                </span>
              )}
              {availability !== 'all' && (
                <span className="flex items-center gap-1 bg-zinc-200/50 dark:bg-zinc-800/80 px-3 py-1 rounded-full">
                  Status: {availability}
                  <X className="w-3.5 h-3.5 hover:text-red-500 cursor-pointer" onClick={() => setAvailability('all')} />
                </span>
              )}
              <button 
                onClick={handleResetFilters}
                className="text-[#0071e3] dark:text-[#2997ff] font-semibold hover:underline"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Products List Loader */}
          {loading ? (
            <div className="w-full py-28 text-center flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium">Updating results...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="glass-panel text-center py-20 px-6 rounded-3xl border border-zinc-200/50 dark:border-white/5 bg-white/40 dark:bg-black/10">
              <ShoppingBag className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold">No results found</h3>
              <p className="text-sm text-zinc-500 max-w-sm mx-auto mt-2">
                We couldn&apos;t find any approved products matching your active filters. Try searching for something else or clearing filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                Clear Search & Filters
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Mobile Filters Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/60 backdrop-blur-sm">
          <div className="ml-auto w-full max-w-xs h-full bg-white dark:bg-[#0a0a0c] p-6 shadow-xl flex flex-col gap-6 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-md uppercase tracking-wider">Filters</h2>
              <button 
                onClick={() => setShowMobileFilters(false)}
                className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <hr className="border-zinc-200 dark:border-zinc-800" />

            {/* Category Filter */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Category</h3>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => { handleCategorySelect(''); setShowMobileFilters(false) }}
                  className={`text-left text-sm px-3 py-2 rounded-lg font-medium transition-colors ${
                    !selectedCategory 
                      ? 'bg-blue-500/10 text-[#0071e3] dark:text-[#2997ff]' 
                      : 'text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { handleCategorySelect(cat.name); setShowMobileFilters(false) }}
                    className={`text-left text-sm px-3 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === cat.name 
                        ? 'bg-blue-500/10 text-[#0071e3] dark:text-[#2997ff]' 
                        : 'text-zinc-600 dark:text-zinc-300'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-zinc-200 dark:border-zinc-800" />

            {/* Availability Filter */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Availability</h3>
              <div className="flex flex-col gap-1.5">
                {[
                  { id: 'all', name: 'All Items' },
                  { id: 'available', name: 'Available only' },
                  { id: 'sold', name: 'Sold out only' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setAvailability(item.id); setShowMobileFilters(false) }}
                    className={`text-left text-sm px-3 py-2 rounded-lg font-medium transition-colors ${
                      availability === item.id 
                        ? 'bg-blue-500/10 text-[#0071e3] dark:text-[#2997ff]' 
                        : 'text-zinc-600 dark:text-zinc-300'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-zinc-200 dark:border-zinc-800" />

            {/* Featured Picks */}
            <div className="flex items-center justify-between">
              <label htmlFor="featured-toggle-mobile" className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                Featured Picks Only
              </label>
              <input 
                id="featured-toggle-mobile"
                type="checkbox" 
                checked={featuredOnly}
                onChange={(e) => {
                  setFeaturedOnly(e.target.checked)
                  updateURLParams('featured', String(e.target.checked))
                  setShowMobileFilters(false)
                }}
                className="w-4 h-4 rounded text-[#0071e3] focus:ring-blue-500"
              />
            </div>

            <hr className="border-zinc-200 dark:border-zinc-800 mt-auto" />
            <button
              onClick={() => { handleResetFilters(); setShowMobileFilters(false) }}
              className="w-full py-2.5 rounded-full border border-red-500/30 text-red-500 text-sm font-semibold hover:bg-red-500/10 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Sub-Component: Product Card (Local Copy to avoid import complications)
function ProductCard({ product }: { product: Product }) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-zinc-200/50 dark:border-white/5 flex flex-col h-full bg-white dark:bg-[#161617]/50 relative transition-all duration-300 hover:translate-y-[-2px]">
      {/* Top badges bar */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
        {product.status === 'sold' && (
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-500 text-white shadow-md">
            Sold Out
          </span>
        )}
        {product.is_featured && (
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Featured
          </span>
        )}
      </div>

      {/* Card Details */}
      <div className="p-6 flex flex-col flex-grow gap-2">
        {/* Category Tag & Icon */}
        <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#0071e3] dark:text-[#2997ff]">
          <ShoppingBag className="w-3.5 h-3.5" />
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
