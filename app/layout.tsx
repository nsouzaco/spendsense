import type { Metadata } from 'next'
import { GeistSans, GeistMono } from 'geist/font'
import './globals.css'

export const metadata: Metadata = {
  title: 'SpendSense - Financial Education Platform',
  description: 'Personalized financial education based on your spending patterns',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${GeistMono.className} ${GeistSans.variable}`}>{children}</body>
    </html>
  )
}

