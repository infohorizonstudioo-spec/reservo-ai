export type LeadStatus =
  | 'nuevo'
  | 'contactado'
  | 'visita_agendada'
  | 'visita_realizada'
  | 'oferta'
  | 'cerrado'
  | 'perdido'

export interface RealEstateLead {
  id: string
  tenant_id: string
  name: string
  phone?: string
  email?: string
  operation: 'compra' | 'alquiler'
  property_type?: string
  zone?: string
  budget_max?: number
  status: LeadStatus
  agent_name?: string
  notes?: string
  source: 'manual' | 'web' | 'portal' | 'telefono' | 'referido'
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
