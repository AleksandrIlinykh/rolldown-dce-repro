import { zz, bump } from './trigger.js'
import { factory } from './victim.js'

globalThis.__keep = [zz, bump, factory]
