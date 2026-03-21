import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event_type, conversation_id, data } = body
    const tenantId = data?.metadata?.tenant_id
    if (!tenantId) return NextResponse.json({ error: 'tenant_id required' }, { status: 400 })

    if (event_type === 'conversation_started') {
      await supabase.from('calls').insert({
        tenant_id: tenantId, call_sid: conversation_id, status: 'activa',
        intent_data: {}, duration_seconds: 0, transcript: [],
        generating_reservation: false, started_at: new Date().toISOString(),
      })
    }
    if (event_type === 'transcript_updated') {
      await supabase.from('calls').update({ transcript: data?.transcript ?? [] })
        .eq('call_sid', conversation_id).eq('tenant_id', tenantId)
    }
    if (event_type === 'intent_detected') {
      await supabase.from('calls')
        .update({ intent: data?.intent, intent_data: data?.intent_data ?? {} })
        .eq('call_sid', conversation_id).eq('tenant_id', tenantId)
    }
    if (event_type === 'conversation_ended') {
      await supabase.from('calls')
        .update({ status: 'completada', duration_seconds: data?.duration_seconds ?? 0, ended_at: new Date().toISOString() })
        .eq('call_sid', conversation_id).eq('tenant_id', tenantId)
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Voice webhook error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
