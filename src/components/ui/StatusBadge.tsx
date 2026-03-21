'use client'

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pendiente:      { label: 'Pendiente',    cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25' },
  confirmada:     { label: 'Confirmada',   cls: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
  sentada:        { label: 'Sentada',      cls: 'bg-violet-500/15 text-violet-400 border-violet-500/25' },
  en_consulta:    { label: 'En consulta',  cls: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
  completada:     { label: 'Completada',   cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  cancelada:      { label: 'Cancelada',    cls: 'bg-red-500/15 text-red-400 border-red-500/25' },
  no_show:        { label: 'No show',      cls: 'bg-slate-500/15 text-slate-400 border-slate-500/25' },
  activa:         { label: 'Activa',       cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  libre:          { label: 'Libre',        cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  ocupada:        { label: 'Ocupada',      cls: 'bg-orange-500/15 text-orange-400 border-orange-500/25' },
  reservada:      { label: 'Reservada',    cls: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
  bloqueada:      { label: 'Bloqueada',    cls: 'bg-slate-500/15 text-slate-400 border-slate-500/25' },
  nuevo:          { label: 'Nuevo',        cls: 'bg-violet-500/15 text-violet-400 border-violet-500/25' },
  contactado:     { label: 'Contactado',   cls: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
  visita_agendada:{ label: 'Visita',       cls: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  oferta:         { label: 'Oferta',       cls: 'bg-orange-500/15 text-orange-400 border-orange-500/25' },
  cerrado:        { label: 'Cerrado',      cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  perdido:        { label: 'Perdido',      cls: 'bg-red-500/15 text-red-400 border-red-500/25' },
  nuevo_pedido:   { label: 'Nuevo',        cls: 'bg-violet-500/15 text-violet-400 border-violet-500/25' },
  preparando:     { label: 'Preparando',   cls: 'bg-orange-500/15 text-orange-400 border-orange-500/25' },
  listo:          { label: 'Listo',        cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  programada:     { label: 'Programada',   cls: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
  realizada:      { label: 'Realizada',    cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  sin_mostrar:    { label: 'Sin mostrar',  cls: 'bg-slate-500/15 text-slate-400 border-slate-500/25' },
}

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? { label: status, cls: 'bg-white/10 text-white/50 border-white/10' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-medium border ${s.cls}`}>
      {s.label}
    </span>
  )
}
