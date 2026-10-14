import 'server-only'

import { isAwaitingRecruitment } from '@/core/lib/academy/recruitmentGate'
import { prisma } from '@/core/lib/db'
import { conflict } from '@/core/lib/errors'
import { ACADEMY_COPY } from '@/declarations/academy/copy'

/**
 * Whether a promotion still waits for its recruitment to end
 * @param {string} sessionId - Promotion identifier
 * @return {Promise<boolean>} - Waiting on the campaign
 */

export const awaitsRecruitment = async (sessionId: string): Promise<boolean> => {
  const row = await prisma.academySession.findUnique({
    where: { id: sessionId },
    select: { status: true, recruitmentSession: { select: { status: true } } },
  })

  return row ? isAwaitingRecruitment(row.status, row.recruitmentSession?.status ?? null) : false
}

/**
 * Refuse to launch a promotion while its recruitment runs
 * @param {string} sessionId - Promotion identifier
 * @return {Promise<void>} - Throws while the campaign runs
 */

export const assertRecruitmentOver = async (sessionId: string): Promise<void> => {
  if (await awaitsRecruitment(sessionId)) throw conflict(ACADEMY_COPY.launchAwaitingRecruitment)
}
