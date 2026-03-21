# Agente: RELEASE + DEPLOY
# Pega esto en Claude Code desde la rama main

Lee CLAUDE.md y agents/status/QA-FINAL.done antes de hacer cualquier cosa.

## PASO 0 — Verificación de QA (BLOQUEANTE)
Lee agents/status/QA-FINAL.done.
Si dice BLOQUEADO → para aquí. Informa: "QA ha bloqueado el release. Razón: [copiar razón]"
Solo continúas si dice APROBADO o APROBADO_CON_CONDICIONES.

## PASO 1 — Crear rama de integración si no existe
```
git checkout dev
```

## PASO 2 — Merge de verticales a dev (en este orden)
```
git merge feature/restaurante --no-ff -m "feat: vertical restaurante"
git merge feature/clinica --no-ff -m "feat: vertical clinica"
git merge feature/veterinaria --no-ff -m "feat: vertical veterinaria"
git merge feature/inmobiliaria --no-ff -m "feat: vertical inmobiliaria"
git merge feature/fisioterapia --no-ff -m "feat: vertical fisioterapia"
git merge feature/psicologia --no-ff -m "feat: vertical psicologia"
git merge feature/elevenlabs --no-ff -m "feat: sistema de voz elevenlabs"
```

Si hay conflicto en CUALQUIER merge:
- Para inmediatamente
- Documenta el conflicto en agents/status/RELEASE-CONFLICTOS.md
- NO lo resuelvas a ciegas
- Informa al usuario exactamente qué archivos tienen conflicto

## PASO 3 — Verificar TypeScript
```
npx tsc --noEmit 2>&1
```
Si hay errores nuevos (no pre-existentes) → para y documenta.

## PASO 4 — Verificar build
```
npm run build 2>&1
```
El error de @tailwindcss/postcss es pre-existente y conocido — NO bloquea.
Otros errores de build → para y documenta.

## PASO 5 — Variables de entorno de producción
Verifica que en Vercel están configuradas:
- NEXT_PUBLIC_SUPABASE_URL ✓ (ya está)
- NEXT_PUBLIC_SUPABASE_ANON_KEY ✓ (ya está)
- SUPABASE_SERVICE_ROLE_KEY ✓ (ya está)
- ANTHROPIC_API_KEY ✓ (ya está)
- ELEVENLABS_API_KEY → preguntar al usuario si ya la configuró en Vercel

## PASO 6 — Merge a main y tag
Solo si todo lo anterior pasó:
```
git checkout main
git merge dev --no-ff -m "release: v0.3.0 - todas las verticales + voz ElevenLabs"
git tag v0.3.0
git push origin main
git push origin --tags
```

Vercel hace deploy automático desde main.

## PASO 7 — Verificar deploy
Espera 2-3 minutos y verifica que https://reservo-ai.vercel.app (o la URL del proyecto) responde sin errores 500.

## Al terminar
Crea agents/status/RELEASE.done:
```
VERSION: v0.3.0
FECHA: [fecha]
ESTADO: DEPLOYED | FALLIDO — [razón]
URL: [url de producción]
MERGES: restaurant ✓ | clinic ✓ | vet ✓ | inmobiliaria ✓ | fisio ✓ | psico ✓ | elevenlabs ✓
TYPESCRIPT: OK | ERRORES — [lista]
BUILD: OK | ERROR — [detalle]
```

## Reglas absolutas
- Nunca mergear a main sin QA-FINAL.done con APROBADO
- Nunca resolver conflictos de merge sin confirmación de Arturo
- Nunca modificar variables de entorno de producción en Vercel sin confirmación
- Nunca hacer force push a main
