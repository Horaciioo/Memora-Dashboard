import 'server-only'

import { prisma } from '@/core/lib/db'
import { forbidden, notFound } from '@/core/lib/errors'
import { toPublicView } from '@/core/lib/unban/publicView'
import { findContestCreator } from '@/core/services/unban/contest/creator'
import type { UnbanIdentity } from '@/core/lib/unban/ticket'
import type { PublicRequestView } from '@/types/unban'

// What a requester may read of their own request, never notes or deciders
const OWN_SELECT = {
  reference: true,
  status: true,
  submittedAt: true,
  statusChangedAt: true,
  decidedAt: true,
  reviewNote: true,
  answers: true,
} as const

/**
 * Newest request an account filed with a creator
 * @param {string} youtuberId - Creator
 * @param {UnbanIdentity | null} identity - Account proven by the browser
 * @return {Promise<PublicRequestView | null>} - View, null when nothing was filed
 */

export const ownRequestView = async (
  youtuberId: string,
  creatorName: string,
  identity: UnbanIdentity | null
): Promise<PublicRequestView | null> => {
  if (!identity) return null

  const request = await prisma.unbanRequest.findFirst({
    where: { youtuberId, discordId: identity.discordId },
    orderBy: { submittedAt: 'desc' },
    select: OWN_SELECT,
  })

  return request ? toPublicView(request, creatorName) : null
}

/**
 * Follow-up for the refresh route, a refusal looks the same whatever the reason
 * @param {string} slug - Creator segment from the address
 * @param {UnbanIdentity | null} identity - Account proven by the browser
 * @return {Promise<PublicRequestView>} - View
 */

export const readFollowUp = async (
  slug: string,
  identity: UnbanIdentity | null
): Promise<PublicRequestView> => {
  const creator = await findContestCreator(slug)
  if (!creator) throw notFound()

  const view = await ownRequestView(creator.id, creator.name, identity)
  if (!view) throw forbidden()

  return view
}
