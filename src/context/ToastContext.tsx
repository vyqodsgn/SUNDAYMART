'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, XCircle, AlertCircle, Loader2, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'loading'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  showToast: (message: string, type: ToastType, duration?: number) => string
  dismissToast: (id: string) => void
  dismissAllLoadingToasts: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const dismissAllLoadingToasts = useCallback(() => {
    setToasts((prev) => prev.filter((t) => t.type !== 'loading'))
  }, [])

  const showToast = useCallback((message: string, type: ToastType, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9)

    // Auto-dismiss any existing loading toast when a new non-loading toast arrives
    if (type !== 'loading') {
      setToasts((prev) => {
        const filtered = prev.filter((t) => t.type !== 'loading')
        return [...filtered, { id, message, type, duration }]
      })
    } else {
      setToasts((prev) => [...prev, { id, message, type, duration }])
    }

    if (type !== 'loading' && duration > 0) {
      setTimeout(() => {
        dismissToast(id)
      }, duration)
    }

    return id
  }, [dismissToast])

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast, dismissAllLoadingToasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

function ToastContainer() {
  const { toasts, dismissToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full p-4 pointer-events-none">
      {toasts.map((toast) => {
        let Icon = AlertCircle
        let style = 'bg-zinc-900 border-zinc-800 text-zinc-100'
        
        if (toast.type === 'success') {
          Icon = CheckCircle
          style = 'bg-zinc-900/90 border-green-500/30 text-green-400'
        } else if (toast.type === 'error') {
          Icon = XCircle
          style = 'bg-zinc-900/90 border-red-500/30 text-red-400'
        } else if (toast.type === 'loading') {
          Icon = Loader2
          style = 'bg-zinc-900/90 border-blue-500/30 text-blue-400'
        } else if (toast.type === 'info') {
          Icon = AlertCircle
          style = 'bg-zinc-900/90 border-zinc-500/30 text-zinc-300'
        }

        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg pointer-events-auto transition-all duration-300 translate-y-0 opacity-100 ${style}`}
            role="alert"
          >
            <Icon className={`w-5 h-5 flex-shrink-0 ${toast.type === 'loading' ? 'animate-spin' : ''}`} />
            <p className="text-sm font-medium flex-1 pr-2">{toast.message}</p>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-current opacity-60 hover:opacity-100 transition-opacity p-0.5 rounded-lg hover:bg-white/10 cursor-pointer"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
