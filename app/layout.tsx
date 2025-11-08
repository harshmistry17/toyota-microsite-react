import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const toyotaFont = localFont({
  src: [
    {
      path: './fonts/ToyotaType-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/ToyotaType-Book.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/ToyotaType-BookIt.ttf',
      weight: '400',
      style: 'italic',
    },
    {
      path: './fonts/ToyotaType-Semibold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: './fonts/ToyotaType-SemiboldIt.ttf',
      weight: '600',
      style: 'italic',
    },
    {
      path: './fonts/ToyotaType-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/ToyotaType-BoldIt.ttf',
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-toyota',
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
})

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${toyotaFont.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}