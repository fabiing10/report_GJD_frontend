import { EstrellasFondo } from '@/components/presentacion/EstrellasFondo'

export default function Home() {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <EstrellasFondo />
      <div className="relative z-10 text-center space-y-4">
        <h1
          className="text-4xl font-bold"
          style={{ fontFamily: 'var(--font-inter-tight, Inter, sans-serif)' }}
        >
          Ecosistema de Gestión Jurídica Digital
        </h1>
        <p className="text-[#CBD5E1] text-sm">
          Informe de Avance — Secretaría General de Medellín
        </p>
        <p className="text-[#64748B] text-xs mt-8">
          Construyendo… fase 1/8 completada
        </p>
      </div>
    </div>
  )
}
