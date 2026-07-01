'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, ChevronDown, Package, User, Phone, Clipboard, Upload, CheckCircle2, ShieldAlert, Sparkles, Loader2 } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/context/ToastContext'
import { createClient } from '@/lib/supabase/client'
import { PREDEFINED_PRODUCTS, PREDEFINED_PRODUCTS as fallbackCatalog, CatalogProduct } from '@/lib/catalog'

export default function SubmitProductPage() {
  const router = useRouter()
  const { settings } = useApp()
  const { showToast } = useToast()

  // Predefined catalog state (loads from db, falls back to catalog.ts)
  const [catalog, setCatalog] = useState<CatalogProduct[]>([])
  
  // Search dropdown states
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<CatalogProduct | null>(null)
  
  // Form fields
  const [isManual, setIsManual] = useState(false)
  const [productName, setProductName] = useState('')
  const [selectedCategoryName, setSelectedCategoryName] = useState('')
  const [availableOptions, setAvailableOptions] = useState<{ quantity: string; price: number }[]>([])
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0)
  
  // Custom manual option values (if not preset)
  const [manualQuantity, setManualQuantity] = useState('')
  const [manualPrice, setManualPrice] = useState('')

  // User input fields
  const [sellerName, setSellerName] = useState('')
  const [sellerPhone, setSellerPhone] = useState('')
  const [packsQuantity, setPacksQuantity] = useState('1')
  const [notes, setNotes] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  // Categories from database
  const [categoriesList, setCategoriesList] = useState<{ id: string; name: string }[]>([])
  
  // Loading & UI States
  const [submitting, setSubmitting] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch catalog & categories on mount
  useEffect(() => {
    const loadInitData = async () => {
      const supabase = createClient()
      
      // Load categories
      const { data: cats } = await supabase.from('categories').select('*').order('name', { ascending: true })
      if (cats) setCategoriesList(cats)

      // Load catalog from database
      const { data: dbCatalog } = await supabase.from('catalog_products').select('*').order('name', { ascending: true })
      if (dbCatalog && dbCatalog.length > 0) {
        setCatalog(dbCatalog as unknown as CatalogProduct[])
      } else {
        setCatalog(fallbackCatalog)
      }
    }
    loadInitData()
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter presets based on search query
  const filteredCatalog = catalog.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectPreset = (item: CatalogProduct) => {
    setSelectedCatalogItem(item)
    setProductName(item.name)
    setSelectedCategoryName(item.category)
    setAvailableOptions(item.options)
    setSelectedOptionIndex(0)
    setIsManual(false)
    setSearchQuery(item.name)
    setShowDropdown(false)
  }

  const handleSelectManual = () => {
    setSelectedCatalogItem(null)
    setProductName('')
    setSelectedCategoryName('')
    setAvailableOptions([])
    setManualQuantity('')
    setManualPrice('')
    setIsManual(true)
    setSearchQuery('Other Product (Manual Entry)')
    setShowDropdown(false)
  }

  // Handle image upload input
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limit size check: 5MB
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size exceeds the 5MB limit', 'error')
      return
    }

    // Allowed mime types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      showToast('Only JPG, PNG and WEBP images are allowed', 'error')
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Canvas Image Compression Helper
  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          // Limit width/height to maximum 1200px
          const MAX_SIZE = 1200
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width
              width = MAX_SIZE
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height
              height = MAX_SIZE
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error('Canvas conversion failed'))
              }
            },
            'image/jpeg',
            0.85 // 85% compression quality
          )
        }
        img.onerror = (err) => reject(err)
      }
      reader.onerror = (err) => reject(err)
    })
  }

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validations
    if (!productName.trim()) {
      showToast('Product name is required', 'error')
      return
    }
    if (!selectedCategoryName) {
      showToast('Category is required', 'error')
      return
    }
    
    let quantityStr = ''
    let priceNum = 0

    if (isManual) {
      if (!manualQuantity.trim()) {
        showToast('Package quantity size (e.g. 500 gm) is required', 'error')
        return
      }
      if (!manualPrice || isNaN(Number(manualPrice)) || Number(manualPrice) <= 0) {
        showToast('Please enter a valid price', 'error')
        return
      }
      quantityStr = manualQuantity.trim()
      priceNum = Number(manualPrice)
    } else {
      if (availableOptions.length === 0) {
        showToast('Please select a valid preset item', 'error')
        return
      }
      const activeOption = availableOptions[selectedOptionIndex]
      quantityStr = activeOption.quantity
      priceNum = activeOption.price
    }

    if (!sellerName.trim()) {
      showToast('Seller name is required', 'error')
      return
    }
    if (!sellerPhone.trim()) {
      showToast('Phone number is required', 'error')
      return
    }
    if (!packsQuantity || isNaN(Number(packsQuantity)) || Number(packsQuantity) <= 0) {
      showToast('Please enter a valid amount of packs', 'error')
      return
    }

    setSubmitting(true)
    const loadToastId = showToast('Submitting product details...', 'loading')

    try {
      const supabase = createClient()
      let finalImageUrl = null

      // 1. Upload & compress image if provided
      if (imageFile) {
        showToast('Compressing image...', 'info')
        const compressedBlob = await compressImage(imageFile)
        
        // Generate random path
        const fileExt = 'jpg' // canvas conversion returns jpeg
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
        const filePath = `submissions/${fileName}`

        // Upload to bucket
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, compressedBlob, {
            contentType: 'image/jpeg',
            cacheControl: '3600'
          })

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`)
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath)
        
        finalImageUrl = publicUrl
      }

      // 2. Fetch category UUID
      const { data: dbCat } = await supabase
        .from('categories')
        .select('id')
        .eq('name', selectedCategoryName)
        .single()

      if (!dbCat) {
        throw new Error(`Category "${selectedCategoryName}" does not exist.`)
      }

      // 3. Save product record with status = 'pending'
      const { error: insertError } = await supabase
        .from('products')
        .insert({
          name: productName.trim(),
          category_id: dbCat.id,
          description: isManual ? `Submitted manually. Size: ${quantityStr}` : `Community Predefined Catalog Product: ${productName}`,
          price: priceNum,
          quantity_option: quantityStr,
          seller_name: sellerName.trim(),
          seller_phone: sellerPhone.trim(),
          seller_quantity: Number(packsQuantity),
          notes: notes.trim() || null,
          image_url: finalImageUrl,
          status: 'pending',
          is_featured: false
        })

      if (insertError) {
        throw insertError
      }

      showToast('Product submitted successfully for review!', 'success')
      // Reset form
      setSelectedCatalogItem(null)
      setProductName('')
      setSelectedCategoryName('')
      setSearchQuery('')
      setSellerName('')
      setSellerPhone('')
      setPacksQuantity('1')
      setNotes('')
      setImageFile(null)
      setImagePreview(null)
      
      // Redirect to products catalog page
      router.push('/products')
    } catch (error: any) {
      console.error('Error submitting product:', error)
      showToast(error.message || 'Submission failed. Please check inputs.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Check if submissions are closed globally
  if (!settings.submission_enabled) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <ShieldAlert className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Submissions are Closed</h2>
        <p className="text-sm text-zinc-500 mt-2">
          The administrator has closed product submissions for the upcoming Sunday Marketplace. Please contact the parish office or try again later.
        </p>
        <Link 
          href="/"
          className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-sm font-semibold"
        >
          Return Home
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Title */}
      <div className="mb-8 text-center sm:text-left">
        <span className="text-[#0071e3] dark:text-[#2997ff] text-xs uppercase tracking-widest font-bold">Participate</span>
        <h1 className="text-3xl font-extrabold tracking-tight mt-1">Submit Your Product</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 font-light">
          Submit items you wish to sell on Sunday. Fill out details and upload a photo. Approved listings appear on the live site.
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-zinc-200/50 dark:border-white/5 shadow-lg bg-white/40 dark:bg-zinc-950/20">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Preset Searchable Dropdown */}
          <div className="relative space-y-2" ref={dropdownRef}>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Select Preset Product</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Type Spicy Chilli, Banana Chips, Pappadam..."
                value={searchQuery}
                onFocus={() => setShowDropdown(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowDropdown(true)
                }}
                className="w-full text-sm font-medium px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950/50 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 cursor-pointer"
              />
              <ChevronDown className="w-5 h-5 absolute right-3 top-3 text-zinc-400 pointer-events-none" />
            </div>

            {/* Dropdown Box */}
            {showDropdown && (
              <div className="absolute top-full left-0 w-full mt-2.5 glass-panel border border-zinc-200 dark:border-zinc-850 rounded-2xl shadow-xl z-20 max-h-64 overflow-y-auto bg-white dark:bg-[#0a0a0c]">
                {filteredCatalog.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleSelectPreset(item)}
                    className="w-full text-left text-sm px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex justify-between items-center"
                  >
                    <span className="font-semibold">{item.name}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded bg-zinc-200/50 dark:bg-zinc-800 text-zinc-400 font-bold uppercase">{item.category}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleSelectManual}
                  className="w-full text-left text-sm px-4 py-3.5 hover:bg-blue-500/10 transition-colors border-t border-zinc-200 dark:border-zinc-850 flex items-center gap-2 text-[#0071e3] dark:text-[#2997ff] font-bold"
                >
                  <Sparkles className="w-4 h-4" /> Other Product (Add Manually)
                </button>
              </div>
            )}
          </div>

          {/* Autocompleted Preset Fields */}
          {selectedCatalogItem && (
            <div className="glass-card p-5 rounded-2xl border border-zinc-200/50 dark:border-white/5 space-y-4 bg-zinc-100/35 dark:bg-zinc-900/10">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-4 h-4 text-zinc-400" /> Preset Config
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-zinc-400 block leading-none">Product Name</span>
                  <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-1 block">{productName}</span>
                </div>
                <div>
                  <span className="text-xs text-zinc-400 block leading-none">Category</span>
                  <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-1 block">{selectedCategoryName}</span>
                </div>
              </div>

              {/* Quantity Options Selector */}
              {availableOptions.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-zinc-200/30 dark:border-white/5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Choose Package Option</label>
                  <div className="flex flex-wrap gap-2">
                    {availableOptions.map((opt, index) => (
                      <button
                        key={opt.quantity}
                        type="button"
                        onClick={() => setSelectedOptionIndex(index)}
                        className={`text-xs font-semibold px-4.5 py-2.5 rounded-xl border transition-all ${
                          selectedOptionIndex === index
                            ? 'bg-[#0071e3] border-[#0071e3] text-white shadow'
                            : 'border-zinc-200 dark:border-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                        }`}
                      >
                        {opt.quantity} - ₹{opt.price}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Manual Entry Fields (If Other Product selected) */}
          {isManual && (
            <div className="glass-card p-5 rounded-2xl border border-zinc-200/50 dark:border-white/5 space-y-4 bg-zinc-100/35 dark:bg-zinc-900/10">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-zinc-400" /> Manual Configuration
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Product Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rice Halwa, Homemade Pickles"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full text-sm px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Category select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Category</label>
                  <select
                    value={selectedCategoryName}
                    onChange={(e) => setSelectedCategoryName(e.target.value)}
                    className="w-full text-sm px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 focus:outline-none"
                  >
                    <option value="">Select Category</option>
                    {categoriesList.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Package Size */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Package Size</label>
                  <input
                    type="text"
                    placeholder="e.g. 500 gm, 1 Pack, 10 Pieces"
                    value={manualQuantity}
                    onChange={(e) => setManualQuantity(e.target.value)}
                    className="w-full text-sm px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Price */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Price per Pack (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 150"
                    value={manualPrice}
                    onChange={(e) => setManualPrice(e.target.value)}
                    className="w-full text-sm px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Seller Input Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-200/30 dark:border-white/5">
            {/* Seller Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Seller Name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Your name"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  className="w-full text-sm px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950/50 focus:outline-none focus:ring-1 focus:ring-blue-500 pl-10"
                />
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" />
              </div>
            </div>

            {/* Seller Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="e.g. 9845012345"
                  value={sellerPhone}
                  onChange={(e) => setSellerPhone(e.target.value)}
                  className="w-full text-sm px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950/50 focus:outline-none focus:ring-1 focus:ring-blue-500 pl-10"
                />
                <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" />
              </div>
            </div>

            {/* Packages Amount */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Packs to Sell</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Amount"
                  value={packsQuantity}
                  onChange={(e) => setPacksQuantity(e.target.value)}
                  className="w-full text-sm px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950/50 focus:outline-none focus:ring-1 focus:ring-blue-500 pl-10"
                />
                <Package className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Seller Notes (Optional)</label>
            <div className="relative">
              <textarea
                placeholder="e.g. Prepare early in the morning, organic only, spicy, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full text-sm px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950/50 focus:outline-none focus:ring-1 focus:ring-blue-500 pl-10"
              />
              <Clipboard className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" />
            </div>
          </div>

          {/* Image Upload Component */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Product Image</label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Selector wrapper */}
              <label className="flex flex-col items-center justify-center w-full sm:w-44 h-32 border-2 border-dashed border-zinc-300 dark:border-zinc-800 hover:border-blue-500 rounded-2xl cursor-pointer transition-colors bg-zinc-100/30 dark:bg-zinc-900/10">
                <div className="flex flex-col items-center justify-center p-4 text-center">
                  <Upload className="w-6 h-6 text-zinc-400 mb-1" />
                  <span className="text-xs font-semibold text-zinc-500">Upload Image</span>
                  <span className="text-[9px] text-zinc-400 mt-0.5">JPG, PNG, WEBP (Max 5MB)</span>
                </div>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden" 
                />
              </label>

              {/* Preview */}
              {imagePreview ? (
                <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 flex items-center justify-center flex-shrink-0">
                  <img src={imagePreview} alt="Upload preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(null) }}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white p-1 rounded-full text-xs cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-150/10 dark:bg-zinc-900/10 flex items-center justify-center text-zinc-400 text-xs flex-shrink-0">
                  No preview
                </div>
              )}
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting for Review...
                </>
              ) : (
                'Submit Product for Admin Review'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
