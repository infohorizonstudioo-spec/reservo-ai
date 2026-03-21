#!/usr/bin/env node
// RESERVO.AI — Setup de estructura de trabajo paralelo
// Ejecutar: node .agent-setup\setup.js (desde C:\Users\krush\reservo-ai)

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const ROOT = path.join(__dirname, '..')

function git(cmd) {
  try {
    execSync(`git ${cmd}`, { cwd: ROOT, encoding: 'utf8', stdio: 'pipe' })
    console.log(`  ✅ git ${cmd}`)
  } catch (e) {
    const msg = e.stderr || e.message
    if (msg.includes('already exists')) {
      console.log(`  ⏭️  git ${cmd} — ya existe`)
    } else {
      console.log(`  ⚠️  git ${cmd} — ${msg.split('\n')[0]}`)
    }
  }
}

function mkdir(rel) {
  const full = path.join(ROOT, rel)
  if (!fs.existsSync(full)) {
    fs.mkdirSync(full, { recursive: true })
    console.log(`  📁 ${rel}`)
  }
}

function touch(rel, content) {
  const full = path.join(ROOT, rel)
  if (!fs.existsSync(full)) {
    fs.writeFileSync(full, content)
    console.log(`  📄 ${rel}`)
  }
}

console.log('\n🚀 RESERVO.AI — Setup paralelo\n')

// Ramas
console.log('📌 Ramas...')
git('checkout main')
const branches = ['dev','feature/restaurante','feature/clinica',
  'feature/veterinaria','feature/inmobiliaria','feature/ux-global']
for (const b of branches) { git(`checkout -b ${b} main`); git('checkout main') }

// Carpetas
console.log('\n📁 Carpetas...')
const dirs = [
  'src/types','src/components/ui','src/components/clinic',
  'src/components/vet','src/components/realestate',
  '.agent-status/arquitecto','.agent-status/restaurante','.agent-status/clinica',
  '.agent-status/veterinaria','.agent-status/inmobiliaria',
  '.agent-status/ux-global','.agent-status/QA','.agent-status/release',
]
dirs.forEach(mkdir)

// .gitignore
const gi = path.join(ROOT, '.gitignore')
const giContent = fs.readFileSync(gi, 'utf8')
if (!giContent.includes('.agent-status')) {
  fs.appendFileSync(gi, '\n# Agent coordination (local)\n.agent-status/\n')
  console.log('\n  ✅ .gitignore actualizado')
}

// Resumen
console.log('\n✨ Setup completado!')
console.log('\n👉 Próximo paso:')
console.log('   Abre Claude Code → pega .agent-setup\\agents\\01-arquitecto.md')
console.log('   Cuando termine → lanza 02-06 en paralelo')
console.log('   Cuando terminen → 07-qa-seguridad.md')
console.log('   Si QA aprueba → 08-release-deploy.md\n')
