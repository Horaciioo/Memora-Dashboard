'use client'

import { useSignalRefresh } from '@/core/hooks/interaction/state/useSignalRefresh'
import { API_ROUTES } from '@/core/lib/api/routes'
import { JOURNAL_SIGNAL } from '@/declarations/system/signals'

/**
 * Re-read the logs each time a fact is written
 * @return {null}
 */

export const JournalSignalListener = () => {
  useSignalRefresh(API_ROUTES.journalStream, JOURNAL_SIGNAL.event)

  return null
}
