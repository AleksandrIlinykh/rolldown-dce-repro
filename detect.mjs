// Finds what happened to `var n = get(81937)` in a built file.
//
//   removed the call is there with nothing assigned to it, while the default value
//           next to it still reads the variable, which is the bug
//   kept    every call to 81937 is assigned to something, which is what should happen
//
// A file can hold many calls to the same module, so all of them are checked.
export function findDeclaration(code) {
  let firstKept = null
  for (const m of code.matchAll(/\(81937\)/g)) {
    const before = code.slice(Math.max(0, m.index - 900), m.index)
    const callee = (before.match(/([A-Za-z$_][A-Za-z0-9$_]*)$/) || [])[1] ?? ''
    const assigned = before.slice(0, before.length - callee.length).trimEnd().endsWith('=')
    const line = code.slice(code.lastIndexOf('\n', m.index) + 1, code.indexOf('\n', m.index)).trim()
    if (!assigned && before.includes('.IS_BLOCK')) return { status: 'removed', line, at: m.index }
    if (assigned && !firstKept) firstKept = { status: 'kept', line, at: m.index }
  }
  return firstKept ?? { status: 'no reader', line: '', at: -1 }
}
