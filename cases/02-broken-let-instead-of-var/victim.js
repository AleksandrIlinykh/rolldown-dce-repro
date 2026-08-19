// Only difference from case 1: let instead of var.
export function factory(get) {
  const read = function (a = n.IS_BLOCK) { return a }
  let n = get(81937)
  return read
}
