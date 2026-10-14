import 'server-only'

import { readActivityWhere } from '@/core/services/system/ActivityService'
import type { ActivityEntry } from '@/core/services/system/ActivityService'
import { JOURNAL_FILES } from '@/core/services/system/FileJournal'

// Target kind the junior routes record under
const JUNIOR_TARGET = 'junior'

/**
 * Read the journal of a session and of the juniors inside it
 * @param {string} sessionId - Session identifier
 * @param {{ id: string }[]} juniors - Juniors of the session
 * @return {Promise<ActivityEntry[]>} - Journal entries, newest first
 */

export const readSessionActivity = (
  sessionId: string,
  juniors: { id: string }[]
): Promise<ActivityEntry[]> =>
  readActivityWhere({
    OR: [
      { targetType: JOURNAL_FILES.Academy, targetId: sessionId },
      { targetType: JUNIOR_TARGET, targetId: { in: juniors.map((junior) => junior.id) } },
    ],
  })
