import 'server-only'

import { readOrigin } from '@/core/lib/http/requestOrigin'
import { publishLive } from '@/core/lib/lives/bus'
import { PAGE_TOPICS } from '@/declarations/pages/topics'
import type { PageStreamEvent } from '@/declarations/pages/topics'

/**
 * Tell a page's readers something moved, identifiers only
 * @param {string} pageId - Page
 * @param {PageStreamEvent} type - Event
 * @param {Record<string, unknown>} [detail] - Small facts
 * @return {Promise<void>} - Sent
 */

export const signalPage = async (
  pageId: string,
  type: PageStreamEvent,
  detail: Record<string, unknown> = {}
): Promise<void> => {
  const { tab } = await readOrigin()

  await publishLive(PAGE_TOPICS.page(pageId), { ...detail, type, tab, at: Date.now() })
}

/**
 * Tell open pages to check their readers again
 * @return {Promise<void>} - Sent
 */

export const signalAccess = (): Promise<void> => publishLive(PAGE_TOPICS.access, { at: Date.now() })
