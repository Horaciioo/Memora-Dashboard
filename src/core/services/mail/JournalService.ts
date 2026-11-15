import 'server-only'

import { prisma } from '@/core/lib/db'
import { MAIL_LIMITS } from '@/utils/constants/mail'
import type { MailStatusName } from '@/utils/constants/mail'

/**
 * One line of the mail journal
 * @typedef {Object} MailJournalEntry
 * @property {string} id - Line
 * @property {string} kind - Mail
 * @property {string | null} reference - Request reference
 * @property {MailStatusName} status - How it ended
 * @property {string | null} detail - Reason when it did not leave
 * @property {boolean} isTest - Trial from the console
 * @property {string} createdAt - ISO date
 */

export interface MailJournalEntry {
  id: string
  kind: string
  reference: string | null
  status: MailStatusName
  detail: string | null
  isTest: boolean
  createdAt: string
}

/**
 * Latest mails handed to the provider, newest first
 * @return {Promise<MailJournalEntry[]>} - Lines
 */

export const readMailJournal = async (): Promise<MailJournalEntry[]> => {
  const rows = await prisma.mailDelivery.findMany({
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: MAIL_LIMITS.journalSize,
  })

  return rows.map((row) => ({
    id: row.id,
    kind: row.kind,
    reference: row.reference,
    status: row.status,
    detail: row.detail,
    isTest: row.isTest,
    createdAt: row.createdAt.toISOString(),
  }))
}
