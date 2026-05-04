'use client'

import { useState, useTransition } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { saveProyectoAction, type SaveProyectoPayload } from '@/lib/actions/proyectos'
import type {
  ProyectoDetalle,
  ComponenteConProyectos,
  EstadoEnum,
  PlazoEnum,
  LogroInput,
  PasoInput,
} from '@/types/domain'

const PLAZOS: PlazoEnum[] = ['corto', 'mediano', 'largo']
const PLAZO_LABELS: Record<PlazoEnum, string> = {
  corto: 'Corto plazo',
  mediano: 'Mediano plazo',
  largo: 'Largo plazo',
}
const ESTADOS: EstadoEnum[] = ['completado', 'en_progreso', 'no_iniciado', 'refinamiento', 'bloqueado']
const ESTADO_LABELS: Record<EstadoEnum, string> = {
  completado: 'Completado',
  en_progreso: 'En progreso',
  no_iniciado: 'No iniciado',
  refinamiento: 'Refinamiento',
  bloqueado: 'Bloqueado',
}

type TabKey = 'general' | 'logros' | 'pasos'

interface Props {
  proyecto?: ProyectoDetalle
  componentes: ComponenteConProyectos[]
  defaultComponenteId?: string
  onClose: () => void
  onSaved: () => void
}

export function ProyectoModal({ proyecto, componentes, defaultComponenteId, onClose, onSaved }: Props) {
  const isNew = !proyecto

  const [tab, setTab] = useState<TabKey>('general')
  const [, startTransition] = useTransition()

  // General fields
  const [componenteId, setComponenteId] = useState(
    proyecto?.componente_id ?? defaultComponenteId ?? componentes[0]?.id ?? ''
  )
  const [codigo, setCodigo] = useState(proyecto?.codigo ?? '')
  const [nombre, setNombre] = useState(proyecto?.nombre ?? '')
  const [descripcionCorta, setDescripcionCorta] = useState(proyecto?.descripcion_corta ?? '')
  const [descripcionLarga, setDescripcionLarga] = useState(proyecto?.descripcion_larga ?? '')
  const [plazo, setPlazo] = useState<PlazoEnum>(proyecto?.plazo ?? 'corto')
  const [estado, setEstado] = useState<EstadoEnum>(proyecto?.estado ?? 'no_iniciado')
  const [avance, setAvance] = useState(proyecto?.avance ?? 0)
  const [avanceCorto, setAvanceCorto] = useState(proyecto?.avance_corto ?? 0)
  const [avanceMediano, setAvanceMediano] = useState(proyecto?.avance_mediano ?? 0)
  const [avanceLargo, setAvanceLargo] = useState(proyecto?.avance_largo ?? 0)
  const [responsable, setResponsable] = useState(proyecto?.responsable ?? '')
  const [fechaTexto, setFechaTexto] = useState(proyecto?.fecha_entrega_texto ?? '')

  // Logros
  const [logros, setLogros] = useState<LogroInput[]>(
    proyecto?.logros.map((l) => ({ texto: l.texto, plazo: l.plazo })) ?? []
  )

  // Próximos pasos
  const [pasos, setPasos] = useState<PasoInput[]>(
    proyecto?.proximos_pasos.map((p) => ({ texto: p.texto, plazo: p.plazo })) ?? []
  )

  const addLogro = () => setLogros((prev) => [...prev, { texto: '', plazo: 'corto' }])
  const updateLogro = (i: number, field: 'texto' | 'plazo', val: string) => {
    setLogros((prev) => prev.map((l, idx) => (idx === i ? { ...l, [field]: val } : l)))
  }
  const removeLogro = (i: number) => setLogros((prev) => prev.filter((_, idx) => idx !== i))

  const addPaso = () => setPasos((prev) => [...prev, { texto: '', plazo: 'mediano' }])
  const updatePaso = (i: number, field: 'texto' | 'plazo', val: string) => {
    setPasos((prev) => prev.map((p, idx) => (idx === i ? { ...p, [field]: val } : p)))
  }
  const removePaso = (i: number) => setPasos((prev) => prev.filter((_, idx) => idx !== i))

  const handleSave = () => {
    if (!nombre.trim()) {
      toast.error('El nombre es requerido')
      setTab('general')
      return
    }
    if (!componenteId) {
      toast.error('Selecciona un componente')
      setTab('general')
      return
    }

    const payload: SaveProyectoPayload = {
      id: proyecto?.id,
      componente_id: componenteId,
      codigo: codigo.trim() || null,
      nombre: nombre.trim(),
      descripcion_corta: descripcionCorta.trim() || null,
      descripcion_larga: descripcionLarga.trim() || null,
      plazo,
      estado,
      avance: Math.min(100, Math.max(0, avance)),
      avance_corto: avanceCorto,
      avance_mediano: avanceMediano,
      avance_largo: avanceLargo,
      responsable: responsable.trim() || null,
      fecha_entrega_texto: fechaTexto.trim() || null,
      logros: logros.filter((l) => l.texto.trim()),
      proximos_pasos: pasos.filter((p) => p.texto.trim()),
    }

    startTransition(async () => {
      try {
        await saveProyectoAction(payload)
        toast.success(isNew ? 'Proyecto creado' : 'Proyecto guardado')
        onSaved()
      } catch (e) {
        toast.error('Error al guardar')
        console.error(e)
      }
    })
  }

  const componente = componentes.find((c) => c.id === componenteId)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        padding: '16px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 680,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 16,
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-surface-border)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-surface-border)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {componente && (
              <span style={{ fontSize: 18 }}>{componente.icono}</span>
            )}
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                {isNew ? 'Nuevo proyecto' : proyecto.nombre}
              </h2>
              {componente && (
                <p style={{ fontSize: 11, color: componente.color_hex, margin: 0, marginTop: 2 }}>
                  {componente.nombre}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: 6,
              borderRadius: 8,
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 0,
            borderBottom: '1px solid var(--color-surface-border)',
            flexShrink: 0,
            padding: '0 20px',
          }}
        >
          {([['general', 'General'], ['logros', `Logros (${logros.length})`], ['pasos', `Próx. pasos (${pasos.length})`]] as [TabKey, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                padding: '10px 16px',
                fontSize: 13,
                fontWeight: tab === key ? 600 : 400,
                color: tab === key ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                background: 'transparent',
                border: 'none',
                borderBottom: tab === key ? '2px solid var(--color-alcaldia-naranja)' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s',
                marginBottom: -1,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {/* GENERAL */}
          {tab === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Componente *</label>
                  <select
                    value={componenteId}
                    onChange={(e) => setComponenteId(e.target.value)}
                    style={selectStyle}
                  >
                    {componentes.map((c) => (
                      <option key={c.id} value={c.id}>{c.icono} {c.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Código</label>
                  <input
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    placeholder="HU-1"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Nombre *</label>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre del proyecto"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Descripción corta</label>
                <input
                  value={descripcionCorta}
                  onChange={(e) => setDescripcionCorta(e.target.value)}
                  placeholder="Resumen en una línea"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Descripción larga</label>
                <textarea
                  value={descripcionLarga}
                  onChange={(e) => setDescripcionLarga(e.target.value)}
                  placeholder="Descripción detallada..."
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Estado</label>
                  <select value={estado} onChange={(e) => setEstado(e.target.value as EstadoEnum)} style={selectStyle}>
                    {ESTADOS.map((e) => (
                      <option key={e} value={e}>{ESTADO_LABELS[e]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Plazo (agrupación)</label>
                  <select value={plazo} onChange={(e) => setPlazo(e.target.value as PlazoEnum)} style={selectStyle}>
                    {PLAZOS.map((p) => (
                      <option key={p} value={p}>{PLAZO_LABELS[p]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Avance global %</label>
                  <input
                    type="number" min={0} max={100}
                    value={avance}
                    onChange={(e) => setAvance(Number(e.target.value))}
                    style={{ ...inputStyle, textAlign: 'right' }}
                  />
                </div>
              </div>

              {/* Avance por plazo */}
              <div>
                <label style={{ ...labelStyle, marginBottom: 8, display: 'block' }}>Avance por plazo</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  {([['corto', avanceCorto, setAvanceCorto], ['mediano', avanceMediano, setAvanceMediano], ['largo', avanceLargo, setAvanceLargo]] as [PlazoEnum, number, (v: number) => void][]).map(([pl, val, setter]) => (
                    <div key={pl} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 12px', border: '1px solid var(--color-surface-border)' }}>
                      <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px' }}>
                        {PLAZO_LABELS[pl]}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input
                          type="range" min={0} max={100}
                          value={val}
                          onChange={(e) => setter(Number(e.target.value))}
                          style={{ flex: 1, accentColor: componente?.color_hex ?? '#3B82F6' }}
                        />
                        <span style={{ fontSize: 13, fontWeight: 700, color: componente?.color_hex ?? '#3B82F6', fontVariantNumeric: 'tabular-nums', minWidth: 32, textAlign: 'right' }}>
                          {val}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Responsable</label>
                  <input
                    value={responsable}
                    onChange={(e) => setResponsable(e.target.value)}
                    placeholder="Nombre del responsable"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Fecha de entrega (texto)</label>
                  <input
                    value={fechaTexto}
                    onChange={(e) => setFechaTexto(e.target.value)}
                    placeholder="Ej: Q2 2025"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          )}

          {/* LOGROS */}
          {tab === 'logros' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '0 0 4px' }}>
                Cada logro aparece en el tab del plazo que le asignes.
              </p>
              {logros.map((logro, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <input
                      value={logro.texto}
                      onChange={(e) => updateLogro(i, 'texto', e.target.value)}
                      placeholder="Describe el logro alcanzado..."
                      style={inputStyle}
                    />
                  </div>
                  <select
                    value={logro.plazo}
                    onChange={(e) => updateLogro(i, 'plazo', e.target.value)}
                    style={{ ...selectStyle, width: 130, flexShrink: 0 }}
                  >
                    {PLAZOS.map((p) => (
                      <option key={p} value={p}>{PLAZO_LABELS[p]}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeLogro(i)}
                    style={{ padding: 7, borderRadius: 7, background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', flexShrink: 0, marginTop: 1 }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={addLogro}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 8, fontSize: 13,
                  color: 'var(--color-estado-completado)',
                  background: 'rgba(34,197,94,0.08)',
                  border: '1px dashed rgba(34,197,94,0.3)',
                  cursor: 'pointer', width: 'fit-content', marginTop: 4,
                }}
              >
                <Plus size={14} /> Agregar logro
              </button>
            </div>
          )}

          {/* PRÓXIMOS PASOS */}
          {tab === 'pasos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '0 0 4px' }}>
                Cada paso aparece en el tab del plazo que le asignes.
              </p>
              {pasos.map((paso, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <input
                      value={paso.texto}
                      onChange={(e) => updatePaso(i, 'texto', e.target.value)}
                      placeholder="Describe el próximo paso..."
                      style={inputStyle}
                    />
                  </div>
                  <select
                    value={paso.plazo}
                    onChange={(e) => updatePaso(i, 'plazo', e.target.value)}
                    style={{ ...selectStyle, width: 130, flexShrink: 0 }}
                  >
                    {PLAZOS.map((p) => (
                      <option key={p} value={p}>{PLAZO_LABELS[p]}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => removePaso(i)}
                    style={{ padding: 7, borderRadius: 7, background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', flexShrink: 0, marginTop: 1 }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={addPaso}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 8, fontSize: 13,
                  color: 'var(--color-estado-en-progreso)',
                  background: 'rgba(59,130,246,0.08)',
                  border: '1px dashed rgba(59,130,246,0.3)',
                  cursor: 'pointer', width: 'fit-content', marginTop: 4,
                }}
              >
                <Plus size={14} /> Agregar paso
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            padding: '14px 20px',
            borderTop: '1px solid var(--color-surface-border)',
            flexShrink: 0,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 13,
              color: 'var(--color-text-muted)',
              background: 'transparent',
              border: '1px solid var(--color-surface-border)',
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              color: '#fff',
              background: 'var(--color-alcaldia-naranja)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {isNew ? 'Crear proyecto' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: 5,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: 8,
  fontSize: 13,
  color: 'var(--color-text-primary)',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid var(--color-surface-border)',
  outline: 'none',
  boxSizing: 'border-box',
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: 8,
  fontSize: 13,
  color: 'var(--color-text-primary)',
  background: 'rgba(20,30,60,0.8)',
  border: '1px solid var(--color-surface-border)',
  outline: 'none',
  cursor: 'pointer',
  boxSizing: 'border-box',
}
