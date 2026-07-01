import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/context/ThemeContext"
import { ToastProvider } from "@/context/ToastContext"
import { AppProvider } from "@/context/AppContext"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const viewport = {
  width: "device-width",
  initialScale: 1,
}

export const metadata: Metadata = {
  title: "SJCK Sunday Mart",
  description: "Browse organic spices, homemade snacks, and traditional delicacies from our church community. Submit products for sale and support local parish families.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[#f5f5f7] dark:bg-black text-[#1d1d1f] dark:text-[#f5f5f7] transition-colors duration-300">
        <ThemeProvider>
          <ToastProvider>
            <AppProvider>
              <Navbar />
              <main className="flex-grow flex flex-col w-full relative">
                {children}
              </main>
            </AppProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
