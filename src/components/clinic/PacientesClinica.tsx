'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { ClinicAppointment } from '@/types/clinic'
import { CONSULT_TYPE_LABELS } from '@/lib/clinic-engine'

interface Patient {
  name: string
  phone?: string
  totalVisits: number
  lastVisit?: string
  lastType?: string
  isUrgent: boolean
}

const MOCK_PATIENTS: Patient[] = [
  { name: 'Ana López', phone: '612345678', totalVisits: 5, lastVisit: '2026-03-18', lastType: 'revision', isUrgent: false },
  { name: 'Carlos Ruiz', phone: '623456789', totalVisits: 3, lastVisit: '2026-03-15', lastType: 'limpieza', isUrgent: false },
  { name: 'María García', phone: '634567890', totalVisits: 8, lastVisit: '2026-03-20', lastType: 'urgencia', isUrgent: true },
  { name: 'Pedro Sánchez', phone: '645678901', totalVisits: 2, lastVisit: '2026-03-10', lastType: 'tratamiento', isUrgent: false },
  { name: 'Laura Fernández', phone: '656789012', totalVisits: 12, lastVisit: '2026-03-19', lastType: 'revision', isUrgent: false },
  { name: 'Javier Martín', phone: '667890123', totalVisits: 1, lastVisit: '2026-03-21', lastType: 'limpieza', isUrgent: false },
]

export default function PacientesClinica({ tenantId }: { tenantId: string }) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [search, setSearch] = useState('')
  const [useMock, setUseMock] = useState(false)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('clinic_appointments')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('date', { ascending: false })

      if (error || !data || data.length === 0) {
        setUseMock(true)
        setPatients(MOCK_PATIENTS)
        return
      }

      const map = new Map<string, Patient>()
      for (const appt of data as ClinicAppointment[]) {
        const key = appt.patient_name.toLowerCase()
        const existing = map.get(key)
        if (existing) {
          existing.totalVisits++
          if (!existing.lastVisit || appt.date > existing.lastVisit) {
            existing.lastVisit = appt.date
            existing.lastType = appt.consult_type
          }
          if (appt.is_urgent) existing.isUrgent = true
        } else {
          map.set(key, {
            name: appt.patient_name,
            phone: appt.patient_phone,
            totalVisits: 1,
            lastVisit: appt.date,
            lastType: appt.consult_type,
            isUrgent: appt.is_urgent,
          })
        }
      }
      setPatients(Array.from(map.values()).sort((a, b) => b.totalVisits - a.totalVisits))
    }
    load()
  }, [tenantId])

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  )

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pacientes</h1>
          <p className="text-white/40 text-sm">
            {patients.length} pacientes registrados
            {useMock && <span className="ml-2 text-white/20">(demo)</span>}
          </p>
        </div>
      </div>

      <input placeholder="Buscar por nombre o teléfono..." value={search} onChange={e => setSearch(e.target.value)}
        className="w-full max-w-md glass rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 bg-transparent focus:outline-none focus:border-violet-500/50" />

      {filtered.length === 0 ? (
        <div className="glass rounded-2xl py-16 text-center text-white/25 text-sm">
          {patients.length === 0 ? 'Sin pacientes registrados. Se añaden automáticamente al crear citas.' : 'Sin resultados'}
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Paciente', 'Teléfono', 'Visitas', 'Última visita', 'Último tipo', 'Estado'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-white/30 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map(p => (
                <tr key={p.name} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/30 to-indigo-500/30 flex items-center justify-center text-xs font-bold text-violet-300">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-sm font-medium">{p.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-white/50">{p.phone || '—'}</td>
                  <td className="px-4 py-3.5 text-sm font-medium">{p.totalVisits}</td>
                  <td className="px-4 py-3.5 text-xs text-white/40">
                    {p.lastVisit ? new Date(p.lastVisit + 'T12:00').toLocaleDateString('es-ES') : '—'}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-white/50">
                    {p.lastType ? CONSULT_TYPE_LABELS[p.lastType as keyof typeof CONSULT_TYPE_LABELS] || p.lastType : '—'}
                  </td>
                  <td className="px-4 py-3.5">
                    {p.isUrgent ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">Urgencia reciente</span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Regular</span>
                    )}
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
