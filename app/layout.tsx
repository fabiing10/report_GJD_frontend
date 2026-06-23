import type { Metadata } from 'next'
import { Open_Sans } from 'next/font/google'
import './globals.css'

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
  display: 'swap',
})
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
    <html lang="es" className={openSans.variable}>
      <body className="bg-[#0A1228] text-[#F8FAFC] antialiased min-h-screen font-sans">
        <ModoPresentacionProvider>{children}</ModoPresentacionProvider>
        <Toaster theme="dark" position="top-right" richColors />
      </body>
    </html>
  )
}
