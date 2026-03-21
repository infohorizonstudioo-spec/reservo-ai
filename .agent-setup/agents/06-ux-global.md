# PROMPT — AGENTE DISEÑO / UX GLOBAL
# Pega esto completo en una sesión de Claude Code dentro de C:\Users\krush\reservo-ai
# RAMA: git checkout feature/ux-global (o créala desde main)

Eres el responsable del sistema de diseño de RESERVO.AI.
Tu trabajo NO es añadir funcionalidad. Es calidad visual, coherencia y reutilización.
Lee CLAUDE.md, src/app/globals.css, src/app/(dashboard)/layout.tsx antes de tocar nada.

## RAMA DE TRABAJO
```bash
git checkout feature/ux-global
```

## TUS ARCHIVOS
```
src/app/globals.css
src/app/page.tsx                         ← pantalla de entrada/demo
src/app/(dashboard)/layout.tsx           ← sidebar unificado + dinámico
src/components/ui/StatusBadge.tsx
src/components/ui/EmptyState.tsx
src/components/ui/LoadingSkeleton.tsx
src/components/ui/Modal.tsx
src/components/ui/Badge.tsx
```

## 1. TOKENS CSS — globals.css
Añade estas variables al :root (sin borrar las existentes):
```css
:root {
  --bg-base: #0a0a0f;
  --bg-surface: #0f0f15;
  --bg-card: rgba(255,255,255,0.02);
  --bg-card-hover: rgba(255,255,255,0.04);
  --border-subtle: rgba(255,255,255,0.05);
  --border-medium: rgba(255,255,255,0.08);
  --border-strong: rgba(255,255,255,0.15);
  --accent: #7c3aed;
  --accent-glow: rgba(124,58,237,0.15);
  --text-1: rgba(255,255,255,0.90);
  --text-2: rgba(255,255,255,0.55);
  --text-3: rgba(255,255,255,0.25);
  --status-green: #10b981;
  --status-yellow: #f59e0b;
  --status-red: #ef4444;
  --status-blue: #3b82f6;
  --status-orange: #f97316;
  --r-sm: 8px; --r-md: 12px; --r-lg: 16px; --r-xl: 20px;
}

/* Animaciones globales */
@keyframes fadeInUp {
  from { opacity:0; transform:translateY(8px) }
  to   { opacity:1; transform:translateY(0) }
}
@keyframes shimmer {
  0%   { background-position: -200% 0 }
  100% { background-position: 200% 0 }
}
@keyframes pulseDot {
  0%,100% { opacity:1 } 50% { opacity:0.4 }
}

.page-enter { animation: fadeInUp 0.2s ease both }
.pulse-dot  { animation: pulseDot 2s infinite }
.skeleton   {
  background: linear-gradient(90deg, rgba(255,255,255,.04) 25%, rgba(255,255,255,.08) 50%, rgba(255,255,255,.04) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--r-md);
}
```

## 2. COMPONENTES UI COMPARTIDOS

### src/components/ui/StatusBadge.tsx
```tsx
'use client'
const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pendiente:    { label: 'Pendiente',    color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
  confirmada:   { label: 'Confirmada',   color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  sentada:      { label: 'Sentada',      color: 'bg-violet-500/15 text-violet-400 border-violet-500/20' },
  completada:   { label: 'Completada',   color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  cancelada:    { label: 'Cancelada',    color: 'bg-red-500/15 text-red-400 border-red-500/20' },
  no_show:      { label: 'No show',      color: 'bg-slate-500/15 text-slate-400 border-slate-500/20' },
  activa:       { label: 'Activa',       color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  libre:        { label: 'Libre',        color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  ocupada:      { label: 'Ocupada',      color: 'bg-orange-500/15 text-orange-400 border-orange-500/20' },
  reservada:    { label: 'Reservada',    color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  bloqueada:    { label: 'Bloqueada',    color: 'bg-slate-500/15 text-slate-400 border-slate-500/20' },
  nuevo:        { label: 'Nuevo',        color: 'bg-violet-500/15 text-violet-400 border-violet-500/20' },
  en_consulta:  { label: 'En consulta',  color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  preparando:   { label: 'Preparando',   color: 'bg-orange-500/15 text-orange-400 border-orange-500/20' },
  listo:        { label: 'Listo',        color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
}
export function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? { label: status, color: 'bg-white/10 text-white/50 border-white/10' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-medium border ${s.color}`}>
      {s.label}
    </span>
  )
}
```

### src/components/ui/EmptyState.tsx
```tsx
export function EmptyState({ icon, title, description, action }:
  { icon: string; title: string; description?: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="text-sm font-medium text-white/60">{title}</p>
      {description && <p className="text-xs text-white/30 mt-1 max-w-xs">{description}</p>}
      {action && (
        <button onClick={action.onClick}
          className="mt-4 px-4 py-2 rounded-xl bg-violet-500/20 border border-violet-500/30
            text-violet-300 text-xs font-medium hover:bg-violet-500/30 transition-colors">
          {action.label}
        </button>
      )}
    </div>
  )
}
```

### src/components/ui/LoadingSkeleton.tsx
```tsx
export function LoadingSkeleton({ lines = 3, type = 'list' }: { lines?: number; type?: 'list'|'card'|'table' }) {
  if (type === 'card') return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_,i) => (
        <div key={i} className="skeleton h-24 rounded-2xl" />
      ))}
    </div>
  )
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: lines }).map((_,i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="skeleton h-4 w-12 rounded shrink-0" />
          <div className="skeleton h-4 flex-1 rounded" style={{ opacity: 1 - i*0.2 }} />
          <div className="skeleton h-5 w-16 rounded-lg shrink-0" />
        </div>
      ))}
    </div>
  )
}
```

### src/components/ui/Modal.tsx
```tsx
'use client'
import { useEffect } from 'react'
export function Modal({ open, onClose, title, children, size = 'md' }:
  { open: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: 'sm'|'md'|'lg' }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])
  if (!open) return null
  const w = size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-2xl' : 'max-w-lg'
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className={`relative w-full ${w} bg-[#0f0f15] border border-white/10 rounded-2xl shadow-2xl`}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h2 className="font-semibold text-sm">{title}</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors text-lg leading-none">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
```

## 3. PANTALLA DE ENTRADA — src/app/page.tsx
En lugar de redirect directo, crea una pantalla de presentación:
- Logo RESERVO.AI grande con gradiente violet→indigo
- Tagline: "Tu recepcionista con IA, siempre disponible"
- 3 stats: "+2.400 llamadas gestionadas · 98% satisfacción · 24/7"
- Botón "Entrar al panel →" que hace router.push('/dashboard')
- Fondo: gradiente oscuro con efecto glow sutil en el centro

## 4. SIDEBAR — layout.tsx
El sidebar ya existe. Mejóralo sin romperlo:
- Añade `transition-all duration-150` donde falte
- El item activo tiene `border-l-2 border-violet-400` además del fondo
- Añade clases `page-enter` al `<main>` para fade-in al navegar

## RESTRICCIONES ABSOLUTAS
- NO elimines lógica funcional de ningún componente
- NO cambies cómo se llama a Supabase
- NO añadas dependencias npm
- Compatible con Tailwind 4

## AL TERMINAR
Crea `.agent-status/ux-global/DONE.md`:
```markdown
# HANDOFF: UX GLOBAL
## Archivos modificados
- src/app/globals.css (tokens + animaciones)
- src/app/page.tsx (pantalla entrada)
- src/app/(dashboard)/layout.tsx (sidebar refinado)
## Archivos nuevos
- src/components/ui/StatusBadge.tsx
- src/components/ui/EmptyState.tsx
- src/components/ui/LoadingSkeleton.tsx
- src/components/ui/Modal.tsx
## Estado: LISTO_PARA_QA
```
