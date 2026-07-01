'use client'

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { createClient } from '@/lib/supabase/client'
import { Volume2, Plus, Edit, Trash2, X, Check, Loader2, ToggleLeft, ToggleRight } from 'lucide-react'
import { useToast } from '@/context/ToastContext'

interface Announcement {
  id: string
  content: string
  is_active: boolean
  created_at: string
}

export default function AdminAnnouncementsPage() {
  const { showToast } = useToast()

  // Data lists
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  // Form states (Add)
  const [content, setContent] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [adding, setAdding] = useState(false)

  // Edit states
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editIsActive, setEditIsActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const fetchAnnouncements = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      showToast('Failed to load announcements list', 'error')
    } else if (data) {
      setAnnouncements(data as Announcement[])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  // Create Announcement
  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      showToast('Announcement content is required', 'error')
      return
    }

    setAdding(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('announcements')
        .insert({
          content: content.trim(),
          is_active: isActive
        })

      if (error) throw error

      showToast('Announcement created successfully!', 'success')
      setContent('')
      setIsActive(true)
      fetchAnnouncements() // refresh
    } catch (err: any) {
      showToast(err.message || 'Failed to create announcement', 'error')
    } finally {
      setAdding(false)
    }
  }

  // Toggle Active Status
  const handleToggleActive = async (id: string, currentVal: boolean) => {
    setActionLoadingId(id)
    const supabase = createClient()
    const nextVal = !currentVal
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ is_active: nextVal })
        .eq('id', id)

      if (error) throw error

      setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, is_active: nextVal } : a))
      showToast(`Announcement is now ${nextVal ? 'active' : 'inactive'}`, 'success')
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error')
    } finally {
      setActionLoadingId(null)
    }
  }

  // Save Announcement Edits
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAnnouncement) return

    if (!editContent.trim()) {
      showToast('Announcement content is required', 'error')
      return
    }

    setSaving(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('announcements')
        .update({
          content: editContent.trim(),
          is_active: editIsActive
        })
        .eq('id', editingAnnouncement.id)

      if (error) throw error

      showToast('Announcement updated successfully!', 'success')
      setEditingAnnouncement(null)
      fetchAnnouncements() // refresh
    } catch (err: any) {
      showToast(err.message || 'Failed to update announcement', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Delete Announcement
  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement permanently?')) return

    const supabase = createClient()
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id)

      if (error) throw error

      showToast('Announcement deleted successfully', 'success')
      setAnnouncements(prev => prev.filter(a => a.id !== id))
    } catch (err: any) {
      showToast(err.message || 'Failed to delete announcement', 'error')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Title */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Announcement Board</h1>
          <p className="text-sm text-zinc-500 mt-1 font-light">
            Broadcast emergency alerts, upcoming changes, or welcome notes at the top banner of the home page.
          </p>
        </div>

        {/* 2 Grid: Form + List */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
          
          {/* Left Form Panel */}
          <div className="md:col-span-2 glass-panel p-6 rounded-2xl border border-zinc-200/50 dark:border-white/5 bg-white/40 dark:bg-zinc-950/10">
            {editingAnnouncement ? (
              <div className="space-y-4">
                <h2 className="text-lg font-bold tracking-tight">Edit Announcement</h2>
                
                <form onSubmit={handleSaveEdit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Announcement Content</label>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={4}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950/20">
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Set Active on Homepage</span>
                    <input 
                      type="checkbox"
                      checked={editIsActive}
                      onChange={(e) => setEditIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingAnnouncement(null)}
                      className="px-4 py-2 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#0071e3] text-white hover:bg-[#0077ed] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save Edits
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-lg font-bold tracking-tight">Create Announcement</h2>
                
                <form onSubmit={handleAddAnnouncement} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Announcement Content</label>
                    <textarea
                      placeholder="e.g. Welcome to Sunday Marketplace! Remember to coordinate pickup after the holy mass."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={4}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-white/50 dark:bg-zinc-950/30 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-zinc-100/50 dark:bg-zinc-950/10">
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Set Active Immediately</span>
                    <input 
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={adding}
                    className="w-full py-2.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Volume2 className="w-3.5 h-3.5" />}
                    Broadcast Announcement
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Right List Panel */}
          <div className="md:col-span-3 glass-panel rounded-2xl border border-zinc-200/50 dark:border-white/5 overflow-hidden bg-white dark:bg-[#161617]/40">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-850 font-bold uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="p-4">Message content</th>
                  <th className="p-4 text-center">Active</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-850">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-500 mx-auto" />
                    </td>
                  </tr>
                ) : announcements.length > 0 ? (
                  announcements.map((ann) => (
                    <tr key={ann.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10">
                      <td className="p-4 text-xs font-light leading-relaxed max-w-xs sm:max-w-sm whitespace-pre-wrap">
                        {ann.content}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleActive(ann.id, ann.is_active)}
                          disabled={actionLoadingId === ann.id}
                          className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full cursor-pointer disabled:opacity-40"
                          aria-label="Toggle active status"
                        >
                          {ann.is_active ? (
                            <ToggleRight className="w-6 h-6 text-green-500" />
                          ) : (
                            <ToggleLeft className="w-6 h-6 text-zinc-400" />
                          )}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingAnnouncement(ann)
                              setEditContent(ann.content)
                              setEditIsActive(ann.is_active)
                            }}
                            className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                            title="Edit Content"
                          >
                            <Edit className="w-4 h-4 text-zinc-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteAnnouncement(ann.id)}
                            className="p-1 rounded hover:bg-red-500/10 text-red-500 cursor-pointer"
                            title="Delete Announcement"
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
                      No announcements broadcasted yet.
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
