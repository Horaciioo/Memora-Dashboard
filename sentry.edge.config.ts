// Sentry on the edge runtime, loaded by src/instrumentation.ts.
// Shares the hardened init of the Node.js runtime, see sentry.server.config.ts.

import { initialiseSentry } from '@/core/lib/sentry'

initialiseSentry()
