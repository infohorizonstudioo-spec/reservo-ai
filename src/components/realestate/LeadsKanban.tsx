'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { RealEstateLead, LeadStatus } from '@/types/realestate'
import LeadModal from './LeadModal'

const KANBAN_COLUMNS: { key: string; label: string; statuses: LeadStatus[] }[] = [
  { key: 'nuevo', label: 'NUEVO', statuses: ['nuevo'] },
  { key: 'contactado', label: 'CONTACTADO', statuses: ['contactado'] },
  { key: 'visita', label: 'VISITA AGENDADA', statuses: ['visita_agendada', 'visita_realizada'] },
  { key: 'oferta', label: 'OFERTA', statuses: ['oferta'] },
  { key: 'cerrado', label: 'CERRADO / PERDIDO', statuses: ['cerrado', 'perdido'] },
]

const ALL_STATUSES: { value: LeadStatus; label: string }[] = [
  { value: 'nuevo', label: 'Nuevo' },
  { value: 'contactado', label: 'Contactado' },
  { value: 'visita_agendada', label: 'Visita agendada' },
  { value: 'visita_realizada', label: 'Visita realizada' },
  { value: 'oferta', label: 'Oferta' },
  { value: 'cerrado', label: 'Cerrado' },
  { value: 'perdido', label: 'Perdido' },
]

const MOCK_LEADS: RealEstateLead[] = [
  {
    id: '1', tenant_id: 'demo', name: 'María García López', phone: '+34 612 345 678',
    email: 'maria@email.com', operation: 'compra', property_type: 'Piso',
    zone: 'Centro', budget_max: 250000, status: 'nuevo', agent_name: 'Carlos',
    source: 'web', notes: 'Busca 3 habitaciones',
    last_contact: new Date(Date.now() - 5 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: '2', tenant_id: 'demo', name: 'Javier Ruiz Martín', phone: '+34 623 456 789',
    operation: 'alquiler', property_type: 'Local', zone: 'Ensanche',
    budget_max: 1200, status: 'contactado', agent_name: 'Laura',
    source: 'telefono',
    last_contact: new Date(Date.now() - 1 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: '3', tenant_id: 'demo', name: 'Ana Fernández Díaz', phone: '+34 634 567 890',
    email: 'ana.fd@email.com', operation: 'compra', property_type: 'Casa',
    zone: 'Periferia Norte', budget_max: 380000, status: 'visita_agendada',
    agent_name: 'Carlos', source: 'referido',
    last_contact: new Date(Date.now() - 4 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: '4', tenant_id: 'demo', name: 'Pedro Sánchez Gómez', phone: '+34 645 678 901',
    operation: 'compra', property_type: 'Piso', zone: 'Zona Playa',
    budget_max: 420000, status: 'oferta', agent_name: 'Laura',
    source: 'portal',
    last_contact: new Date(Date.now() - 0.5 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: '5', tenant_id: 'demo', name: 'Lucía Moreno Blanco', phone: '+34 656 789 012',
    operation: 'alquiler', property_type: 'Piso', zone: 'Centro',
    budget_max: 900, status: 'perdido', agent_name: 'Carlos',
    source: 'web', notes: 'Encontró otra opción',
    last_contact: new Date(Date.now() - 7 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
]

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

function formatBudget(n: number): string {
  return n >= 10000 ? `${(n / 1000).toFixed(0)}k€` : `${n}€`
}

export default function LeadsKanban({ tenantId }: { tenantId: string }) {
  const [leads, setLeads] = useState<RealEstateLead[]>([])
  const [showModal, setShowModal] = useState(false)
  const [movingLead, setMovingLead] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('real_estate_leads')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })

      if (error?.code === '42P01' || !data) {
        setLeads(MOCK_LEADS)
      } else {
        setLeads(data as RealEstateLead[])
      }
    }
    load()
  }, [tenantId])

  function moveLeadStatus(leadId: string, newStatus: LeadStatus) {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l))
    setMovingLead(null)
    // Persist to supabase (best-effort)
    supabase
      .from('real_estate_leads')
      .update({ status: newStatus })
      .eq('id', leadId)
      .eq('tenant_id', tenantId)
      .then(() => {})
  }

  function handleNewLead(lead: Partial<RealEstateLead>) {
    const newLead: RealEstateLead = {
      id: crypto.randomUUID(),
      tenant_id: tenantId,
      name: lead.name || '',
      phone: lead.phone,
      email: lead.email,
      operation: lead.operation || 'compra',
      property_type: lead.property_type,
      zone: lead.zone,
      budget_max: lead.budget_max,
      status: 'nuevo',
      agent_name: lead.agent_name,
      source: lead.source || 'manual',
      notes: lead.notes,
      last_contact: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }
    setLeads(prev => [newLead, ...prev])
    setShowModal(false)
    // Persist (best-effort)
    supabase.from('real_estate_leads').insert(newLead).then(() => {})
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leads Inmobiliaria</h1>
          <p className="text-white/40 text-sm">{leads.length} leads en total</p>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map(col => {
          const colLeads = leads.filter(l => col.statuses.includes(l.status))
          return (
            <div key={col.key} className="min-w-[280px] w-[280px] flex-shrink-0 flex flex-col">
              {/* Column header */}
              <div className="flex items-center justify-between px-3 py-2.5 mb-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white/70">{col.label}</span>
                  <span className="text-[10px] bg-white/[0.08] text-white/50 rounded-full px-2 py-0.5 font-medium">
                    {colLeads.length}
                  </span>
                </div>
                {col.key === 'nuevo' && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors"
                  >
                    + Nuevo lead
                  </button>
                )}
              </div>

              {/* Cards */}
              <div className="space-y-2.5 flex-1">
                {colLeads.map(lead => {
                  const daysCreated = daysSince(lead.created_at)
                  const daysSinceContact = lead.last_contact ? daysSince(lead.last_contact) : null
                  const alertContact = daysSinceContact !== null && daysSinceContact > 3

                  return (
                    <div
                      key={lead.id}
                      className="glass rounded-xl p-3.5 space-y-2.5 border border-white/[0.06] hover:border-white/[0.12] transition-colors"
                    >
                      {/* Name + phone */}
                      <div>
                        <p className="text-sm font-semibold leading-tight">{lead.name}</p>
                        {lead.phone && (
                          <p className="text-xs text-white/40 mt-0.5">{lead.phone}</p>
                        )}
                      </div>

                      {/* What they're looking for */}
                      <div className="text-xs text-white/50 space-y-0.5">
                        <p>
                          <span className="capitalize">{lead.operation}</span>
                          {lead.property_type && <> · {lead.property_type}</>}
                          {lead.zone && <> · {lead.zone}</>}
                        </p>
                        {lead.budget_max && (
                          <p>Presupuesto: hasta {formatBudget(lead.budget_max)}</p>
                        )}
                      </div>

                      {/* Badges row */}
                      <div className="flex flex-wrap gap-1.5">
                        {lead.agent_name && (
                          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 rounded-md px-2 py-0.5 border border-indigo-500/20">
                            {lead.agent_name}
                          </span>
                        )}
                        <span className="text-[10px] bg-white/[0.06] text-white/40 rounded-md px-2 py-0.5">
                          {daysCreated}d
                        </span>
                        {alertContact && (
                          <span className="text-[10px] bg-red-500/20 text-red-300 rounded-md px-2 py-0.5 border border-red-500/30 font-medium">
                            {daysSinceContact}d sin contacto
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-1 border-t border-white/[0.04]">
                        {lead.phone && (
                          <a
                            href={`tel:${lead.phone.replace(/\s/g, '')}`}
                            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                          >
                            Llamar
                          </a>
                        )}
                        <div className="relative ml-auto">
                          <button
                            onClick={() => setMovingLead(movingLead === lead.id ? null : lead.id)}
                            className="text-[11px] text-white/40 hover:text-white/70 font-medium transition-colors"
                          >
                            Mover estado
                          </button>
                          {movingLead === lead.id && (
                            <div className="absolute right-0 top-6 z-50 bg-[#1a1a22] border border-white/[0.1] rounded-xl p-1.5 shadow-2xl min-w-[160px]">
                              {ALL_STATUSES.filter(s => s.value !== lead.status).map(s => (
                                <button
                                  key={s.value}
                                  onClick={() => moveLeadStatus(lead.id, s.value)}
                                  className="w-full text-left text-xs px-3 py-1.5 rounded-lg hover:bg-white/[0.06] text-white/60 hover:text-white transition-colors"
                                >
                                  {s.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {showModal && (
        <LeadModal onClose={() => setShowModal(false)} onSave={handleNewLead} />
      )}
    </div>
  )
}
