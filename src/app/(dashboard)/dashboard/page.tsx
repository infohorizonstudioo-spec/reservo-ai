
function StatusBadge({ status, type }: { status: string; type: 'reservation' | 'order' }) {
  const cfg: Record<string, { label: string; cls: string }> = {
    pendiente:   { label: 'Pendiente',   cls: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
    confirmada:  { label: 'Confirmada',  cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
    sentada:     { label: 'Sentada',     cls: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
    completada:  { label: 'Completada',  cls: 'bg-white/10 text-white/40 border-white/10' },
    cancelada:   { label: 'Cancelada',   cls: 'bg-red-500/15 text-red-400 border-red-500/20' },
    no_show:     { label: 'No show',     cls: 'bg-red-500/15 text-red-400 border-red-500/20' },
    nuevo:       { label: 'Nuevo',       cls: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
    confirmado:  { label: 'Confirmado',  cls: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
    preparando:  { label: 'Preparando', cls: 'bg-orange-500/15 text-orange-400 border-orange-500/20' },
    listo:       { label: 'Listo',       cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
    enviado:     { label: 'Enviado',     cls: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
    entregado:   { label: 'Entregado',   cls: 'bg-white/10 text-white/40 border-white/10' },
  }
  const c = cfg[status] || { label: status, cls: 'bg-white/10 text-white/40 border-white/10' }
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium shrink-0 ${c.cls}`}>
      {c.label}
    </span>
  )
}
