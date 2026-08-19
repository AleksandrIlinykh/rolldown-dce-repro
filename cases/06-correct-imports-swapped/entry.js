// Only difference from case 1: victim.js is imported first.
import { factory } from './victim.js'
import { n, bump } from './trigger.js'

globalThis.__keep = [n, bump, factory]
