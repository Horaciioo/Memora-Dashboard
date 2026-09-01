import 'server-only'

import crypto from 'crypto'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { readDate, readNumberValue, readText } from '@/core/lib/forms/values'
import { reachableSession } from '@/core/services/recruitment/RecruitmentService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { ACADEMY_SETTINGS } from '@/declarations/configurations/settings'
import { INTEGRATION_LINK_FIELD_COPY } from '@/declarations/onboarding/copy'
import { INTEGRATION_LINK_KIND_REGISTRY } from '@/declarations/onboarding/registries'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type { IntegrationLinkView } from '@/types/onboarding'
import { IntegrationLinkKinds } from '@/utils/constants/integration'
import type { IntegrationLinkKindName } from '@/utils/constants/integration'

// Entropy of a public token, wide enough that guessing one is hopeless
const TOKEN_BYTES = 24

// A day, in milliseconds
const DAY_IN_MS = 86_400_000

/**
 * Map a link row to its display shape
 * @param {Object} row - Link row
 * @return {IntegrationLinkView} - Display link
 */

export const toLinkView = (row: {
  id: string
  kind: IntegrationLinkKindName
  token: string
  expiresAt: Date
  uses: number
  maxUses: number | null
}): IntegrationLinkView => ({
  id: row.id,
  kind: row.kind,
  token: row.token,
  expiresAt: row.expiresAt.toISOString(),
  uses: row.uses,
  maxUses: row.maxUses,
  usable: row.expiresAt > new Date() && row.uses < (row.maxUses ?? Number.POSITIVE_INFINITY),
})

/**
 * Read the link a campaign hands out, if it has been emitted
 * @param {string} recruitmentSessionId - Campaign identifier
 * @return {Promise<IntegrationLinkView | null>} - Emitted link
 */

export const readLink = async (
  recruitmentSessionId: string
): Promise<IntegrationLinkView | null> => {
  const row = await prisma.integrationInvite.findUnique({ where: { recruitmentSessionId } })

  return row ? toLinkView(row) : null
}

/**
 * Declarations of the emission form. The creator, the function and the academy
 * session are never asked: a campaign already names all three
 * @return {FieldDefinition[]} - Field declarations
 */

export const linkFields = (): FieldDefinition[] => [
  {
    name: 'kind',
    kind: 'select',
    label: INTEGRATION_LINK_FIELD_COPY.kind,
    required: true,
    options: INTEGRATION_LINK_KIND_REGISTRY.keys.map((key) => ({
      value: key,
      label: INTEGRATION_LINK_KIND_REGISTRY.label(key),
      hint: INTEGRATION_LINK_KIND_REGISTRY.get(key).hint,
      accent: INTEGRATION_LINK_KIND_REGISTRY.get(key).accent,
    })),
    mark: 'dot',
  },
  {
    name: 'expiresAt',
    kind: 'date',
    label: INTEGRATION_LINK_FIELD_COPY.expiresAt,
    hint: INTEGRATION_LINK_FIELD_COPY.expiresAtHint,
    span: 'half',
  },
  {
    name: 'maxUses',
    kind: 'number',
    label: INTEGRATION_LINK_FIELD_COPY.maxUses,
    hint: INTEGRATION_LINK_FIELD_COPY.maxUsesHint,
    min: 1,
    span: 'half',
  },
]

/**
 * Hand out the link of a campaign, its targets read from the campaign itself.
 * A campaign only ever carries one link, so a second call replaces the spent one
 * @param {string} recruitmentSessionId - Campaign identifier
 * @param {FormValues} values - Parsed body
 * @param {AccessScope} scope - Creator perimeter
 * @param {string} actorId - Member handing it out
 * @return {Promise<IntegrationLinkView>} - Emitted link
 */

export const emitLink = async (
  recruitmentSessionId: string,
  values: FormValues,
  scope: AccessScope,
  actorId: string
): Promise<IntegrationLinkView> => {
  const session = await reachableSession(recruitmentSessionId, scope)

  const kind = (readText(values, 'kind') ?? IntegrationLinkKinds.Account) as IntegrationLinkKindName
  const expiresAt =
    readDate(values, 'expiresAt') ??
    new Date(Date.now() + ACADEMY_SETTINGS.inviteExpiryDays * DAY_IN_MS)

  // The campaign names the creator, the function and the promotion it feeds
  const data = {
    kind,
    youtuberId: session.youtuberId,
    functionId: session.functionId,
    sessionId: INTEGRATION_LINK_KIND_REGISTRY.get(kind).enrolsAcademy
      ? session.academySessionId
      : null,
    expiresAt,
    maxUses: readNumberValue(values, 'maxUses'),
    createdById: actorId,
  }

  const row = await prisma.integrationInvite.upsert({
    where: { recruitmentSessionId },
    update: { ...data, token: crypto.randomBytes(TOKEN_BYTES).toString('base64url'), uses: 0 },
    create: {
      ...data,
      recruitmentSessionId,
      token: crypto.randomBytes(TOKEN_BYTES).toString('base64url'),
    },
  })

  // The step that hands out the form is cleared by the act of handing it out
  await prisma.recruitmentStep.updateMany({
    where: { sessionId: recruitmentSessionId, emitsInvite: true, doneAt: null },
    data: { doneAt: new Date() },
  })

  return toLinkView(row)
}

/**
 * Close the link of a campaign, the accounts it already opened staying untouched
 * @param {string} recruitmentSessionId - Campaign identifier
 * @param {AccessScope} scope - Creator perimeter
 * @return {Promise<void>} - Revoked
 */

export const revokeLink = async (
  recruitmentSessionId: string,
  scope: AccessScope
): Promise<void> => {
  await reachableSession(recruitmentSessionId, scope)

  const row = await prisma.integrationInvite.findUnique({ where: { recruitmentSessionId } })
  if (!row) throw notFound()

  await prisma.integrationInvite.delete({ where: { id: row.id } })
}
