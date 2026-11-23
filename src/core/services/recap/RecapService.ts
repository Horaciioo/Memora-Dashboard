import 'server-only'

import { prisma } from '@/core/lib/db'
import { logger } from '@/core/lib/logger'
import { composeThreads } from '@/core/lib/recap/compose'
import { buildDemoRecap } from '@/core/lib/recap/demo'
import { RECAP_SOURCES } from '@/core/services/recap/sources'
import { resolveWindow } from '@/core/services/recap/window'
import { RECAP_SETTINGS } from '@/declarations/configurations/settings'
import { OFFERS_DEMO_RECAP } from '@/declarations/system/environments'
import type { PermissionHelpers } from '@/types/auth'
import type { Recap, RecapContext, RecapDraft, RecapPerson } from '@/types/recap'

/**
 * What a recap is asked for
 * @typedef {Object} RecapRequest
 * @property {string} accountId - Member
 * @property {PermissionHelpers} access - Rights of the member
 * @property {Date | null} from - Start picked by hand, null for the member's own absence
 * @property {boolean} demo - Made-up recap asked for
 */

export interface RecapRequest {
  accountId: string
  access: PermissionHelpers
  from: Date | null
  demo: boolean
}

// A source that fails leaves its own movements out and nothing else
const readSources = async (context: RecapContext): Promise<RecapDraft[]> => {
  const settled = await Promise.allSettled(RECAP_SOURCES.map((source) => source(context)))

  return settled.flatMap((result) => {
    if (result.status === 'fulfilled') return result.value

    logger.warn('[recap] a source failed', result.reason)

    return []
  })
}

// Members behind the movements, in one read
const readDirectory = async (drafts: RecapDraft[]): Promise<Map<string, RecapPerson>> => {
  const ids = [...new Set(drafts.flatMap((draft) => draft.actorIds))]
  const rows = await prisma.account.findMany({
    where: { id: { in: ids } },
    select: { id: true, displayName: true, avatarUrl: true },
  })

  return new Map(
    rows.map((row) => [row.id, { id: row.id, name: row.displayName, avatar: row.avatarUrl }])
  )
}

/**
 * Read what happened around one member while they were away
 * @param {RecapRequest} request - Who asks, from when
 * @return {Promise<Recap>} - Recap
 */

export const readRecap = async ({
  accountId,
  access,
  from,
  demo,
}: RecapRequest): Promise<Recap> => {
  const now = new Date()

  if (demo && OFFERS_DEMO_RECAP) return buildDemoRecap(now)

  const window = await resolveWindow(accountId, from, now)
  const empty: Recap = {
    since: (window?.since ?? now).toISOString(),
    until: now.toISOString(),
    isAway: false,
    isDemo: false,
    demoAvailable: OFFERS_DEMO_RECAP,
    threads: [],
  }

  // Not gone long enough, nothing to welcome back
  if (!window || (!from && !window.isAway)) return empty

  const drafts = await readSources({ accountId, access, since: window.since, until: window.until })
  const directory = await readDirectory(drafts)

  return {
    ...empty,
    isAway: window.isAway,
    threads: composeThreads(drafts, directory, {
      threads: RECAP_SETTINGS.maxThreads,
      beats: RECAP_SETTINGS.maxBeats,
      people: RECAP_SETTINGS.maxPeople,
    }),
  }
}
