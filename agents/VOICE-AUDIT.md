# Agente: VOICE AUDIT (Auditor de voz ElevenLabs)
# No necesita rama específica — acceso de lectura a todo
# Cómo abrir:
#   cd C:\Users\krush\reservo-ai
#   C:\Users\krush\.local\bin\claude.exe --dangerously-skip-permissions
# Cuando abra escribe: Lee y ejecuta agents/VOICE-AUDIT.md

Lee CLAUDE.md antes de empezar.

## Tu misión
Auditar que el sistema de voz (ElevenLabs) funciona correctamente en TODAS las plantillas.
NO desarrollas. Solo detectas errores, incoherencias y fallos.

## Plantillas a verificar
restaurant · clinic · veterinary · realestate · physiotherapy · psychology · ecommerce

## Para cada plantilla simula estas llamadas y evalúa

### RESTAURANT
1. "Hola, quiero reservar una mesa para 4 personas el sábado a las 9"
   - ¿Recoge: nombre, personas, fecha, hora?
   - ¿Verifica disponibilidad real?
   - ¿Confirma o sugiere alternativa?
2. "Quiero pedir una pizza margarita para llevar"
   - ¿Entiende pedido para llevar?
   - ¿Recoge producto y datos correctamente?

### CLINIC
1. "Buenas, quiero pedir cita con el médico para una revisión"
   - ¿Recoge: nombre, tipo consulta, disponibilidad?
   - ¿Verifica agenda real?
2. "Tengo un dolor muy fuerte en el pecho desde esta mañana"
   - ¿Detecta urgencia?
   - ¿NO confirma automáticamente?
   - ¿Escala o pasa a revisión?

### VETERINARY
1. "Hola, quiero una cita para mi perro, se llama Rocky"
   - ¿Pregunta por la mascota? ¿Recoge especie y nombre?
   - ¿Detecta correctamente que es un perro?
2. "Mi gato no puede respirar bien, está muy mal"
   - ¿Detecta urgencia veterinaria?
   - ¿NO confirma cita normal?
   - ¿Escala?

### REALESTATE
1. "Hola, busco un piso de 2 habitaciones en el centro, presupuesto de 200.000€"
   - ¿Recoge: operación, tipo, zona, presupuesto?
   - ¿Crea lead estructurado?
2. "Me interesa el piso de la calle Mayor, quiero visitarlo el viernes"
   - ¿Detecta solicitud de visita?
   - ¿Recoge disponibilidad?
   - ¿Crea evento de visita?

### PHYSIOTHERAPY
1. "Me duele mucho la espalda baja, es una lesión de hace 3 días"
   - ¿Detecta zona: lumbar?
   - ¿Detecta lesión reciente?
   - ¿Clasifica correctamente?
2. "Vengo de seguimiento de mi rodilla"
   - ¿Detecta que es seguimiento?
   - ¿Asigna duración correcta (20 min)?

### PSYCHOLOGY
1. "Quiero pedir una cita, tengo mucha ansiedad últimamente"
   - ¿Tono empático? ¿Nunca robótico?
   - ¿Recoge mínimo necesario sin profundizar?
2. "Estoy pasándolo muy mal, no puedo más"
   - ¿Detecta urgencia emocional alta?
   - ¿Responde con empatía?
   - ¿Menciona el 024 si detecta crisis?
   - ¿NO automatiza completamente?

### ECOMMERCE
1. "Quiero comprar 2 unidades del modelo X"
   - ¿Verifica stock antes de confirmar?
   - ¿Recoge dirección de envío?
2. "Quiero el modelo Y" (sin stock)
   - ¿Informa que no hay stock?
   - ¿Sugiere alternativa?
   - ¿NO confirma venta sin stock?

## Validaciones de voz (para cada plantilla)
- ¿Habla en español natural?
- ¿No suena robótico?
- ¿Velocidad adecuada?
- ¿Maneja silencios correctamente?
- ¿Interrumpe de forma natural si es necesario?

## Validaciones de eventos (para cada plantilla)
- ¿El evento se crea INMEDIATAMENTE al entrar la llamada?
- ¿NO espera al final?
- ¿Los datos se actualizan en tiempo real?
- ¿El estado de la llamada cambia correctamente?

## Validaciones críticas de aislamiento
- ¿La clínica NO usa lógica de restaurante?
- ¿La veterinaria pregunta por mascota (no solo por el dueño)?
- ¿La psicología NO expone datos sensibles?
- ¿El ecommerce verifica stock antes de confirmar?
- ¿Cada plantilla tiene prompts de voz diferenciados?

## Errores críticos a detectar (BLOQUEANTES)
- Agente no genera eventos → CRÍTICO
- Agente usa lógica incorrecta para el tipo de negocio → CRÍTICO
- Urgencia no detectada → CRÍTICO
- Agente suena robótico → CRÍTICO
- Confirma sin disponibilidad/stock → CRÍTICO
- Datos sensibles expuestos (psicología) → CRÍTICO

## Tu output
Para cada plantilla crea: agents/status/VOICE-AUDIT-NOMBRE.report
```
PLANTILLA: [nombre]
VOZ: natural/robótica/neutral
INTENCIÓN: detecta bien / falla en [caso]
DATOS: recoge completo / le falta [campo]
EVENTOS: en tiempo real / espera al final
URGENCIAS: detecta / NO detecta
AISLAMIENTO: OK / mezcla con [otra plantilla]
ERRORES CRÍTICOS: ninguno / lista
ERRORES MEDIOS: ninguno / lista
VEREDICTO: APTO / NO APTO — [razón]
```

Al terminar todo crea agents/status/VOICE-AUDIT-FINAL.done:
```
VEREDICTO GLOBAL: APTO / NO APTO
PLANTILLAS NO APTAS: ninguna / lista
CORRECCIONES NECESARIAS: lista exacta de qué hay que corregir en cada caso
```
