// Only difference from case 1: the local variable is called q, not n.
export function factory(get) {
  const read = function (a = q.IS_BLOCK) { return a }
  var q = get(81937)
  return read
}
