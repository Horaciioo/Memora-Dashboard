import { register } from 'node:module'

// Lets plain node read the app declarations through their @/ aliases
register('./resolve-hook.mjs', import.meta.url)
