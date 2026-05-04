import type { Metadata } from 'next'
import { Inter, Inter_Tight } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { ModoPresentacionProvider } from '@/components/presentacion/ModoPresentacionProvider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const interTight = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-inter-tight',
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
    <html lang="es" className={`${inter.variable} ${interTight.variable}`}>
      <body className="bg-[#0A1228] text-[#F8FAFC] antialiased min-h-screen">
        <ModoPresentacionProvider>{children}</ModoPresentacionProvider>
        <Toaster theme="dark" position="top-right" richColors />
      </body>
    </html>
  )
}
