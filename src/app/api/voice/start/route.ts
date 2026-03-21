import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createConversation } from '@/lib/elevenlabs'
import type { TenantType } from '@/lib/tenant-context'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { tenantId } = await req.json()
    if (!tenantId) return NextResponse.json({ error: 'tenantId required' }, { status: 400 })

    const { data: tenant } = await supabase.from('tenants').select('*').eq('id', tenantId).single()
    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })

    const { conversationId, token } = await createConversation(
      tenantId,
      tenant.type as TenantType,
      tenant.name
    )
    return NextResponse.json({ conversationId, token })
  } catch (e: any) {
    console.error('Voice start error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
