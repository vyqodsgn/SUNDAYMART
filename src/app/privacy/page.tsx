'use client'

import React from 'react'

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
      {/* Title */}
      <div className="text-center">
        <span className="text-[#0071e3] dark:text-[#2997ff] text-xs uppercase tracking-widest font-bold">Policy</span>
        <h1 className="text-4xl font-extrabold tracking-tight mt-1">Privacy Policy</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 font-light">
          Last updated: July 1, 2026. Learn how we handle your contact details and submitted product listing data.
        </p>
      </div>

      {/* Policy Text content */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-zinc-200/50 dark:border-white/5 space-y-6 text-sm font-light leading-relaxed text-zinc-650 dark:text-zinc-300">
        
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-150">1. Information We Collect</h2>
          <p>
            When you submit a product for sale on the Sunday Marketplace, we collect specific personal details to coordinate the sale and listing. This information includes:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2 text-xs">
            <li><strong>Seller Name:</strong> Displayed alongside your product so buyers know who is selling it.</li>
            <li><strong>Phone Number:</strong> Used by potential buyers to contact you via voice call or SMS to reserve items.</li>
            <li><strong>Product Details:</strong> Names, prices, quantities, and descriptions of items you submit.</li>
            <li><strong>Product Images:</strong> Photographs of products you upload.</li>
            <li><strong>Contact Message Details:</strong> Any messages, names, or emails submitted through the contact form.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-150">2. How We Use Your Information</h2>
          <p>
            Your information is used solely to run the Sunday Marketplace. Specifically:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2 text-xs">
            <li>To display your approved products in our public catalog so church members and visitors can browse them.</li>
            <li>To enable buyers to click and view your contact number to finalize pickups on Sunday.</li>
            <li>To allow the parish administrator to manage listings, mark items as sold, or contact you if there are questions about your submission.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-150">3. Data Visibility & Public Exposure</h2>
          <p>
            Please be aware of the public visibility rules on our platform:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2 text-xs">
            <li><strong>Pending Submissions:</strong> When you submit a product, it starts as &quot;pending&quot; and is only visible to the site administrator.</li>
            <li><strong>Approved Listings:</strong> Once approved, the seller name, product name, price, quantity, and notes become publicly searchable. The phone number is hidden behind a &quot;Show Phone Number&quot; button to prevent automated scraper bots, but is viewable by any human visitor who clicks it.</li>
            <li><strong>Sold Out Listings:</strong> Once marked as &quot;sold&quot; by the administrator, the product remains visible with a &quot;Sold Out&quot; badge, but the phone number is disabled and hidden from public view.</li>
            <li><strong>Rejected Listings:</strong> If a product is rejected by the administrator, it is hidden from public view.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-150">4. Third-Party Sharing & Storage</h2>
          <p>
            We do not sell, trade, or share your contact numbers or personal details with third-party marketing networks or external entities. Your data is stored securely using <strong>Supabase (PostgreSQL and Storage Buckets)</strong> and protected by Row Level Security (RLS) policies. Only the authenticated parish administrator has permission to modify, delete, or perform dashboard operations on your data.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-150">5. Your Rights & Data Removal</h2>
          <p>
            If you wish to edit your listing, mark an item as sold, or request the complete deletion of your product submission and phone number from our systems, please contact the parish administrator or use the Contact Page. The administrator can delete or modify any entry immediately.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-150">6. Contacting Organizers</h2>
          <p>
            If you have questions about this privacy statement, please visit the parish office or submit an inquiry using our Contact form.
          </p>
        </section>

      </div>
    </div>
  )
}
