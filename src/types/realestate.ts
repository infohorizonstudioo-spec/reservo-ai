export type LeadStatus =
  | 'nuevo'
  | 'contactado'
  | 'visita_agendada'
  | 'visita_realizada'
  | 'oferta'
  | 'cerrado'
  | 'perdido'

export type PropertyType = 'piso' | 'chalet' | 'local' | 'terreno' | 'garaje' | 'otro'
export type OperationType = 'compra' | 'alquiler' | 'venta'
export type LeadIntent = 'busqueda_vivienda' | 'solicitud_visita' | 'info_propiedad' | 'venta_propiedad' | 'consulta_general'
export type LeadCallState = 'incoming' | 'listening' | 'processing' | 'speaking' | 'collecting_data'
export type LeadDecisionType = 'crear_lead' | 'crear_visita' | 'pending' | 'escalar'

export interface LeadEvent {
  id: string
  tenant_id: string
  call_id?: string
  client_name?: string
  client_phone?: string
  operation?: OperationType
  property_type?: PropertyType
  zone?: string
  budget?: number
  property_ref?: string
  availability?: string
  notes?: string
  intent?: LeadIntent
  state: LeadCallState
  decision?: LeadDecisionType
  collected_data: Record<string, any>
  created_at: string
}

export interface RealEstateLead {
  id: string
  tenant_id: string
  name: string
  phone?: string
  email?: string
  operation: OperationType
  property_type?: PropertyType
  zone?: string
  budget_max?: number
  property_ref?: string
  status: LeadStatus
  agent_name?: string
  notes?: string
  source: 'llamada' | 'web' | 'portal' | 'manual' | 'referido'
  last_contact?: string
  created_at: string
}

export interface Property {
  id: string
  tenant_id: string
  reference: string
  type: 'piso' | 'casa' | 'local' | 'terreno' | 'garaje' | 'otro'
  operation: 'venta' | 'alquiler'
  price: number
  address: string
  zone?: string
  sqm?: number
  rooms?: number
  bathrooms?: number
  status: 'disponible' | 'reservada' | 'vendida' | 'alquilada' | 'inactiva'
  active: boolean
  created_at: string
}

export interface PropertyVisit {
  id: string
  tenant_id: string
  client_name: string
  client_phone?: string
  agent_name?: string
  property_address?: string
  date: string
  time: string
  status: 'programada' | 'confirmada' | 'realizada' | 'cancelada' | 'sin_mostrar'
  notes?: string
  created_at: string
}
