'use client'

import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from 'next-themes'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap'
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap'
})

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='es' suppressHydrationWarning>
      <title>ULEAM LMS · Plataforma Académica</title>
      <body
        className={`${inter.variable} ${playfair.variable} antialiased`}
      >
        <ThemeProvider
          defaultTheme='light'
          attribute='class'
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster richColors position='top-right' />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
