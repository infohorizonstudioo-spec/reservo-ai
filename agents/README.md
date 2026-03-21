# RESERVO.AI — Sistema completo de agentes

## FASE 1 — ARCHITECT (ya terminó ✅)
agents/status/ARCHITECT.done existe

## FASE 2 — Lanza estos agentes en paralelo (una pestaña por cada uno)

| Pestaña | Agente       | Rama                    | Archivo a leer                  |
|---------|-------------|-------------------------|----------------------------------|
| 1       | RESTAURANT  | feature/restaurante     | Lee y ejecuta agents/RESTAURANT.md |
| 2       | CLINIC      | feature/clinica         | Lee y ejecuta agents/CLINIC.md  |
| 3       | VETERINARY  | feature/veterinaria     | Lee y ejecuta agents/VETERINARY.md |
| 4       | REALESTATE  | feature/inmobiliaria    | Lee y ejecuta agents/REALESTATE.md |
| 5       | PHYSIO      | feature/fisioterapia    | Lee y ejecuta agents/PHYSIOTHERAPY.md |
| 6       | PSYCHOLOGY  | feature/psicologia      | Lee y ejecuta agents/PSYCHOLOGY.md |
| 7       | ECOMMERCE   | feature/ecommerce       | Lee y ejecuta agents/ECOMMERCE.md |
| 8       | ELEVENLABS  | feature/elevenlabs      | Lee y ejecuta agents/ELEVENLABS.md |

## FASE 3 — QA (cuando haya 3+ agentes terminados)
Lee y ejecuta agents/QA.md

## FASE 3b — VOICE AUDIT (en paralelo con QA)
Lee y ejecuta agents/VOICE-AUDIT.md

## FASE 4 — RELEASE (solo cuando QA + VOICE AUDIT aprueban)
Lee y ejecuta agents/RELEASE.md

## Cómo abrir cada pestaña
1. Pulsa el + en tu terminal para nueva pestaña
2. Pega estos 3 comandos:
   cd C:\Users\krush\reservo-ai
   git checkout feature/NOMBRE-RAMA
   C:\Users\krush\.local\bin\claude.exe --dangerously-skip-permissions
3. Cuando abra Claude Code escribe el comando de la columna "Archivo a leer"

## Estado actual
ARCHITECT    ✅ LISTO
RESTAURANT   ⏳ pendiente
CLINIC       ⏳ pendiente
VETERINARY   ⏳ pendiente
REALESTATE   ⏳ pendiente
PHYSIOTHERAPY ⏳ pendiente
PSYCHOLOGY   ⏳ pendiente
ECOMMERCE    ⏳ pendiente
ELEVENLABS   ⏳ pendiente
QA           ⏳ esperando verticales
VOICE AUDIT  ⏳ esperando ELEVENLABS
RELEASE      ⏳ esperando QA + VOICE AUDIT
