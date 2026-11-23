import 'server-only'

import { readCommentBeats } from '@/core/services/recap/sources/comments'
import { readEditBeats } from '@/core/services/recap/sources/edits'
import { readAlertBeats } from '@/core/services/recap/sources/notifications'
import { readPageBeats } from '@/core/services/recap/sources/pages'
import { readQueueBeats } from '@/core/services/recap/sources/queues'
import { readRollCallBeats } from '@/core/services/recap/sources/rollCall'
/**
 * Every place the recap listens to, a new one is added here
 * @type {((context: RecapContext) => Promise<RecapDraft[]>)[]}
 */

export const RECAP_SOURCES = [
  readAlertBeats,
  readRollCallBeats,
  readCommentBeats,
  readPageBeats,
  readEditBeats,
  readQueueBeats,
]
