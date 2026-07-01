'use client'

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { createClient } from '@/lib/supabase/client'
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Trash2, Edit, Check, X, Eye, Download, Star, Loader2, RefreshCw } from 'lucide-react'
import { useToast } from '@/context/ToastContext'

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
  categories: {
    name: string
  }
}

export default function AdminProductsPage() {
  const { showToast } = useToast()

  // Data states
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  
  // Filtering & Pagination states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8
  
  // Selection states (for bulk actions)
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  
  // Loading & Action states
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  
  // Edit modal states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editName, setEditName] = useState('')
  const [editCategoryId, setEditCategoryId] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editQuantityOption, setEditQuantityOption] = useState('')
  const [editSellerName, setEditSellerName] = useState('')
  const [editSellerQuantity, setEditSellerQuantity] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [editStatus, setEditStatus] = useState('')
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
      .select('*, categories(name)')
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
    fetchData()
  }, [])

  // Apply search & filtering locally
  const filteredProducts = products.filter((prod) => {
    // 1. Search Query
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = 
      prod.name.toLowerCase().includes(searchLower) ||
      prod.seller_name.toLowerCase().includes(searchLower) ||
      (prod.notes && prod.notes.toLowerCase().includes(searchLower))

    // 2. Status Filter
    const matchesStatus = selectedStatus === 'all' || prod.status === selectedStatus

    // 3. Category Filter
    const matchesCategory = selectedCategory === 'all' || prod.category_id === selectedCategory

    return matchesSearch && matchesStatus && matchesCategory
  })

  // Pagination Math
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedStatus, selectedCategory])

  // Toggle selection for bulk actions
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProductIds(paginatedProducts.map(p => p.id))
    } else {
      setSelectedProductIds([])
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedProductIds(prev => [...prev, id])
    } else {
      setSelectedProductIds(prev => prev.filter(item => item !== id))
    }
  }

  // Individual Status Updates
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setActionLoadingId(id)
    const supabase = createClient()
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error

      setProducts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p))
      showToast(`Product marked as ${newStatus}`, 'success')
    } catch (err: any) {
      showToast(err.message || 'Status update failed', 'error')
    } finally {
      setActionLoadingId(null)
    }
  }

  // Toggle Featured Picker
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
      showToast(err.message || 'Failed to update featured pick status', 'error')
    } finally {
      setActionLoadingId(null)
    }
  }

  // Delete Individual Product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product listing permanently?')) return
    setActionLoadingId(id)
    const supabase = createClient()
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error

      setProducts(prev => prev.filter(p => p.id !== id))
      setSelectedProductIds(prev => prev.filter(item => item !== id))
      showToast('Product listing deleted permanently', 'success')
    } catch (err: any) {
      showToast(err.message || 'Deletion failed', 'error')
    } finally {
      setActionLoadingId(null)
    }
  }

  // Bulk operations
  const handleBulkAction = async (action: 'approve' | 'reject' | 'delete') => {
    if (selectedProductIds.length === 0) return
    
    const confirmMsg = action === 'delete' 
      ? `Are you sure you want to delete the ${selectedProductIds.length} selected items permanently?`
      : `Are you sure you want to ${action} the ${selectedProductIds.length} selected items?`
      
    if (!confirm(confirmMsg)) return

    setLoading(true)
    const supabase = createClient()

    try {
      if (action === 'delete') {
        const { error } = await supabase
          .from('products')
          .delete()
          .in('id', selectedProductIds)

        if (error) throw error
        setProducts(prev => prev.filter(p => !selectedProductIds.includes(p.id)))
        showToast('Selected products deleted successfully', 'success')
      } else {
        const targetStatus = action === 'approve' ? 'approved' : 'rejected'
        const { error } = await supabase
          .from('products')
          .update({ status: targetStatus })
          .in('id', selectedProductIds)

        if (error) throw error
        setProducts(prev => prev.map(p => selectedProductIds.includes(p.id) ? { ...p, status: targetStatus } : p))
        showToast(`Selected products marked as ${targetStatus}`, 'success')
      }
      setSelectedProductIds([])
    } catch (err: any) {
      showToast(err.message || 'Bulk operation failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Edit Modal Handlers
  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod)
    setEditName(prod.name)
    setEditCategoryId(prod.category_id)
    setEditPrice(String(prod.price))
    setEditQuantityOption(prod.quantity_option)
    setEditSellerName(prod.seller_name)
    setEditSellerQuantity(String(prod.seller_quantity))
    setEditNotes(prod.notes || '')
    setEditStatus(prod.status)
    setEditIsFeatured(prod.is_featured)
  }

  const handleCloseEditModal = () => {
    setEditingProduct(null)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return

    if (!editName.trim() || !editCategoryId || !editPrice || !editQuantityOption || !editSellerName.trim() || !editSellerQuantity) {
      showToast('All fields except notes are required', 'error')
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: editName.trim(),
          category_id: editCategoryId,
          price: Number(editPrice),
          quantity_option: editQuantityOption.trim(),
          seller_name: editSellerName.trim(),
          seller_quantity: Number(editSellerQuantity),
          notes: editNotes.trim() || null,
          status: editStatus,
          is_featured: editIsFeatured
        })
        .eq('id', editingProduct.id)

      if (error) throw error

      showToast('Product updated successfully', 'success')
      setEditingProduct(null)
      fetchData() // Refresh catalog
    } catch (err: any) {
      showToast(err.message || 'Failed to save product edits', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Export Product Data to CSV
  const handleExportCSV = () => {
    if (filteredProducts.length === 0) {
      showToast('No products available to export', 'error')
      return
    }

    const headers = ['ID', 'Name', 'Category', 'Price (INR)', 'Unit Package Size', 'Seller Name', 'Quantity', 'Status', 'Featured Pick', 'Created At']
    const rows = filteredProducts.map(p => [
      p.id,
      p.name,
      p.categories?.name || '',
      p.price,
      p.quantity_option,
      p.seller_name,
      p.seller_quantity,
      p.status,
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
    link.setAttribute('download', `church_sundaymart_products_${Date.now()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Catalog exported to CSV successfully', 'success')
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Title row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Product Submissions</h1>
            <p className="text-sm text-zinc-500 mt-1 font-light">
              Review visitor product submissions, toggle approvals, edit values, or mark as sold.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 hover:bg-green-500/20 text-xs font-semibold cursor-pointer"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button 
              onClick={fetchData}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              aria-label="Reload data"
            >
              <RefreshCw className="w-4.5 h-4.5 text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Filter controls panel */}
        <div className="glass-panel p-5 rounded-2xl border border-zinc-200/50 dark:border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white/40 dark:bg-zinc-950/10">
          {/* Search bar */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Search</label>
            <input
              type="text"
              placeholder="Search product, seller..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved Active</option>
              <option value="rejected">Rejected Listings</option>
              <option value="sold">Marked Sold Out</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk Action Controls */}
        {selectedProductIds.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm">
            <span className="font-semibold text-xs text-blue-500">{selectedProductIds.length} items selected</span>
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => handleBulkAction('approve')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" /> Approve
              </button>
              <button
                onClick={() => handleBulkAction('reject')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-yellow-500 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" /> Reject
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="glass-panel rounded-2xl border border-zinc-200/50 dark:border-white/5 overflow-hidden bg-white dark:bg-[#161617]/40">
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 font-bold uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="p-4 w-12 text-center">
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll}
                      checked={paginatedProducts.length > 0 && selectedProductIds.length === paginatedProducts.length}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th className="p-4 min-w-[150px]">Product details</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Seller Info</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Featured</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-850">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-10 text-center text-zinc-500">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                        <span>Updating Queue...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedProducts.length > 0 ? (
                  paginatedProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10">
                      {/* Checkbox select */}
                      <td className="p-4 text-center">
                        <input 
                          type="checkbox"
                          checked={selectedProductIds.includes(prod.id)}
                          onChange={(e) => handleSelectOne(prod.id, e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                        />
                      </td>

                      {/* Product details */}
                      <td className="p-4">
                        <div className="font-bold text-sm text-zinc-800 dark:text-zinc-150 leading-tight">{prod.name}</div>
                        <div className="text-[10px] text-zinc-400 mt-1 font-mono">{prod.quantity_option}</div>
                      </td>

                      {/* Category */}
                      <td className="p-4 text-zinc-600 dark:text-zinc-300">
                        {prod.categories?.name}
                      </td>

                      {/* Price */}
                      <td className="p-4 font-bold text-zinc-800 dark:text-white">
                        ₹{prod.price}
                      </td>

                      {/* Seller Info */}
                      <td className="p-4">
                        <div className="font-semibold">{prod.seller_name}</div>
                        <div className="text-[10px] text-zinc-400 font-light mt-0.5">Qty: {prod.seller_quantity} packs</div>
                      </td>

                      {/* Status badge */}
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          prod.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                          prod.status === 'approved' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                          prod.status === 'sold' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                          'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}>
                          {prod.status}
                        </span>
                      </td>

                      {/* Featured checkbox */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleFeatured(prod.id, prod.is_featured)}
                          disabled={actionLoadingId === prod.id}
                          className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full cursor-pointer disabled:opacity-40"
                          aria-label="Toggle Featured Pick"
                        >
                          <Star className={`w-4.5 h-4.5 ${prod.is_featured ? 'fill-amber-500 text-amber-500' : 'text-zinc-300 dark:text-zinc-700'}`} />
                        </button>
                      </td>

                      {/* Action buttons */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Approve option (if pending/rejected) */}
                          {prod.status !== 'approved' && prod.status !== 'sold' && (
                            <button
                              onClick={() => handleUpdateStatus(prod.id, 'approved')}
                              disabled={actionLoadingId === prod.id}
                              className="p-1 rounded bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20 cursor-pointer"
                              title="Approve Listing"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}

                          {/* Reject option (if pending/approved) */}
                          {prod.status !== 'rejected' && prod.status !== 'sold' && (
                            <button
                              onClick={() => handleUpdateStatus(prod.id, 'rejected')}
                              disabled={actionLoadingId === prod.id}
                              className="p-1 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 hover:bg-yellow-500/20 cursor-pointer"
                              title="Reject Listing"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}

                          {/* Mark as Sold option */}
                          {prod.status === 'approved' && (
                            <button
                              onClick={() => handleUpdateStatus(prod.id, 'sold')}
                              disabled={actionLoadingId === prod.id}
                              className="px-2 py-1 text-[10px] rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/20 cursor-pointer font-bold uppercase tracking-wider"
                              title="Mark as Sold"
                            >
                              Sold
                            </button>
                          )}

                          {/* Restore Option (if sold) */}
                          {prod.status === 'sold' && (
                            <button
                              onClick={() => handleUpdateStatus(prod.id, 'approved')}
                              disabled={actionLoadingId === prod.id}
                              className="px-2 py-1 text-[10px] rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border hover:bg-zinc-300 dark:hover:bg-zinc-700 cursor-pointer font-bold uppercase tracking-wider"
                              title="Restore Listing"
                            >
                              Restore
                            </button>
                          )}

                          {/* Edit Details */}
                          <button
                            onClick={() => handleOpenEditModal(prod)}
                            className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent cursor-pointer"
                            title="Edit Listing Details"
                          >
                            <Edit className="w-4 h-4 text-zinc-450" />
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
                    <td colSpan={8} className="p-12 text-center text-zinc-400">
                      No product listings found matching the active filters in this event.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-500 text-xs font-medium">Page {currentPage} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded border border-zinc-200 dark:border-zinc-800 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded border border-zinc-200 dark:border-zinc-800 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Edit Details Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel max-w-xl w-full max-h-[90vh] overflow-y-auto rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 sm:p-8 bg-white dark:bg-[#0a0a0c] shadow-2xl flex flex-col gap-6">
            
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold tracking-tight">Edit Product Listing</h2>
              <button 
                onClick={handleCloseEditModal}
                className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <XCircle className="w-6 h-6 text-zinc-400" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Product Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Product Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 focus:outline-none"
                  />
                </div>

                {/* Category select */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Category</label>
                  <select
                    value={editCategoryId}
                    onChange={(e) => setEditCategoryId(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Quantity option (size) */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Package unit Size</label>
                  <input
                    type="text"
                    value={editQuantityOption}
                    onChange={(e) => setEditQuantityOption(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 focus:outline-none"
                  />
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Price (₹)</label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 focus:outline-none"
                  />
                </div>

                {/* Seller Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Seller Name</label>
                  <input
                    type="text"
                    value={editSellerName}
                    onChange={(e) => setEditSellerName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 focus:outline-none"
                  />
                </div>



                {/* Seller Quantity */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Total Packs available</label>
                  <input
                    type="number"
                    value={editSellerQuantity}
                    onChange={(e) => setEditSellerQuantity(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 focus:outline-none"
                  />
                </div>

                {/* Listing Status */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Listing Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 focus:outline-none"
                  >
                    <option value="pending">Pending Review</option>
                    <option value="approved">Approved Active</option>
                    <option value="rejected">Rejected Listings</option>
                    <option value="sold">Marked Sold Out</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Seller Notes</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={2}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 focus:outline-none"
                />
              </div>

              {/* Featured toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950/20">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Set as Featured Pick</span>
                <input 
                  type="checkbox"
                  checked={editIsFeatured}
                  onChange={(e) => setEditIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200/35 dark:border-white/5">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="px-5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold transition-all shadow"
                >
                  Save Product Edits
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
