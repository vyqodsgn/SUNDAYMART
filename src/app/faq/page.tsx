'use client'

import React, { useState } from 'react'
import { Plus, Minus, HelpCircle } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

export default function FAQPage() {
  const faqs: FAQItem[] = [
    {
      question: 'What is the Church Sunday Marketplace?',
      answer: 'It is a community-driven initiative that allows members of our church parish to sell their home-grown crops, organic spices, homemade food, and crafts to other church members and visitors during our Sunday gatherings.'
    },
    {
      question: 'Who can submit products for sale?',
      answer: 'Any active member or family within our church parish community can submit products for sale. There are no seller fees or charges. Submitting is completely free.'
    },
    {
      question: 'Do I need to create a seller account to submit products?',
      answer: 'No, there are no seller accounts. Visitors and church members can submit products directly from the "Submit Item" page without logging in. You only need to fill in your contact name, phone number, choose the product details, and upload an image.'
    },
    {
      question: 'How do product reviews and approvals work?',
      answer: 'To maintain high quality and coordinate logistics, all submissions are put into a "Pending Review" queue. The single church website administrator reviews each submission (verifying price points, descriptions, and uploaded images). Once approved, the item immediately appears on the public website catalog.'
    },
    {
      question: 'What is the "Searchable Dropdown" on the submit page?',
      answer: 'To make submissions faster, the administrator maintains a catalog of predefined products (like Chilli Powder, Banana Chips, Pappadam, and Spices). Selecting one of these preset products automatically configures the item name, available package sizes, and standard price. If your product is not in the dropdown, select "Other Product" at the bottom to enter all details manually.'
    },
    {
      question: 'How do I purchase items listed on the website?',
      answer: 'Our website serves as a digital display catalog rather than an e-commerce store. If you are interested in a product, view its details page and click "Show Seller Phone Number" to contact the seller directly. You can reserve the product and complete the payment/pickup in person at the church ground on the event day.'
    },
    {
      question: 'What are the photo upload requirements?',
      answer: 'Images uploaded must be in JPEG, PNG, or WEBP format and cannot exceed 5MB. For performance, our website automatically compresses your images in your browser before uploading them, ensuring the catalog loads fast on mobile networks.'
    },
    {
      question: 'What does the "Sold Out" status mean?',
      answer: 'When a seller has sold all of their submitted packages, they contact the administrator. The administrator will toggle the status to "Sold", displaying a red "Sold Out" badge on the product and hiding the seller contact number to prevent further calls.'
    }
  ]

  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
      {/* Title */}
      <div className="text-center">
        <span className="text-[#0071e3] dark:text-[#2997ff] text-xs uppercase tracking-widest font-bold">Support</span>
        <h1 className="text-4xl font-extrabold tracking-tight mt-1">FAQ & Support</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 font-light max-w-md mx-auto">
          Have questions? Find answers to frequently asked questions about submissions, purchases, and admin reviews.
        </p>
      </div>

      {/* FAQs List */}
      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = activeIndex === idx
          return (
            <div 
              key={idx} 
              className="glass-card rounded-2xl overflow-hidden border border-zinc-200/50 dark:border-white/5 transition-all bg-white/40 dark:bg-zinc-950/20"
            >
              <button
                onClick={() => toggleFAQ(idx)}
                className="w-full flex items-center justify-between px-6 py-4.5 text-left text-sm font-semibold select-none cursor-pointer"
              >
                <span className="flex items-center gap-2.5 text-zinc-800 dark:text-zinc-200 pr-4">
                  <HelpCircle className="w-4.5 h-4.5 text-zinc-400 flex-shrink-0" />
                  {faq.question}
                </span>
                {isOpen ? (
                  <Minus className="w-4 h-4 text-blue-500 flex-shrink-0" />
                ) : (
                  <Plus className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                )}
              </button>
              
              {isOpen && (
                <div className="px-6 pb-5 pt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-light border-t border-zinc-150/20 dark:border-white/5">
                  {faq.answer}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
