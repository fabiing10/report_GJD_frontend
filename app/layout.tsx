import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { Toaster } from 'sonner'
import { ModoPresentacionProvider } from '@/components/presentacion/ModoPresentacionProvider'

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
    <html lang="es" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="bg-[#0A1228] text-[#F8FAFC] antialiased min-h-screen font-sans">
        <ModoPresentacionProvider>{children}</ModoPresentacionProvider>
        <Toaster theme="dark" position="top-right" richColors />
      </body>
    </html>
  )
}
