// Builds one case. Usage: node build.mjs cases/1-baseline [minify mode]
import { build } from 'rolldown'

const dir = new URL('.', import.meta.url).pathname.replace(/^\//, '')
const caseDir = process.argv[2] ?? 'cases/1-baseline'
const arg = process.argv[3] ?? 'dce-only'
const minify = arg === 'true' ? true : arg === 'false' ? false : arg

await build({
  input: dir + caseDir + '/entry.js',
  output: { dir: dir + 'dist', minify },
  platform: 'browser'
})
console.log(`built ${caseDir} with output.minify = ${JSON.stringify(minify)}`)
