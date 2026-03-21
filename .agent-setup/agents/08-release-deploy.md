# PROMPT — AGENTE RELEASE / DEPLOY FINAL
# Pega esto completo en Claude Code dentro de C:\Users\krush\reservo-ai
# ERES EL ÚLTIMO PASO. Nada va a producción sin tu validación.

## PASO 0 — LEE ESTO PRIMERO (bloqueante)
Lee `.agent-status/QA/RESUMEN-FINAL.md`.

Si el veredicto es BLOQUEADO → PARA AQUÍ. Informa al usuario:
"QA ha bloqueado el release. Razón: [copiar razón del reporte]"

Solo continúas si el veredicto es APROBADO o APROBADO_CON_CONDICIONES.

---

## PASO 1 — Verificar pre-condiciones
Confirma que existen estos archivos antes de cualquier acción:
- `.agent-status/QA/RESUMEN-FINAL.md` → veredicto APROBADO
- `.agent-status/arquitecto/DONE.md`
- `.agent-status/ux-global/DONE.md`

---

## PASO 2 — Merge ordenado a rama dev

```bash
git checkout dev

# Orden obligatorio (dependencias de arriba a abajo):
git merge feature/ux-global --no-ff -m "merge: ux-global → dev [QA APROBADO]"
git merge feature/restaurante --no-ff -m "merge: restaurante → dev [QA APROBADO]"
git merge feature/clinica --no-ff -m "merge: clinica → dev [QA APROBADO]"
git merge feature/veterinaria --no-ff -m "merge: veterinaria → dev [QA APROBADO]"
git merge feature/inmobiliaria --no-ff -m "merge: inmobiliaria → dev [QA APROBADO]"
```

Si aparece un conflicto en cualquier merge → PARA.
Documenta el conflicto en `.agent-status/release/CONFLICTOS.md` e informa al usuario.
NO resuelvas conflictos a ciegas.

---

## PASO 3 — Verificación post-merge
```bash
npx tsc --noEmit
```
Si hay errores de TypeScript → PARA. Documenta. No continúes.

```bash
npm run build
```
Si el build falla → PARA. Documenta el error exacto. No continúes.

---

## PASO 4 — Merge a main y tag
Solo si los pasos 2 y 3 pasaron sin errores:
```bash
git checkout main
git merge dev --no-ff -m "release: v0.2.0 — verticales restaurante + clínica + vet + inmobiliaria + UX"
git tag v0.2.0
```

Versiona así:
- v0.1.0 = arquitecto + UX global (base)
- v0.2.0 = todas las verticales
- v1.0.0 = QA completo + producción

---

## PASO 5 — Deploy a Vercel
El proyecto en Vercel debería estar configurado para auto-deploy desde main.
Si no hay auto-deploy configurado:
```bash
npx vercel --prod
```
Verifica que la URL de producción responde y no hay errores 500.

---

## TU OUTPUT
Crea `.agent-status/release/RELEASE-NOTES.md`:
```markdown
# RELEASE NOTES — v0.2.0
## Fecha: [fecha]
## Deploy URL: [url]

## Qué incluye
- Arquitecto: tipos de verticales + TenantContext + sidebar dinámico
- Restaurante: reservas, pedidos, mesas, llamadas, dashboard
- Clínica: agenda clínica condicional, vista pacientes
- Veterinaria: agenda vet condicional, mascotas/propietarios
- Inmobiliaria: kanban leads, visitas
- UX Global: sistema de tokens CSS, componentes UI, pantalla entrada

## Merges realizados
- feature/ux-global → dev ✅
- feature/restaurante → dev ✅
- feature/clinica → dev ✅
- feature/veterinaria → dev ✅
- feature/inmobiliaria → dev ✅
- dev → main ✅

## Checks
- TypeScript: ✅ / ❌ [error]
- Build: ✅ / ❌ [error]
- Deploy: ✅ / ❌ [error]

## Conflictos resueltos
- ninguno

## Estado: DEPLOYED ✅
```

## REGLAS ABSOLUTAS
- ❌ NUNCA mergear a main sin QA APROBADO
- ❌ NUNCA deploy si el build falla
- ❌ NUNCA resolver conflictos de merge a ciegas
- ❌ NUNCA cambiar variables de entorno de producción sin confirmación de Arturo
- ✅ Siempre crear tag de versión
- ✅ Siempre dejar RELEASE-NOTES.md actualizado
