import 'server-only'

import { prisma } from '@/core/lib/db'
import { forbidden, invalidInput, notFound } from '@/core/lib/errors'
import { readCheck } from '@/core/services/identity/IdentityCheckService'
import { notify } from '@/core/services/system/NotificationService'
import { AUTH_SETTINGS, FORM_SETTINGS } from '@/declarations/configurations/settings'
import { IDENTITY_COPY } from '@/declarations/onboarding/welcome'
import { MemberRoles, MemberStatuses } from '@/utils/constants/hierarchy'
import { IdentityCheckStatuses } from '@/utils/constants/identity'

// Separates the pseudonyms typed one after the other
const NAME_SEPARATOR = ' / '

/**
 * Applications an accepted pseudonym may point at
 * @param {string[]} names - Pseudonyms typed
 * @return {Promise<{ id: string, sessionId: string }[]>} - Accepted, still unconfirmed
 */

const matchCandidates = async (names: string[]): Promise<{ id: string; sessionId: string }[]> =>
  prisma.recruitmentCandidate.findMany({
    where: {
      outcome: { admits: true },
      OR: names.map((name) => ({ displayName: { equals: name, mode: 'insensitive' as const } })),
      NOT: { admission: { confirmedAt: { not: null } } },
    },
    select: { id: true, sessionId: true },
    take: 2,
  })

/**
 * Members who must hear about an identifier to correct
 * @param {string | null} sessionId - Recruitment session the application belongs to
 * @return {Promise<string[]>} - Recipients
 */

const responsablesOf = async (sessionId: string | null): Promise<string[]> => {
  // Only the campaigns that opened their accounts can have this problem
  const sessions = sessionId
    ? [sessionId]
    : (
        await prisma.recruitmentSession.findMany({
          where: { accountsActivatedAt: { not: null } },
          select: { id: true },
        })
      ).map((row) => row.id)

  const rows = await prisma.recruitmentResponsable.findMany({
    where: { sessionId: { in: sessions } },
    select: { accountId: true },
  })
  if (rows.length > 0) return [...new Set(rows.map((row) => row.accountId))]

  // Nobody carries the campaign, administration steps in
  const admins = await prisma.account.findMany({
    where: { role: MemberRoles.Admin, status: MemberStatuses.Active, frozenAt: null },
    select: { id: true },
  })

  return admins.map((row) => row.id)
}

/**
 * Hand the case to the responsables
 * @param {string} id - Check identifier
 * @param {string[]} names - Pseudonyms typed
 * @return {Promise<void>} - Escalated
 */

const escalate = async (id: string, names: string[]): Promise<void> => {
  const matches = await matchCandidates(names)
  // Several applications under one pseudonym are left to the responsable
  const candidate = matches.length === 1 ? matches[0] : null

  await prisma.identityCheck.update({
    where: { id },
    data: {
      status: IdentityCheckStatuses.Escalated,
      candidateId: candidate?.id ?? null,
    },
  })

  await notify({
    kind: 'IdentityAlert',
    recipients: await responsablesOf(candidate?.sessionId ?? null),
    target: 'identity',
    targetId: id,
    subject: names.at(-1) ?? IDENTITY_COPY.unnamed,
  })
}

/**
 * Take the pseudonym someone types after saying the account is not theirs
 * @param {string} id - Check identifier
 * @param {string} typed - Pseudonym
 * @return {Promise<'retry' | 'escalated'>} - Asked again, or a responsable called
 */

export const submitPseudo = async (id: string, typed: string): Promise<'retry' | 'escalated'> => {
  const name = typed.trim().slice(0, FORM_SETTINGS.shortTextMaxLength)
  if (!name) throw invalidInput([{ field: 'name', message: IDENTITY_COPY.nameRequired }])

  const check = await readCheck(id)
  if (!check) throw notFound()
  if (check.status === IdentityCheckStatuses.Escalated) return 'escalated'
  if (check.status !== IdentityCheckStatuses.Open) throw forbidden()

  const row = await prisma.identityCheck.findUniqueOrThrow({
    where: { id },
    select: { typedName: true },
  })
  const names = [...(row.typedName ? row.typedName.split(NAME_SEPARATOR) : []), name]
  const attempts = check.attempts + 1

  await prisma.identityCheck.update({
    where: { id },
    data: { attempts, typedName: names.join(NAME_SEPARATOR) },
  })

  // The same answer is not asked for forever
  if (attempts < AUTH_SETTINGS.identityAttempts) return 'retry'

  await escalate(id, names)

  return 'escalated'
}
