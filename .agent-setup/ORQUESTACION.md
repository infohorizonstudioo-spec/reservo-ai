# RESERVO.AI — GUÍA DE ORQUESTACIÓN
# Cómo lanzar el pipeline completo de agentes paralelos

## SETUP INICIAL (una sola vez)
Abre PowerShell en C:\Users\krush\reservo-ai y ejecuta:
```
node .agent-setup\setup.js
```
Esto crea las ramas y la estructura de carpetas.

---

## FLUJO COMPLETO

### FASE 1 — Arquitecto (bloqueante, va primero)
Abre Claude Code en el repo y pega el contenido de:
  .agent-setup\agents\01-arquitecto.md

Espera a que cree: .agent-status\arquitecto\DONE.md
No lances nada más hasta que ese archivo exista.

---

### FASE 2 — Agentes paralelos (lanza los 5 a la vez)
Abre 5 sesiones de Claude Code simultáneas (o lanza de a uno si prefieres).
Cada sesión recibe el contenido de su archivo:

  Sesión A → .agent-setup\agents\02-restaurante.md
  Sesión B → .agent-setup\agents\03-clinica.md
  Sesión C → .agent-setup\agents\04-veterinaria.md
  Sesión D → .agent-setup\agents\05-inmobiliaria.md
  Sesión E → .agent-setup\agents\06-ux-global.md

Cada uno trabaja en su rama. No se pisan entre sí.
Señal de fin: cada uno crea su .agent-status\<nombre>\DONE.md

---

### FASE 3 — QA (cuando hay al menos 2-3 agentes terminados)
No tienes que esperar a que terminen todos para lanzar QA.
Puedes lanzarlo cuando quieras — revisará lo que encuentre.

  .agent-setup\agents\07-qa-seguridad.md

Señal de aprobación: .agent-status\QA\RESUMEN-FINAL.md con APROBADO

---

### FASE 4 — Release (solo cuando QA aprueba)
  .agent-setup\agents\08-release-deploy.md

El agente release lee el QA report. Si está BLOQUEADO, para solo.
Señal de éxito: .agent-status\release\RELEASE-NOTES.md con DEPLOYED ✅

---

## DIAGRAMA

  ARQUITECTO (bloqueante)
       |
  -----+-----+-----+-----+-----
  |    |     |     |     |
 REST CLIN  VET  INMOB  UX   ← en paralelo
  |    |     |     |     |
  -----+-----+-----+-----
       |
      QA / SEGURIDAD
       |
    APROBADO? ── NO → los agentes corrigen → vuelve a QA
       |
      YES
       |
    RELEASE → deploy Vercel → ✅ producción

---

## ARCHIVOS CON RIESGO DE CONFLICTO

Estos archivos son tocados por múltiples agentes:
  src/app/(dashboard)/agenda/page.tsx     ← clínica + vet + inmobiliaria
  src/app/(dashboard)/clientes/page.tsx   ← clínica + vet + inmobiliaria

La solución es condicional por useTenantType(), no sobrescribir.
Si hay conflicto git → QA lo detecta → release no procede.

---

## VERSIONING

  v0.1.0 — Arquitecto + UX Global listos
  v0.2.0 — Todas las verticales
  v1.0.0 — QA completo + producción estable
