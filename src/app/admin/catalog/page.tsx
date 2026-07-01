'use client'

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Edit, X, Check, Loader2, ListPlus } from 'lucide-react'
import { useToast } from '@/context/ToastContext'

interface CatalogOption {
  quantity: string
  price: number
}

interface CatalogProduct {
  id: string
  name: string
  category_name: string
  options: CatalogOption[]
  created_at: string
}

export default function AdminCatalogPage() {
  const { showToast } = useToast()

  // Data lists
  const [presets, setPresets] = useState<CatalogProduct[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Options input structure (Quantity size & price)
  const [options, setOptions] = useState<CatalogOption[]>([{ quantity: '', price: 0 }])

  // Form states (Add preset)
  const [name, setName] = useState('')
  const [categoryName, setCategoryName] = useState('')
  const [adding, setAdding] = useState(false)

  // Edit states
  const [editingPreset, setEditingPreset] = useState<CatalogProduct | null>(null)
  const [editName, setEditName] = useState('')
  const [editCategoryName, setEditCategoryName] = useState('')
  const [editOptions, setEditOptions] = useState<CatalogOption[]>([])
  const [saving, setSaving] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    const supabase = createClient()

    // 1. Fetch categories list
    const { data: catData } = await supabase.from('categories').select('name')
    if (catData) setCategories(catData.map(c => c.name))

    // 2. Fetch predefined catalog products
    const { data: catalogData, error } = await supabase
      .from('catalog_products')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error(error)
      showToast('Failed to load preset catalog', 'error')
    } else if (catalogData) {
      setPresets(catalogData as CatalogProduct[])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Dynamic Options Handlers (Add Form)
  const handleAddOptionRow = () => {
    setOptions([...options, { quantity: '', price: 0 }])
  }

  const handleRemoveOptionRow = (index: number) => {
    if (options.length === 1) return
    setOptions(options.filter((_, idx) => idx !== index))
  }

  const handleOptionChange = (index: number, field: keyof CatalogOption, value: any) => {
    const updated = options.map((opt, idx) => {
      if (idx === index) {
        return {
          ...opt,
          [field]: field === 'price' ? Number(value) : value
        }
      }
      return opt
    })
    setOptions(updated)
  }

  // Dynamic Options Handlers (Edit Modal)
  const handleAddEditOptionRow = () => {
    setEditOptions([...editOptions, { quantity: '', price: 0 }])
  }

  const handleRemoveEditOptionRow = (index: number) => {
    if (editOptions.length === 1) return
    setEditOptions(editOptions.filter((_, idx) => idx !== index))
  }

  const handleEditOptionChange = (index: number, field: keyof CatalogOption, value: any) => {
    const updated = editOptions.map((opt, idx) => {
      if (idx === index) {
        return {
          ...opt,
          [field]: field === 'price' ? Number(value) : value
        }
      }
      return opt
    })
    setEditOptions(updated)
  }

  // Create Preset
  const handleAddPreset = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validations
    if (!name.trim()) {
      showToast('Product name is required', 'error')
      return
    }
    if (!categoryName) {
      showToast('Category is required', 'error')
      return
    }

    // Filter out incomplete option rows
    const validOptions = options.filter(opt => opt.quantity.trim() !== '' && opt.price > 0)
    if (validOptions.length === 0) {
      showToast('Please add at least one valid package option (size & price)', 'error')
      return
    }

    setAdding(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('catalog_products')
        .insert({
          name: name.trim(),
          category_name: categoryName,
          options: validOptions
        })

      if (error) {
        if (error.code === '23505') {
          throw new Error('A catalog product with this name already exists.')
        }
        throw error
      }

      showToast('Catalog product added successfully!', 'success')
      setName('')
      setCategoryName('')
      setOptions([{ quantity: '', price: 0 }])
      fetchData() // refresh
    } catch (err: any) {
      showToast(err.message || 'Failed to add preset product', 'error')
    } finally {
      setAdding(false)
    }
  }

  // Save Preset Edits
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPreset) return

    if (!editName.trim() || !editCategoryName) {
      showToast('Product name and category are required', 'error')
      return
    }

    const validOptions = editOptions.filter(opt => opt.quantity.trim() !== '' && opt.price > 0)
    if (validOptions.length === 0) {
      showToast('Please add at least one valid package option (size & price)', 'error')
      return
    }

    setSaving(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('catalog_products')
        .update({
          name: editName.trim(),
          category_name: editCategoryName,
          options: validOptions
        })
        .eq('id', editingPreset.id)

      if (error) {
        if (error.code === '23505') {
          throw new Error('A catalog product with this name already exists.')
        }
        throw error
      }

      showToast('Catalog product updated successfully!', 'success')
      setEditingPreset(null)
      fetchData() // refresh
    } catch (err: any) {
      showToast(err.message || 'Failed to update preset product', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Delete Preset
  const handleDeletePreset = async (id: string, presetName: string) => {
    if (!confirm(`Are you sure you want to delete "${presetName}" from the predefined catalog dropdown list?`)) return

    const supabase = createClient()
    try {
      const { error } = await supabase
        .from('catalog_products')
        .delete()
        .eq('id', id)

      if (error) throw error

      showToast('Preset product removed successfully', 'success')
      setPresets(prev => prev.filter(p => p.id !== id))
    } catch (err: any) {
      showToast(err.message || 'Failed to delete preset product', 'error')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Title */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Preset Catalog</h1>
          <p className="text-sm text-zinc-500 mt-1 font-light">
            Configure the predefined product lists that populate the searchable dropdown on the visitor submit form, avoiding typos.
          </p>
        </div>

        {/* 2 Grid: Form + Table */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          
          {/* Left 2 Cols: Form Panel */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-zinc-200/50 dark:border-white/5 bg-white/40 dark:bg-zinc-950/10 space-y-6">
            <h2 className="text-lg font-bold tracking-tight">Add Preset Product</h2>
            
            <form onSubmit={handleAddPreset} className="space-y-4">
              {/* Product Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. Kashmiri Chilli Powder"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-white/50 dark:bg-zinc-950/30 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Category Select */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Category</label>
                <select
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 focus:outline-none"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Options Dynamic rows */}
              <div className="space-y-2 pt-2 border-t border-zinc-200/30 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Package Options</label>
                  <button
                    type="button"
                    onClick={handleAddOptionRow}
                    className="text-[10px] font-bold text-[#0071e3] dark:text-[#2997ff] hover:underline"
                  >
                    + Add Size/Price
                  </button>
                </div>

                <div className="space-y-2">
                  {options.map((opt, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="e.g. 500 gm, 1 Pack"
                        value={opt.quantity}
                        onChange={(e) => handleOptionChange(index, 'quantity', e.target.value)}
                        className="w-1/2 text-[11px] px-2.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 focus:outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Price (₹)"
                        value={opt.price || ''}
                        onChange={(e) => handleOptionChange(index, 'price', e.target.value)}
                        className="w-1/3 text-[11px] px-2.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 focus:outline-none"
                      />
                      {options.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOptionRow(index)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={adding}
                className="w-full py-2.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-4"
              >
                {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ListPlus className="w-3.5 h-3.5" />}
                Add Preset Product
              </button>
            </form>
          </div>

          {/* Right 3 Cols: Presets List Table */}
          <div className="lg:col-span-3 glass-panel rounded-2xl border border-zinc-200/50 dark:border-white/5 overflow-hidden bg-white dark:bg-[#161617]/40">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-850 font-bold uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="p-4">Product preset</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Options (Size/Price)</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-850">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-10 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" />
                    </td>
                  </tr>
                ) : presets.length > 0 ? (
                  presets.map((preset) => (
                    <tr key={preset.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10">
                      <td className="p-4 font-bold text-sm">{preset.name}</td>
                      <td className="p-4">
                        <span className="bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded text-[10px] font-bold text-zinc-400 uppercase tracking-wider border dark:border-zinc-850">
                          {preset.category_name}
                        </span>
                      </td>
                      <td className="p-4 font-medium">
                        <div className="flex flex-wrap gap-1">
                          {preset.options.map((opt, i) => (
                            <span key={i} className="text-[10px] bg-blue-500/10 text-[#0071e3] dark:text-[#2997ff] px-2 py-0.5 rounded font-mono">
                              {opt.quantity} (₹{opt.price})
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingPreset(preset)
                              setEditName(preset.name)
                              setEditCategoryName(preset.category_name)
                              setEditOptions(preset.options)
                            }}
                            className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                            title="Edit Preset Config"
                          >
                            <Edit className="w-4 h-4 text-zinc-400" />
                          </button>
                          <button
                            onClick={() => handleDeletePreset(preset.id, preset.name)}
                            className="p-1 rounded hover:bg-red-500/10 text-red-500 cursor-pointer"
                            title="Delete Preset"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-zinc-450">
                      No predefined products catalog items found in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

      {/* Edit Preset Modal */}
      {editingPreset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel max-w-lg w-full rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 sm:p-8 bg-white dark:bg-[#0a0a0c] shadow-2xl flex flex-col gap-6">
            
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold tracking-tight">Edit Preset Product</h2>
              <button 
                onClick={() => setEditingPreset(null)}
                className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <X className="w-6 h-6 text-zinc-400" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Product Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Product Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-855 bg-white dark:bg-zinc-950 focus:outline-none"
                />
              </div>

              {/* Category Select */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Category</label>
                <select
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-855 bg-white dark:bg-zinc-950 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Options list */}
              <div className="space-y-2 pt-2 border-t border-zinc-200/35 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Package Options</label>
                  <button
                    type="button"
                    onClick={handleAddEditOptionRow}
                    className="text-[10px] font-bold text-[#0071e3] dark:text-[#2997ff] hover:underline"
                  >
                    + Add Row
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {editOptions.map((opt, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Size Size"
                        value={opt.quantity}
                        onChange={(e) => handleEditOptionChange(index, 'quantity', e.target.value)}
                        className="w-1/2 text-[11px] px-2.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-855 bg-white dark:bg-zinc-950 focus:outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={opt.price || ''}
                        onChange={(e) => handleEditOptionChange(index, 'price', e.target.value)}
                        className="w-1/3 text-[11px] px-2.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-855 bg-white dark:bg-zinc-950 focus:outline-none"
                      />
                      {editOptions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveEditOptionRow(index)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200/35 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setEditingPreset(null)}
                  className="px-5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold transition-all shadow flex items-center gap-1"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save Presets
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
