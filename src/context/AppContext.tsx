'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Settings {
  church_name: string
  church_logo: string | null
  theme: string
  contact_number: string
  email: string
  address: string
  google_maps_iframe: string
  submission_enabled: boolean
  facebook_link: string | null
  instagram_link: string | null
  youtube_link: string | null
}

export interface EventDetails {
  event_date: string
  title: string
  description: string
}

interface AppContextType {
  settings: Settings
  eventDetails: EventDetails
  loading: boolean
  refreshSettings: () => Promise<void>
}

const defaultSettings: Settings = {
  church_name: 'SJCK Sunday Mart',
  church_logo: null,
  theme: 'dark',
  contact_number: '+91 94470 12345',
  email: 'contact@stjosephchurchkaryavattom.org',
  address: 'St. Joseph Church Road, Karyavattom, Trivandrum, Kerala 695581',
  google_maps_iframe: '',
  submission_enabled: true,
  facebook_link: null,
  instagram_link: null,
  youtube_link: null,
}

const defaultEventDetails: EventDetails = {
  event_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
  title: 'Sunday Harvest Fair & Marketplace',
  description: 'Sunday church market fair.',
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [eventDetails, setEventDetails] = useState<EventDetails>(defaultEventDetails)
  const [loading, setLoading] = useState(true)

  const refreshSettings = async () => {
    try {
      const supabase = createClient()
      
      const { data: settingsData, error: settingsError } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 'global')
        .maybeSingle()

      if (settingsData) {
        setSettings(settingsData as Settings)
      }

      const { data: eventData, error: eventError } = await supabase
        .from('event_details')
        .select('*')
        .eq('id', 'global')
        .maybeSingle()

      if (eventData) {
        setEventDetails(eventData as EventDetails)
      }
    } catch (err) {
      console.error('Error fetching settings/event details:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshSettings()
  }, [])

  return (
    <AppContext.Provider value={{ settings, eventDetails, loading, refreshSettings }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
