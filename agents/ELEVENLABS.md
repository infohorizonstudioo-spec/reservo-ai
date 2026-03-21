# Agente: ELEVENLABS + VOZ
# Rama: feature/elevenlabs (créala: git checkout -b feature/elevenlabs main)
# Pega esto en Claude Code

Lee CLAUDE.md antes de empezar.

## Tu misión
Configurar correctamente el sistema de voz con ElevenLabs para que funcione
en TODAS las verticales (restaurant, clinic, veterinary, realestate, physiotherapy, psychology).
Cada vertical necesita un prompt de voz diferente y configuración distinta.

## Contexto del proyecto
- Supabase URL: https://phrfucpinxxcsgxgbcno.supabase.co
- El sistema de llamadas ya existe en la tabla 'calls' de Supabase
- La página /llamadas muestra llamadas activas con transcripción en tiempo real
- NO tienes claves de ElevenLabs en .env.local todavía — las necesitarás pedir al usuario

## Lo que puedes tocar
- src/lib/elevenlabs.ts (crear)
- src/lib/voice-prompts.ts (crear)
- src/app/api/voice/ (crear carpeta y rutas)
- src/app/api/calls/ (crear si no existe)
- src/types/voice.ts (crear)
- tests/voice/ (crear carpeta con tests)

## Lo que NO puedes tocar
- src/lib/supabase.ts
- src/types/index.ts
- Páginas del dashboard (solo el backend de voz)

## Tareas

### 1. src/lib/voice-prompts.ts
Crea prompts de sistema para el agente de voz según el tipo de negocio:

```typescript
export function getVoicePrompt(tenantType: string, tenantName: string, tenantPhone?: string): string
```

Prompt para RESTAURANT:
"Eres la recepcionista virtual de {tenantName}. Puedes: gestionar reservas (crear, modificar, cancelar), 
informar sobre el menú y horarios, tomar pedidos para llevar. Habla en español, sé amable y concisa.
Si no puedes resolver algo, di que transferirás con un humano."

Prompt para CLINIC:
"Eres la recepcionista virtual de la clínica {tenantName}. Puedes: gestionar citas médicas, 
informar sobre especialidades y horarios, recordar citas. NO des consejos médicos. 
Ante cualquier urgencia médica, indica llamar al 112."

Prompt para VETERINARY:
"Eres la recepcionista virtual de la clínica veterinaria {tenantName}. Puedes: gestionar citas,
informar sobre servicios (consultas, vacunas, peluquería), preguntar nombre y especie de la mascota.
Ante urgencias veterinarias graves, indica venir directamente."

Prompt para PHYSIOTHERAPY:
"Eres la recepcionista virtual del centro de fisioterapia {tenantName}. Puedes: gestionar citas,
informar sobre tratamientos y tarifas, recordar qué traer a la primera sesión.
NO des diagnósticos ni consejos clínicos."

Prompt para PSYCHOLOGY:
"Eres la recepcionista virtual de la consulta de psicología {tenantName}. Tu tono es calmado y empático.
Puedes: gestionar citas, informar sobre modalidades (presencial/online) y tarifas.
Mantén absoluta confidencialidad. Ante crisis, indica llamar al 024."

Prompt para REALESTATE:
"Eres el asistente virtual de la inmobiliaria {tenantName}. Puedes: informar sobre propiedades disponibles,
gestionar visitas, recoger datos de clientes interesados. Sé profesional y orientado a la venta."

### 2. src/lib/elevenlabs.ts
```typescript
// Exporta:
// - getElevenLabsConfig(tenantType) → configuración de voz por tipo (voice_id, stability, similarity)
// - createConversation(tenantId, tenantType, tenantName) → inicia conversación ElevenLabs
// - endConversation(conversationId) → termina conversación
// Usa process.env.ELEVENLABS_API_KEY
// Si la clave no existe, lanza error descriptivo: "Configura ELEVENLABS_API_KEY en .env.local"
```

Voces recomendadas por tipo:
- restaurant: voz femenina amable (Rachel o similar)
- clinic: voz profesional neutra
- veterinary: voz cálida y amigable
- physiotherapy: voz tranquila y profesional
- psychology: voz muy calmada y empática
- realestate: voz segura y profesional

### 3. src/app/api/voice/webhook/route.ts
Webhook que recibe eventos de ElevenLabs:
- conversation_started → crea registro en tabla calls
- transcript_updated → actualiza transcripción en tiempo real
- conversation_ended → marca llamada como completada, guarda duración
- intent_detected → actualiza intent en la llamada

SIEMPRE incluir tenant_id en todos los registros de Supabase.

### 4. src/app/api/voice/start/route.ts
POST endpoint para iniciar una llamada:
- Recibe: tenantId
- Busca el tenant en Supabase
- Genera el prompt correcto según tenant.type
- Inicia conversación con ElevenLabs
- Devuelve: { conversationId, token }

### 5. tests/voice/voice-prompts.test.ts
Tests unitarios para los prompts de voz:
```typescript
// Test 1: cada tipo de negocio genera un prompt diferente
// Test 2: el nombre del tenant aparece en el prompt
// Test 3: los prompts de clinic y psychology incluyen avisos de emergencia
// Test 4: el prompt de psychology NO menciona diagnósticos
// Test 5: todos los prompts están en español
```

### 6. tests/voice/webhook.test.ts
Tests del webhook:
```typescript
// Test 1: conversation_started crea registro en calls con tenant_id
// Test 2: conversation_ended actualiza status a 'completada'
// Test 3: webhook sin tenant_id válido devuelve 400
// Test 4: transcripción se actualiza correctamente
```

Usa Jest o Vitest para los tests. Usa mocks para Supabase y ElevenLabs API.

## Variable de entorno necesaria
Añade a .env.local (pide la clave al usuario si no la tienes):
ELEVENLABS_API_KEY=tu_clave_aqui

## Al terminar
Crea agents/status/ELEVENLABS.done con contenido: LISTO
Lista los archivos creados y los tests que pasan.
