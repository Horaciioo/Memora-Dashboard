import { captureClientErrors } from '@/core/lib/nexus/observe/clientCapture'
import { initialiseSentry } from '@/core/lib/sentry'

initialiseSentry()
captureClientErrors()
