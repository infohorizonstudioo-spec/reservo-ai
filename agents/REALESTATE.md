# Agente: REALESTATE
# Rama: feature/inmobiliaria
# Cómo abrir:
#   cd C:\Users\krush\reservo-ai
#   git checkout feature/inmobiliaria
#   C:\Users\krush\.local\bin\claude.exe --dangerously-skip-permissions
# Cuando abra escribe: Lee y ejecuta agents/REALESTATE.md

Lee CLAUDE.md antes de empezar.

## Tu misión
Sistema de captación y gestión de leads para inmobiliarias.
Sustituye la atención inicial. Captura leads completos en tiempo real.

## Patrón obligatorio
if (tenantType !== 'realestate') return null

## Lo que puedes tocar
- src/types/realestate.ts (crear)
- src/components/realestate/ (crear carpeta)
- src/lib/realestate-engine.ts (crear)
- src/app/(dashboard)/clientes/page.tsx (añadir caso realestate)
- src/app/(dashboard)/agenda/page.tsx (añadir caso realestate — visitas)
- src/app/(dashboard)/llamadas/page.tsx (añadir panel realestate)

## Tipos (src/types/realestate.ts)
```typescript
type LeadStatus = 'nuevo' | 'contactado' | 'visita_agendada' | 'visita_realizada' | 'oferta' | 'cerrado' | 'perdido'
type PropertyType = 'piso' | 'chalet' | 'local' | 'terreno' | 'garaje' | 'otro'
type OperationType = 'compra' | 'alquiler' | 'venta'
type LeadIntent = 'busqueda_vivienda' | 'solicitud_visita' | 'info_propiedad' | 'venta_propiedad' | 'consulta_general'

interface LeadEvent {
  id: string; tenant_id: string; call_id?: string
  client_name?: string; client_phone?: string
  operation?: OperationType; property_type?: PropertyType
  zone?: string; budget?: number; property_ref?: string
  availability?: string; notes?: string
  intent?: LeadIntent; state: string
  decision?: 'crear_lead' | 'crear_visita' | 'pending' | 'escalar'
  collected_data: Record<string, any>
  created_at: string
}

interface RealEstateLead {
  id: string; tenant_id: string
  name: string; phone?: string; email?: string
  operation: OperationType; property_type?: PropertyType
  zone?: string; budget_max?: number; property_ref?: string
  status: LeadStatus; agent_name?: string; notes?: string
  source: 'llamada' | 'web' | 'portal' | 'manual' | 'referido'
  last_contact?: string; created_at: string
}

interface PropertyVisit {
  id: string; tenant_id: string
  client_name: string; client_phone?: string
  agent_name?: string; property_address?: string
  date: string; time: string
  status: 'programada' | 'confirmada' | 'realizada' | 'cancelada' | 'sin_mostrar'
  notes?: string; created_at: string
}
```

## Motor (src/lib/realestate-engine.ts)
- detectLeadIntent(text): LeadIntent
- extractLeadData(transcript): Partial<RealEstateLead> → extrae zona, presupuesto, tipo, operación
- makeLeadDecision(event, hasAvailability): DecisionType
- calculateDaysSinceContact(lastContact: string): number

## Panel de llamadas en tiempo real (src/components/realestate/LeadCallPanel.tsx)
Muestra INMEDIATAMENTE al entrar la llamada:
- Estado animado
- Datos capturados en tiempo real (se van llenando): nombre, qué busca, zona, presupuesto
- Al final: lead estructurado listo para guardar
  Cliente: [nombre] | Interés: [compra/alquiler] | Tipo: [tipo] | Zona: [zona] | Presupuesto: [€]
- Botón "Guardar lead" y "Agendar visita"

## Kanban de leads (src/components/realestate/LeadsKanban.tsx)
5 columnas: NUEVO · CONTACTADO · VISITA AGENDADA · OFERTA · CERRADO/PERDIDO
- Header columna: nombre + contador
- Cada card: nombre, teléfono, operación+tipo+zona, presupuesto, agente
- BADGE ROJO si más de 3 días sin last_contact — este es el elemento más importante
- Badge naranja si 1-3 días sin contacto
- Botones: "Llamar" (tel: link) | "Mover estado"
- Mock data con 5 leads distribuidos, fechas variadas para probar los badges
- Si real_estate_leads no existe → usar mock

## Vista de visitas (src/components/realestate/VisitasView.tsx)
Lista ordenada por fecha (no calendario):
- Sección "HOY" con fondo diferenciado arriba
- Sección "PRÓXIMAS"
- Cada item: hora, cliente, dirección, agente, StatusBadge
- Botones: Confirmar · Realizada · Cancelar

## Memoria (src/lib/realestate-memory.ts)
Por tenant: zonas más demandadas, precios habituales, tipos de propiedad.
NO compartir entre tenants.

## Páginas
clientes/page.tsx: if (tenantType === 'realestate') return <LeadsKanban tenantId={tenantId} />
agenda/page.tsx: if (tenantType === 'realestate') return <VisitasView tenantId={tenantId} />
llamadas/page.tsx: añadir <LeadCallPanel /> si tenantType === 'realestate'

## Al terminar
Crea agents/status/REALESTATE.done con lista de archivos y: LISTO
