# Agente: ECOMMERCE
# Rama: feature/ecommerce
# Cómo abrir:
#   cd C:\Users\krush\reservo-ai
#   git checkout feature/ecommerce
#   C:\Users\krush\.local\bin\claude.exe --dangerously-skip-permissions
# Cuando abra escribe: Lee y ejecuta agents/ECOMMERCE.md

Lee CLAUDE.md antes de empezar.

## Tu misión
Sistema de ventas y atención al cliente para eCommerce.
Aumenta conversión, gestiona pedidos en tiempo real, resuelve dudas automáticamente.

## Patrón obligatorio
if (tenantType !== 'ecommerce') return null

## Lo que puedes tocar
- src/types/ecommerce.ts (crear)
- src/components/ecommerce/ (crear carpeta)
- src/lib/ecommerce-engine.ts (crear)
- src/app/(dashboard)/pedidos/page.tsx (añadir caso ecommerce — diferente a restaurante)
- src/app/(dashboard)/clientes/page.tsx (añadir caso ecommerce)
- src/app/(dashboard)/llamadas/page.tsx (añadir panel ecommerce)

## Tipos (src/types/ecommerce.ts)
```typescript
type OrderIntent = 'compra_directa' | 'duda_producto' | 'estado_pedido' | 'devolucion' | 'recomendacion'
type OrderStatus = 'nuevo' | 'confirmado' | 'preparando' | 'enviado' | 'entregado' | 'cancelado' | 'devolucion'
type EcomCallState = 'incoming' | 'listening' | 'processing' | 'speaking' | 'collecting_data'

interface OrderEvent {
  id: string; tenant_id: string; call_id?: string
  client_name?: string; client_phone?: string
  product_interest?: string; quantity?: number
  shipping_address?: string; order_ref?: string
  intent?: OrderIntent; state: EcomCallState
  decision?: 'confirmar_pedido' | 'sugerir_alternativa' | 'escalar_problema' | 'pending'
  collected_data: Record<string, any>
  created_at: string
}

interface EcomOrder {
  id: string; tenant_id: string
  client_name: string; client_phone?: string; client_email?: string
  items: Array<{ product_name: string; sku?: string; qty: number; price: number }>
  shipping_address?: string; total: number
  status: OrderStatus; source: 'llamada' | 'web' | 'manual'
  notes?: string; created_at: string; updated_at: string
}

interface Product {
  id: string; tenant_id: string
  name: string; sku?: string; price: number
  stock: number; category?: string
  description?: string; active: boolean
}
```

## Motor (src/lib/ecommerce-engine.ts)
- detectOrderIntent(text): OrderIntent
- extractProductInfo(text, products): Partial<EcomOrder['items'][0]>
- checkStock(productId, quantity): boolean — PROHIBIDO vender sin stock
- makeOrderDecision(event, stockAvailable): DecisionType
- suggestAlternative(product, allProducts): Product | null → buscar similar con stock

## Panel de llamadas en tiempo real (src/components/ecommerce/OrderCallPanel.tsx)
Muestra INMEDIATAMENTE:
- Estado animado
- Datos capturados en tiempo real: nombre, producto de interés, cantidad
- Si el producto tiene stock: badge verde "EN STOCK"
- Si sin stock: badge rojo "SIN STOCK" + sugerencia alternativa automática
- Pedido estructurado al final: producto, qty, dirección, total
- Botones: "Confirmar pedido" | "Sugerir alternativa"

## Panel de pedidos ecommerce (src/components/ecommerce/EcomOrdersPanel.tsx)
DIFERENTE al panel de restaurante (sin mesas, sin zonas):
- Lista de pedidos con estados: nuevo → confirmado → preparando → enviado → entregado
- Cada card: cliente, productos, total, estado, tiempo transcurrido
- Botón avanzar estado
- Filtros: activos / todos / por estado
- Realtime con cleanup

## Catálogo (src/components/ecommerce/ProductCatalog.tsx)
Grid de productos:
- Nombre, precio, stock (badge rojo si stock < 5)
- Toggle activo/inactivo
- Mock data si products no existe

## Memoria (src/lib/ecommerce-memory.ts)
Por tenant: productos más vendidos, patrones de compra, horarios pico.
NO compartir entre tenants.

## Páginas
pedidos/page.tsx: if (tenantType === 'ecommerce') return <EcomOrdersPanel tenantId={tenantId} />
clientes/page.tsx: if (tenantType === 'ecommerce') return <EcomClientesView tenantId={tenantId} />

## Al terminar
Crea agents/status/ECOMMERCE.done con lista de archivos y: LISTO
