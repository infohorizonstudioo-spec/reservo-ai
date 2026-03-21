import type { OperationType, PropertyType } from '@/types/realestate'

interface RealEstateMemory {
  zones_demand: Record<string, number>
  avg_prices: Record<string, number>
  property_types: Record<PropertyType, number>
  operations: Record<OperationType, number>
}

const store = new Map<string, RealEstateMemory>()

function getDefault(): RealEstateMemory {
  return {
    zones_demand: {},
    avg_prices: {},
    property_types: { piso: 0, chalet: 0, local: 0, terreno: 0, garaje: 0, otro: 0 },
    operations: { compra: 0, alquiler: 0, venta: 0 },
  }
}

function getMemory(tenantId: string): RealEstateMemory {
  if (!store.has(tenantId)) store.set(tenantId, getDefault())
  return store.get(tenantId)!
}

export function recordZoneDemand(tenantId: string, zone: string) {
  const mem = getMemory(tenantId)
  mem.zones_demand[zone] = (mem.zones_demand[zone] || 0) + 1
}

export function recordPrice(tenantId: string, zone: string, price: number) {
  const mem = getMemory(tenantId)
  mem.avg_prices[zone] = mem.avg_prices[zone]
    ? (mem.avg_prices[zone] + price) / 2
    : price
}

export function recordPropertyType(tenantId: string, type: PropertyType) {
  const mem = getMemory(tenantId)
  mem.property_types[type] = (mem.property_types[type] || 0) + 1
}

export function recordOperation(tenantId: string, op: OperationType) {
  const mem = getMemory(tenantId)
  mem.operations[op] = (mem.operations[op] || 0) + 1
}

export function getTopZones(tenantId: string, limit = 5): [string, number][] {
  const mem = getMemory(tenantId)
  return Object.entries(mem.zones_demand)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
}

export function getFrequentPropertyTypes(tenantId: string): Record<PropertyType, number> {
  return getMemory(tenantId).property_types
}

export function getOperationDistribution(tenantId: string): Record<OperationType, number> {
  return getMemory(tenantId).operations
}
