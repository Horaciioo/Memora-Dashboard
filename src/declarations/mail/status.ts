import { MAIL_CONSOLE_COPY } from '@/declarations/mail/copy'
import type { Tone } from '@/declarations/ui/theme'
import type { MailStatusName } from '@/utils/constants/mail'

/**
 * Look of one send outcome
 * @type {Record<MailStatusName, { tone: Tone, label: string }>}
 */

export const MAIL_STATUS_TONES: Record<MailStatusName, { tone: Tone; label: string }> = {
  SENT: { tone: 'success', label: MAIL_CONSOLE_COPY.statusSent },
  FAILED: { tone: 'danger', label: MAIL_CONSOLE_COPY.statusFailed },
  SKIPPED: { tone: 'caution', label: MAIL_CONSOLE_COPY.statusSkipped },
}
