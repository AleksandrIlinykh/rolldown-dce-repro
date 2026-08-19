import { n, bump } from './trigger.js'
import { factory } from './victim.js'

globalThis.__keep = [n, bump, factory]
