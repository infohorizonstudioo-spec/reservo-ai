'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types/ecommerce'

const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', tenant_id: '', name: 'Zapatillas Running Pro', sku: 'ZRP-42', price: 89.99, stock: 24, category: 'Calzado', active: true },
  { id: 'p2', tenant_id: '', name: 'Camiseta Dry-Fit', sku: 'CDF-M', price: 34.99, stock: 58, category: 'Ropa', active: true },
  { id: 'p3', tenant_id: '', name: 'Mochila Urbana', sku: 'MU-01', price: 59.90, stock: 3, category: 'Accesorios', active: true },
  { id: 'p4', tenant_id: '', name: 'Pantalón Corto Sport', sku: 'PCS-L', price: 29.99, stock: 41, category: 'Ropa', active: true },
  { id: 'p5', tenant_id: '', name: 'Calcetines Técnicos (3-pack)', sku: 'CT-M', price: 12.50, stock: 120, category: 'Accesorios', active: true },
  { id: 'p6', tenant_id: '', name: 'Chaqueta Cortavientos', sku: 'CC-XL', price: 74.50, stock: 0, category: 'Ropa', active: false },
  { id: 'p7', tenant_id: '', name: 'Botella Isotérmica 750ml', sku: 'BI-750', price: 18.95, stock: 2, category: 'Accesorios', active: true },
  { id: 'p8', tenant_id: '', name: 'Gorra Deportiva UV', sku: 'GDU-U', price: 22.00, stock: 15, category: 'Accesorios', active: true },
]

export default function ProductCatalog({ tenantId }: { tenantId: string }) {
  const [products, setProducts] = useState<Product[]>([])
  const [useMock, setUseMock] = useState(false)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('name')

      if (error || !data || data.length === 0) {
        setUseMock(true)
        setProducts(MOCK_PRODUCTS.map(p => ({ ...p, tenant_id: tenantId })))
      } else {
        setProducts(data)
      }
    }
    load()
  }, [tenantId])

  async function toggleActive(product: Product) {
    const newActive = !product.active
    if (useMock) {
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, active: newActive } : p))
      return
    }
    await supabase.from('products')
      .update({ active: newActive })
      .eq('id', product.id).eq('tenant_id', tenantId)
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, active: newActive } : p))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Catálogo de productos</h2>
        {useMock && <span className="text-[10px] text-white/20 bg-white/5 px-2 py-0.5 rounded">demo</span>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {products.map(product => (
          <div key={product.id} className={`glass rounded-xl p-4 space-y-2 border transition-opacity ${
            product.active ? 'border-white/[0.06]' : 'border-white/[0.03] opacity-50'
          }`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium leading-tight">{product.name}</p>
                {product.sku && <p className="text-[10px] text-white/25 mt-0.5">{product.sku}</p>}
              </div>
              <button onClick={() => toggleActive(product)}
                className={`w-8 h-4.5 rounded-full transition-colors relative shrink-0 ${
                  product.active ? 'bg-emerald-500/40' : 'bg-white/10'
                }`}>
                <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all ${
                  product.active ? 'left-[calc(100%-1rem)]' : 'left-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">{product.price.toFixed(2)}€</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-lg border font-medium ${
                product.stock === 0
                  ? 'bg-red-500/15 text-red-400 border-red-500/25'
                  : product.stock < 5
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/25'
                    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
              }`}>
                {product.stock === 0 ? 'Sin stock' : `${product.stock} uds`}
              </span>
            </div>

            {product.category && (
              <span className="inline-block text-[10px] text-white/30 bg-white/[0.04] px-2 py-0.5 rounded">
                {product.category}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
