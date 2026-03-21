'use client'
import { useState } from 'react'
import type { PetSpecies, VetAppointmentType } from '@/types/veterinary'

interface CitaVetModalProps {
  tenantId: string
  onClose: () => void
  onSave: (cita: any) => void
}

const SPECIES_OPTIONS: { value: PetSpecies; label: string }[] = [
  { value: 'perro', label: 'Perro' },
  { value: 'gato', label: 'Gato' },
  { value: 'conejo', label: 'Conejo' },
  { value: 'ave', label: 'Ave' },
  { value: 'reptil', label: 'Reptil' },
  { value: 'otro', label: 'Otro' },
]

const TYPE_OPTIONS: { value: VetAppointmentType; label: string }[] = [
  { value: 'consulta', label: 'Consulta general' },
  { value: 'vacuna', label: 'Vacunacion' },
  { value: 'revision', label: 'Revision' },
  { value: 'urgencia', label: 'Urgencia' },
  { value: 'cirugia', label: 'Cirugia' },
  { value: 'peluqueria', label: 'Peluqueria' },
]

const DURATION_OPTIONS = [15, 30, 45, 60, 90] as const

export default function CitaVetModal({ tenantId, onClose, onSave }: CitaVetModalProps) {
  const [form, setForm] = useState({
    pet_name: '',
    pet_species: 'perro' as PetSpecies,
    breed: '',
    age_approx: '',
    color: '',
    owner_name: '',
    owner_phone: '',
    vet_name: '',
    type: 'consulta' as VetAppointmentType,
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    duration_minutes: 30 as 15 | 30 | 45 | 60 | 90,
    reason: '',
  })

  const set = (field: string, value: string | number) =>
    setForm(prev => ({ ...prev, [field]: value }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.pet_name.trim() || !form.owner_name.trim()) return
    onSave({
      id: crypto.randomUUID(),
      tenant_id: tenantId,
      ...form,
      status: 'pendiente',
      created_at: new Date().toISOString(),
    })
    onClose()
  }

  const inputClass =
    'w-full glass rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 bg-transparent focus:outline-none focus:border-violet-500/50'
  const labelClass = 'text-xs text-white/40 mb-1 block'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="glass rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">Nueva cita veterinaria</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 text-xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Animal */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Nombre animal *</label>
              <input
                required
                value={form.pet_name}
                onChange={e => set('pet_name', e.target.value)}
                placeholder="Ej: Rocky"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Especie</label>
              <select
                value={form.pet_species}
                onChange={e => set('pet_species', e.target.value)}
                className={inputClass}
              >
                {SPECIES_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Raza</label>
              <input value={form.breed} onChange={e => set('breed', e.target.value)} placeholder="Ej: Labrador" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Edad aprox.</label>
              <input value={form.age_approx} onChange={e => set('age_approx', e.target.value)} placeholder="Ej: 3 anos" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Color</label>
              <input value={form.color} onChange={e => set('color', e.target.value)} placeholder="Ej: Dorado" className={inputClass} />
            </div>
          </div>

          {/* Propietario */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Propietario *</label>
              <input
                required
                value={form.owner_name}
                onChange={e => set('owner_name', e.target.value)}
                placeholder="Nombre completo"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Telefono</label>
              <input value={form.owner_phone} onChange={e => set('owner_phone', e.target.value)} placeholder="+34 600..." className={inputClass} />
            </div>
          </div>

          {/* Cita */}
          <div>
            <label className={labelClass}>Veterinario asignado</label>
            <input value={form.vet_name} onChange={e => set('vet_name', e.target.value)} placeholder="Dra. Garcia" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Tipo de cita</label>
              <select value={form.type} onChange={e => set('type', e.target.value)} className={inputClass}>
                {TYPE_OPTIONS.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Duracion</label>
              <select
                value={form.duration_minutes}
                onChange={e => set('duration_minutes', Number(e.target.value))}
                className={inputClass}
              >
                {DURATION_OPTIONS.map(d => (
                  <option key={d} value={d}>{d} min</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Fecha</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Hora</label>
              <input type="time" value={form.time} onChange={e => set('time', e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Motivo</label>
            <textarea
              value={form.reason}
              onChange={e => set('reason', e.target.value)}
              placeholder="Describe brevemente el motivo de la cita..."
              rows={2}
              className={inputClass + ' resize-none'}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 glass rounded-xl py-2.5 text-sm text-white/50 hover:text-white/80 transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl py-2.5 text-sm font-medium bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:opacity-90 transition-opacity"
            >
              Crear cita
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
