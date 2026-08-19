// Reads the last build and says whether the declaration survived.
import { readdirSync, readFileSync } from 'node:fs'
import { findDeclaration } from './detect.mjs'

const dir = new URL('./dist/', import.meta.url)
let broken = false

for (const file of readdirSync(dir).filter(f => f.endsWith('.js'))) {
  const code = readFileSync(new URL(file, dir), 'utf8')
  const { status } = findDeclaration(code)
  if (status !== 'removed') continue
  broken = true
  const at = code.indexOf('(81937)')
  console.log(`\nDECLARATION REMOVED in ${file}\n`)
  console.log(code.slice(Math.max(0, at - 300), at + 40))
}

console.log(broken ? '\nresult: the declaration was removed' : 'result: output is correct')
process.exit(broken ? 1 : 0)
