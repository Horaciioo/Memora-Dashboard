import 'server-only'

import { prisma } from '@/core/lib/db'
import { conflict, notFound } from '@/core/lib/errors'
import { cleanLinkInput } from '@/core/lib/unban/linkInput'
import { createToken, hashToken } from '@/core/lib/unban/token'
import { assertInScope } from '@/core/services/auth/ScopeService'
import { isFeatureOn } from '@/core/services/features/FeatureService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { ROUTES } from '@/declarations/navigation'
import { UNBAN_SETTINGS } from '@/declarations/configurations/settings'
import { UNBAN_ERRORS } from '@/declarations/unban/copy'
import { UNBAN_INTAKE_FEATURE } from '@/utils/constants/unban'
import { revokeLink } from './manage'
import { assertCanLink, expiryAfter, LINK_INCLUDE, loadLink, toLinkView } from './shared'
import type { NewLinkInput } from '@/core/lib/unban/linkInput'
import type { CreatedUnbanLink } from '@/types/unban'
import type { UnbanCaller } from './shared'

/**
 * Store a link and say so in the journal
 * @param {NewLinkInput} input - Checked settings
 * @param {UnbanCaller} caller - Who acts
 * @return {Promise<CreatedUnbanLink>} - Link and its one-time address
 */

const insertLink = async (input: NewLinkInput, caller: UnbanCaller): Promise<CreatedUnbanLink> => {
  const clean = cleanLinkInput(input)
  assertInScope(caller.scope, clean.youtuberId)

  if (!(await isFeatureOn(UNBAN_INTAKE_FEATURE))) throw conflict(UNBAN_ERRORS.intakeClosed)

  const youtuber = await prisma.youtuber.findUnique({ where: { id: clean.youtuberId } })
  if (!youtuber) throw notFound()

  // Only the fingerprint is stored
  const token = createToken()
  const row = await prisma.unbanLink.create({
    data: {
      tokenHash: hashToken(token),
      youtuberId: clean.youtuberId,
      expectedDiscordId: clean.expectedDiscordId,
      label: clean.label,
      expiresAt: expiryAfter(clean.expiryDays),
      createdById: caller.actorId,
    },
    include: LINK_INCLUDE,
  })

  await recordEvent({
    eventType: 'UnbanLinkCreated',
    actorId: caller.actorId,
    targetType: 'unbanLink',
    targetId: row.id,
    summary: youtuber.name,
  })

  return { link: toLinkView(row), path: ROUTES.unbanPublic(token) }
}

/**
 * Make a link a banned person will open once
 * @param {NewLinkInput} input - Settings asked for
 * @param {UnbanCaller} caller - Who acts
 * @return {Promise<CreatedUnbanLink>} - Link and its one-time address
 */

export const createLink = async (
  input: NewLinkInput,
  caller: UnbanCaller
): Promise<CreatedUnbanLink> => {
  assertCanLink(caller)

  return insertLink(input, caller)
}

/**
 * Replace a lost link by a new one with the same settings
 * @param {string} id - Link to replace
 * @param {UnbanCaller} caller - Who acts
 * @param {number} [expiryDays] - Validity of the new link
 * @return {Promise<CreatedUnbanLink>} - New link and its one-time address
 */

export const renewLink = async (
  id: string,
  caller: UnbanCaller,
  expiryDays: number = UNBAN_SETTINGS.defaultExpiryDays
): Promise<CreatedUnbanLink> => {
  const old = await loadLink(id, caller)

  // The request of a used link keeps its own link
  if (old.usedAt) throw conflict(UNBAN_ERRORS.linkUsed)
  // Made first so a refusal never leaves the person without a link
  const created = await insertLink(
    {
      youtuberId: old.youtuberId,
      expiryDays,
      expectedDiscordId: old.expectedDiscordId,
      label: old.label,
    },
    caller
  )
  await revokeLink(id, caller)

  return created
}
