import 'server-only'

import { decryptField } from '@/core/lib/crypto'
import { prisma } from '@/core/lib/db'
import { contestPath } from '@/core/lib/unban/slug'
import { noteSkippedMail, sendMail } from '@/core/services/mail/MailService'
import { MAIL_CONFIG } from '@/declarations/mail/config'
import type { MailKindName } from '@/utils/constants/mail'
import type { UnbanRequest } from '@prisma/client'

/**
 * Request fields a mail needs
 * @typedef {Pick<UnbanRequest, 'id' | 'youtuberId' | 'reference' | 'discordName' | 'email' | 'cycle'>} MailedRequest
 */

export type MailedRequest = Pick<
  UnbanRequest,
  'id' | 'youtuberId' | 'reference' | 'discordName' | 'email' | 'cycle'
>

/**
 * Tell the requester where their request stands, never throws and never waits for the provider
 * @param {MailKindName} kind - Mail to send
 * @param {MailedRequest} request - Request concerned
 * @param {string | null} [note] - Message of the team, for a decision
 * @return {void} - Sent in the background
 */

export const mailRequester = (
  kind: MailKindName,
  request: MailedRequest,
  note: string | null = null
): void => {
  void (async () => {
    try {
      const creator = await prisma.youtuber.findUnique({
        where: { id: request.youtuberId },
        select: { name: true },
      })
      const input = {
        kind,
        requestId: request.id,
        idempotencyKey: `${kind}-${request.id}-${request.cycle}`,
        variables: {
          name: request.discordName,
          creator: creator?.name ?? '',
          reference: request.reference,
          link:
            MAIL_CONFIG.origin && creator
              ? `${MAIL_CONFIG.origin}${contestPath(creator.name)}`
              : null,
          note,
        },
      }

      const to = decryptField(request.email)
      if (!to) return await noteSkippedMail(input)

      await sendMail({ ...input, to })
    } catch {
      // The request never depends on its mail
    }
  })()
}
