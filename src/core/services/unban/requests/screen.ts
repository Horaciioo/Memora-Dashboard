import 'server-only'

import { issueFillToken } from '@/core/lib/unban/fillToken'
import { identityFor } from '@/core/lib/unban/ticket'
import type { UnbanIdentity, UnbanTicket } from '@/core/lib/unban/ticket'
import { FeatureModes } from '@/declarations/features'
import { discordAvatarUrl } from '@/declarations/access/discord'
import { UNBAN_SETTINGS } from '@/declarations/configurations/settings'
import { readVerdict } from '@/core/services/features/FeatureService'
import { readActive } from '@/core/services/unban/UnbanFormService'
import { findContestCreator } from '@/core/services/unban/contest/creator'
import { UNBAN_INTAKE_FEATURE } from '@/utils/constants/unban'
import { ownRequestView } from './follow'
import type { IntegrationCreator } from '@/types/onboarding'
import type { PublicRequestView, UnbanFormVersionView, UnbanIdentityView } from '@/types/unban'

/**
 * Screen a stranger opening a creator's address is shown
 * @typedef {Object} UnbanScreen
 */

export type UnbanScreen =
  | { kind: 'closed'; note: string | null }
  | { kind: 'unknown' }
  | { kind: 'gate'; creator: IntegrationCreator; isOtherAccount: boolean }
  | {
      kind: 'intake'
      creator: IntegrationCreator
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
 * What the public page shows for a creator and a browser
 * @param {string} slug - Creator segment from the address
 * @param {UnbanTicket | null} ticket - Ticket of the browser
 * @return {Promise<UnbanScreen>} - Screen
 */

export const loadUnbanScreen = async (
  slug: string,
  ticket: UnbanTicket | null
): Promise<UnbanScreen> => {
  const verdict = await readVerdict(UNBAN_INTAKE_FEATURE)
  if (verdict.mode !== FeatureModes.On) return { kind: 'closed', note: verdict.note }

  const creator = await findContestCreator(slug)
  if (!creator) return { kind: 'unknown' }

  const identity = identityFor(ticket, slug)

  // A person who already filed follows their request
  const view = await ownRequestView(creator.id, creator.name, identity)
  if (view) return { kind: 'followUp', creator, view }

  if (UNBAN_SETTINGS.requireDiscordIdentity && !identity) {
    return { kind: 'gate', creator, isOtherAccount: false }
  }

  const version = await readActive()

  return {
    kind: 'intake',
    creator,
    version,
    fillToken: issueFillToken(creator.id, version.id),
    identity: toIdentityView(identity),
  }
}
