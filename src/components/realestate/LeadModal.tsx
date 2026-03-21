'use client'

import { useState } from 'react'
import type { RealEstateLead } from '@/types/realestate'

interface Props {
  onClose: () => void
  onSave: (lead: Partial<RealEstateLead>) => void
}

export default function LeadModal({ onClose, onSave }: Props) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    operation: 'compra' as 'compra' | 'alquiler',
    property_type: '',
    zone: '',
    budget_max: '',
    source: 'manual' as RealEstateLead['source'],
    agent_name: '',
    notes: '',
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave({
      name: form.name.trim(),
      phone: form.phone || undefined,
      email: form.email || undefined,
      operation: form.operation,
      property_type: form.property_type || undefined,
      zone: form.zone || undefined,
      budget_max: form.budget_max ? Number(form.budget_max) : undefined,
      source: form.source,
      agent_name: form.agent_name || undefined,
      notes: form.notes || undefined,
    })
  }

  const inputClass =
    'w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-violet-500/50 transition-colors'
  const labelClass = 'text-xs text-white/50 font-medium mb-1 block'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative bg-[#16161d] border border-white/[0.08] rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold">Nuevo Lead</h2>
          <button type="button" onClick={onClose} className="text-white/30 hover:text-white/60 text-lg">
            ✕
          </button>
        </div>

        {/* Name (required) */}
        <div>
          <label className={labelClass}>Nombre *</label>
          <input
            required
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="Nombre completo"
            className={inputClass}
          />
        </div>

        {/* Phone + Email row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Teléfono</label>
            <input
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              placeholder="+34 600 000 000"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="email@ejemplo.com"
              className={inputClass}
            />
          </div>
        </div>

        {/* Operation + Type */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Operación</label>
            <select
              value={form.operation}
              onChange={e => set('operation', e.target.value)}
              className={inputClass}
            >
              <option value="compra">Compra</option>
              <option value="alquiler">Alquiler</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Tipo propiedad</label>
            <input
              value={form.property_type}
              onChange={e => set('property_type', e.target.value)}
              placeholder="Piso, Casa, Local..."
              className={inputClass}
            />
          </div>
        </div>

        {/* Zone + Budget */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Zona</label>
            <input
              value={form.zone}
              onChange={e => set('zone', e.target.value)}
              placeholder="Centro, Ensanche..."
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Presupuesto máx. (€)</label>
            <input
              type="number"
              value={form.budget_max}
              onChange={e => set('budget_max', e.target.value)}
              placeholder="250000"
              className={inputClass}
            />
          </div>
        </div>

        {/* Source + Agent */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Fuente</label>
            <select
              value={form.source}
              onChange={e => set('source', e.target.value)}
              className={inputClass}
            >
              <option value="manual">Manual</option>
              <option value="web">Web</option>
              <option value="portal">Portal inmobiliario</option>
              <option value="telefono">Teléfono</option>
              <option value="referido">Referido</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Agente asignado</label>
            <input
              value={form.agent_name}
              onChange={e => set('agent_name', e.target.value)}
              placeholder="Nombre del agente"
              className={inputClass}
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className={labelClass}>Notas</label>
          <textarea
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="Observaciones, requisitos especiales..."
            rows={3}
            className={inputClass + ' resize-none'}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/20"
          >
            Crear Lead
          </button>
        </div>
      </form>
    </div>
  )
}
