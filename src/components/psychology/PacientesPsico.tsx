'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { PsychPatient } from '@/types/psychology'
import { MODALITY_COLORS } from '@/lib/psych-engine'

const MOCK_PATIENTS: PsychPatient[] = [
  { id: 'pp1', tenant_id: '', name: 'Ana R.', phone: '612345678', modality_preference: 'presencial', sessions_completed: 8, next_appointment: '2026-03-24', active: true },
  { id: 'pp2', tenant_id: '', name: 'Carlos M.', phone: '623456789', modality_preference: 'online', sessions_completed: 14, next_appointment: '2026-03-22', active: true },
  { id: 'pp3', tenant_id: '', name: 'Lucía F.', phone: '634567890', modality_preference: 'presencial', sessions_completed: 32, next_appointment: '2026-03-25', active: true },
  { id: 'pp4', tenant_id: '', name: 'Jorge B.', modality_preference: 'online', sessions_completed: 3, active: true },
  { id: 'pp5', tenant_id: '', name: 'Elena V.', phone: '645678901', modality_preference: 'presencial', sessions_completed: 21, next_appointment: '2026-03-28', active: true },
  { id: 'pp6', tenant_id: '', name: 'Marta D.', phone: '656789012', sessions_completed: 1, active: true },
  { id: 'pp7', tenant_id: '', name: 'Pedro S.', phone: '667890123', modality_preference: 'presencial', sessions_completed: 45, active: false },
]

export default function PacientesPsico({ tenantId }: { tenantId: string }) {
  const [patients, setPatients] = useState<PsychPatient[]>([])
  const [usingMock, setUsingMock] = useState(false)
  const [search, setSearch] = useState('')
  const [showInactive, setShowInactive] = useState(false)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('psych_patients')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('sessions_completed', { ascending: false })

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
    if (!showInactive && !p.active) return false
    if (!search) return true
    const q = search.toLowerCase()
    return p.name.toLowerCase().includes(q) || p.phone?.includes(q)
  })

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white/90">Pacientes</h1>
          <p className="text-white/35 text-sm">
            {patients.filter(p => p.active).length} activos
            {usingMock && <span className="ml-2 text-amber-400/50">(demo)</span>}
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs text-white/35">
          <input type="checkbox" checked={showInactive} onChange={e => setShowInactive(e.target.checked)}
            className="rounded" />
          Mostrar inactivos
        </label>
      </div>

      <input placeholder="Buscar por nombre o teléfono..." value={search} onChange={e => setSearch(e.target.value)}
        className="w-full max-w-md glass rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 bg-transparent focus:outline-none focus:border-slate-500/50" />

      {filtered.length === 0 ? (
        <div className="glass rounded-2xl py-16 text-center text-white/20 text-sm">
          {patients.length === 0 ? 'Sin pacientes registrados aún.' : 'Sin resultados'}
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Paciente', 'Teléfono', 'Sesiones', 'Próxima cita', 'Modalidad', 'Estado'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-white/25 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-white/[0.015] transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-500/15 flex items-center justify-center text-xs font-semibold text-slate-400">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-white/80">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-white/40 font-mono">{p.phone || '—'}</td>
                  <td className="px-4 py-3.5 text-sm font-medium text-white/70">{p.sessions_completed}</td>
                  <td className="px-4 py-3.5 text-xs text-white/35">
                    {p.next_appointment
                      ? new Date(p.next_appointment + 'T12:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
                      : '—'}
                  </td>
                  <td className="px-4 py-3.5">
                    {p.modality_preference ? (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${MODALITY_COLORS[p.modality_preference]}`}>
                        {p.modality_preference === 'online' ? 'Online' : 'Presencial'}
                      </span>
                    ) : (
                      <span className="text-xs text-white/20">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                      p.active
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-white/5 text-white/25 border-white/10'
                    }`}>
                      {p.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
