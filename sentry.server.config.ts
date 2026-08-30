// Sentry on the Node.js server, loaded by src/instrumentation.ts.
// The options live in src/core/lib/sentry.ts so one hardened init serves every
// runtime: DSN from the environment, sampling bounded, personal data scrubbed.

import { initialiseSentry } from '@/core/lib/sentry'

initialiseSentry()
