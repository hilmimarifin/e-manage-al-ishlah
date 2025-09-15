import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ReactQueryProvider } from '@/lib/react-query'
import { Toaster } from '@/components/ui/toaster'
import { PWAInstallPrompt, NetworkStatusIndicator } from '@/components/pwa-install-prompt'
import { Suspense } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'E-Manage Al-Ishlah',
  description: 'Educational Management System for Al-Ishlah - Manage classes, students, and educational resources',
  keywords: ['education', 'management', 'school', 'students', 'classes', 'al-ishlah'],
  authors: [{ name: 'Al-Ishlah Team' }],
  creator: 'Al-Ishlah',
  publisher: 'Al-Ishlah',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  themeColor: '#000000',
  colorScheme: 'light dark',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'E-Manage Al-Ishlah',
  },
  applicationName: 'E-Manage Al-Ishlah',
  category: 'education',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icons/icon-192x192.svg" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="E-Manage Al-Ishlah" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={inter.className}>
        <ReactQueryProvider>
          <Suspense fallback={<div>Loading...</div>}>
            {children}
          </Suspense>
          <Toaster />
          <PWAInstallPrompt />
          <NetworkStatusIndicator />
        </ReactQueryProvider>
      </body>
    </html>
  )
}