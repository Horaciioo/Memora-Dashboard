import 'server-only'

import { prisma } from '@/core/lib/db'
import { renderMail } from '@/core/lib/mail/render'
import type { MailVariables } from '@/core/lib/mail/render'
import { isMailConfigured, MAIL_CONFIG, MAIL_ENDPOINT } from '@/declarations/mail/config'
import { MAIL_CONSOLE_COPY } from '@/declarations/mail/copy'
import { MAIL_LIMITS, MailStatuses } from '@/utils/constants/mail'
import type { MailKindName, MailStatusName } from '@/utils/constants/mail'

/**
 * What it takes to send one mail
 * @typedef {Object} SendMailInput
 * @property {MailKindName} kind - Mail
 * @property {string} to - Address
 * @property {MailVariables} variables - Words to put in
 * @property {string | null} [requestId] - Request it concerns
 * @property {boolean} [isTest] - Sent from the console
 * @property {string} [idempotencyKey] - Same key, same single send
 */

export interface SendMailInput {
  kind: MailKindName
  to: string
  variables: MailVariables
  requestId?: string | null
  isTest?: boolean
  idempotencyKey?: string
}

/**
 * Outcome of one send
 * @typedef {Object} SendMailResult
 * @property {MailStatusName} status - How it ended
 * @property {string | null} detail - Reason when it did not leave
 */

export interface SendMailResult {
  status: MailStatusName
  detail: string | null
}

/**
 * Keep one line in the journal
 * @param {SendMailInput} input - The send
 * @param {SendMailResult & { providerId?: string | null }} result - Outcome
 * @return {Promise<void>} - Written, a failure here is swallowed
 */

const writeJournal = async (
  input: SendMailInput,
  result: SendMailResult & { providerId?: string | null }
): Promise<void> => {
  try {
    await prisma.mailDelivery.create({
      data: {
        kind: input.kind,
        requestId: input.requestId ?? null,
        reference: input.variables.reference,
        status: result.status,
        providerId: result.providerId ?? null,
        detail: result.detail?.slice(0, MAIL_LIMITS.errorMaxLength) ?? null,
        isTest: input.isTest ?? false,
      },
    })
  } catch {
    // A missing journal line never blocks a mail
  }
}

/**
 * Hand a payload to Resend
 * @param {SendMailInput} input - The send
 * @return {Promise<SendMailResult & { providerId: string | null }>} - Outcome
 */

const deliver = async (input: SendMailInput) => {
  const mail = renderMail(input.kind, input.variables)

  try {
    const response = await fetch(MAIL_ENDPOINT, {
      method: 'POST',
      signal: AbortSignal.timeout(MAIL_LIMITS.timeoutMs),
      headers: {
        Authorization: `Bearer ${MAIL_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
        ...(input.idempotencyKey ? { 'Idempotency-Key': input.idempotencyKey } : {}),
      },
      body: JSON.stringify({
        from: MAIL_CONFIG.from,
        to: [input.to],
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        ...(MAIL_CONFIG.replyTo ? { reply_to: MAIL_CONFIG.replyTo } : {}),
      }),
    })
    const payload = (await response.json().catch(() => ({}))) as { id?: string; message?: string }

    if (!response.ok) {
      return {
        status: MailStatuses.Failed,
        detail: `${response.status} ${payload.message ?? ''}`.trim(),
        providerId: null,
      }
    }

    return { status: MailStatuses.Sent, detail: null, providerId: payload.id ?? null }
  } catch (error) {
    return {
      status: MailStatuses.Failed,
      detail: error instanceof Error ? error.message : String(error),
      providerId: null,
    }
  }
}

/**
 * Send one mail and keep a line of it, never throws
 * @param {SendMailInput} input - The send
 * @return {Promise<SendMailResult>} - How it ended
 */

export const sendMail = async (input: SendMailInput): Promise<SendMailResult> => {
  if (!isMailConfigured()) {
    const skipped = { status: MailStatuses.Skipped, detail: MAIL_CONSOLE_COPY.skippedNotConfigured }
    await writeJournal(input, skipped)

    return skipped
  }

  const result = await deliver(input)
  await writeJournal(input, result)

  return { status: result.status, detail: result.detail }
}

/**
 * Note a mail that could not leave because the request has no address
 * @param {SendMailInput} input - The send, address left empty
 * @return {Promise<void>} - Written
 */

export const noteSkippedMail = (input: Omit<SendMailInput, 'to'>): Promise<void> =>
  writeJournal(
    { ...input, to: '' },
    {
      status: MailStatuses.Skipped,
      detail: MAIL_CONSOLE_COPY.skippedNoAddress,
    }
  )
