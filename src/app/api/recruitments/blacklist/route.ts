import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { readText } from '@/core/lib/forms/values'
import { createProtectedRoute } from '@/core/lib/http/route'
import { banIdentifier, liftBan } from '@/core/services/recruitment/BanService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { reachableSession } from '@/core/services/recruitment/reach'
import { JOURNAL_FILES, recordFileEvent } from '@/core/services/system/FileJournal'
import { BAN_FIELDS } from '@/declarations/recruitment/banForm'
import { HISTORY_COPY } from '@/declarations/recruitment/historyCopy'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.RecruitmentManage,
  status: 201,
  descriptor: { summary: 'Bar an identifier from the new sessions', tags: ['recruitment'] },
  handler: async ({ raw, session, scope }) => {
    const parsed = parseFormValues(BAN_FIELDS, raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    const discordId = readText(parsed.values, 'discordId') ?? ''
    const sessionId = readText(parsed.values, 'sessionId')
    // The decision is taken on a session in reach
    if (sessionId) await reachableSession(sessionId, await scope())

    const ban = await banIdentifier({
      discordId,
      sessionId,
      reason: readText(parsed.values, 'reason'),
      actorId: session.id,
    })

    if (sessionId) {
      await recordFileEvent({
        eventType: 'RecruitmentBanned',
        file: JOURNAL_FILES.Recruitment,
        fileId: sessionId,
        actorId: session.id,
        summary: HISTORY_COPY.logBanned(ban.name ?? discordId),
        candidateId: readText(parsed.values, 'candidateId') ?? undefined,
      })
    }

    return ban
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.RecruitmentManage,
  descriptor: { summary: 'Let an identifier join the sessions again', tags: ['recruitment'] },
  handler: async ({ query, session }) => {
    const discordId = query.get('discordId')
    if (!discordId)
      throw invalidInput([{ field: 'discordId', message: HISTORY_COPY.refusedAnywhere }])

    const ban = await liftBan(discordId)
    const event = {
      eventType: 'RecruitmentUnbanned',
      actorId: session.id,
      summary: HISTORY_COPY.logUnbanned(ban.name ?? discordId),
    } as const

    // On the session it was decided on, else alone
    if (ban.sessionId)
      await recordFileEvent({ ...event, file: JOURNAL_FILES.Recruitment, fileId: ban.sessionId })
    else await recordEvent(event)

    return { ok: true }
  },
})
