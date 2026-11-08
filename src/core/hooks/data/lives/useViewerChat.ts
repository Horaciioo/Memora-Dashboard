'use client'

import { useInfiniteQuery } from '@tanstack/react-query'

import { apiGet } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import type { ChatHistoryMessage, ViewerChatHistory } from '@/types/lives'

/**
 * Chat stored on a viewer, newest first, page after page
 * @param {string | null} liveId - Live, none off a real live
 * @param {string} chatterId - Viewer
 * @return {Object} - Messages, facts about the history and loader
 */

export const useViewerChat = (liveId: string | null, chatterId: string) => {
  const query = useInfiniteQuery({
    queryKey: QUERY_KEYS.liveViewerChat(liveId ?? '', chatterId),
    queryFn: ({ pageParam, signal }) =>
      apiGet<ViewerChatHistory>(
        API_ROUTES.liveViewerChat(liveId ?? '', chatterId, pageParam),
        signal
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
    enabled: liveId !== null,
  })
  const first = query.data?.pages[0]

  return {
    messages: query.data?.pages.flatMap((page): ChatHistoryMessage[] => page.messages) ?? null,
    total: first?.total ?? null,
    firstKnownAt: first?.firstKnownAt ?? null,
    isComplete: first?.isComplete ?? false,
    hasMore: query.hasNextPage,
    isFetchingMore: query.isFetchingNextPage,
    loadMore: () => void query.fetchNextPage(),
  }
}
