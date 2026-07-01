'use client'

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { createClient } from '@/lib/supabase/client'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/context/ToastContext'
import { Settings as SettingsIcon, Save, Calendar, Globe, Map, ShoppingBag, Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react'

export default function AdminSettingsPage() {
  const { refreshSettings } = useApp()
  const { showToast } = useToast()

  // Form states (Settings table)
  const [churchName, setChurchName] = useState('')
  const [churchLogo, setChurchLogo] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [googleMapsIframe, setGoogleMapsIframe] = useState('')
  const [facebookLink, setFacebookLink] = useState('')
  const [instagramLink, setInstagramLink] = useState('')
  const [youtubeLink, setYoutubeLink] = useState('')
  
  // Form states (Event table)
  const [eventTitle, setEventTitle] = useState('')
  const [eventDescription, setEventDescription] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')

  // Loading states
  const [loading, setLoading] = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)
  const [savingEvent, setSavingEvent] = useState(false)

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)

  useEffect(() => {
    const fetchConfigs = async () => {
      setLoading(true)
      const supabase = createClient()

      // Fetch settings
      const { data: settingsData } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 'global')
        .single()

      if (settingsData) {
        setChurchName(settingsData.church_name)
        setChurchLogo(settingsData.church_logo || '')
        setContactNumber(settingsData.contact_number || '')
        setEmail(settingsData.email || '')
        setAddress(settingsData.address || '')
        setGoogleMapsIframe(settingsData.google_maps_iframe || '')
        setFacebookLink(settingsData.facebook_link || '')
        setInstagramLink(settingsData.instagram_link || '')
        setYoutubeLink(settingsData.youtube_link || '')
      }

      // Fetch event
      const { data: eventData } = await supabase
        .from('event_details')
        .select('*')
        .eq('id', 'global')
        .single()

      if (eventData) {
        setEventTitle(eventData.title)
        setEventDescription(eventData.description || '')
        
        // Split ISO date to Date & Time for HTML inputs
        const d = new Date(eventData.event_date)
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        const hours = String(d.getHours()).padStart(2, '0')
        const minutes = String(d.getMinutes()).padStart(2, '0')
        
        setEventDate(`${year}-${month}-${day}`)
        setEventTime(`${hours}:${minutes}`)
      }
      setLoading(false)
    }

    fetchConfigs()
  }, [])

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!churchName.trim()) {
      showToast('Church name is required', 'error')
      return
    }

    setSavingSettings(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('settings')
        .update({
          church_name: churchName.trim(),
          church_logo: churchLogo.trim() || null,
          contact_number: contactNumber.trim() || null,
          email: email.trim() || null,
          address: address.trim() || null,
          google_maps_iframe: googleMapsIframe.trim() || null,
          facebook_link: facebookLink.trim() || null,
          instagram_link: instagramLink.trim() || null,
          youtube_link: youtubeLink.trim() || null,
        })
        .eq('id', 'global')

      if (error) throw error

      showToast('Global settings updated successfully', 'success')
      await refreshSettings() // Sync header/footer
    } catch (err: any) {
      showToast(err.message || 'Failed to save settings', 'error')
    } finally {
      setSavingSettings(false)
    }
  }

  // Save Event Details (countdown)
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventTitle.trim()) {
      showToast('Event title is required', 'error')
      return
    }
    if (!eventDate || !eventTime) {
      showToast('Please select both event date and time', 'error')
      return
    }

    setSavingEvent(true)
    const supabase = createClient()

    // Combine date & time into ISO string
    const localDateTime = new Date(`${eventDate}T${eventTime}`)
    const isoDateTime = localDateTime.toISOString()

    try {
      const { error } = await supabase
        .from('event_details')
        .update({
          title: eventTitle.trim(),
          description: eventDescription.trim() || null,
          event_date: isoDateTime
        })
        .eq('id', 'global')

      if (error) throw error

      showToast('Marketplace event details updated', 'success')
      await refreshSettings() // sync countdown
    } catch (err: any) {
      showToast(err.message || 'Failed to save event info', 'error')
    } finally {
      setSavingEvent(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="py-24 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-zinc-500">Loading system settings...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Title */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">System Settings</h1>
          <p className="text-sm text-zinc-500 mt-1 font-light">
            Edit church branding and configure the marketplace countdown timer event.
          </p>
        </div>

        {/* 2 Column Form Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Column 1: Church Branding & Contacts */}
          <div className="glass-panel p-6 rounded-2xl border border-zinc-200/50 dark:border-white/5 bg-white/40 dark:bg-zinc-950/10 space-y-6">
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-1.5">
              <SettingsIcon className="w-5 h-5 text-zinc-400" /> Church Branding & Details
            </h2>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              
              {/* Church Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Church Name</label>
                <input
                  type="text"
                  value={churchName}
                  onChange={(e) => setChurchName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-855 bg-white dark:bg-zinc-950 focus:outline-none"
                />
              </div>

              {/* Logo URL */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Logo URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={churchLogo}
                  onChange={(e) => setChurchLogo(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-855 bg-white dark:bg-zinc-950 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Contact phone */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Office Contact Phone</label>
                  <input
                    type="text"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-855 bg-white dark:bg-zinc-950 focus:outline-none"
                  />
                </div>

                {/* Contact email */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Office Contact Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-855 bg-white dark:bg-zinc-950 focus:outline-none"
                  />
                </div>
              </div>

              {/* Physical Address */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Parish Street Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-855 bg-white dark:bg-zinc-950 focus:outline-none"
                />
              </div>

              {/* Google Maps embed code */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Google Maps Iframe Embed Code (Optional)</label>
                <textarea
                  placeholder="Paste Google Maps <iframe> code here..."
                  value={googleMapsIframe}
                  onChange={(e) => setGoogleMapsIframe(e.target.value)}
                  rows={3}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-855 bg-white dark:bg-zinc-950 focus:outline-none font-mono"
                />
              </div>

              {/* Social Links */}
              <div className="space-y-2 pt-2 border-t border-zinc-200/35 dark:border-white/5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Social Media Links</label>
                <div className="space-y-2">
                  <input
                    type="url"
                    placeholder="Facebook URL"
                    value={facebookLink}
                    onChange={(e) => setFacebookLink(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-855 bg-white dark:bg-zinc-950 focus:outline-none"
                  />
                  <input
                    type="url"
                    placeholder="Instagram URL"
                    value={instagramLink}
                    onChange={(e) => setInstagramLink(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-855 bg-white dark:bg-zinc-950 focus:outline-none"
                  />
                  <input
                    type="url"
                    placeholder="YouTube URL"
                    value={youtubeLink}
                    onChange={(e) => setYoutubeLink(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-855 bg-white dark:bg-zinc-950 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="w-full py-2.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-4"
              >
                {savingSettings ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Branding & Contact Info
              </button>

            </form>
          </div>

          {/* Column 2: Event Details & Countdown timer */}
          <div className="glass-panel p-6 rounded-2xl border border-zinc-200/50 dark:border-white/5 bg-white/40 dark:bg-zinc-950/10 space-y-6">
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-1.5">
              <Calendar className="w-5 h-5 text-zinc-400" /> Marketplace Countdown Event
            </h2>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              {/* Event Title */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Event Title</label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-855 bg-white dark:bg-zinc-950 focus:outline-none"
                />
              </div>

              {/* Event description */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Event Description</label>
                <textarea
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  rows={4}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-855 bg-white dark:bg-zinc-950 focus:outline-none"
                />
              </div>

              {/* Event Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Event Date</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-855 bg-white dark:bg-zinc-950 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Event Start Time</label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-855 bg-white dark:bg-zinc-950 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingEvent}
                className="w-full py-2.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-4"
              >
                {savingEvent ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Event Details & Date
              </button>
            </form>
          </div>

        </div>

        {/* Change Password Section */}
        <div className="glass-panel p-6 rounded-2xl border border-zinc-200/50 dark:border-white/5 bg-white/40 dark:bg-zinc-950/10 space-y-6">
          <h2 className="text-lg font-bold tracking-tight flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5 text-zinc-400" /> Change Administrator Password
          </h2>
          <p className="text-xs text-zinc-500">
            Update your admin login password. You must enter your current password to confirm.
          </p>

          <form
            onSubmit={async (e) => {
              e.preventDefault()
              if (!currentPassword.trim()) { showToast('Enter current password', 'error'); return }
              if (newPassword.length < 8) { showToast('New password must be at least 8 characters', 'error'); return }
              if (newPassword !== confirmPassword) { showToast('Passwords do not match', 'error'); return }
              if (newPassword === 'sjck1985') { showToast('Choose a different password from the default', 'error'); return }
              setChangingPassword(true)
              const supabase = createClient()
              // Re-authenticate first
              const { error: signInErr } = await supabase.auth.signInWithPassword({
                email: 'adminsjck@sjck.internal',
                password: currentPassword.trim()
              })
              if (signInErr) {
                showToast('Current password is incorrect', 'error')
                setChangingPassword(false)
                return
              }
              const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword })
              if (updateErr) {
                showToast(updateErr.message || 'Failed to update password', 'error')
              } else {
                showToast('Password updated successfully!', 'success')
                setCurrentPassword('')
                setNewPassword('')
                setConfirmPassword('')
              }
              setChangingPassword(false)
            }}
            className="space-y-4"
            id="change-password-form"
          >
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Current Password</label>
              <div className="relative">
                <input
                  id="current-password"
                  type={showCurrentPw ? 'text' : 'password'}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={changingPassword}
                  className="w-full text-xs px-3.5 py-2.5 pr-10 rounded-lg border border-zinc-200 dark:border-zinc-855 bg-white dark:bg-zinc-950 focus:outline-none disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showCurrentPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">New Password</label>
              <div className="relative">
                <input
                  id="new-admin-password"
                  type={showNewPw ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={changingPassword}
                  className="w-full text-xs px-3.5 py-2.5 pr-10 rounded-lg border border-zinc-200 dark:border-zinc-855 bg-white dark:bg-zinc-950 focus:outline-none disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showNewPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Confirm New Password</label>
              <input
                id="confirm-admin-password"
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={changingPassword}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-855 bg-white dark:bg-zinc-950 focus:outline-none disabled:opacity-50"
              />
            </div>

            <button
              id="change-password-btn"
              type="submit"
              disabled={changingPassword}
              className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-all shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {changingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              Update Password
            </button>
          </form>
        </div>

      </div>
    </AdminLayout>
  )
}
