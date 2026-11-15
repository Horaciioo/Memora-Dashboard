import 'server-only'

import { prisma } from '@/core/lib/db'
import { conflict, forbidden, invalidInput, notFound, systemFailure } from '@/core/lib/errors'
import { checkSubmission, sealAnswers } from '@/core/lib/unban/answers'
import { checkFillToken, FILL_REFUSALS } from '@/core/lib/unban/fillToken'
import { createReference } from '@/core/lib/unban/token'
import { encryptField } from '@/core/lib/crypto'
import { isFeatureOn } from '@/core/services/features/FeatureService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { readVersion } from '@/core/services/unban/UnbanFormService'
import { findContestCreator } from '@/core/services/unban/contest/creator'
import { UNBAN_ERRORS, UNBAN_FORM_COPY, UNBAN_PUBLIC_COPY } from '@/declarations/unban/copy'
import {
  UNBAN_FORM_FIELDS,
  UNBAN_INTAKE_FEATURE,
  UNBAN_TOKEN,
  UnbanStatuses,
} from '@/utils/constants/unban'
import { alertHandlers } from './alerts'
import { readEmail } from './email'
import { mailRequester } from './mails'
import { MailKinds } from '@/utils/constants/mail'
import { journalEvent } from './journal'
import { filingIdentity } from './identity'
import type { UnbanIdentity, UnbanTicket } from '@/core/lib/unban/ticket'
import type { IntegrationCreator } from '@/types/onboarding'
import type { SubmitOutcome } from '@/types/unban'
import type { UnbanAnswer } from '@/declarations/unban/form'
import type { Prisma } from '@prisma/client'

/**
 * What a person sends when they file
 * @typedef {Object} SubmitInput
 * @property {string} slug - Creator segment from the address
 * @property {Record<string, unknown>} body - Answers and reserved fields
 * @property {UnbanTicket | null} ticket - Ticket of the browser
 */

export interface SubmitInput {
  slug: string
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
 * Creator that still takes requests, an unknown one looks the same from outside
 * @param {string} slug - Creator segment from the address
 * @return {Promise<IntegrationCreator>} - Creator
 */

const openCreator = async (slug: string): Promise<IntegrationCreator> => {
  const creator = await findContestCreator(slug)
  if (!creator) throw notFound()

  return creator
}

/**
 * Version the person was served, refused when the proof is missing or too quick
 * @param {string | undefined} fillToken - Hidden field
 * @param {string} youtuberId - Creator being filed
 * @return {Promise<ReturnType<typeof readVersion>>} - Version served
 */

const servedVersion = async (fillToken: string | undefined, youtuberId: string) => {
  const { formVersionId, refusal } = checkFillToken(fillToken, youtuberId)
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
 * Write the request, under a lock on the creator so two sends cannot both open
 * @param {IntegrationCreator} creator - Creator being filed
 * @param {UnbanIdentity} identity - Account filing
 * @param {{ formVersionId: string, answers: UnbanAnswer[], email: string }} filing - Version, answers and address
 * @return {Promise<{ outcome: SubmitOutcome, created: { id: string, youtuberId: string, discordName: string } | null }>} - Outcome and the request when new
 */

const fileRequest = (
  creator: IntegrationCreator,
  identity: UnbanIdentity,
  filing: { formVersionId: string; answers: UnbanAnswer[]; email: string }
) =>
  prisma.$transaction(async (tx) => {
    // The second of two simultaneous sends waits here, then finds the first one's request
    await tx.$queryRaw`SELECT id FROM youtubers WHERE id = ${creator.id} FOR UPDATE`
    // A send that left before the switch was cut and landed after it
    if (!(await isFeatureOn(UNBAN_INTAKE_FEATURE))) throw forbidden(UNBAN_ERRORS.intakeClosed)

    const open = await tx.unbanRequest.findFirst({
      where: {
        youtuberId: creator.id,
        discordId: identity.discordId,
        status: { in: OPEN_STATUSES },
      },
    })
    if (open) throw conflict(UNBAN_PUBLIC_COPY.alreadyOpen)

    const reference = await freeReference(tx)
    const created = await tx.unbanRequest.create({
      data: {
        reference,
        youtuberId: creator.id,
        formVersionId: filing.formVersionId,
        discordId: identity.discordId,
        discordName: identity.name,
        discordAvatar: identity.avatar,
        email: encryptField(filing.email),
        answers: sealAnswers(filing.answers),
      },
    })

    return { outcome: { reference }, created }
  })

/**
 * Answer a robot as if it had succeeded, and say so in the journal
 * @param {IntegrationCreator} creator - Creator being filed
 * @return {Promise<SubmitOutcome>} - Decoy outcome
 */

const decoy = async (creator: IntegrationCreator): Promise<SubmitOutcome> => {
  await recordEvent({
    eventType: 'AccessDenied',
    level: 'Warning',
    targetType: 'youtuber',
    targetId: creator.id,
    summary: UNBAN_FORM_COPY.trapFilled,
  })

  return { reference: createReference() }
}

/**
 * File a request with a creator
 * @param {SubmitInput} input - What the person sent
 * @return {Promise<SubmitOutcome>} - Reference
 */

export const submitRequest = async ({
  slug,
  body,
  ticket,
}: SubmitInput): Promise<SubmitOutcome> => {
  const creator = await openCreator(slug)
  const { answers, reserved } = splitBody(body)

  // A filled bait means a robot
  if (reserved[UNBAN_FORM_FIELDS.trap]) return decoy(creator)

  const identity = filingIdentity(ticket, slug, reserved)
  const email = readEmail(reserved)
  const version = await servedVersion(
    String(reserved[UNBAN_FORM_FIELDS.fillToken] ?? ''),
    creator.id
  )

  const checked = checkSubmission(version.snapshot, answers)
  if (checked.issues.length > 0) throw invalidInput(checked.issues)

  const { outcome, created } = await fileRequest(creator, identity, {
    formVersionId: version.id,
    answers: checked.answers,
    email,
  })

  // After the commit, a failure here never undoes the filing
  await recordEvent({
    ...journalEvent('UnbanSubmitted', 'déposé', created, [], {
      payload: { reference: outcome.reference },
    }),
    targetType: 'unbanRequest',
    targetId: created.id,
  }).catch(() => undefined)
  await alertHandlers(created)
  mailRequester(MailKinds.UnbanReceived, created)

  return outcome
}
