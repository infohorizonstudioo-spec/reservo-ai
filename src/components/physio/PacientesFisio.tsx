'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { PhysioPatient, BodyArea } from '@/types/physiotherapy'
import { BODY_AREA_LABELS, BODY_AREA_COLORS } from '@/lib/physio-engine'

const MOCK_PATIENTS: PhysioPatient[] = [
  { id: 'pp1', tenant_id: '', name: 'Roberto Méndez', phone: '612345678', email: 'roberto@email.com', injury_description: 'Lesión menisco lateral', body_area: 'rodilla', sessions_completed: 3, total_sessions_planned: 10, next_appointment: new Date().toISOString().split('T')[0], active: true },
  { id: 'pp2', tenant_id: '', name: 'Elena Vázquez', phone: '623456789', injury_description: 'Cervicalgia crónica', body_area: 'cervical', sessions_completed: 0, total_sessions_planned: 8, active: true },
  { id: 'pp3', tenant_id: '', name: 'Carlos Ruiz', phone: '634567890', email: 'carlos@email.com', injury_description: 'Post-operatorio manguito rotador', body_area: 'hombro', sessions_completed: 7, total_sessions_planned: 15, active: true },
  { id: 'pp4', tenant_id: '', name: 'Laura Fernández', phone: '645678901', injury_description: 'Lumbalgia recurrente', body_area: 'lumbar', sessions_completed: 5, total_sessions_planned: 8, active: true },
  { id: 'pp5', tenant_id: '', name: 'Javier Torres', phone: '656789012', injury_description: 'Esguince tobillo grado II', body_area: 'tobillo', sessions_completed: 2, total_sessions_planned: 6, active: true },
  { id: 'pp6', tenant_id: '', name: 'María García', email: 'maria@email.com', injury_description: 'Bursitis cadera', body_area: 'cadera', sessions_completed: 4, total_sessions_planned: 10, active: true },
  { id: 'pp7', tenant_id: '', name: 'Ana Sánchez', phone: '667890123', injury_description: 'Contractura cervical', body_area: 'cervical', sessions_completed: 6, total_sessions_planned: 6, active: false },
]

export default function PacientesFisio({ tenantId }: { tenantId: string }) {
  const [patients, setPatients] = useState<PhysioPatient[]>([])
  const [search, setSearch] = useState('')
  const [usingMock, setUsingMock] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('physio_patients')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('name')

      if (error || !data || data.length === 0) {
        setUsingMock(true)
        setPatients(MOCK_PATIENTS.map(p => ({ ...p, tenant_id: tenantId })))
        return
      }
      setPatients(data)
    }
    load()
  }, [tenantId])

  const filtered = patients.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone?.includes(search) ||
      p.email?.toLowerCase().includes(search.toLowerCase()) ||
      p.injury_description?.toLowerCase().includes(search.toLowerCase())

    if (filter === 'active') return matchSearch && p.active
    if (filter === 'completed') return matchSearch && !p.active
    return matchSearch
  })

  const activeCount = patients.filter(p => p.active).length
  const completedCount = patients.filter(p => !p.active).length

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pacientes Fisioterapia</h1>
          <p className="text-white/40 text-sm">
            {activeCount} activos · {completedCount} dados de alta
            {usingMock && <span className="ml-2 text-amber-400/60">(demo)</span>}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input placeholder="Buscar por nombre, telefono, email o lesion..." value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 max-w-md glass rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 bg-transparent focus:outline-none focus:border-violet-500/50" />
        <div className="flex gap-1">
          {(['all', 'active', 'completed'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? 'bg-white/12 text-white' : 'text-white/40 hover:text-white/60'}`}>
              {f === 'all' ? 'Todos' : f === 'active' ? 'Activos' : 'Alta'}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass rounded-2xl py-16 text-center text-white/25 text-sm">
          {patients.length === 0 ? 'Sin pacientes registrados aun.' : 'Sin resultados'}
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Paciente', 'Zona / Lesion', 'Progreso', 'Proxima cita', 'Estado'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-white/30 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map(p => {
                const progress = p.total_sessions_planned
                  ? Math.round((p.sessions_completed / p.total_sessions_planned) * 100)
                  : 0

                return (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/30 to-indigo-500/30 flex items-center justify-center text-xs font-bold text-violet-300">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{p.name}</p>
                          <p className="text-xs text-white/30">{p.phone || p.email || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-1">
                        {p.body_area && (
                          <span className={`inline-flex w-fit px-1.5 py-0.5 rounded text-[10px] font-medium border ${BODY_AREA_COLORS[p.body_area]}`}>
                            {BODY_AREA_LABELS[p.body_area]}
                          </span>
                        )}
                        {p.injury_description && (
                          <p className="text-xs text-white/40 truncate max-w-[200px]">{p.injury_description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden max-w-[120px]">
                            <div
                              className={`h-full rounded-full transition-all ${progress >= 100 ? 'bg-emerald-500' : 'bg-violet-500'}`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-white/50">
                            {p.sessions_completed}{p.total_sessions_planned ? `/${p.total_sessions_planned}` : ''}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-white/40">
                      {p.next_appointment
                        ? new Date(p.next_appointment + 'T12:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
                        : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                        p.active
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                          : 'bg-white/5 text-white/30 border-white/10'
                      }`}>
                        {p.active ? 'En tratamiento' : 'Alta'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
