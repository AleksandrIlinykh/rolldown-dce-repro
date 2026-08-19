// Builds every case, writes the result next to its input and prints the table.
// A case directory is named after what it should produce, so this also checks that
// the name still tells the truth. Usage: node run-all.mjs
//
// Most cases are judged by reading the output. A case that ships a verify.mjs is
// judged by running the built file instead.
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync, writeFileSync, rmSync, unlinkSync, existsSync } from 'node:fs'
import { findDeclaration } from './detect.mjs'

const dir = new URL('.', import.meta.url).pathname.replace(/^\//, '')
const cases = readdirSync(dir + 'cases').sort()
const rows = []
let mismatches = 0

for (const name of cases) {
  const caseDir = 'cases/' + name
  rmSync(dir + 'dist', { recursive: true, force: true })
  execFileSync('node', [dir + 'build.mjs', caseDir, 'dce-only'], { stdio: 'pipe' })

  const built = readdirSync(dir + 'dist').filter(f => f.endsWith('.js'))[0]
  const builtPath = dir + 'dist/' + built
  const code = readFileSync(builtPath, 'utf8')

  let verdict, evidence, at
  if (existsSync(`${dir}${caseDir}/verify.mjs`)) {
    const verify = (await import('./' + caseDir + '/verify.mjs')).default
    ;({ verdict, evidence } = await verify(builtPath))
    at = 0
  } else {
    const found = findDeclaration(code)
    verdict = found.status === 'removed' ? 'broken' : 'correct'
    evidence = found.line
    at = found.at
  }

  const expected = name.split('-')[1]
  if (verdict !== expected) mismatches++

  for (const stale of readdirSync(`${dir}${caseDir}`).filter(f => f.startsWith('output.'))) {
    unlinkSync(`${dir}${caseDir}/${stale}`)
  }

  // jodit alone is 700 kB, so that case keeps only the damaged module
  const huge = code.length > 50_000
  const body = huge ? code.slice(Math.max(0, at - 620), at + 60) + '\n' : code
  writeFileSync(`${dir}${caseDir}/output${huge ? '.excerpt' : ''}.js`,
    `// node build.mjs ${caseDir} dce-only\n// ${evidence}\n\n` + body)

  rows.push([name, verdict, expected, evidence])
}
rmSync(dir + 'dist', { recursive: true, force: true })

const w = Math.max(...rows.map(r => r[0].length))
console.log('case'.padEnd(w), '', 'result '.padEnd(8), 'evidence')
console.log('-'.repeat(w), '', '-'.repeat(8), '-'.repeat(40))
for (const [name, verdict, expected, evidence] of rows) {
  const flag = verdict === expected ? '' : `  <-- the directory name says ${expected}`
  console.log(name.padEnd(w), '', verdict.padEnd(8), evidence + flag)
}
if (mismatches) {
  console.log(`\n${mismatches} case(s) no longer match their directory name`)
  process.exit(1)
}
