import type { TenantType } from './tenant-context'

export interface VoiceConfig {
  voice_id: string
  stability: number
  similarity_boost: number
  style: number
}

const VOICE_CONFIGS: Record<TenantType, VoiceConfig> = {
  restaurant:    { voice_id: 'EXAVITQu4vr4xnSDxMaL', stability: 0.5, similarity_boost: 0.8, style: 0.3 },
  clinic:        { voice_id: 'ErXwobaYiN019PkySvjV', stability: 0.7, similarity_boost: 0.8, style: 0.1 },
  veterinary:    { voice_id: 'EXAVITQu4vr4xnSDxMaL', stability: 0.6, similarity_boost: 0.8, style: 0.2 },
  realestate:    { voice_id: 'VR6AewLTigWG4xSOukaG', stability: 0.6, similarity_boost: 0.8, style: 0.2 },
  physiotherapy: { voice_id: 'ErXwobaYiN019PkySvjV', stability: 0.7, similarity_boost: 0.8, style: 0.1 },
  psychology:    { voice_id: 'ErXwobaYiN019PkySvjV', stability: 0.8, similarity_boost: 0.9, style: 0.0 },
  ecommerce:     { voice_id: 'VR6AewLTigWG4xSOukaG', stability: 0.5, similarity_boost: 0.8, style: 0.3 },
  other:         { voice_id: 'EXAVITQu4vr4xnSDxMaL', stability: 0.5, similarity_boost: 0.8, style: 0.2 },
}

export function getElevenLabsConfig(tenantType: TenantType): VoiceConfig {
  return VOICE_CONFIGS[tenantType] ?? VOICE_CONFIGS.other
}

export async function createConversation(
  tenantId: string,
  tenantType: TenantType,
  tenantName: string
): Promise<{ conversationId: string; token: string }> {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) throw new Error('Configura ELEVENLABS_API_KEY en .env.local')

  const config = getElevenLabsConfig(tenantType)
  const { getVoicePrompt } = await import('./voice-prompts')
  const prompt = getVoicePrompt(tenantType, tenantName)

  const res = await fetch('https://api.elevenlabs.io/v1/convai/conversations', {
    method: 'POST',
    headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agent_id: process.env.ELEVENLABS_AGENT_ID ?? 'default',
      conversation_config_override: {
        agent: { prompt: { prompt }, first_message: `Hola, soy la recepcionista virtual de ${tenantName}. ¿En qué puedo ayudarte?` },
        tts: { voice_id: config.voice_id, stability: config.stability, similarity_boost: config.similarity_boost },
      },
      metadata: { tenant_id: tenantId, tenant_type: tenantType },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`ElevenLabs error ${res.status}: ${err}`)
  }

  const data = await res.json()
  return { conversationId: data.conversation_id, token: data.signed_url ?? '' }
}

export async function endConversation(conversationId: string): Promise<void> {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) return
  await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`, {
    method: 'DELETE',
    headers: { 'xi-api-key': apiKey },
  }).catch(() => {})
}
