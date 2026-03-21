# Agente: QA + SEGURIDAD + DEPURACIÓN
# No necesita rama específica — acceso de lectura a todas las ramas
# Pega esto en Claude Code desde main

Lee CLAUDE.md antes de empezar.

## Tu misión
Revisar el trabajo de TODOS los agentes verticales y el agente ELEVENLABS.
Eres la última barrera antes del deploy. Tu veredicto decide si se despliega o no.

## Cuándo actuar
Cuando existan archivos en agents/status/ con extensión .done

## Proceso de revisión

### BLOQUE 1 — Seguridad crítica (multi-tenant)
Busca en TODOS los archivos modificados por los agentes este patrón:
```
supabase.from('cualquier_tabla').select/insert/update/delete SIN .eq('tenant_id', ...)
```
UNA sola query sin filtro de tenant = BLOQUEADO automático. No hay excepciones.

También verifica:
- Los inserts incluyen tenant_id en todos los campos
- El tenant_id viene de getDemoTenant() o del contexto autenticado, no de params de URL sin validar

### BLOQUE 2 — Aislamiento entre verticales
Para cada vertical (restaurant, clinic, vet, realestate, physio, psico):
- Su lógica solo activa cuando useTenantType() devuelve su tipo
- No importa componentes de otras verticales
- No modifica archivos protegidos (supabase.ts, types/index.ts, layout.tsx)

### BLOQUE 3 — Memory leaks
Busca useEffect con suscripciones Supabase sin return de cleanup:
```typescript
// MAL:
useEffect(() => { supabase.channel('x').on(...).subscribe() }, [])
// BIEN:
useEffect(() => {
  const ch = supabase.channel('x').on(...).subscribe()
  return () => supabase.removeChannel(ch)
}, [])
```

### BLOQUE 4 — Revisión funcional por vertical
Para cada vertical con .done, verifica:
- [ ] La página carga con 0 datos sin crashear
- [ ] El empty state se muestra y tiene sentido
- [ ] Los modales se cierran con Escape y con click fuera
- [ ] Los formularios validan campos requeridos antes de enviar
- [ ] Los botones de acción funcionan (confirmar, cancelar, etc.)
- [ ] El texto está en español y corresponde al tipo de negocio correcto

### BLOQUE 5 — Revisión ElevenLabs
- [ ] El webhook incluye tenant_id en todos los registros
- [ ] Cada tipo de negocio tiene su prompt diferenciado
- [ ] Los prompts de clínica y psicología incluyen avisos de emergencia
- [ ] Los tests unitarios existen y pasan (ejecuta: npm test si está configurado)
- [ ] La variable ELEVENLABS_API_KEY está documentada en .env.local (como placeholder)

### BLOQUE 6 — TypeScript
Ejecuta: npx tsc --noEmit
- Documenta todos los errores de tipo
- Diferencia entre errores pre-existentes y errores nuevos de los agentes

### BLOQUE 7 — Build
Ejecuta: npm run build
- Si falla, identifica si es por código nuevo o dependencias pre-existentes
- El error @tailwindcss/postcss es pre-existente y no bloquea

### BLOQUE 8 — UX y coherencia visual
- Los colores y estilos son consistentes con el resto del dashboard
- No hay texto hardcodeado de otro negocio (ej: "La Bahía" en una clínica)
- Los badges de estado son legibles

## Tu output

Para cada vertical crea: agents/status/QA-NOMBRE.report
```
SEGURIDAD: OK | BLOQUEADO — [razón]
AISLAMIENTO: OK | PROBLEMA — [descripción]
MEMORY LEAKS: OK | ENCONTRADOS — [archivos]
FUNCIONAL: OK | BUGS — [lista]
UX: OK | PROBLEMAS — [lista]
VEREDICTO: APROBADO | BLOQUEADO | APROBADO_CON_CONDICIONES — [condiciones]
```

Al terminar TODA la revisión crea: agents/status/QA-FINAL.done
```
VEREDICTO GLOBAL: APROBADO | BLOQUEADO
BLOQUEANTES: ninguno | lista de lo que debe corregirse antes del deploy
PENDIENTES: lista de mejoras que pueden ir en el siguiente ciclo
```
