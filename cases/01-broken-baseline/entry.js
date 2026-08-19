// All four conditions are met, so the build is wrong.
import { n, bump } from './trigger.js'
import { factory } from './victim.js'

globalThis.__keep = [n, bump, factory]
