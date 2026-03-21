# Agente: VETERINARY
# Rama: feature/veterinaria
# Cómo abrir:
#   cd C:\Users\krush\reservo-ai
#   git checkout feature/veterinaria
#   C:\Users\krush\.local\bin\claude.exe --dangerously-skip-permissions
# Cuando abra escribe: Lee y ejecuta agents/VETERINARY.md

Lee CLAUDE.md antes de empezar.

## Tu misión
Sistema de recepción para clínicas veterinarias. La mascota es el protagonista, no el dueño.
No es un chatbot — sustituye a la recepción real de una veterinaria.

## Patrón obligatorio
if (tenantType !== 'veterinary') return null

## Lo que puedes tocar
- src/types/veterinary.ts (crear)
- src/components/vet/ (crear carpeta)
- src/lib/vet-engine.ts (crear)
- src/app/(dashboard)/agenda/page.tsx (añadir caso veterinary)
- src/app/(dashboard)/clientes/page.tsx (añadir caso veterinary)
- src/app/(dashboard)/llamadas/page.tsx (añadir panel vet)

## Tipos (src/types/veterinary.ts)
```typescript
type PetSpecies = 'perro' | 'gato' | 'conejo' | 'ave' | 'reptil' | 'otro'
type VetConsultType = 'revision' | 'vacuna' | 'tratamiento' | 'urgencia' | 'otro'
type VetCallState = 'incoming' | 'listening' | 'processing' | 'speaking' | 'collecting_data'
type VetDecision = 'confirmar_cita' | 'sugerir_alternativa' | 'pending_review' | 'escalar_urgencia'

interface VetConsultationEvent {
  id: string; tenant_id: string; call_id?: string
  owner_name?: string; pet_name?: string; pet_species?: PetSpecies
  reason?: string; consult_type?: VetConsultType
  is_urgent: boolean; urgency_keywords?: string[]
  state: VetCallState; decision?: VetDecision
  collected_data: Record<string, any>
  created_at: string; updated_at: string
}

interface VetAppointment {
  id: string; tenant_id: string
  owner_name: string; owner_phone?: string
  pet_name: string; pet_species: PetSpecies; pet_breed?: string
  vet_name?: string; consult_type: VetConsultType
  date: string; time: string; duration_minutes: number
  reason?: string; is_urgent: boolean
  status: 'pendiente' | 'confirmada' | 'en_consulta' | 'completada' | 'cancelada'
  notes?: string; created_at: string
}

interface Pet {
  id: string; tenant_id: string
  owner_name: string; owner_phone?: string
  name: string; species: PetSpecies; breed?: string
  age_approx?: string; notes?: string; active: boolean
}
```

## Motor (src/lib/vet-engine.ts)
- detectVetUrgency(text): boolean → accidente, sangrado, respiración, dolor intenso, estado grave
- classifyVetConsult(text): VetConsultType
- getVetDuration(type): number → revision=20, vacuna=15, tratamiento=45, urgencia=30
- detectPetSpecies(text): PetSpecies → detectar de frases como "mi perro", "mi gato"
- makeVetDecision(event, slots): VetDecision

## Panel de llamadas en tiempo real (src/components/vet/VetCallPanel.tsx)
Muestra INMEDIATAMENTE al entrar la llamada:
- Estado animado (incoming → listening → collecting_data...)
- Datos recopilados en tiempo real: dueño, NOMBRE MASCOTA (protagonista, grande), especie con emoji
- Emojis por especie: perro=🐕 gato=🐈 conejo=🐇 ave=🦜 reptil=🦎 otro=🐾
- Si urgencia: banner rojo pulsante "URGENCIA VETERINARIA"
- Transcripción últimas 4 líneas
- Decisión con razón

## Agenda veterinaria (src/components/vet/AgendaVet.tsx)
Vista de DÍA (no semana — más práctica para vet):
- Selector prev/next día arriba
- Si hay urgencias hoy: sección roja destacada arriba con las urgencias
- Lista principal: [HORA] [EMOJI] NOMBRE MASCOTA (raza) — DUEÑO — TIPO badge — Estado
- La mascota va PRIMERO y en grande
- Colores: vacuna=teal, urgencia=red, tratamiento=orange, revision=blue
- Botones: Confirmar / En consulta / Completar
- Mock data si vet_appointments no existe (incluir: Rocky perro, Luna gato, Tobi urgencia)
- NO solapamientos

## Vista mascotas (src/components/vet/MascotasView.tsx)
Dos tabs: "Mascotas" | "Propietarios"
- Mascotas: grid de cards — emoji grande, nombre animal, raza, propietario, botón "Nueva cita"
- Propietarios: lista con nombre, teléfono, badges de sus mascotas

## Memoria (src/lib/vet-memory.ts)
Por tenant: consultas frecuentes, duraciones reales, patrones de urgencia.
NO compartir entre tenants.

## Páginas
agenda/page.tsx: if (tenantType === 'veterinary') return <AgendaVet tenantId={tenantId} />
clientes/page.tsx: if (tenantType === 'veterinary') return <MascotasView tenantId={tenantId} />
llamadas/page.tsx: añadir <VetCallPanel /> si tenantType === 'veterinary'

## Al terminar
Crea agents/status/VETERINARY.done con lista de archivos y: LISTO
