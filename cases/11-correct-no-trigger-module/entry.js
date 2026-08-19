// Only difference from case 1: there is no trigger.js, so no other module declares n.
import { factory } from './victim.js'

globalThis.__keep = [factory]
