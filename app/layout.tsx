import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import Navbar from '@/components/Navbar'
import { AuthProvider } from '@/hooks/useAuth'
import { EnhancedAuthProvider } from '@/hooks/useEnhancedAuth'
import { MultiAccountProvider } from '@/hooks/useMultiAccount'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Diabeto - Diabetes Management Platform',
  description: 'Comprehensive diabetes management platform with multi-account support',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <EnhancedAuthProvider>
            <MultiAccountProvider>
              <Navbar />
              {children}
              <Toaster />
            </MultiAccountProvider>
          </EnhancedAuthProvider>
        </AuthProvider>
      </body>
    </html>
  )
}