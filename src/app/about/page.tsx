'use client'

import React from 'react'
import Link from 'next/link'
import { Calendar, ShieldCheck, Heart, Users, ArrowRight, ShoppingBag } from 'lucide-react'
import { useApp } from '@/context/AppContext'

export default function AboutPage() {
  const { settings, eventDetails } = useApp()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-12">
      {/* Title */}
      <div className="text-center">
        <span className="text-[#0071e3] dark:text-[#2997ff] text-xs uppercase tracking-widest font-bold">About Us</span>
        <h1 className="text-4xl font-extrabold tracking-tight mt-1">Our Sunday Marketplace</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 font-light max-w-lg mx-auto">
          A parish-driven community initiative bringing together organic crops, home-ground spices, and traditional delicacies.
        </p>
      </div>

      {/* Visual Header card */}
      <div className="relative rounded-3xl overflow-hidden glass-panel h-64 sm:h-80 flex items-center justify-center border border-zinc-200/50 dark:border-white/5 bg-zinc-900/10">
        <img 
          src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1200&auto=format&fit=crop" 
          alt="Marketplace background" 
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center p-8 sm:p-12 text-white space-y-2">
          <span className="text-xs uppercase tracking-widest font-bold text-[#2997ff]">Community First</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold max-w-md leading-tight">Supporting Our Local Parish Members</h2>
          <p className="text-xs text-zinc-300 font-light max-w-sm">Every purchase you make directly supports a family within our church community.</p>
        </div>
      </div>

      {/* Grid of Key Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          {
            Icon: Heart,
            title: 'Homemade & Pure',
            desc: 'All products submitted are crafted, baked, or harvested directly by parish members with zero artificial additives.'
          },
          {
            Icon: ShieldCheck,
            title: 'Admin Curated',
            desc: 'Every item goes through a rigorous quality review by our parish administrator to ensure premium quality and fair pricing.'
          },
          {
            Icon: Users,
            title: 'Parish Unity',
            desc: 'More than a store, it is a Sunday celebration of sharing crops, home skills, and community bonds.'
          }
        ].map((item) => (
          <div key={item.title} className="glass-card p-6 rounded-2xl border border-zinc-200/50 dark:border-white/5 bg-white/40 dark:bg-zinc-950/20">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[#0071e3] dark:text-[#2997ff] w-fit mb-4">
              <item.Icon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base mb-2">{item.title}</h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-light">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* How it works section */}
      <div className="space-y-6 pt-4">
        <h2 className="text-2xl font-extrabold tracking-tight text-center sm:text-left">How the Marketplace Works</h2>
        
        <div className="space-y-4">
          {[
            { step: '1', title: 'Submit Product Details', body: 'Parish members fill out a simple product form. If you are selling pre-seeded items like Chilli Powder or Pappadam, select it from the dropdown to automatically configure size and price.' },
            { step: '2', title: 'Administrator Quality Review', body: 'The parish administrator reviews the submission details and product image to ensure it meets our community guidelines and approves it.' },
            { step: '3', title: 'Product Appears on Live Catalog', body: 'Once approved, the product immediately appears on the live website. Visitors can search, filter, and view description and price.' },
            { step: '4', title: 'Connect & Complete Purchase', body: 'Interested buyers click "Show Phone Number" to dial the seller directly, organize pickup at the church ground on Sunday, and complete the transaction.' }
          ].map((item) => (
            <div key={item.step} className="flex gap-4 items-start">
              <span className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#0071e3] dark:text-[#2997ff] flex items-center justify-center font-bold text-sm flex-shrink-0">
                {item.step}
              </span>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">{item.title}</h4>
                <p className="text-xs text-zinc-500 leading-relaxed font-light">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Event Details Countdown Promo */}
      <div className="glass-panel p-8 rounded-3xl border border-zinc-200/50 dark:border-white/5 bg-zinc-100/30 dark:bg-zinc-900/10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-lg font-bold">Ready to participate?</h3>
          <p className="text-xs text-zinc-500 max-w-sm font-light">
            If you have homemade items, submit them before the deadline. Submissions close before the event starts.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3">
          {settings.submission_enabled ? (
            <Link 
              href="/submit"
              className="px-6 py-2.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow transition-colors flex items-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4" /> Submit Product
            </Link>
          ) : (
            <span className="px-6 py-2.5 rounded-full bg-red-500/10 text-red-500 text-xs font-semibold border border-red-500/20">
              Submissions Closed
            </span>
          )}
          <Link 
            href="/products"
            className="px-6 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-semibold transition-colors flex items-center gap-1"
          >
            Browse Products <ArrowRight className="w-4.5 h-4.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
