import 'server-only'

import { forbidden, notFound } from '@/core/lib/errors'
import { toPublicView } from '@/core/lib/unban/publicView'
import { accessStateOf } from '@/core/lib/unban/linkState'
import { findLinkByToken } from '@/core/services/unban/links/public'
import { UNBAN_SETTINGS } from '@/declarations/configurations/settings'
import { UnbanLinkStates } from '@/utils/constants/unban'
import type { UnbanIdentity } from '@/core/lib/unban/ticket'
import type { PublicLinkRow } from '@/core/services/unban/links/public'
import type { PublicRequestView } from '@/types/unban'

/**
 * Whether the browser may read the request behind a link
 * @param {NonNullable<PublicLinkRow['request']>} request - Request of the link
 * @param {UnbanIdentity | null} identity - Account proven by the browser
 * @return {boolean} - Allowed
 */

const mayFollow = (
  request: NonNullable<PublicLinkRow['request']>,
  identity: UnbanIdentity | null
): boolean => !UNBAN_SETTINGS.requireDiscordIdentity || identity?.discordId === request.discordId

/**
 * Request of a link as its requester reads it, nothing else
 * @param {PublicLinkRow} link - Link with its request
 * @param {UnbanIdentity | null} identity - Account proven by the browser
 * @return {PublicRequestView | null} - View, null when there is nothing to show this browser
 */

export const followView = (
  link: PublicLinkRow,
  identity: UnbanIdentity | null
): PublicRequestView | null => {
  if (accessStateOf(link) !== UnbanLinkStates.Used || !link.request) return null
  if (!mayFollow(link.request, identity)) return null

  return toPublicView(link.request, link.youtuber.name, link.expiresAt)
}

/**
 * Follow-up for the refresh route, a refusal looks the same whatever the reason
 * @param {string} token - Secret from the address
 * @param {UnbanIdentity | null} identity - Account proven by the browser
 * @return {Promise<PublicRequestView>} - View
 */

export const readFollowUp = async (
  token: string,
  identity: UnbanIdentity | null
): Promise<PublicRequestView> => {
  const link = await findLinkByToken(token)
  if (!link) throw notFound()

  const view = followView(link, identity)
  if (!view) throw forbidden()

  return view
}
