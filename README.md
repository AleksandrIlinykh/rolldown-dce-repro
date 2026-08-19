# Rolldown removes a variable that is still in use

A reference inside a default parameter value is resolved against the wrong module. When another
module in the same chunk declares a binding with that name and comes first, the reference binds to
it instead of to the local variable. The local variable is then seen as unused and its declaration
is removed. The build reports nothing, and the wrong value is only seen at runtime.

Four things have to come together. Take any one of them away and the output is correct.

1. Another module declares a top level binding with the same name.
2. That module comes first in the import order.
3. The variable is declared after the function that reads it.
4. The read happens in a default parameter value.

## The whole case

`cases/01-broken-baseline/trigger.js`

```js
export let n = 1
export function bump() { n += 1 }
```

`cases/01-broken-baseline/victim.js`

```js
export function factory(get) {
  const read = function (a = n.IS_BLOCK) { return a }
  var n = get(81937)
  return read
}
```

`cases/01-broken-baseline/entry.js`

```js
import { n, bump } from './trigger.js'
import { factory } from './victim.js'

globalThis.__keep = [n, bump, factory]
```

Build it with `output.minify: 'dce-only'` and this comes out:

```js
//#region trigger.js
let n = 1;
function bump() {
	n += 1;
}
//#endregion
//#region victim.js
function factory(get) {
	const read = function(a = n.IS_BLOCK) {   // still reads n
		return a;
	};
	get(81937);                               // "var n =" is gone
	return read;
}
//#endregion
```

The local `n` inside `factory` is gone. The call to `get` stays, because a call can have side
effects. What is left reads the `n` from `trigger.js`, which holds the number `1`, so `n.IS_BLOCK`
is `undefined`.

## Every condition has its own directory

Each folder under `cases/` is a complete, standalone case, and its name says what it produces. Open
it and everything is there: the modules, the entry, and the build result. The broken cases come first, the correct ones after them.

| Case | What is different from the first case | Result | Evidence |
| ---- | ------------------------------------- | ------ | -------- |
| `01-broken-baseline` | nothing, all four conditions are met | **broken** | `get(81937);` |
| `02-broken-let-instead-of-var` | `let` instead of `var` | **broken** | `get(81937);` |
| `03-broken-variable-also-used-normally` | `n` is returned as well, so it cannot be called unused | **broken** | `return [read, get(81937)];` |
| `04-broken-local-function-declaration` | a local function instead of a variable, checked by running the output | **broken** | returns `"THE OTHER ONE"` instead of `"the local one"` |
| `05-broken-notistack-and-jodit` | real packages instead of the two local files | **broken** | `i(81937);` |
| `06-correct-imports-swapped` | the two imports are in the other order | correct | `var n = get(81937);` |
| `07-correct-trigger-variable-renamed` | the other module calls its variable `zz` | correct | `var n = get(81937);` |
| `08-correct-victim-variable-renamed` | the local variable is called `q` | correct | `var q = get(81937);` |
| `09-correct-var-declared-before-reader` | `var n` is written above the function that reads it | correct | `var n = get(81937);` |
| `10-correct-read-in-function-body` | `n` is read in the body, not in a default value | correct | `var n = get(81937);` |
| `11-correct-no-trigger-module` | there is no second module at all | correct | `var n = get(81937);` |

Case 04 is the shortest proof that this is a miscompilation and not a matter of taste. The same
source returns `"the local one"` when node runs it directly and `"THE OTHER ONE"` after bundling,
and that case is checked by running the built file rather than by reading it.

Case 03 is worth opening. There the variable is returned from the function, so it cannot be treated
as unused, and the declaration still disappears: its value is folded into the return and the default
value keeps reading the other module's `n`. Removing the declaration is the consequence, the wrong
resolution is the cause.

Rebuild them all and print this table again:

```sh
npm run cases
```

## How to run one case

```sh
npm install

npm run build          && npm run check   # case 01, 'dce-only' -> broken
npm run build:minify   && npm run check   # case 01, true       -> correct here
npm run build:nominify && npm run check   # case 01, false      -> correct
npm run build:packages && npm run check   # case 05, real packages -> broken
```

Those five scripts are all there is: `build`, `build:minify` and `build:nominify` run the first case
in the three minify modes, `build:packages` runs the real package case, and `cases` runs everything.
Any other case is built by naming its directory.

`npm run check` reads the built file and looks for the problem. It prints the broken code and exits
with code 1 when the bug is there, and with code 0 when the output is correct. Any other case can be
built directly:

```sh
node build.mjs cases/02-broken-let-instead-of-var dce-only && npm run check
```

Builds go to `dist/`, which is not in the repository. The committed results live next to each case.
`npm run cases` also fails if a case stops matching the verdict in its own directory name.

## Which settings are affected

| `output.minify` | case 1 | case 9, real packages |
| --------------- | ------ | --------------------- |
| `'dce-only'` | broken | broken |
| `true` | correct | broken |
| `false` | correct | correct |

With `true` the name shortening step renames bindings, and in the small case that happens to move
the two names apart. In a large chunk it does not, so a normal production build is broken.

If you use Vite, `build.minify` maps to these values. The default `'oxc'` maps to `true` and
`build.minify: false` maps to `'dce-only'`, so a build without minification is broken as well. Only
`'esbuild'` and `'terser'` map to `false`.

## Why this matters

Nothing in the build points at a problem. The code runs, and it fails only in the browser.

It was found because the Enter key stopped working in a Jodit based editor. The damaged module is
the first thing that the Enter handler calls. Jodit catches the error inside its own event system,
so the console stays empty, and by then the handler has already told the browser not to insert a
line break. The result is that Enter does nothing at all, with no error anywhere. Getting from a
report about a keyboard key to the bundler took a long time.

Case 04 is the shape reported in [rolldown issue 9204](https://github.com/rolldown/rolldown/issues/9204),
which was closed without a reproduction. It still reproduces on the current release.

[EXPLANATION.md](./EXPLANATION.md) follows the variable through the build step by step.

## Files

| File | What it does |
| ---- | ------------ |
| `cases/` | one directory per case, with its input and its build result |
| `build.mjs` | builds one case, takes the case directory and the minify mode |
| `check.mjs` | reads the last build and reports whether the declaration was removed |
| `detect.mjs` | the check itself, shared by `check.mjs` and `run-all.mjs` |
| `run-all.mjs` | builds every case, writes the results, prints the table |

## Versions

```
rolldown  1.2.5
jodit     4.13.3
notistack 3.0.2
node      24.14.0
OS        Windows 11
```

Versions are pinned in `package.json` and `package-lock.json`, so the cases do not drift. The same
result was measured on rolldown 1.1.5, which is where it was first seen, and on 1.2.5, the current
release.
