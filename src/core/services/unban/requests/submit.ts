import 'server-only'

import { prisma } from '@/core/lib/db'
import { conflict, forbidden, invalidInput, notFound, systemFailure } from '@/core/lib/errors'
import { checkSubmission, sealAnswers } from '@/core/lib/unban/answers'
import { checkFillToken, FILL_REFUSALS } from '@/core/lib/unban/fillToken'
import { accessStateOf } from '@/core/lib/unban/linkState'
import { createReference } from '@/core/lib/unban/token'
import { recordEvent } from '@/core/services/system/ActivityService'
import { readVersion } from '@/core/services/unban/UnbanFormService'
import { findLinkByToken } from '@/core/services/unban/links/public'
import { UNBAN_FORM_COPY, UNBAN_PUBLIC_COPY } from '@/declarations/unban/copy'
import {
  UNBAN_FORM_FIELDS,
  UNBAN_TOKEN,
  UnbanLinkStates,
  UnbanStatuses,
} from '@/utils/constants/unban'
import { filingIdentity } from './identity'
import type { UnbanIdentity, UnbanTicket } from '@/core/lib/unban/ticket'
import type { PublicLinkRow } from '@/core/services/unban/links/public'
import type { SubmitOutcome } from '@/types/unban'
import type { UnbanAnswer } from '@/declarations/unban/form'
import type { Prisma } from '@prisma/client'

/**
 * What a person sends when they file
 * @typedef {Object} SubmitInput
 * @property {string} token - Link secret from the address
 * @property {Record<string, unknown>} body - Answers and reserved fields
 * @property {UnbanTicket | null} ticket - Ticket of the browser
 */

export interface SubmitInput {
  token: string
  body: Record<string, unknown>
  ticket: UnbanTicket | null
}

// Request statuses that still count as open
const OPEN_STATUSES = [UnbanStatuses.Pending, UnbanStatuses.InReview]

/**
 * Split the reserved fields from the answers
 * @param {Record<string, unknown>} body - Raw body
 * @return {{ answers: Record<string, unknown>, reserved: Record<string, unknown> }} - Both halves
 */

const splitBody = (
  body: Record<string, unknown>
): { answers: Record<string, unknown>; reserved: Record<string, unknown> } => {
  const names: string[] = Object.values(UNBAN_FORM_FIELDS)
  const entries = Object.entries(body)

  return {
    answers: Object.fromEntries(entries.filter(([key]) => !names.includes(key))),
    reserved: Object.fromEntries(entries.filter(([key]) => names.includes(key))),
  }
}

/**
 * Link that still accepts a filing, a dead or unknown one looks the same from outside
 * @param {string} token - Secret from the address
 * @return {Promise<PublicLinkRow>} - Open link
 */

const openLink = async (token: string): Promise<PublicLinkRow> => {
  const link = await findLinkByToken(token)
  if (!link) throw notFound()

  const state = accessStateOf(link)
  if (state === UnbanLinkStates.Revoked || state === UnbanLinkStates.Expired) throw forbidden()

  return link
}

/**
 * Version the person was served, refused when the proof is missing or too quick
 * @param {string | undefined} fillToken - Hidden field
 * @param {string} linkId - Link being submitted
 * @return {Promise<ReturnType<typeof readVersion>>} - Version served
 */

const servedVersion = async (fillToken: string | undefined, linkId: string) => {
  const { formVersionId, refusal } = checkFillToken(fillToken, linkId)
  if (refusal === FILL_REFUSALS.TooFast) {
    throw invalidInput([{ field: UNBAN_FORM_FIELDS.fillToken, message: UNBAN_PUBLIC_COPY.tooFast }])
  }
  if (!formVersionId) throw forbidden()

  return readVersion(formVersionId)
}

/**
 * Reference no other request carries
 * @param {Prisma.TransactionClient} tx - Transaction
 * @return {Promise<string>} - Free reference
 */

const freeReference = async (tx: Prisma.TransactionClient): Promise<string> => {
  for (let attempt = 0; attempt < UNBAN_TOKEN.referenceAttempts; attempt++) {
    const reference = createReference()
    if (!(await tx.unbanRequest.findUnique({ where: { reference } }))) return reference
  }

  throw systemFailure()
}

/**
 * Write the request and spend the link, under a lock on the link
 * @param {PublicLinkRow} link - Link being submitted
 * @param {UnbanIdentity} identity - Account filing
 * @param {{ formVersionId: string, answers: UnbanAnswer[] }} filing - Version and answers
 * @return {Promise<{ outcome: SubmitOutcome, isNew: boolean }>} - Outcome and whether it is new
 */

const fileRequest = (
  link: PublicLinkRow,
  identity: UnbanIdentity,
  filing: { formVersionId: string; answers: UnbanAnswer[] }
) =>
  prisma.$transaction(async (tx) => {
    // The second of two simultaneous sends waits here, then finds the first one's request
    await tx.$queryRaw`SELECT id FROM unban_links WHERE id = ${link.id} FOR UPDATE`
    const fresh = await tx.unbanLink.findUniqueOrThrow({
      where: { id: link.id },
      include: { request: true },
    })
    const expiresAt = fresh.expiresAt.toISOString()

    if (fresh.request) {
      if (fresh.request.discordId !== identity.discordId) throw conflict(UNBAN_PUBLIC_COPY.linkUsed)

      return {
        outcome: { reference: fresh.request.reference, linkExpiresAt: expiresAt },
        isNew: false,
      }
    }
    if (accessStateOf(fresh) !== UnbanLinkStates.Active) throw forbidden()

    const open = await tx.unbanRequest.findFirst({
      where: {
        youtuberId: link.youtuberId,
        discordId: identity.discordId,
        status: { in: OPEN_STATUSES },
      },
    })
    if (open) throw conflict(UNBAN_PUBLIC_COPY.alreadyOpen)

    const reference = await freeReference(tx)
    await tx.unbanRequest.create({
      data: {
        reference,
        linkId: link.id,
        youtuberId: link.youtuberId,
        formVersionId: filing.formVersionId,
        discordId: identity.discordId,
        discordName: identity.name,
        discordAvatar: identity.avatar,
        answers: sealAnswers(filing.answers),
      },
    })
    await tx.unbanLink.update({ where: { id: link.id }, data: { usedAt: new Date() } })

    return { outcome: { reference, linkExpiresAt: expiresAt }, isNew: true }
  })

/**
 * Answer a robot as if it had succeeded, and say so in the journal
 * @param {PublicLinkRow} link - Link being submitted
 * @return {Promise<SubmitOutcome>} - Decoy outcome
 */

const decoy = async (link: PublicLinkRow): Promise<SubmitOutcome> => {
  await recordEvent({
    eventType: 'AccessDenied',
    level: 'Warning',
    targetType: 'unbanLink',
    targetId: link.id,
    summary: UNBAN_FORM_COPY.trapFilled,
  })

  return { reference: createReference(), linkExpiresAt: link.expiresAt.toISOString() }
}

/**
 * File a request on a link
 * @param {SubmitInput} input - What the person sent
 * @return {Promise<SubmitOutcome>} - Reference and expiry
 */

export const submitRequest = async ({
  token,
  body,
  ticket,
}: SubmitInput): Promise<SubmitOutcome> => {
  const link = await openLink(token)
  const { answers, reserved } = splitBody(body)

  // A filled bait means a robot
  if (reserved[UNBAN_FORM_FIELDS.trap]) return decoy(link)

  const identity = filingIdentity(link, ticket, token, reserved)
  const version = await servedVersion(String(reserved[UNBAN_FORM_FIELDS.fillToken] ?? ''), link.id)

  const checked = checkSubmission(version.snapshot, answers)
  if (checked.issues.length > 0) throw invalidInput(checked.issues)

  const { outcome, isNew } = await fileRequest(link, identity, {
    formVersionId: version.id,
    answers: checked.answers,
  })

  // After the commit, a failure here never undoes the filing
  if (isNew) {
    await recordEvent({
      eventType: 'UnbanSubmitted',
      targetType: 'unbanRequest',
      summary: outcome.reference,
      payload: { reference: outcome.reference },
    }).catch(() => undefined)
  }

  return outcome
}
