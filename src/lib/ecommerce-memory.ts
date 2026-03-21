interface EcommerceMemory {
  top_products: Record<string, number>
  purchase_patterns: Record<string, number>
  peak_hours: Record<number, number>
}

const store = new Map<string, EcommerceMemory>()

function getDefault(): EcommerceMemory {
  return {
    top_products: {},
    purchase_patterns: {},
    peak_hours: {},
  }
}

function getMemory(tenantId: string): EcommerceMemory {
  if (!store.has(tenantId)) store.set(tenantId, getDefault())
  return store.get(tenantId)!
}

export function recordProductSale(tenantId: string, productName: string, qty: number) {
  const mem = getMemory(tenantId)
  mem.top_products[productName] = (mem.top_products[productName] || 0) + qty
}

export function recordPurchasePattern(tenantId: string, category: string) {
  const mem = getMemory(tenantId)
  mem.purchase_patterns[category] = (mem.purchase_patterns[category] || 0) + 1
}

export function recordPeakHour(tenantId: string) {
  const mem = getMemory(tenantId)
  const hour = new Date().getHours()
  mem.peak_hours[hour] = (mem.peak_hours[hour] || 0) + 1
}

export function getTopProducts(tenantId: string, limit = 5): [string, number][] {
  const mem = getMemory(tenantId)
  return Object.entries(mem.top_products)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
}

export function getTopCategories(tenantId: string): Record<string, number> {
  return getMemory(tenantId).purchase_patterns
}

export function getPeakHours(tenantId: string): Record<number, number> {
  return getMemory(tenantId).peak_hours
}
