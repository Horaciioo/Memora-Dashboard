import { prisma } from '@/core/lib/db'
import { systemFailure } from '@/core/lib/errors'
import { createPublicRoute } from '@/core/lib/http/route'
import { APP_VERSION } from '@/declarations/app'
import { TIMEOUT_SETTINGS } from '@/declarations/configurations/settings'

export const dynamic = 'force-dynamic'

export const GET = createPublicRoute({
  descriptor: { summary: 'Probe availability for external monitors', tags: ['system'] },
  handler: async () => {
    // Database answers in time
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(systemFailure()), TIMEOUT_SETTINGS.externalMs)
    )
    await Promise.race([prisma.$queryRaw`SELECT 1`, timeout]).catch(() => {
      throw systemFailure()
    })

    return { status: 'ok' as const, version: APP_VERSION, timestamp: new Date().toISOString() }
  },
})
