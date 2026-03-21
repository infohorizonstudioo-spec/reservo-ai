import type { OrderIntent, OrderEvent, EcomOrder, Product } from '@/types/ecommerce'

const INTENT_KEYWORDS: Record<OrderIntent, string[]> = {
  compra_directa: ['comprar', 'quiero', 'pedir', 'añadir', 'agregar', 'llevar', 'necesito', 'dame'],
  duda_producto: ['información', 'info', 'precio', 'características', 'talla', 'color', 'disponible', 'material'],
  estado_pedido: ['pedido', 'envío', 'seguimiento', 'dónde está', 'tracking', 'cuándo llega', 'estado'],
  devolucion: ['devolver', 'devolución', 'cambiar', 'cambio', 'defectuoso', 'roto', 'no funciona', 'reembolso'],
  recomendacion: ['recomendar', 'sugerir', 'alternativa', 'similar', 'parecido', 'mejor', 'qué me recomiendas'],
}

export function detectOrderIntent(text: string): OrderIntent {
  const lower = text.toLowerCase()
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS) as [OrderIntent, string[]][]) {
    if (keywords.some(kw => lower.includes(kw))) return intent
  }
  return 'duda_producto'
}

export function extractProductInfo(
  text: string,
  products: Product[]
): Partial<EcomOrder['items'][0]> | null {
  const lower = text.toLowerCase()

  for (const product of products) {
    if (lower.includes(product.name.toLowerCase())) {
      const qtyMatch = text.match(/(\d+)\s*(?:unidades?|piezas?|uds?)/i)
      return {
        product_name: product.name,
        sku: product.sku,
        qty: qtyMatch ? parseInt(qtyMatch[1]) : 1,
        price: product.price,
      }
    }
  }

  // Try SKU match
  for (const product of products) {
    if (product.sku && lower.includes(product.sku.toLowerCase())) {
      return {
        product_name: product.name,
        sku: product.sku,
        qty: 1,
        price: product.price,
      }
    }
  }

  return null
}

export function checkStock(product: Product, quantity: number): boolean {
  return product.stock >= quantity
}

export type DecisionType = 'confirmar_pedido' | 'sugerir_alternativa' | 'escalar_problema' | 'pending'

export function makeOrderDecision(event: OrderEvent, stockAvailable: boolean): DecisionType {
  const hasName = !!event.client_name
  const hasProduct = !!event.product_interest

  if (!hasName || !hasProduct) return 'pending'
  if (event.intent === 'devolucion') return 'escalar_problema'
  if (!stockAvailable) return 'sugerir_alternativa'
  return 'confirmar_pedido'
}

export function suggestAlternative(product: Product, allProducts: Product[]): Product | null {
  const candidates = allProducts.filter(p =>
    p.id !== product.id &&
    p.active &&
    p.stock > 0 &&
    p.category === product.category
  )

  if (candidates.length === 0) return null

  // Sort by closest price
  candidates.sort((a, b) =>
    Math.abs(a.price - product.price) - Math.abs(b.price - product.price)
  )

  return candidates[0]
}

export const INTENT_LABELS: Record<OrderIntent, string> = {
  compra_directa: 'Compra directa',
  duda_producto: 'Duda producto',
  estado_pedido: 'Estado pedido',
  devolucion: 'Devolución',
  recomendacion: 'Recomendación',
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  nuevo: 'Nuevo',
  confirmado: 'Confirmado',
  preparando: 'Preparando',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
  devolucion: 'Devolución',
}
