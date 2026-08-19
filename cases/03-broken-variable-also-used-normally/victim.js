// Only difference from case 1: n is also returned, so it cannot be called unused.
// The declaration still disappears and the default value still reads the other module's n.
export function factory(get) {
  const read = function (a = n.IS_BLOCK) { return a }
  var n = get(81937)
  return [read, n]
}
