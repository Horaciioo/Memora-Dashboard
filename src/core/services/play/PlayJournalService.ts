import 'server-only'

import { readActivityWhere, recordEvent } from '@/core/services/system/ActivityService'
import type { ActivityEntry } from '@/core/services/system/ActivityService'
import { fillPlayMessage, PLAY_GAMES, PLAY_TARGET } from '@/declarations/play'
import type { EventTypeName } from '@/utils/constants/events'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * One Play line of a member's journal
 * @typedef {Object} PlayJournalInput
 * @property {EventTypeName} eventType - Event kind
 * @property {string} subjectId - Member it lands on
 * @property {string | null} [actorId] - Who did it, the member by default
 * @property {PlayGameName} game - Game
 * @property {string} template - Journal line
 * @property {Record<string, number | string>} [values] - Placeholders
 * @property {string} [sessionId] - Game played
 */

export interface PlayJournalInput {
  eventType: EventTypeName
  subjectId: string
  actorId?: string | null
  game: PlayGameName
  template: string
  values?: Record<string, number | string>
  sessionId?: string
}

/**
 * Write Play lines, never failing the move
 * @param {PlayJournalInput[]} inputs - Lines
 * @return {Promise<void>} - Written
 */

export const journalPlay = async (...inputs: PlayJournalInput[]): Promise<void> => {
  await Promise.allSettled(
    inputs.map((input) =>
      recordEvent({
        eventType: input.eventType,
        actorId: input.actorId === undefined ? input.subjectId : input.actorId,
        subjectId: input.subjectId,
        targetType: PLAY_TARGET,
        targetId: input.sessionId,
        summary: fillPlayMessage(input.template, {
          game: PLAY_GAMES.label(input.game),
          ...input.values,
        }),
      })
    )
  )
}

/**
 * Play lines of a member's journal
 * @param {string} accountId - Member
 * @return {Promise<ActivityEntry[]>} - Journal entries
 */

export const readPlayActivity = (accountId: string): Promise<ActivityEntry[]> =>
  readActivityWhere({ targetType: PLAY_TARGET, subjectId: accountId })
