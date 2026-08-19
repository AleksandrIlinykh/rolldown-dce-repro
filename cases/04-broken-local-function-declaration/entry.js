import { getActivator } from './trigger.js'
import { make } from './victim.js'

globalThis.__keep = [getActivator, make]

// exported so that verify.mjs can call it on the built file
export { make }
