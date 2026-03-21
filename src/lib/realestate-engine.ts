import type { LeadIntent, LeadEvent, LeadDecisionType, OperationType, PropertyType, RealEstateLead } from '@/types/realestate'

const INTENT_KEYWORDS: Record<LeadIntent, string[]> = {
  busqueda_vivienda: ['busco', 'necesito', 'quiero', 'piso', 'casa', 'chalet', 'vivienda', 'apartamento', 'ático', 'estudio', 'dúplex'],
  solicitud_visita: ['visitar', 'ver', 'visita', 'enseñar', 'mostrar', 'quedar', 'cita'],
  info_propiedad: ['información', 'info', 'precio', 'metros', 'habitaciones', 'referencia', 'disponible', 'características'],
  venta_propiedad: ['vender', 'poner en venta', 'valoración', 'tasar', 'quiero vender'],
  consulta_general: ['consulta', 'duda', 'pregunta', 'horario', 'oficina'],
}

const OPERATION_KEYWORDS: Record<OperationType, string[]> = {
  compra: ['comprar', 'compra', 'adquirir', 'inversión', 'invertir'],
  alquiler: ['alquilar', 'alquiler', 'arrendar', 'rentar', 'renta'],
  venta: ['vender', 'venta', 'poner en venta', 'valoración'],
}

const PROPERTY_KEYWORDS: Record<PropertyType, string[]> = {
  piso: ['piso', 'apartamento', 'ático', 'estudio', 'dúplex', 'loft'],
  chalet: ['chalet', 'casa', 'villa', 'adosado', 'pareado', 'unifamiliar'],
  local: ['local', 'comercial', 'oficina', 'nave', 'negocio'],
  terreno: ['terreno', 'parcela', 'solar', 'finca', 'suelo'],
  garaje: ['garaje', 'parking', 'plaza de garaje', 'aparcamiento'],
  otro: [],
}

export function detectLeadIntent(text: string): LeadIntent {
  const lower = text.toLowerCase()
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS) as [LeadIntent, string[]][]) {
    if (intent === 'consulta_general') continue
    if (keywords.some(kw => lower.includes(kw))) return intent
  }
  return 'consulta_general'
}

function detectOperation(text: string): OperationType | undefined {
  const lower = text.toLowerCase()
  for (const [op, keywords] of Object.entries(OPERATION_KEYWORDS) as [OperationType, string[]][]) {
    if (keywords.some(kw => lower.includes(kw))) return op
  }
  return undefined
}

function detectPropertyType(text: string): PropertyType | undefined {
  const lower = text.toLowerCase()
  for (const [type, keywords] of Object.entries(PROPERTY_KEYWORDS) as [PropertyType, string[]][]) {
    if (type === 'otro') continue
    if (keywords.some(kw => lower.includes(kw))) return type
  }
  return undefined
}

function extractBudget(text: string): number | undefined {
  const match = text.match(/(\d[\d.,]*)\s*(?:€|euros?|mil|k)/i)
  if (!match) return undefined
  let val = parseFloat(match[1].replace(/\./g, '').replace(',', '.'))
  if (/mil|k/i.test(match[0])) val *= 1000
  return val
}

function extractZone(text: string): string | undefined {
  const patterns = [
    /(?:en|zona|barrio|cerca de|por)\s+([A-ZÁÉÍÓÚÑa-záéíóúñ\s]{2,30})/i,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m) return m[1].trim()
  }
  return undefined
}

export function extractLeadData(transcript: string): Partial<RealEstateLead> {
  return {
    operation: detectOperation(transcript),
    property_type: detectPropertyType(transcript),
    zone: extractZone(transcript),
    budget_max: extractBudget(transcript),
  }
}

export function makeLeadDecision(event: LeadEvent, hasAvailability: boolean): LeadDecisionType {
  const hasName = !!event.client_name
  const hasOperation = !!event.operation

  if (!hasName || !hasOperation) return 'pending'
  if (event.intent === 'solicitud_visita' && hasAvailability) return 'crear_visita'
  if (event.intent === 'venta_propiedad') return 'escalar'
  return 'crear_lead'
}

export function calculateDaysSinceContact(lastContact: string): number {
  const last = new Date(lastContact)
  const now = new Date()
  const diff = now.getTime() - last.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export const INTENT_LABELS: Record<LeadIntent, string> = {
  busqueda_vivienda: 'Búsqueda vivienda',
  solicitud_visita: 'Solicitud visita',
  info_propiedad: 'Info propiedad',
  venta_propiedad: 'Venta propiedad',
  consulta_general: 'Consulta general',
}

export const OPERATION_LABELS: Record<OperationType, string> = {
  compra: 'Compra',
  alquiler: 'Alquiler',
  venta: 'Venta',
}

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  piso: 'Piso',
  chalet: 'Chalet',
  local: 'Local',
  terreno: 'Terreno',
  garaje: 'Garaje',
  otro: 'Otro',
}

export const LEAD_STATUS_LABELS: Record<string, string> = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  visita_agendada: 'Visita agendada',
  visita_realizada: 'Visita realizada',
  oferta: 'Oferta',
  cerrado: 'Cerrado',
  perdido: 'Perdido',
}
