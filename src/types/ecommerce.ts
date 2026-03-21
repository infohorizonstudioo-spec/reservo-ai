export type OrderIntent = 'compra_directa' | 'duda_producto' | 'estado_pedido' | 'devolucion' | 'recomendacion'
export type OrderStatus = 'nuevo' | 'confirmado' | 'preparando' | 'enviado' | 'entregado' | 'cancelado' | 'devolucion'
export type EcomCallState = 'incoming' | 'listening' | 'processing' | 'speaking' | 'collecting_data'

export interface OrderEvent {
  id: string
  tenant_id: string
  call_id?: string
  client_name?: string
  client_phone?: string
  product_interest?: string
  quantity?: number
  shipping_address?: string
  order_ref?: string
  intent?: OrderIntent
  state: EcomCallState
  decision?: 'confirmar_pedido' | 'sugerir_alternativa' | 'escalar_problema' | 'pending'
  collected_data: Record<string, any>
  created_at: string
}

export interface EcomOrder {
  id: string
  tenant_id: string
  client_name: string
  client_phone?: string
  client_email?: string
  items: Array<{ product_name: string; sku?: string; qty: number; price: number }>
  shipping_address?: string
  total: number
  status: OrderStatus
  source: 'llamada' | 'web' | 'manual'
  notes?: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  tenant_id: string
  name: string
  sku?: string
  price: number
  stock: number
  category?: string
  description?: string
  active: boolean
}
