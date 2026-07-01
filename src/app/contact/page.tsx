'use client'

import React, { useState } from 'react'
import { Phone, Mail, MapPin, Send, MessageSquare, Loader2 } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/context/ToastContext'
import { createClient } from '@/lib/supabase/client'

export default function ContactPage() {
  const { settings } = useApp()
  const { showToast } = useToast()

  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validations
    if (!name.trim()) {
      showToast('Name is required', 'error')
      return
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Please enter a valid email address', 'error')
      return
    }
    if (!message.trim()) {
      showToast('Message is required', 'error')
      return
    }

    setSubmitting(true)
    const loadToastId = showToast('Sending message...', 'loading')

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('contacts')
        .insert({
          name: name.trim(),
          email: email.trim(),
          message: message.trim()
        })

      if (error) throw error

      showToast('Thank you! Your message has been sent successfully.', 'success')
      setName('')
      setEmail('')
      setMessage('')
    } catch (err: any) {
      console.error('Error submitting contact form:', err)
      showToast(err.message || 'Failed to send message. Please try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col w-full">
      {/* Page Title */}
      <div className="text-center mb-12">
        <span className="text-[#0071e3] dark:text-[#2997ff] text-xs uppercase tracking-widest font-bold">Get In Touch</span>
        <h1 className="text-4xl font-extrabold tracking-tight mt-1">Contact Parish Mart Team</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-lg mx-auto font-light leading-relaxed">
          Have questions about product submissions, event timing, or interested in volunteering? Drop us a line!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Left 2 Cols: Contact info details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-zinc-200/50 dark:border-white/5 space-y-6">
            <h2 className="text-xl font-bold tracking-tight">Parish Contact Info</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-light">
              You can reach the organizers of the Sunday Marketplace via phone, email, or by visiting the parish office.
            </p>

            <ul className="space-y-4 pt-2">
              {settings.contact_number && (
                <li className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[#0071e3] dark:text-[#2997ff] flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400 font-bold block uppercase tracking-wider">Phone Number</span>
                    <span className="text-sm font-semibold mt-0.5 block">{settings.contact_number}</span>
                  </div>
                </li>
              )}
              {settings.email && (
                <li className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[#0071e3] dark:text-[#2997ff] flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400 font-bold block uppercase tracking-wider">Email Address</span>
                    <a href={`mailto:${settings.email}`} className="text-sm font-semibold mt-0.5 block hover:underline break-all">
                      {settings.email}
                    </a>
                  </div>
                </li>
              )}
              {settings.address && (
                <li className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[#0071e3] dark:text-[#2997ff] flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400 font-bold block uppercase tracking-wider">Office Location</span>
                    <span className="text-sm font-semibold mt-0.5 block leading-relaxed">{settings.address}</span>
                  </div>
                </li>
              )}
            </ul>
          </div>

          {/* Embedded Google Maps Ifram */}
          {settings.google_maps_iframe && (
            <div 
              className="w-full h-64 rounded-2xl overflow-hidden shadow border border-zinc-200 dark:border-zinc-850"
              dangerouslySetInnerHTML={{ __html: settings.google_maps_iframe }}
            />
          )}
        </div>

        {/* Right 3 Cols: Frosted Contact Form */}
        <div className="lg:col-span-3 glass-panel p-6 sm:p-8 rounded-3xl border border-zinc-200/50 dark:border-white/5 bg-white/40 dark:bg-zinc-950/20">
          <h2 className="text-2xl font-extrabold tracking-tight mb-6">Send a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-sm px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950/50 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Email Address</label>
              <input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950/50 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Message</label>
              <div className="relative">
                <textarea
                  placeholder="How can we help you?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="w-full text-sm px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950/50 focus:outline-none focus:ring-1 focus:ring-blue-500 pl-10"
                />
                <MessageSquare className="w-4 h-4 absolute left-3.5 top-4.5 text-zinc-400" />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-sm transition-all shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Sending message...
                </>
              ) : (
                <>
                  <Send className="w-4.5 h-4.5" /> Send Message
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
