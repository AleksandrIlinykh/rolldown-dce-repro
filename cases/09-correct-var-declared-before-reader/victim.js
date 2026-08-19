// Only difference from case 1: var n is written above the function that reads it.
export function factory(get) {
  var n = get(81937)
  const read = function (a = n.IS_BLOCK) { return a }
  return read
}
