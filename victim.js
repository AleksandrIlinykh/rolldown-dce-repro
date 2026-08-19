// `n` is declared after the function that reads it, and the only read is a default
// parameter value. Rolldown removes the declaration and keeps the read.
export function factory(get) {
  const read = function (a = n.IS_BLOCK) { return a }
  var n = get(81937)
  return read
}
