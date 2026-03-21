# PROMPT — AGENTE ARQUITECTO
# Pega esto completo en una sesión de Claude Code dentro de C:\Users\krush\reservo-ai

Eres el arquitecto principal de RESERVO.AI. Tu trabajo es proteger el motor común y
definir los contratos que usan todos los demás agentes. Trabaja en la rama `main`.

## TU MISIÓN

### 1. Tipos por vertical
Lee `src/types/index.ts` y crea estos archivos SIN tocar el original:

**`src/types/restaurant.ts`**
```typescript
export interface MenuItem {
  id: string; tenant_id: string; name: string; description?: string
  price: number; category: string; available: boolean; image_url?: string
}
export interface Zone {
  id: string; tenant_id: string; name: string; capacity: number; active: boolean
}
export interface Shift {
  id: string; tenant_id: string; name: string
  start_time: string; end_time: string; days: number[]
}
```

**`src/types/clinic.ts`**
```typescript
export type ClinicAppointmentType = 'consulta'|'especialidad'|'urgencia'|'revision'|'primera_visita'
export type AppointmentStatus = 'pendiente'|'confirmada'|'en_consulta'|'completada'|'cancelada'|'no_show'
export interface ClinicAppointment {
  id: string; tenant_id: string; patient_name: string; patient_phone?: string
  doctor_name?: string; type: ClinicAppointmentType; date: string; time: string
  duration_minutes: 15|30|45|60; reason?: string; status: AppointmentStatus
  notes?: string; created_at: string
}
export interface ClinicDoctor {
  id: string; tenant_id: string; name: string; specialty: string
  color: string; active: boolean
}
```
**`src/types/veterinary.ts`**
```typescript
export type PetSpecies = 'perro'|'gato'|'conejo'|'ave'|'reptil'|'otro'
export interface Pet {
  id: string; tenant_id: string; owner_name: string; owner_phone?: string
  name: string; species: PetSpecies; breed?: string
  age_approx?: string; color?: string; notes?: string
  active: boolean; created_at: string
}
export interface VetAppointment {
  id: string; tenant_id: string; pet_name: string; pet_species: PetSpecies
  owner_name: string; owner_phone?: string; vet_name?: string
  type: 'consulta'|'vacuna'|'revision'|'urgencia'|'cirugia'|'peluqueria'
  date: string; time: string; duration_minutes: 15|30|45|60|90
  reason?: string; status: 'pendiente'|'confirmada'|'en_consulta'|'completada'|'cancelada'
  notes?: string; created_at: string
}
```

**`src/types/realestate.ts`**
```typescript
export interface RealEstateLead {
  id: string; tenant_id: string; name: string; phone?: string; email?: string
  operation: 'compra'|'alquiler'; property_type?: string; zone?: string
  budget_max?: number
  status: 'nuevo'|'contactado'|'visita_agendada'|'visita_realizada'|'oferta'|'cerrado'|'perdido'
  agent_name?: string; notes?: string
  source: 'manual'|'web'|'portal'|'telefono'|'referido'
  last_contact?: string; created_at: string
}
export interface Property {
  id: string; tenant_id: string; reference: string
  type: 'piso'|'casa'|'local'|'terreno'|'garaje'|'otro'
  operation: 'venta'|'alquiler'; price: number; address: string; zone?: string
  sqm?: number; rooms?: number; bathrooms?: number
  status: 'disponible'|'reservada'|'vendida'|'alquilada'|'inactiva'
  active: boolean; created_at: string
}
export interface PropertyVisit {
  id: string; tenant_id: string; client_name: string; client_phone?: string
  agent_name?: string; property_address?: string; date: string; time: string
  status: 'programada'|'confirmada'|'realizada'|'cancelada'|'sin_mostrar'
  notes?: string; created_at: string
}
```

### 2. Hook de tipo de tenant — `src/lib/tenant-context.ts`
Crea este archivo completo:

```typescript
'use client'
import { createContext, useContext } from 'react'
import { Tenant } from '@/types'

export type TenantType = 'restaurant' | 'clinic' | 'veterinary' | 'realestate' | 'other'

export interface NavItem { href: string; icon: string; label: string; badge?: string }
export interface TenantConfig { navItems: NavItem[]; primaryEntity: string; defaultRoute: string }

export const TenantContext = createContext<Tenant | null>(null)
export function useTenant() { return useContext(TenantContext) }

export function useTenantType(): TenantType {
  const tenant = useTenant()
  if (!tenant) return 'restaurant'
  const t = tenant.type
  if (t === 'clinic') return 'clinic'
  if (t === 'veterinary' as any) return 'veterinary'
  if (t === 'realestate' as any) return 'realestate'
  return 'restaurant'
}

export function getTenantConfig(type: TenantType): TenantConfig {
  const configs: Record<TenantType, TenantConfig> = {
    restaurant: {
      primaryEntity: 'reserva',
      defaultRoute: '/dashboard',
      navItems: [
        { href: '/dashboard', icon: '◈', label: 'Dashboard' },
        { href: '/llamadas',  icon: '⬤', label: 'Llamadas', badge: 'live' },
        { href: '/reservas',  icon: '◻', label: 'Reservas' },
        { href: '/pedidos',   icon: '▤', label: 'Pedidos' },
        { href: '/mesas',     icon: '⊞', label: 'Mesas' },
        { href: '/clientes',  icon: '◉', label: 'Clientes' },
      ],
    },
    clinic: {
      primaryEntity: 'cita',
      defaultRoute: '/agenda',
      navItems: [
        { href: '/dashboard', icon: '◈', label: 'Dashboard' },
        { href: '/llamadas',  icon: '⬤', label: 'Llamadas', badge: 'live' },
        { href: '/agenda',    icon: '▦', label: 'Agenda' },
        { href: '/clientes',  icon: '◉', label: 'Pacientes' },
      ],
    },
    veterinary: {
      primaryEntity: 'cita',
      defaultRoute: '/agenda',
      navItems: [
        { href: '/dashboard', icon: '◈', label: 'Dashboard' },
        { href: '/llamadas',  icon: '⬤', label: 'Llamadas', badge: 'live' },
        { href: '/agenda',    icon: '▦', label: 'Agenda' },
        { href: '/clientes',  icon: '◉', label: 'Mascotas' },
      ],
    },
    realestate: {
      primaryEntity: 'lead',
      defaultRoute: '/clientes',
      navItems: [
        { href: '/dashboard', icon: '◈', label: 'Dashboard' },
        { href: '/llamadas',  icon: '⬤', label: 'Llamadas', badge: 'live' },
        { href: '/clientes',  icon: '◉', label: 'Leads' },
        { href: '/agenda',    icon: '▦', label: 'Visitas' },
      ],
    },
    other: {
      primaryEntity: 'cliente',
      defaultRoute: '/dashboard',
      navItems: [
        { href: '/dashboard', icon: '◈', label: 'Dashboard' },
        { href: '/llamadas',  icon: '⬤', label: 'Llamadas', badge: 'live' },
        { href: '/clientes',  icon: '◉', label: 'Clientes' },
      ],
    },
  }
  return configs[type]
}
```

### 3. Refactorizar el layout para usar TenantContext
Modifica `src/app/(dashboard)/layout.tsx`:
- Importa `TenantContext`, `getTenantConfig`, `useTenantType`
- Envuelve el layout en `<TenantContext.Provider value={tenant}>`
- Carga el tenant con `getDemoTenant()` en un useEffect
- El sidebar usa `getTenantConfig(tenantType).navItems` para renderizar la nav dinámica
- El nombre del tenant en el sidebar viene de `tenant?.name`

### 4. Añadir 'veterinary' y 'realestate' al tipo Tenant
En `src/types/index.ts`, cambia la línea:
```typescript
type: 'restaurant' | 'clinic' | 'advisory' | 'other'
```
por:
```typescript
type: 'restaurant' | 'clinic' | 'veterinary' | 'realestate' | 'advisory' | 'other'
```
Esta es la ÚNICA modificación permitida en ese archivo.

### 5. Restricciones
- NO cambies nada más en `src/types/index.ts`
- NO cambies `src/lib/supabase.ts`
- NO cambies `next.config.js`, `package.json`, `.env.local`

## AL TERMINAR
Crea `.agent-status/arquitecto/DONE.md`:
```markdown
# HANDOFF: ARQUITECTO
## Archivos creados
- src/types/restaurant.ts
- src/types/clinic.ts
- src/types/veterinary.ts
- src/types/realestate.ts
- src/lib/tenant-context.ts
## Archivos modificados
- src/types/index.ts (solo añadida veterinary | realestate al tipo)
- src/app/(dashboard)/layout.tsx (sidebar dinámico + TenantContext)
## Advertencias para QA
- El TenantContext necesita ser consumido con useTenant() en todos los pages
## Estado: LISTO_PARA_QA
```
