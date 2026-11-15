import 'server-only'

import { prisma } from '@/core/lib/db'
import { forbidden, invalidInput, notFound } from '@/core/lib/errors'
import { canVoteOn, UNBAN_VOTE_CHOICES } from '@/core/lib/unban/votes'
import { scopedWhere } from '@/core/services/auth/ScopeService'
import { UNBAN_ERRORS } from '@/declarations/unban/copy'
import { readRequest } from './query'
import type { UnbanVoteChoiceName } from '@/core/lib/unban/votes'
import type { UnbanCaller } from '@/core/services/unban/requests/caller'
import type { UnbanRequestDetail } from '@/types/unban'

// Field the refusal points at
const CHOICE_FIELD = 'choice'

/**
 * Take a side on a request, the same side again takes the vote back
 * @param {string} id - Request identifier
 * @param {string} choice - Side taken
 * @param {UnbanCaller} caller - Who votes
 * @return {Promise<UnbanRequestDetail>} - Request as it stands now
 */

export const voteOnRequest = async (
  id: string,
  choice: string,
  caller: UnbanCaller
): Promise<UnbanRequestDetail> => {
  if (!(UNBAN_VOTE_CHOICES as readonly string[]).includes(choice)) {
    throw invalidInput([{ field: CHOICE_FIELD, message: UNBAN_ERRORS.badVote }])
  }

  const row = await prisma.unbanRequest.findFirst({
    where: scopedWhere('unbanRequest', caller.scope, { id }),
    select: { id: true, status: true },
  })
  if (!row) throw notFound()
  if (!canVoteOn(row.status, caller.access)) throw forbidden(UNBAN_ERRORS.notAllowed)

  const side = choice as UnbanVoteChoiceName
  const key = { requestId_voterId: { requestId: id, voterId: caller.actorId } }
  const current = await prisma.unbanVote.findUnique({ where: key })

  if (current?.choice === side) {
    await prisma.unbanVote.delete({ where: key })
  } else {
    await prisma.unbanVote.upsert({
      where: key,
      create: { requestId: id, voterId: caller.actorId, choice: side },
      update: { choice: side },
    })
  }

  return readRequest(id, caller)
}
