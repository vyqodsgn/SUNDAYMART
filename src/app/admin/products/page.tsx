'use client'

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { createClient } from '@/lib/supabase/client'
import { Search, Trash2, Edit, Check, X, Star, Loader2, Plus, Download, RefreshCw, XCircle, ChevronDown } from 'lucide-react'
import { useToast } from '@/context/ToastContext'
import { PREDEFINED_PRODUCTS } from '@/lib/catalog'

interface Category {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  price: number
  quantity_option: string
  seller_name: string
  seller_quantity: number
  notes: string | null
  status: string
  is_featured: boolean
  created_at: string
  category_id: string
}

export default function AdminProductsPage() {
  const { showToast } = useToast()

  // Data states
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  
  // Filtering & Pagination states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all') // 'all', 'approved', 'sold'
  
  // Loading & Action states
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Creation form states
  const [addPresetIndex, setAddPresetIndex] = useState<string>('')
  const [addPresetOptionIndex, setAddPresetOptionIndex] = useState<number>(0)
  const [addName, setAddName] = useState('')
  const [addPrice, setAddPrice] = useState('')
  const [addQuantityOption, setAddQuantityOption] = useState('')
  const [addSellerName, setAddSellerName] = useState('Church')
  const [addSellerQuantity, setAddSellerQuantity] = useState('1000')
  const [addNotes, setAddNotes] = useState('')
  const [addIsFeatured, setAddIsFeatured] = useState(false)

  // Edit form states
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editQuantityOption, setEditQuantityOption] = useState('')
  const [editSellerName, setEditSellerName] = useState('')
  const [editSellerQuantity, setEditSellerQuantity] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [editIsFeatured, setEditIsFeatured] = useState(false)

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true)
    const supabase = createClient()
    
    // Fetch categories
    const { data: catData } = await supabase.from('categories').select('*').order('name')
    if (catData) setCategories(catData)

    // Fetch all products
    const { data: prodData, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error(error)
      showToast('Failed to load catalog products', 'error')
    } else if (prodData) {
      setProducts(prodData as unknown as Product[])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Auto-populate creation form fields on selecting preset
  useEffect(() => {
    if (addPresetIndex !== '') {
      const idx = parseInt(addPresetIndex)
      if (!isNaN(idx) && PREDEFINED_PRODUCTS[idx]) {
        const preset = PREDEFINED_PRODUCTS[idx]
        setAddName(preset.name)
        
        // Populate options
        const option = preset.options[addPresetOptionIndex] || preset.options[0]
        if (option) {
          setAddPrice(String(option.price))
          setAddQuantityOption(option.quantity)
        }
      }
    }
  }, [addPresetIndex, addPresetOptionIndex])

  // Handle Preset Change
  const handlePresetSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAddPresetIndex(e.target.value)
    setAddPresetOptionIndex(0)
  }

  // Local filtering
  const filteredProducts = products.filter((prod) => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = prod.name.toLowerCase().includes(searchLower) || (prod.notes && prod.notes.toLowerCase().includes(searchLower))
    const matchesStatus = selectedStatus === 'all' || prod.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  // Add Product Submit
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addName.trim() || !addPrice || !addQuantityOption) {
      showToast('Name, Price, and Unit Size are required', 'error')
      return
    }

    const defaultCategoryId = categories[0]?.id
    if (!defaultCategoryId) {
      showToast('No category found in database. Please configure a default category.', 'error')
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('products')
        .insert({
          name: addName.trim(),
          category_id: defaultCategoryId,
          price: Number(addPrice),
          quantity_option: addQuantityOption.trim(),
          seller_name: addSellerName.trim() || 'Church',
          seller_quantity: Number(addSellerQuantity) || 1000,
          notes: addNotes.trim() || null,
          status: 'approved', // Always active
          is_featured: addIsFeatured
        })

      if (error) throw error

      showToast('Product added to active catalog!', 'success')
      setIsAddModalOpen(false)
      
      // Reset form
      setAddPresetIndex('')
      setAddName('')
      setAddPrice('')
      setAddQuantityOption('')
      setAddNotes('')
      setAddIsFeatured(false)
      
      fetchData()
    } catch (err: any) {
      console.error(err)
      showToast(err.message || 'Failed to add product', 'error')
      setLoading(false)
    }
  }

  // Toggle availability (approved vs sold)
  const handleToggleAvailability = async (id: string, currentStatus: string) => {
    setActionLoadingId(id)
    const supabase = createClient()
    const newStatus = currentStatus === 'approved' ? 'sold' : 'approved'
    
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error

      setProducts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p))
      showToast(`Product is now ${newStatus === 'approved' ? 'Available' : 'Sold Out'}`, 'success')
    } catch (err: any) {
      showToast(err.message || 'Status toggle failed', 'error')
    } finally {
      setActionLoadingId(null)
    }
  }

  // Toggle Featured Pick
  const handleToggleFeatured = async (id: string, currentVal: boolean) => {
    setActionLoadingId(id)
    const supabase = createClient()
    const nextVal = !currentVal
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_featured: nextVal })
        .eq('id', id)

      if (error) throw error

      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_featured: nextVal } : p))
      showToast(`Featured pick ${nextVal ? 'enabled' : 'disabled'}`, 'success')
    } catch (err: any) {
      showToast(err.message || 'Failed to update featured pick', 'error')
    } finally {
      setActionLoadingId(null)
    }
  }

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this catalog item permanently?')) return
    setActionLoadingId(id)
    const supabase = createClient()
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error

      setProducts(prev => prev.filter(p => p.id !== id))
      showToast('Product deleted permanently', 'success')
    } catch (err: any) {
      showToast(err.message || 'Deletion failed', 'error')
    } finally {
      setActionLoadingId(null)
    }
  }

  // Open Edit Modal
  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod)
    setEditName(prod.name)
    setEditPrice(String(prod.price))
    setEditQuantityOption(prod.quantity_option)
    setEditSellerName(prod.seller_name)
    setEditSellerQuantity(String(prod.seller_quantity))
    setEditNotes(prod.notes || '')
    setEditIsFeatured(prod.is_featured)
  }

  // Save Edit Submit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return

    if (!editName.trim() || !editPrice || !editQuantityOption) {
      showToast('Name, Price, and Unit Size are required', 'error')
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: editName.trim(),
          price: Number(editPrice),
          quantity_option: editQuantityOption.trim(),
          seller_name: editSellerName.trim() || 'Church',
          seller_quantity: Number(editSellerQuantity) || 1000,
          notes: editNotes.trim() || null,
          is_featured: editIsFeatured
        })
        .eq('id', editingProduct.id)

      if (error) throw error

      showToast('Product details updated successfully!', 'success')
      setEditingProduct(null)
      fetchData()
    } catch (err: any) {
      console.error(err)
      showToast(err.message || 'Failed to update product', 'error')
      setLoading(false)
    }
  }

  // Export Product Data to CSV
  const handleExportCSV = () => {
    if (filteredProducts.length === 0) {
      showToast('No products available to export', 'error')
      return
    }

    const headers = ['ID', 'Name', 'Price (INR)', 'Unit Package Size', 'Status', 'Featured Pick', 'Created At']
    const rows = filteredProducts.map(p => [
      p.id,
      p.name,
      p.price,
      p.quantity_option,
      p.status === 'approved' ? 'Available' : 'Sold Out',
      p.is_featured ? 'Yes' : 'No',
      p.created_at
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `sundaymart_catalog_${Date.now()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Catalog exported to CSV successfully', 'success')
  }

  return (
    <AdminLayout>
      <div className="space-y-6 text-white">
        
        {/* Title row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Active Catalog</h1>
            <p className="text-sm text-zinc-400 mt-1 font-light">
              Add and edit items in the church marketplace. Items are instantly approved for user orders.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2997ff] hover:bg-[#54aeff] text-white text-xs font-bold shadow transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-xs font-semibold cursor-pointer"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button 
              onClick={fetchData}
              className="p-2 rounded-xl border border-zinc-800 hover:bg-zinc-900 transition-colors cursor-pointer"
              aria-label="Reload data"
            >
              <RefreshCw className="w-4 h-4 text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Filter controls panel */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-950/10">
          {/* Search bar */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Search</label>
            <input
              type="text"
              placeholder="Search product"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-850 bg-zinc-950 focus:outline-none text-white"
            />
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Availability</label>
            <div className="relative flex items-center">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full appearance-none text-xs px-3.5 py-2.5 rounded-lg border border-zinc-850 bg-zinc-950 focus:outline-none cursor-pointer text-white pr-10"
              >
                <option value="all">All Statuses</option>
                <option value="approved">Available</option>
                <option value="sold">Sold Out</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3.5 pointer-events-none text-zinc-405 text-zinc-400" />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden bg-[#161617]/40 shadow-sm">
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-zinc-900 border-b border-zinc-805 border-zinc-800 font-bold uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="p-4 min-w-[200px]">Product details</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Availability</th>
                  <th className="p-4 text-center">Featured</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-900">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-zinc-500">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                        <span>Updating Catalog</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-zinc-900/10">
                      {/* Product details */}
                      <td className="p-4">
                        <div className="font-bold text-sm text-zinc-150 leading-tight">{prod.name}</div>
                        <div className="text-[10px] text-zinc-500 mt-1 font-mono">{prod.quantity_option}</div>
                      </td>

                      {/* Price */}
                      <td className="p-4 font-bold text-white">
                        ₹{prod.price}
                      </td>

                      {/* Status toggle */}
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleAvailability(prod.id, prod.status)}
                          disabled={actionLoadingId === prod.id}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer border hover:opacity-85 transition-all ${
                            prod.status === 'approved' 
                              ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                              : 'bg-red-500/10 text-red-500 border-red-500/20'
                          }`}
                        >
                          {prod.status === 'approved' ? 'Available' : 'Sold Out'}
                        </button>
                      </td>

                      {/* Featured checkbox */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleFeatured(prod.id, prod.is_featured)}
                          disabled={actionLoadingId === prod.id}
                          className="p-1 hover:bg-zinc-900 rounded-full cursor-pointer disabled:opacity-40"
                          aria-label="Toggle Featured Pick"
                        >
                          <Star className={`w-4.5 h-4.5 ${prod.is_featured ? 'fill-amber-500 text-amber-500' : 'text-zinc-700'}`} />
                        </button>
                      </td>

                      {/* Action buttons */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Details */}
                          <button
                            onClick={() => handleOpenEditModal(prod)}
                            className="p-1.5 rounded hover:bg-zinc-900 border border-transparent cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4 text-zinc-500" />
                          </button>

                          {/* Delete Item */}
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            disabled={actionLoadingId === prod.id}
                            className="p-1.5 rounded hover:bg-red-500/10 text-red-500 cursor-pointer disabled:opacity-40"
                            title="Delete Permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-zinc-500">
                      No catalog products found. Click &quot;Add Product&quot; to list items.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel max-w-xl w-full max-h-[90vh] overflow-y-auto rounded-3xl border border-zinc-850 p-6 sm:p-8 bg-[#0a0a0c] shadow-2xl flex flex-col gap-6 text-white">
            
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold tracking-tight">Add Catalog Product</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full hover:bg-zinc-900 cursor-pointer"
              >
                <XCircle className="w-6 h-6 text-zinc-500" />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-4">
              {/* Preset selection dropdown */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Choose from presets</label>
                <div className="relative flex items-center">
                  <select
                    value={addPresetIndex}
                    onChange={handlePresetSelectChange}
                    className="w-full appearance-none text-xs px-3.5 py-2.5 rounded-lg border border-zinc-850 bg-zinc-950 focus:outline-none cursor-pointer text-white pr-10"
                  >
                    <option value="">-- Select Predefined Food Preset (Optional) --</option>
                    {PREDEFINED_PRODUCTS.map((preset, idx) => (
                      <option key={idx} value={idx}>{preset.name} ({preset.category})</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3.5 pointer-events-none text-zinc-400" />
                </div>
              </div>

              {/* Predefined Option selection (if presets have options) */}
              {addPresetIndex !== '' && PREDEFINED_PRODUCTS[parseInt(addPresetIndex)]?.options.length > 1 && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Select Package Option</label>
                  <div className="relative flex items-center">
                    <select
                      value={addPresetOptionIndex}
                      onChange={(e) => setAddPresetOptionIndex(Number(e.target.value))}
                      className="w-full appearance-none text-xs px-3.5 py-2.5 rounded-lg border border-zinc-850 bg-zinc-950 focus:outline-none cursor-pointer text-white pr-10"
                    >
                      {PREDEFINED_PRODUCTS[parseInt(addPresetIndex)].options.map((opt, oIdx) => (
                        <option key={oIdx} value={oIdx}>{opt.quantity} - ₹{opt.price}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3.5 pointer-events-none text-zinc-400" />
                  </div>
                </div>
              )}

              <hr className="border-zinc-850 my-2" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fresh Mangoes"
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-850 bg-zinc-950 focus:outline-none text-zinc-100"
                  />
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 150"
                    value={addPrice}
                    onChange={(e) => setAddPrice(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-850 bg-zinc-950 focus:outline-none text-zinc-100"
                  />
                </div>

                {/* Quantity option (size) */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Unit Package Size *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500 gm, 1 Pack, 10 Pieces"
                    value={addQuantityOption}
                    onChange={(e) => setAddQuantityOption(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-850 bg-zinc-950 focus:outline-none text-zinc-100"
                  />
                </div>

                {/* Stock Quantity */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Net Quantity *</label>
                  <input
                    type="number"
                    required
                    value={addSellerQuantity}
                    onChange={(e) => setAddSellerQuantity(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-850 bg-zinc-950 focus:outline-none text-zinc-100"
                  />
                </div>
              </div>

              {/* Advanced Source */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Seller Source</label>
                <input
                  type="text"
                  value={addSellerName}
                  onChange={(e) => setAddSellerName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-850 bg-zinc-900 focus:outline-none text-zinc-300"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Product Description / Notes</label>
                <textarea
                  placeholder="Optional details or description"
                  value={addNotes}
                  onChange={(e) => setAddNotes(e.target.value)}
                  rows={2}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-850 bg-zinc-950 focus:outline-none text-zinc-100"
                />
              </div>

              {/* Featured toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-850 bg-zinc-950/20">
                <span className="text-xs font-bold text-zinc-300">Set as Featured Pick</span>
                <input 
                  type="checkbox"
                  checked={addIsFeatured}
                  onChange={(e) => setAddIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-zinc-800 text-xs font-bold hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#2997ff] hover:bg-[#54aeff] text-white text-xs font-bold transition-all shadow cursor-pointer"
                >
                  Add Product
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel max-w-xl w-full max-h-[90vh] overflow-y-auto rounded-3xl border border-zinc-850 p-6 sm:p-8 bg-[#0a0a0c] shadow-2xl flex flex-col gap-6 text-white">
            
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold tracking-tight">Edit Product Details</h2>
              <button 
                onClick={() => setEditingProduct(null)}
                className="p-1 rounded-full hover:bg-zinc-900 cursor-pointer"
              >
                <XCircle className="w-6 h-6 text-zinc-500" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-850 bg-zinc-950 focus:outline-none text-zinc-100"
                  />
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-850 bg-zinc-950 focus:outline-none text-zinc-100"
                  />
                </div>

                {/* Quantity size */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Unit Package Size *</label>
                  <input
                    type="text"
                    required
                    value={editQuantityOption}
                    onChange={(e) => setEditQuantityOption(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-850 bg-zinc-950 focus:outline-none text-zinc-100"
                  />
                </div>

                {/* Stock Quantity */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Net Quantity *</label>
                  <input
                    type="number"
                    required
                    value={editSellerQuantity}
                    onChange={(e) => setEditSellerQuantity(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-850 bg-zinc-950 focus:outline-none text-zinc-100"
                  />
                </div>
              </div>

              {/* Extra Details */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Seller Source</label>
                <input
                  type="text"
                  value={editSellerName}
                  onChange={(e) => setEditSellerName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-850 bg-zinc-900 focus:outline-none text-zinc-300"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Product Description / Notes</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={2}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-850 bg-zinc-950 focus:outline-none text-zinc-100"
                />
              </div>

              {/* Featured toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-850 bg-zinc-950/20">
                <span className="text-xs font-bold text-zinc-300">Set as Featured Pick</span>
                <input 
                  type="checkbox"
                  checked={editIsFeatured}
                  onChange={(e) => setEditIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-5 py-2.5 rounded-xl border border-zinc-800 text-xs font-bold hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#2997ff] hover:bg-[#54aeff] text-white text-xs font-bold transition-all shadow cursor-pointer"
                >
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
