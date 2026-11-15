import 'server-only'

import { prisma } from '@/core/lib/db'
import { UNBAN_COPY } from '@/declarations/unban/copy'
import { UNBAN_STATUS_REGISTRY } from '@/declarations/unban/registries'
import type { ChangeLine, ChangeSummary } from '@/core/services/system/changes'
import type { EventInput } from '@/core/services/system/ActivityService'
import type { UnbanStatusName } from '@/utils/constants/unban'
import type { UnbanRequest } from '@prisma/client'

// What a journal line needs of a request
type Subject = Pick<UnbanRequest, 'discordName' | 'discordId' | 'reference'>

/**
 * Sentence ending naming the person, their identifier and the file
 * @param {Subject} row - Request
 * @return {string} - Remainder of the sentence
 */

const about = (row: Subject): string =>
  UNBAN_COPY.journalSubject
    .replace('{name}', row.discordName)
    .replace('{discordId}', row.discordId)
    .replace('{reference}', row.reference)

/**
 * Line of a status moving
 * @param {UnbanStatusName} before - Status before
 * @param {UnbanStatusName} after - Status after
 * @return {ChangeLine} - Line
 */

export const statusLine = (before: UnbanStatusName, after: UnbanStatusName): ChangeLine => ({
  label: UNBAN_COPY.journalStatus,
  before: UNBAN_STATUS_REGISTRY.label(before),
  after: UNBAN_STATUS_REGISTRY.label(after),
})

/**
 * Names of members, by identifier
 * @param {(string | null)[]} ids - Identifiers, none for nobody
 * @return {Promise<Map<string, string>>} - Display names
 */

export const memberNames = async (ids: (string | null)[]): Promise<Map<string, string>> => {
  const wanted = ids.filter((id): id is string => id !== null)
  const rows = await prisma.account.findMany({
    where: { id: { in: wanted } },
    select: { id: true, displayName: true },
  })

  return new Map(rows.map(({ id, displayName }) => [id, displayName]))
}

/**
 * Journal event worded as a full sentence about the request, with the facts that moved under it
 * @param {string} eventType - Registered event
 * @param {string} verb - Past participle after the actor
 * @param {Subject} row - Request the line is about
 * @param {ChangeLine[]} [lines] - Facts that moved
 * @param {Pick<EventInput, 'payload'>} [extra] - Stored detail
 * @return {Pick<EventInput, 'eventType' | 'summary' | 'change' | 'payload'>} - Event
 */

export const journalEvent = (
  eventType: EventInput['eventType'],
  verb: string,
  row: Subject,
  lines: ChangeLine[] = [],
  extra: Pick<EventInput, 'payload'> = {}
): Pick<EventInput, 'eventType' | 'summary' | 'change' | 'payload'> => {
  const change: ChangeSummary = { verb, rest: about(row), ...(lines.length ? { lines } : {}) }

  return { eventType, summary: row.reference, change, ...extra }
}
