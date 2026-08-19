// The same failure with real packages, which is how it was found. notistack declares the
// top level n after its own minification, jodit carries the module that gets damaged.
import * as notistack from 'notistack'
import { Jodit } from 'jodit/es2021/jodit.fat.min'

globalThis.__keep = [notistack, Jodit]
