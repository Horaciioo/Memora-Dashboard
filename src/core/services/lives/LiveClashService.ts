import 'server-only'

import { prisma } from '@/core/lib/db'
import { invalidInput } from '@/core/lib/errors'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import { LIVE_COPY } from '@/declarations/lives/copy'
import { OPEN_LIVE_STATUSES } from '@/utils/constants/lives'
import type { LivePlatformName } from '@/utils/constants/lives'

/**
 * Refuse a live overlapping another one
 * @param {Object} input - Planned live
 * @param {string} input.youtuberId - Creator
 * @param {LivePlatformName} input.platform - Platform
 * @param {Date} input.startsAt - Planned start
 * @param {Date | null} input.endsAt - Planned end
 * @return {Promise<void>} - Free slot
 */

export const assertNoLiveClash = async ({
  youtuberId,
  platform,
  startsAt,
  endsAt,
}: {
  youtuberId: string
  platform: LivePlatformName
  startsAt: Date
  endsAt: Date | null
}): Promise<void> => {
  // A live without an end lasts its usual duration
  const usual = LIVE_SETTINGS.defaultDurationMinutes * 60_000
  const spanEnd = (start: Date, end: Date | null) => (end ?? new Date(+start + usual)).getTime()

  const open = await prisma.live.findMany({
    where: { youtuberId, platform, status: { in: [...OPEN_LIVE_STATUSES] } },
    select: { plannedStartAt: true, plannedEndAt: true },
  })

  // Back-to-back lives do not overlap
  const clash = open.some(
    (live) =>
      live.plannedStartAt.getTime() < spanEnd(startsAt, endsAt) &&
      startsAt.getTime() < spanEnd(live.plannedStartAt, live.plannedEndAt)
  )
  if (clash) throw invalidInput([{ field: 'startsAt', message: LIVE_COPY.slotTaken }])
}
