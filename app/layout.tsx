import type { Metadata } from 'next'
import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { ModoPresentacionProvider } from '@/components/presentacion/ModoPresentacionProvider'

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plex-sans',
  display: 'swap',
})

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Ecosistema de Gestión Jurídica Digital',
  description: 'Informe de Avance — Secretaría General de Medellín',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body className="bg-[#0A1228] text-[#F8FAFC] antialiased min-h-screen font-sans">
        <ModoPresentacionProvider>{children}</ModoPresentacionProvider>
        <Toaster theme="dark" position="top-right" richColors />
      </body>
    </html>
  )
}
