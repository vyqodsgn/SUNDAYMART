'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/AdminLayout'
import { createClient } from '@/lib/supabase/client'
import { ShoppingBag, Eye, User, Calendar, Volume2, Settings as SettingsIcon, ShieldAlert, Check, X, FileText, ArrowRight, Activity, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react'
import { useToast } from '@/context/ToastContext'

interface Product {
  id: string
  name: string
  price: number
  seller_name: string
  status: string
  created_at: string
}

interface Contact {
  id: string
  name: string
  email: string
  message: string
  created_at: string
}

interface CategoryCount {
  name: string
  count: number
}

export default function AdminDashboard() {
  const { showToast } = useToast()
  
  // Dashboard stats
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    sold: 0,
    totalRevenue: 0,
    totalCount: 0
  })

  // Recent data lists
  const [recentProducts, setRecentProducts] = useState<Product[]>([])
  const [recentContacts, setRecentContacts] = useState<Contact[]>([])
  const [categoryStats, setCategoryStats] = useState<CategoryCount[]>([])
  
  // System Config states
  const [submissionEnabled, setSubmissionEnabled] = useState(true)
  
  // General states
  const [loading, setLoading] = useState(true)
  const [toggleLoading, setToggleLoading] = useState(false)

  const fetchDashboardData = async () => {
    try {
      const supabase = createClient()
      
      // 1. Fetch products stats
      const { data: prods, error: prodErr } = await supabase
        .from('products')
        .select('id, price, seller_quantity, status, created_at, name, seller_name, category_id, categories(name)')
      
      if (prodErr) throw prodErr

      if (prods) {
        let pend = 0, appr = 0, rejc = 0, sld = 0, rev = 0
        const categoriesMap: Record<string, number> = {}

        prods.forEach((p: any) => {
          if (p.status === 'pending') pend++
          if (p.status === 'approved') appr++
          if (p.status === 'rejected') rejc++
          if (p.status === 'sold') {
            sld++
            // Add to estimated revenue
            rev += (Number(p.price) * Number(p.seller_quantity))
          }

          // Count by category
          const catName = p.categories?.name || 'Uncategorized'
          categoriesMap[catName] = (categoriesMap[catName] || 0) + 1
        })

        setStats({
          pending: pend,
          approved: appr,
          rejected: rejc,
          sold: sld,
          totalRevenue: rev,
          totalCount: prods.length
        })

        // Format category stats
        const catStatsArr = Object.entries(categoriesMap).map(([name, count]) => ({
          name,
          count
        })).sort((a, b) => b.count - a.count)
        setCategoryStats(catStatsArr)

        // Sort and get recent 5 products
        const sortedProds = [...prods]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
        setRecentProducts(sortedProds as Product[])
      }

      // 2. Fetch recent 5 contact messages
      const { data: contacts, error: contErr } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (contErr) throw contErr
      if (contacts) setRecentContacts(contacts)

      // 3. Fetch current system settings
      const { data: settingsData } = await supabase
        .from('settings')
        .select('submission_enabled')
        .eq('id', 'global')
        .single()
      
      if (settingsData) {
        setSubmissionEnabled(settingsData.submission_enabled)
      }

    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err)
      showToast('Error loading dashboard statistics', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Toggle submission status
  const handleToggleSubmissions = async () => {
    setToggleLoading(true)
    const supabase = createClient()
    const nextVal = !submissionEnabled

    try {
      const { error } = await supabase
        .from('settings')
        .update({ submission_enabled: nextVal })
        .eq('id', 'global')

      if (error) throw error

      setSubmissionEnabled(nextVal)
      showToast(`Product submissions are now ${nextVal ? 'enabled' : 'disabled'}`, 'success')
    } catch (err: any) {
      console.error('Error updating settings:', err)
      showToast('Failed to update submission status', 'error')
    } finally {
      setToggleLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="py-24 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
          <p className="text-zinc-500">Loading overview data...</p>
        </div>
      </AdminLayout>
    )
  }

  // Calculate percentage of category counts for SVG chart width
  const maxCategoryCount = categoryStats.length > 0 ? Math.max(...categoryStats.map(c => c.count)) : 1

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Title row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Overview Dashboard</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-light">
              Welcome back! Here is a summary of the Sunday Marketplace activity.
            </p>
          </div>
          <button 
            onClick={() => { setLoading(true); fetchDashboardData() }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <Activity className="w-4 h-4 text-zinc-400" /> Refresh Data
          </button>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Pending Review', value: stats.pending, color: 'border-yellow-500/30 text-yellow-500 bg-yellow-500/5' },
            { label: 'Approved Active', value: stats.approved, color: 'border-green-500/30 text-green-500 bg-green-500/5' },
            { label: 'Marked Sold', value: stats.sold, color: 'border-blue-500/30 text-blue-500 bg-blue-500/5' },
            { label: 'Rejected Listings', value: stats.rejected, color: 'border-red-500/30 text-red-500 bg-red-500/5' },
          ].map((card) => (
            <div key={card.label} className={`glass-card p-5 rounded-2xl border ${card.color} flex flex-col justify-between h-28`}>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-455 block">{card.label}</span>
              <span className="text-3xl font-extrabold mt-2 block">{card.value}</span>
            </div>
          ))}
        </div>

        {/* Secondary Info banner (Revenue) */}
        <div className="glass-panel p-6 rounded-2xl border border-zinc-200/50 dark:border-white/5 bg-gradient-to-r from-blue-500/10 to-indigo-500/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Total Revenue Generated (From Sold Items)</span>
            <div className="text-3xl font-black text-gradient-primary">₹{stats.totalRevenue}</div>
          </div>
          <Link 
            href="/admin/products"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow"
          >
            Manage Product Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 2 Column Layout: Charts + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Col 3: Category Share Charts */}
          <div className="lg:col-span-3 glass-panel p-6 rounded-2xl border border-zinc-200/50 dark:border-white/5 space-y-6">
            <h2 className="text-lg font-bold tracking-tight">Category Distribution</h2>
            
            {categoryStats.length > 0 ? (
              <div className="space-y-4">
                {categoryStats.map((item) => {
                  const percentage = Math.round((item.count / stats.totalCount) * 100)
                  const barWidth = (item.count / maxCategoryCount) * 100
                  return (
                    <div key={item.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold">{item.name}</span>
                        <span className="text-zinc-400 font-bold">{item.count} items ({percentage}%)</span>
                      </div>
                      
                      {/* Custom SVG Bar Chart Indicator */}
                      <svg className="w-full h-3 rounded-full bg-zinc-100 dark:bg-zinc-900" xmlns="http://www.w3.org/2000/svg">
                        <rect 
                          width={`${barWidth}%`} 
                          height="100%" 
                          rx="6" 
                          fill="url(#barGradient)"
                        />
                        <defs>
                          <linearGradient id="barGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#0071e3" />
                            <stop offset="100%" stopColor="#2997ff" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-500 text-xs">
                No product distribution data available yet.
              </div>
            )}
          </div>

          {/* Col 2: Quick Actions & controls */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-zinc-200/50 dark:border-white/5 space-y-6">
            <h2 className="text-lg font-bold tracking-tight">System Controls</h2>
            
            <div className="space-y-4">
              {/* Submission Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-900 bg-white/40 dark:bg-zinc-950/10">
                <div>
                  <span className="text-xs font-bold block">Visitor Submissions</span>
                  <span className="text-[10px] text-zinc-400 mt-0.5 block leading-tight">Allow members to submit items</span>
                </div>
                
                <button
                  onClick={handleToggleSubmissions}
                  disabled={toggleLoading}
                  className="text-zinc-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                  aria-label="Toggle Submissions"
                >
                  {toggleLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
                  ) : submissionEnabled ? (
                    <ToggleRight className="w-8 h-8 text-green-500" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-zinc-400" />
                  )}
                </button>
              </div>

              {/* Quick links to Settings Panel */}
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  href="/admin/settings"
                  className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-xs font-semibold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-zinc-400" /> Event Date & Banner Config
                  </span>
                  <ArrowRight className="w-4.5 h-4.5 text-zinc-400" />
                </Link>
                <Link
                  href="/admin/announcements"
                  className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-xs font-semibold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-zinc-400" /> Edit Church Announcement
                  </span>
                  <ArrowRight className="w-4.5 h-4.5 text-zinc-400" />
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* 2 Grid: Recent Submissions + Recent Inquiries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Recent Submissions */}
          <div className="glass-panel p-6 rounded-2xl border border-zinc-200/50 dark:border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight">Recent Submissions</h2>
              <Link href="/admin/products" className="text-xs font-semibold text-[#0071e3] dark:text-[#2997ff] hover:underline">
                View Queue
              </Link>
            </div>

            {recentProducts.length > 0 ? (
              <div className="divide-y divide-zinc-200/40 dark:divide-zinc-800/40">
                {recentProducts.map((p) => (
                  <div key={p.id} className="py-3 flex items-center justify-between text-xs gap-3">
                    <div className="truncate space-y-0.5">
                      <span className="font-semibold block truncate text-sm">{p.name}</span>
                      <span className="text-zinc-400 font-light truncate block">by {p.seller_name} &bull; ₹{p.price}</span>
                    </div>
                    
                    {/* Status Pill */}
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      p.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                      p.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                      p.status === 'sold' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-zinc-400 text-xs font-light">
                No products submitted recently.
              </div>
            )}
          </div>

          {/* Right: Recent Contacts */}
          <div className="glass-panel p-6 rounded-2xl border border-zinc-200/50 dark:border-white/5 space-y-4">
            <h2 className="text-lg font-bold tracking-tight">Recent Contact Inquiries</h2>

            {recentContacts.length > 0 ? (
              <div className="divide-y divide-zinc-200/40 dark:divide-zinc-800/40">
                {recentContacts.map((c) => (
                  <div key={c.id} className="py-3.5 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{c.name}</span>
                      <a href={`mailto:${c.email}`} className="text-zinc-400 hover:text-blue-500 transition-colors font-light">{c.email}</a>
                    </div>
                    <p className="text-zinc-500 dark:text-zinc-400 italic leading-relaxed font-light line-clamp-2">
                      &ldquo;{c.message}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-zinc-400 text-xs font-light">
                No contact form submissions received yet.
              </div>
            )}
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}
