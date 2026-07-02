'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/AdminLayout'
import { createClient } from '@/lib/supabase/client'
import { ShoppingBag, User, Calendar, RefreshCw, Loader2, Trash2, Edit, Check, X, ChevronDown, Minus, Plus, MapPin, Search, Download, ClipboardCheck } from 'lucide-react'
import { useToast } from '@/context/ToastContext'

interface OrderItem {
  product_id: string
  name: string
  price: number
  quantity_option: string
  quantity: number
}

interface Order {
  id: string
  person_name: string
  collection_centre: string
  items: OrderItem[]
  total_price: number
  created_at: string
}

interface AggregatedItem {
  name: string
  quantity_option: string
  total_quantity: number
  total_revenue: number
}

export default function AdminDashboard() {
  const { showToast } = useToast()
  
  // Dashboard states
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [centreFilter, setCentreFilter] = useState('all') // 'all', 'Main Church', 'Mission Centre'

  // Edit Order modal states
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [editPersonName, setEditPersonName] = useState('')
  const [editCollectionCentre, setEditCollectionCentre] = useState('')
  const [editItems, setEditItems] = useState<OrderItem[]>([])
  const [savingOrder, setSavingOrder] = useState(false)

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      
      // Fetch all orders
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      if (data) setOrders(data as Order[])
    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err)
      showToast('Error loading orders from database. Make sure table exists.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Delete Order
  const handleDeleteOrder = async (id: string) => {
    if (!confirm('Are you sure you want to clear/remove this order?')) return
    setDeletingId(id)
    const supabase = createClient()
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id)

      if (error) throw error

      setOrders(prev => prev.filter(o => o.id !== id))
      showToast('Order removed/completed successfully!', 'success')
    } catch (err: any) {
      showToast(err.message || 'Failed to remove order', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  // Open Edit Modal
  const handleOpenEditModal = (order: Order) => {
    setEditingOrder(order)
    setEditPersonName(order.person_name)
    setEditCollectionCentre(order.collection_centre)
    setEditItems(order.items.map(item => ({ ...item }))) // Clone items list
  }

  // Handle quantity adjustments inside modal
  const handleUpdateItemQuantity = (product_id: string, delta: number) => {
    setEditItems(prev => prev.map(item => {
      if (item.product_id === product_id) {
        const nextQty = Math.max(0, item.quantity + delta)
        return { ...item, quantity: nextQty }
      }
      return item
    }).filter(item => item.quantity > 0)) // Remove item if qty becomes 0
  }

  // Save Order Edit
  const handleSaveOrderEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingOrder) return

    if (!editPersonName.trim()) {
      showToast('Customer name is required', 'error')
      return
    }

    if (editItems.length === 0) {
      showToast('Order must contain at least one item', 'error')
      return
    }

    setSavingOrder(true)
    const supabase = createClient()
    const nextTotalPrice = editItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          person_name: editPersonName.trim(),
          collection_centre: editCollectionCentre,
          items: editItems,
          total_price: nextTotalPrice
        })
        .eq('id', editingOrder.id)

      if (error) throw error

      showToast('Order updated successfully!', 'success')
      setEditingOrder(null)
      fetchDashboardData()
    } catch (err: any) {
      console.error(err)
      showToast(err.message || 'Failed to update order', 'error')
    } finally {
      setSavingOrder(false)
    }
  }

  // Statistics calculation
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_price), 0)
  
  const mainChurchOrders = orders.filter(o => o.collection_centre === 'Main Church')
  const mainChurchRevenue = mainChurchOrders.reduce((sum, o) => sum + Number(o.total_price), 0)
  
  const missionCentreOrders = orders.filter(o => o.collection_centre === 'Mission Centre')
  const missionCentreRevenue = missionCentreOrders.reduce((sum, o) => sum + Number(o.total_price), 0)

  // Aggregated Item Summary (Qty of each item users have chosen)
  const getAggregatedItems = (): AggregatedItem[] => {
    const map: Record<string, AggregatedItem> = {}

    orders.forEach(order => {
      order.items.forEach(item => {
        const key = `${item.name}-${item.quantity_option}`
        if (map[key]) {
          map[key].total_quantity += item.quantity
          map[key].total_revenue += item.price * item.quantity
        } else {
          map[key] = {
            name: item.name,
            quantity_option: item.quantity_option,
            total_quantity: item.quantity,
            total_revenue: item.price * item.quantity
          }
        }
      })
    })

    return Object.values(map).sort((a, b) => b.total_quantity - a.total_quantity)
  }

  const aggregatedItems = getAggregatedItems()

  // Filter orders locally
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.person_name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCentre = centreFilter === 'all' || o.collection_centre === centreFilter
    return matchesSearch && matchesCentre
  })

  // Export orders to CSV
  const handleExportCSV = () => {
    if (orders.length === 0) {
      showToast('No orders available to export', 'error')
      return
    }

    const headers = ['Order ID', 'Customer Name', 'Collection Centre', 'Ordered Items Summary', 'Total Price (INR)', 'Date Ordered']
    const rows = orders.map(o => {
      const itemsStr = o.items.map(item => `${item.quantity}x ${item.name} (${item.quantity_option})`).join(' | ')
      return [
        o.id,
        o.person_name,
        o.collection_centre,
        itemsStr,
        o.total_price,
        new Date(o.created_at).toLocaleString()
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `sundaymart_orders_${Date.now()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Orders export to CSV successfully', 'success')
  }

  return (
    <AdminLayout>
      <div className="space-y-8 text-white">
        
        {/* Title row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Overview Dashboard</h1>
            <p className="text-sm text-zinc-300 mt-1 font-light">
              Welcome back! Here is a summary of active pickup orders placed by church members.
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 hover:bg-green-500/20 text-xs font-semibold cursor-pointer"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button 
              onClick={fetchDashboardData}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-800 text-xs font-semibold hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-zinc-400" /> Refresh Data
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Orders */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-zinc-900/10 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] text-zinc-300 uppercase tracking-widest font-bold">Total Orders</span>
              <h3 className="text-3xl font-black mt-1">{totalOrders}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Total Revenue */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-zinc-900/10 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] text-zinc-300 uppercase tracking-widest font-bold">Total Revenue</span>
              <h3 className="text-3xl font-black mt-1 text-green-500 font-mono">₹{totalRevenue}</h3>
            </div>
            <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold">₹</span>
            </div>
          </div>

          {/* Card 3: Main Church Split */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-zinc-900/10 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] text-zinc-300 uppercase tracking-widest font-bold">Main Church</span>
              <h3 className="text-xl font-black mt-1">
                {mainChurchOrders.length} {mainChurchOrders.length === 1 ? 'order' : 'orders'}
              </h3>
              <span className="text-xs text-sky-400 font-bold font-mono">₹{mainChurchRevenue}</span>
            </div>
            <div className="w-12 h-12 bg-sky-500/10 text-sky-400 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Mission Centre Split */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-zinc-900/10 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] text-zinc-300 uppercase tracking-widest font-bold">Mission Centre</span>
              <h3 className="text-xl font-black mt-1">
                {missionCentreOrders.length} {missionCentreOrders.length === 1 ? 'order' : 'orders'}
              </h3>
              <span className="text-xs text-green-500 font-bold font-mono">₹{missionCentreRevenue}</span>
            </div>
            <div className="w-12 h-12 bg-zinc-900 text-zinc-500 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Aggregated Item Summary section */}
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-[#2997ff]" /> Aggregated Item Summary
          </h2>
          <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden bg-[#161617]/40 shadow-sm">
            <div className="overflow-x-auto w-full">
              <table className="w-full border-collapse text-left text-xs">
                <thead className="bg-zinc-900 border-b border-zinc-800 font-bold uppercase tracking-wider text-zinc-350">
                  <tr>
                    <th className="p-4">Item Name</th>
                    <th className="p-4">Package Size</th>
                    <th className="p-4">Total Quantity Ordered</th>
                    <th className="p-4 text-right">Fulfillment Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-zinc-400">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : aggregatedItems.length > 0 ? (
                    aggregatedItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-zinc-900/10">
                        <td className="p-4 font-bold text-sm text-zinc-200">{item.name}</td>
                        <td className="p-4 font-semibold text-zinc-300 font-mono">{item.quantity_option}</td>
                        <td className="p-4 font-extrabold text-sm text-blue-400">{item.total_quantity}</td>
                        <td className="p-4 font-extrabold text-right text-white font-mono">₹{item.total_revenue}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-zinc-300">
                        No orders placed yet. Aggregated totals will be shown here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Detailed Individual Orders section */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#2997ff]" /> Detailed Individual Orders
            </h2>
            
            {/* Table Search & Tabs */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Customer Name */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search customer"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-xs px-3.5 py-2 rounded-lg border border-zinc-850 bg-zinc-950 focus:outline-none text-white"
                />
              </div>

              {/* Centre Tabs */}
              <div className="flex bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
                {[
                  { id: 'all', label: 'All Centres' },
                  { id: 'Main Church', label: 'Main Church' },
                  { id: 'Mission Centre', label: 'Mission Centre' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setCentreFilter(tab.id)}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-md uppercase tracking-wider transition-all cursor-pointer ${
                      centreFilter === tab.id 
                        ? 'bg-zinc-850 shadow-sm text-[#2997ff]' 
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden bg-[#161617]/40 shadow-sm">
            <div className="overflow-x-auto w-full">
              <table className="w-full border-collapse text-left text-xs">
                <thead className="bg-zinc-900 border-b border-zinc-800 font-bold uppercase tracking-wider text-zinc-350">
                  <tr>
                    <th className="p-4">Customer Name</th>
                    <th className="p-4">Collection Centre</th>
                    <th className="p-4 min-w-[250px]">Detailed Info</th>
                    <th className="p-4">Total Price</th>
                    <th className="p-4">Order Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-zinc-400">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-500" />
                      </td>
                    </tr>
                  ) : filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-zinc-900/10">
                        {/* Name */}
                        <td className="p-4 font-bold text-sm text-zinc-200">{order.person_name}</td>
                        
                        {/* Collection Centre */}
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            order.collection_centre === 'Main Church' 
                              ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' 
                              : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          }`}>
                            {order.collection_centre}
                          </span>
                        </td>

                        {/* Detailed Items list */}
                        <td className="p-4 text-zinc-300">
                          <div className="space-y-1 font-medium">
                            {order.items.map((item, idx) => (
                              <div key={idx}>
                                • <span className="font-bold text-zinc-250">{item.quantity}x</span> {item.name} <span className="text-[10px] text-zinc-400 font-mono">({item.quantity_option})</span> — ₹{item.price * item.quantity}
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* Price */}
                        <td className="p-4 font-extrabold text-sm text-white font-mono">
                          ₹{order.total_price}
                        </td>

                        {/* Date */}
                        <td className="p-4 text-zinc-300 font-light font-mono">
                          {new Date(order.created_at).toLocaleString()}
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Edit Button */}
                            <button
                              onClick={() => handleOpenEditModal(order)}
                              className="p-1.5 rounded hover:bg-zinc-900 border border-transparent text-zinc-400 hover:text-white cursor-pointer"
                              title="Edit Order Details"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              disabled={deletingId === order.id}
                              className="p-1.5 rounded hover:bg-red-500/10 text-red-500 cursor-pointer disabled:opacity-40"
                              title="Complete or Clear Order"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-zinc-300">
                        No individual orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Edit Order Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel max-w-xl w-full max-h-[90vh] overflow-y-auto rounded-3xl border border-zinc-850 p-6 sm:p-8 bg-[#0a0a0c] shadow-2xl flex flex-col gap-6 text-white">
            
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold tracking-tight">Edit Order Details</h2>
              <button 
                onClick={() => setEditingOrder(null)}
                className="p-1 rounded-full hover:bg-zinc-900 cursor-pointer text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOrderEdit} className="space-y-5">
              
              {/* Customer Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={editPersonName}
                  onChange={(e) => setEditPersonName(e.target.value)}
                  className="w-full text-sm px-4 py-3 rounded-xl border border-zinc-850 bg-zinc-950 focus:outline-none text-zinc-100"
                />
              </div>

              {/* Collection Centre Dropdown with Chevron */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">Collection Centre *</label>
                <div className="relative flex items-center">
                  <select
                    value={editCollectionCentre}
                    onChange={(e) => setEditCollectionCentre(e.target.value)}
                    className="w-full appearance-none bg-zinc-950 border border-zinc-850 rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none text-zinc-105 text-zinc-100 cursor-pointer"
                  >
                    <option value="Main Church">Main Church</option>
                    <option value="Mission Centre">Mission Centre</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-4 pointer-events-none text-zinc-400" />
                </div>
              </div>

              {/* Order Items list */}
              <div className="space-y-3 pt-2">
                <label className="text-[10px] font-bold text-zinc-455 uppercase tracking-wider block">Order Items Summary</label>
                <div className="divide-y divide-zinc-900 bg-zinc-950/20 rounded-2xl border border-zinc-850 p-4 space-y-2">
                  {editItems.map((item) => (
                    <div key={item.product_id} className="py-2.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                      <div>
                        <h4 className="font-bold text-xs text-zinc-200">{item.name}</h4>
                        <span className="text-[10px] text-zinc-500 font-mono">{item.quantity_option} — ₹{item.price} each</span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {/* Quantity controls */}
                        <div className="flex items-center gap-2 bg-zinc-950/80 rounded-lg p-1 border border-zinc-800">
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQuantity(item.product_id, -1)}
                            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-black min-w-[1.25rem] text-center font-mono text-zinc-200">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQuantity(item.product_id, 1)}
                            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-xs font-extrabold font-mono text-zinc-200 min-w-[3.5rem] text-right">₹{item.price * item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-905 mt-4">
                <div>
                  <span className="text-[9px] text-zinc-450 uppercase tracking-widest block font-bold">Recalculated Total</span>
                  <span className="text-xl font-black text-white font-mono">
                    ₹{editItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingOrder(null)}
                    className="px-4 py-2.5 rounded-xl border border-zinc-800 text-xs font-bold hover:bg-zinc-900 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingOrder}
                    className="flex items-center gap-1 px-5 py-2.5 rounded-xl bg-[#2997ff] hover:bg-[#54aeff] text-white text-xs font-bold transition-all shadow cursor-pointer disabled:bg-zinc-800"
                  >
                    {savingOrder ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Save Order
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
