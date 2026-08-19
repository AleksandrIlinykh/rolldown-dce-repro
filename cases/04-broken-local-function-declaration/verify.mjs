// This case is checked by running the built file, not by reading it. The bundled code
// returns a different value than the same source does without a bundler.
export default async function verify(builtFile) {
  const { make } = await import('file:///' + builtFile.split(String.fromCharCode(92)).join('/') + '?t=' + Date.now())
  const got = make()()
  const want = 'the local one'
  return {
    verdict: got === want ? 'correct' : 'broken',
    evidence: `bind() returns ${JSON.stringify(got)}, the same source without a bundler returns ${JSON.stringify(want)}`
  }
}
