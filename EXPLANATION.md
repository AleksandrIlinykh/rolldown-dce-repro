# What happens inside the build

The output looks like the letters got scrambled. They did not. Two modules end up in one file, two
variables end up with the same name, and one of them wins.

## Step 0: what a bundler does

Three different jobs are easy to mix up.

**Bundling** joins many files into one. Every module keeps its own scope in the source, but after
bundling they all live in the same file, so the bundler has to keep track of which name belongs to
which module.

**Dead code elimination** removes code that nobody uses. Without it every unused part of every
library would end up in the bundle.

**Name shortening** renames local variables to one or two letters, which saves a lot of bytes on a
large bundle.

The first two jobs are the ones that fail here. Name shortening only makes the result harder to
read.

## Step 1: two modules, one name

`trigger.js` declares `n` at the top level. `victim.js` declares its own `n` inside a function.
These are two different variables in two different scopes, and in normal JavaScript they never meet.

After bundling both are in the same file:

```js
//#region trigger.js
let n = 1;
//#endregion
//#region victim.js
function factory(get) {
  const read = function (a = n.IS_BLOCK) { return a }
  var n = get(81937);
  return read;
}
//#endregion
```

This is still correct. The `n` inside `factory` shadows the outer one, so `read` sees the local
value. Everything depends on the bundler knowing that.

## Step 2: the read is attributed to the wrong module

The only read of the local `n` sits in a **default parameter value**, `a = n.IS_BLOCK`. Code in a
default value does not run when the function is created. It runs later, on every call where the
argument is missing.

That read is resolved against `trigger.js` instead of against the local variable. From the
analyzer's side the local `n` is then declared and never used, so it is dead and can go.

Case 03 in `cases/` shows that this is the right way round. There the variable is also returned from
the function, so it cannot be called unused, and the declaration still disappears: the value is
folded into the return statement while the default value keeps reading the other module's `n`. The
wrong resolution comes first, everything else follows from it.

Position matters too. If `var n` is written above the function that reads it, the output is
correct. The bug needs the declaration to sit below the reader, which is normal in code that a
minifier has already rewritten.

## Step 3: the declaration goes, the call stays

The right side, `get(81937)`, is a function call, and a call can have side effects. So dead code
elimination does the thing that is normally correct: it removes the variable and keeps the call.

```js
  get(81937);   // was: var n = get(81937)
```

Now `read` still says `n.IS_BLOCK`, but there is no local `n` any more.

## Step 4: the name resolves to the wrong variable

Here is where the two modules meet. The local `n` is gone, so `n` inside `read` now points at the
only other `n` in the file, the one from `trigger.js`. That variable holds the number `1`.

So `n.IS_BLOCK` is `undefined`, and the code that expected an object gets a number instead.

This also explains the two strange conditions.

**Why renaming either side fixes it.** With different names there is nothing to resolve to. The
read becomes a free variable, which is easy to spot, and in our real case it would have been a
`ReferenceError` in the first second of testing.

**Why the import order matters.** The module that comes first gets its binding placed first. Only in
that order does the leftover read land on the other module's variable.

## Step 5: why it is so hard to see

Nothing fails during the build. A name that is not declared in the current scope is normal
JavaScript, it just means "look further out". The bundler does exactly that and finds a match.

At runtime you get a value of the wrong type instead of a missing variable, so the error message
points at the property, not at the variable. In the real case the message was
`Cannot read properties of undefined (reading 'test')`, which says nothing about a bundler.

With `output.minify: true` the picture gets worse. Name shortening renames both bindings, so the
name in the broken code is different in every build. Searching for it does not help.

## Step 6: what it did to a real application

The damaged module was `getBlockWrapper` from Jodit. It finds the block element around the cursor,
and in the whole library it has exactly one caller: the plugin that handles the Enter key. Bold,
lists, tables and paste never touch it, so they kept working.

Then an unlucky detail made the failure silent. The Enter handler runs inside a history transaction
that swallows the exception, so nothing reached the console. By that time the handler had already
told the browser that it would handle Enter itself. The native behaviour was cancelled, the custom
behaviour crashed, and no error was visible. The cursor just stayed where it was, as if the key had
never been pressed.
