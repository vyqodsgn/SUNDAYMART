'use client'

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { createClient } from '@/lib/supabase/client'
import { FolderHeart, Plus, Edit, Trash2, X, Check, Loader2 } from 'lucide-react'
import { useToast } from '@/context/ToastContext'

interface Category {
  id: string
  name: string
  slug: string
  created_at: string
}

export default function AdminCategoriesPage() {
  const { showToast } = useToast()
  
  // Data lists
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Add Category form states
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [adding, setAdding] = useState(false)

  // Edit Category states
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editName, setEditName] = useState('')
  const [editSlug, setEditSlug] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchCategories = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Error fetching categories:', error)
      showToast('Failed to load categories', 'error')
    } else if (data) {
      setCategories(data as Category[])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Auto-generate slug from name
  const generateSlug = (val: string) => {
    return val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // remove special characters
      .replace(/[\s_-]+/g, '-') // replace spaces/hyphens with single hyphen
      .replace(/^-+|-+$/g, '') // remove leading/trailing hyphens
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setName(val)
    setSlug(generateSlug(val))
  }

  const handleEditNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setEditName(val)
    setEditSlug(generateSlug(val))
  }

  // Create Category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      showToast('Category name is required', 'error')
      return
    }
    if (!slug.trim()) {
      showToast('Category slug is required', 'error')
      return
    }

    setAdding(true)
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: name.trim(),
          slug: slug.trim()
        })
        .select()

      if (error) {
        if (error.code === '23505') {
          throw new Error('A category with this name or slug already exists.')
        }
        throw error
      }

      showToast('Category added successfully!', 'success')
      setName('')
      setSlug('')
      fetchCategories() // refresh
    } catch (err: any) {
      showToast(err.message || 'Failed to add category', 'error')
    } finally {
      setAdding(false)
    }
  }

  // Save Category Edits
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategory) return

    if (!editName.trim() || !editSlug.trim()) {
      showToast('Category name and slug are required', 'error')
      return
    }

    setSaving(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: editName.trim(),
          slug: editSlug.trim()
        })
        .eq('id', editingCategory.id)

      if (error) {
        if (error.code === '23505') {
          throw new Error('A category with this name or slug already exists.')
        }
        throw error
      }

      showToast('Category updated successfully!', 'success')
      setEditingCategory(null)
      fetchCategories() // refresh
    } catch (err: any) {
      showToast(err.message || 'Failed to update category', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Delete Category
  const handleDeleteCategory = async (id: string, catName: string) => {
    const confirmMsg = `Are you sure you want to delete the category "${catName}"? \n\nWARNING: Deleting this category will delete all product submissions belonging to this category!`
    if (!confirm(confirmMsg)) return

    const supabase = createClient()
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) throw error

      showToast('Category deleted successfully', 'success')
      setCategories(prev => prev.filter(c => c.id !== id))
    } catch (err: any) {
      showToast(err.message || 'Failed to delete category', 'error')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Header Title */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Category Management</h1>
          <p className="text-sm text-zinc-500 mt-1 font-light">
            Manage product categories. Creating or deleting categories dynamically updates filters on the public browse page.
          </p>
        </div>

        {/* 2 Grid: Add Form + Categories List */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
          
          {/* Form: Add or Edit Category */}
          <div className="md:col-span-2 glass-panel p-6 rounded-2xl border border-zinc-200/50 dark:border-white/5 bg-white/40 dark:bg-zinc-950/10">
            {editingCategory ? (
              <div className="space-y-4">
                <h2 className="text-lg font-bold tracking-tight">Edit Category</h2>
                <form onSubmit={handleSaveEdit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Category Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={handleEditNameChange}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">URL Slug</label>
                    <input
                      type="text"
                      value={editSlug}
                      onChange={(e) => setEditSlug(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-zinc-100 dark:bg-zinc-900 focus:outline-none text-zinc-400 font-mono"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingCategory(null)}
                      className="px-4 py-2 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#0071e3] text-white hover:bg-[#0077ed] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-lg font-bold tracking-tight">Add New Category</h2>
                <form onSubmit={handleAddCategory} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Category Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Traditional Foods, Pickles"
                      value={name}
                      onChange={handleNameChange}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-white/50 dark:bg-zinc-950/30 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">URL Slug</label>
                    <input
                      type="text"
                      placeholder="e.g. traditional-foods"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-zinc-100/50 dark:bg-zinc-900/50 focus:outline-none text-zinc-450 font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={adding}
                    className="w-full py-2.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {adding ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    Add Category
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* List Categories */}
          <div className="md:col-span-3 glass-panel rounded-2xl border border-zinc-200/50 dark:border-white/5 overflow-hidden bg-white dark:bg-[#161617]/40">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-850 font-bold uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Slug</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-850">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-zinc-500">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                        <span>Loading list...</span>
                      </div>
                    </td>
                  </tr>
                ) : categories.length > 0 ? (
                  categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10">
                      <td className="p-4 font-bold text-sm">{cat.name}</td>
                      <td className="p-4 text-zinc-450 font-mono">{cat.slug}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingCategory(cat)
                              setEditName(cat.name)
                              setEditSlug(cat.slug)
                            }}
                            className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                            title="Edit Category Name/Slug"
                          >
                            <Edit className="w-4 h-4 text-zinc-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            className="p-1 rounded hover:bg-red-500/10 text-red-500 cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-zinc-450">
                      No categories found in system database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </AdminLayout>
  )
}
