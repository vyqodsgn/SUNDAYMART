'use client'

import React, { useState, useEffect } from 'react'
import { Search, X, ShoppingBag, Sparkles, Plus, Minus, Check, ChevronUp, ChevronDown, ShoppingCart, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/context/ToastContext'

interface Product {
  id: string
  name: string
  price: number
  quantity_option: string
  seller_name: string
  seller_quantity: number
  status: string
  is_featured: boolean
  created_at: string
  category_id: string
}

export default function Home() {
  const { showToast } = useToast()
  
  // State
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOption, setSortOption] = useState('price-low') // 'price-low', 'price-high'
  const [loading, setLoading] = useState(true)

  // Quantity selection state (cart)
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({})
  const [userName, setUserName] = useState('')
  const [collectionCentre, setCollectionCentre] = useState('Main Church')
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [orderSubmitting, setOrderSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)

  // Fetch initial data
  const loadInitialData = async () => {
    setLoading(true)
    const supabase = createClient()
    
    // Fetch active products with stock
    const { data: prodData, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'approved')
      .gt('seller_quantity', 0)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      showToast('Failed to load products list', 'error')
    } else if (prodData) {
      setProducts(prodData as unknown as Product[])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadInitialData()
  }, [])

  // Cart operations
  const updateQuantity = (productId: string, delta: number, maxQty: number) => {
    const current = selectedQuantities[productId] || 0
    const next = Math.min(maxQty, Math.max(0, current + delta))
    
    if (current + delta > maxQty && delta > 0) {
      showToast(`Cannot order more than available stock (${maxQty} units)`, 'error')
    }
    
    setSelectedQuantities(prev => ({
      ...prev,
      [productId]: next
    }))
  }

  const getCartTotals = () => {
    let totalItems = 0
    let totalPrice = 0
    const itemsList: { product: Product; quantity: number }[] = []

    products.forEach(p => {
      const qty = selectedQuantities[p.id] || 0
      if (qty > 0) {
        totalItems += qty
        totalPrice += p.price * qty
        itemsList.push({ product: p, quantity: qty })
      }
    })

    return { totalItems, totalPrice, itemsList }
  }

  const { totalItems, totalPrice, itemsList } = getCartTotals()

  // Submit Order and Decrement Stock
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userName.trim()) {
      showToast('Please enter your name to complete the order', 'error')
      return
    }

    if (itemsList.length === 0) {
      showToast('Your order list is empty', 'error')
      return
    }

    setOrderSubmitting(true)
    const supabase = createClient()

    try {
      // Prepare items structure
      const orderItems = itemsList.map(item => ({
        product_id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity_option: item.product.quantity_option,
        quantity: item.quantity
      }))

      // Call database transaction RPC
      const { error: rpcErr } = await supabase.rpc(
        'submit_order_and_decrement_stock',
        {
          p_name: userName.trim(),
          p_centre: collectionCentre,
          p_items: orderItems,
          p_total_price: totalPrice
        }
      )

      if (rpcErr) throw rpcErr

      showToast('Order placed successfully!', 'success')
      setOrderSuccess(true)
      setSelectedQuantities({})
      setUserName('')
      setIsCheckoutOpen(false)
      
      // Reload products to reflect decremented quantities
      loadInitialData()
    } catch (err: any) {
      console.error(err)
      showToast(err.message || 'Failed to submit order. Verify database connection.', 'error')
    } finally {
      setOrderSubmitting(false)
    }
  }

  // Filter products locally
  const filteredProducts = products.filter((prod) => {
    const searchLower = searchQuery.toLowerCase()
    return prod.name.toLowerCase().includes(searchLower)
  })

  // Sort products locally
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === 'newest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    } else if (sortOption === 'oldest') {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    } else if (sortOption === 'price-low') {
      return a.price - b.price
    } else if (sortOption === 'price-high') {
      return b.price - a.price
    }
    return 0
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col w-full relative">
      {/* Header Banner */}
      <div className="mb-8 text-center sm:text-left">
        <span className="text-[#2997ff] text-xs uppercase tracking-widest font-bold">Sunday Marketplace</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 text-white">Order Church Marketplace Items</h1>
        <p className="text-sm text-zinc-400 mt-2 font-light max-w-2xl">
          Choose items from the catalog below, specify your quantities, and enter your details to submit your pickup order.
        </p>
      </div>

      {/* Main Results area (categories removed - full width) */}
      <div className="space-y-6 mb-24">
        {/* Search bar + Sort controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="relative glass-card p-0.5 rounded-full flex items-center shadow border border-white/5 w-full sm:max-w-md bg-zinc-950/20">
            <input 
              type="text" 
              placeholder="Search items" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm w-full focus:outline-none pl-4 pr-4 py-2.5 text-zinc-100"
            />
          </div>

          {/* Sort Selector */}
          <div className="relative flex items-center">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="appearance-none text-sm font-medium pl-5 pr-10 py-2.5 rounded-full border border-zinc-800 bg-zinc-950 focus:outline-none cursor-pointer text-zinc-300"
            >
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-4 pointer-events-none text-zinc-500" />
          </div>
        </div>

        {/* Active Filters Display */}
        {searchQuery && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-zinc-500 font-medium mr-1">Active:</span>
            <span className="flex items-center gap-1 bg-zinc-800/80 px-3 py-1 rounded-full text-zinc-300">
              Search: &quot;{searchQuery}&quot;
              <X className="w-3.5 h-3.5 hover:text-red-500 cursor-pointer" onClick={() => setSearchQuery('')} />
            </span>
          </div>
        )}

        {/* Products List Loader */}
        {loading ? (
          <div className="w-full py-28 text-center flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-zinc-400 font-medium">Updating catalog</p>
          </div>
        ) : sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                quantity={selectedQuantities[product.id] || 0}
                onQuantityChange={(qty) => updateQuantity(product.id, qty - (selectedQuantities[product.id] || 0), product.seller_quantity)}
              />
            ))}
          </div>
        ) : (
          <div className="glass-panel text-center py-20 px-6 rounded-3xl border border-white/5 bg-black/10">
            <ShoppingBag className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white">No items available</h3>
            <p className="text-sm text-zinc-500 max-w-sm mx-auto mt-2">
              We couldn&apos;t find any in-stock items. Please check back later.
            </p>
          </div>
        )}
      </div>

      {/* Success Modal */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel max-w-md w-full p-8 rounded-3xl text-center border border-white/10 shadow-2xl relative bg-zinc-950 text-white">
            <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black mb-2">Order Placed!</h2>
            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
              Your order has been recorded successfully. Please visit your selected collection centre to pick up and make payment for your items.
            </p>
            <button
              onClick={() => setOrderSuccess(false)}
              className="w-full py-3 rounded-full bg-green-505 bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg shadow-green-600/20 transition-all cursor-pointer"
            >
              Back to Catalog
            </button>
          </div>
        </div>
      )}

      {/* Persistent Sticky Cart Summary Bar */}
      {totalItems > 0 && !isCheckoutOpen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[90%] md:w-full">
          <div className="glass-panel p-4 rounded-full border border-white/10 shadow-2xl flex items-center justify-between gap-4 bg-black/90 backdrop-blur-md">
            <div className="flex items-center gap-3 pl-4">
              <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center relative">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-1.5 bg-[#2997ff] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                  {totalItems}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-bold">My Order</span>
                <span className="text-sm font-extrabold text-white font-mono">₹{totalPrice}</span>
              </div>
            </div>
            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#2997ff] hover:bg-[#54aeff] text-white text-xs font-extrabold tracking-wide uppercase shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
            >
              Checkout <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Full Screen Slide-Up Checkout Drawer */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-3xl glass-panel bg-zinc-950 rounded-t-3xl border-t border-white/10 shadow-2xl flex flex-col max-h-[85vh] text-white">
            {/* Header */}
            <div className="p-6 border-b border-zinc-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#2997ff]" />
                <h2 className="text-xl font-extrabold tracking-tight">Review Order & Pickup</h2>
              </div>
              <button 
                onClick={() => setIsCheckoutOpen(false)}
                className="p-2 rounded-full hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Order Details */}
            <div className="p-6 overflow-y-auto flex-grow flex flex-col gap-6">
              {/* Items List */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-500">Selected Items</h3>
                <div className="divide-y divide-zinc-900">
                  {itemsList.map(({ product, quantity }) => (
                    <div key={product.id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-sm text-zinc-100">{product.name}</h4>
                        <span className="text-xs text-zinc-500 font-medium">Size: {product.quantity_option}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        {/* Inline Selector */}
                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() => updateQuantity(product.id, -1, product.seller_quantity)}
                            className="p-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-900 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-sm font-semibold w-4 text-center font-mono text-zinc-200">{quantity}</span>
                          <button
                            onClick={() => updateQuantity(product.id, 1, product.seller_quantity)}
                            className="p-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-900 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-sm font-extrabold min-w-[3.5rem] text-right font-mono text-zinc-100">₹{product.price * quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Input fields */}
              <form onSubmit={handleSubmitOrder} className="space-y-4 pt-4 border-t border-zinc-900">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-zinc-500 block">Your Name</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        required
                        placeholder="Enter your name" 
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-100"
                      />
                    </div>
                  </div>

                  {/* Dropdown for Collection Centre */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-zinc-500 block">Collection Centre</label>
                    <div className="relative flex items-center">
                      <select
                        value={collectionCentre}
                        onChange={(e) => setCollectionCentre(e.target.value)}
                        className="w-full appearance-none bg-zinc-900 border border-zinc-850 rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-100 cursor-pointer"
                      >
                        <option value="Main Church">Main Church</option>
                        <option value="Mission Centre">Mission Centre</option>
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-4 pointer-events-none text-zinc-400" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-zinc-900 mt-6">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Total Price</span>
                    <span className="text-2xl font-black text-white font-mono">₹{totalPrice}</span>
                  </div>
                  <button
                    type="submit"
                    disabled={orderSubmitting}
                    className="px-8 py-3.5 rounded-full bg-[#2997ff] hover:bg-[#54aeff] disabled:bg-zinc-700 text-white font-extrabold tracking-wide uppercase shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {orderSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Placing Order
                      </>
                    ) : (
                      'Submit Order'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Sub-Component: Product Card with Quantity Selector (category removed)
function ProductCard({ 
  product, 
  quantity, 
  onQuantityChange 
}: { 
  product: Product
  quantity: number
  onQuantityChange: (qty: number) => void
}) {
  const stock = product.seller_quantity

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-white/5 flex flex-col h-full bg-[#161617]/50 relative transition-all duration-300 hover:translate-y-[-2px]">
      {/* Top badges bar */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
        {product.is_featured && (
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Featured
          </span>
        )}
      </div>

      {/* Card Details */}
      <div className="p-6 flex flex-col flex-grow gap-2">
        {/* Title */}
        <h3 className="font-bold text-lg tracking-tight leading-tight line-clamp-2 mt-1 text-zinc-100">
          {product.name}
        </h3>

        {/* Info row */}
        <div className="flex items-center justify-between text-xs text-zinc-400 mt-2">
          <span className="bg-[#2997ff]/10 text-[#2997ff] px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
            Available: {stock} {stock === 1 ? 'pack' : 'packs'}
          </span>
          <span className="bg-zinc-800/80 px-2 py-0.5 rounded font-mono font-semibold text-zinc-300">
            {product.quantity_option}
          </span>
        </div>

        {/* Push to bottom spacer */}
        <div className="flex-grow min-h-[1.5rem]"></div>

        {/* Price & Quantity Selector */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-850 mt-2">
          <div>
            <span className="text-[10px] text-zinc-500 block leading-none uppercase tracking-wider font-bold">Price</span>
            <span className="text-lg font-extrabold text-white font-mono">
              ₹{product.price}
            </span>
          </div>

          {quantity > 0 ? (
            <div className="flex items-center gap-2 bg-[#2997ff]/10 rounded-full p-1 border border-[#2997ff]/20">
              <button
                onClick={() => onQuantityChange(quantity - 1)}
                className="p-1.5 rounded-full hover:bg-zinc-900 transition-colors text-[#2997ff]"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-black min-w-[1.25rem] text-center text-[#2997ff] font-mono">
                {quantity}
              </span>
              <button
                onClick={() => onQuantityChange(quantity + 1)}
                className="p-1.5 rounded-full hover:bg-zinc-900 transition-colors text-[#2997ff]"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => onQuantityChange(1)}
              className="flex items-center gap-1 px-4 py-2 rounded-full bg-[#2997ff] hover:bg-[#54aeff] text-white transition-colors text-xs font-bold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add to Order
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
