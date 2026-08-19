// The only job of this module is to declare a top level binding called `n`.
// Rename it and the bug goes away.
export let n = 1
export function bump() { n += 1 }
