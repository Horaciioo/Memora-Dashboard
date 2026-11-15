import 'server-only'

import { sampleVariables } from '@/core/lib/mail/catalogue'
import { MAIL_CONFIG } from '@/declarations/mail/config'
import type { MailKindName } from '@/utils/constants/mail'
import { sendMail } from './MailService'
import type { SendMailResult } from './MailService'

/**
 * Send one catalogue mail with sample words to an address
 * @param {MailKindName} kind - Mail
 * @param {string} to - Address of the trial
 * @return {Promise<SendMailResult>} - How it ended
 */

export const sendTrialMail = (kind: MailKindName, to: string): Promise<SendMailResult> =>
  sendMail({ kind, to, isTest: true, variables: sampleVariables(kind, MAIL_CONFIG.origin) })
