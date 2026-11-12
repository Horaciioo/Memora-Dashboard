import 'server-only'

import { accessStateOf } from '@/core/lib/unban/linkState'
import { issueFillToken } from '@/core/lib/unban/fillToken'
import { identityFor } from '@/core/lib/unban/ticket'
import type { UnbanIdentity, UnbanTicket } from '@/core/lib/unban/ticket'
import { FeatureModes } from '@/declarations/features'
import { discordAvatarUrl } from '@/declarations/access/discord'
import { UNBAN_SETTINGS } from '@/declarations/configurations/settings'
import { readVerdict } from '@/core/services/features/FeatureService'
import { readActive } from '@/core/services/unban/UnbanFormService'
import { findLinkByToken } from '@/core/services/unban/links/public'
import { UNBAN_INTAKE_FEATURE, UnbanLinkStates } from '@/utils/constants/unban'
import { followView } from './follow'
import type { PublicLinkRow } from '@/core/services/unban/links/public'
import type { IntegrationCreator } from '@/types/onboarding'
import type { PublicRequestView, UnbanFormVersionView, UnbanIdentityView } from '@/types/unban'

/**
 * Screen a stranger holding a link is shown
 * @typedef {Object} UnbanScreen
 */

export type UnbanScreen =
  | { kind: 'closed'; note: string | null }
  | { kind: 'unknown' }
  | { kind: 'expired' | 'revoked'; creator: IntegrationCreator }
  | { kind: 'gate'; creator: IntegrationCreator; isOtherAccount: boolean }
  | {
      kind: 'intake'
      creator: IntegrationCreator
      linkId: string
      version: UnbanFormVersionView
      fillToken: string
      identity: UnbanIdentityView | null
    }
  | { kind: 'followUp'; creator: IntegrationCreator; view: PublicRequestView }

/**
 * Account shown back to the person
 * @param {UnbanIdentity | null} identity - Account proven
 * @return {UnbanIdentityView | null} - Display account
 */

const toIdentityView = (identity: UnbanIdentity | null): UnbanIdentityView | null =>
  identity
    ? {
        discordId: identity.discordId,
        name: identity.name,
        avatarUrl: discordAvatarUrl(identity.discordId, identity.avatar),
      }
    : null

/**
 * Screen of a link a person may use, the gate when the proof is missing
 * @param {PublicLinkRow} link - Stored link
 * @param {UnbanIdentity | null} identity - Account proven by the browser
 * @return {Promise<UnbanScreen>} - Screen
 */

const usableScreen = async (
  link: PublicLinkRow,
  identity: UnbanIdentity | null
): Promise<UnbanScreen> => {
  const creator = link.youtuber

  if (accessStateOf(link) === UnbanLinkStates.Used) {
    const view = followView(link, identity)

    // A request that is not theirs asks for the right account
    return view
      ? { kind: 'followUp', creator, view }
      : { kind: 'gate', creator, isOtherAccount: identity !== null }
  }
  if (UNBAN_SETTINGS.requireDiscordIdentity && !identity) {
    return { kind: 'gate', creator, isOtherAccount: false }
  }

  const version = await readActive()

  return {
    kind: 'intake',
    creator,
    linkId: link.id,
    version,
    fillToken: issueFillToken(link.id, version.id),
    identity: toIdentityView(identity),
  }
}

/**
 * What the public page shows for a link and a browser
 * @param {string} token - Secret from the address
 * @param {UnbanTicket | null} ticket - Ticket of the browser
 * @return {Promise<UnbanScreen>} - Screen
 */

export const loadUnbanScreen = async (
  token: string,
  ticket: UnbanTicket | null
): Promise<UnbanScreen> => {
  const verdict = await readVerdict(UNBAN_INTAKE_FEATURE)
  if (verdict.mode !== FeatureModes.On) return { kind: 'closed', note: verdict.note }

  const link = await findLinkByToken(token)
  if (!link) return { kind: 'unknown' }

  const state = accessStateOf(link)
  if (state === UnbanLinkStates.Revoked) return { kind: 'revoked', creator: link.youtuber }
  if (state === UnbanLinkStates.Expired) return { kind: 'expired', creator: link.youtuber }

  return usableScreen(link, identityFor(ticket, token))
}
