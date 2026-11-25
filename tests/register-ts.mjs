// Lets the Node test runner import the site's TypeScript modules directly.
// Node strips the types itself; this hook only adds the `.ts` extension that
// the source omits on relative imports, as the bundler does.
import { registerHooks } from 'node:module'

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (/^\.{1,2}\//.test(specifier) && !/\.[cm]?[jt]s$/.test(specifier)) {
      try {
        return nextResolve(`${specifier}.ts`, context)
      } catch {
        // fall through to the default resolution
      }
    }
    return nextResolve(specifier, context)
  },
})
