import Image from 'next/image'
import { getInformeActivo } from '@/lib/db/queries'
import { ProgressRing } from '@/components/presentacion/ProgressRing'
import { ComponenteCard } from '@/components/presentacion/ComponenteCard'

export default async function HomePage() {
  const informe = await getInformeActivo()
  if (!informe) return null

  return (
    <div className="flex flex-col items-center px-4 pt-8 pb-24">
      <div className="flex flex-col items-center gap-4 mb-10">
        <Image
          src="/logo-gjd.svg"
          alt="Gestión Jurídica Digital"
          width={80}
          height={80}
          priority
        />
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-[var(--color-text-primary)] leading-tight">
            {informe.titulo}
          </h1>
          {informe.subtitulo && (
            <p className="text-[var(--color-text-secondary)] text-sm mt-2">
              {informe.subtitulo}
            </p>
          )}
        </div>
      </div>

      <div className="mb-12">
        <ProgressRing
          value={informe.avance_global_calculado}
          color="#F97316"
          size="lg"
          label="Avance global"
        />
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {informe.componentes.map((componente, i) => (
          <ComponenteCard
            key={componente.id}
            componente={componente}
            index={i}
          />
        ))}
      </div>
    </div>
  )
}
