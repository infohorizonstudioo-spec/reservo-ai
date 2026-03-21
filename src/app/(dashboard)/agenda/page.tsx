'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { getDemoTenant } from '@/lib/supabase'
import { useTenantType } from '@/lib/tenant-context'
import { AgendaClinica } from '@/components/clinic/AgendaClinica'
import AgendaVet from '@/components/vet/AgendaVet'
import VisitasView from '@/components/realestate/VisitasView'

export default function AgendaPage() {
  const tenantType = useTenantType()
  const [tenantId, setTenantId] = useState<string | null>(null)

  useEffect(() => {
    getDemoTenant().then(t => {
      if (t) setTenantId(t.id)
    })
  }, [])

  if (!tenantId) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-white/30 text-sm">Cargando...</div>
      </div>
    )
  }

  if (tenantType === 'clinic') {
    return <AgendaClinica tenantId={tenantId} />
  }

  if (tenantType === 'veterinary') {
    return <AgendaVet tenantId={tenantId} />
  }

  if (tenantType === 'realestate') {
    return <VisitasView tenantId={tenantId} />
  }

  return (
    <div className="p-6 flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-2">
        <p className="text-white/40 text-lg">▦</p>
        <p className="text-white/30 text-sm">Agenda no disponible para este tipo de negocio</p>
      </div>
    </div>
  )
}
