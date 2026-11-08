'use client'

import { useMemo, useState } from 'react'

import type { UnbanRequest } from '@/types/modview'

// Requests per page, as Twitch lists them
export const UNBAN_PAGE_SIZE = 25

/**
 * Order of the requests
 * @typedef {'recent' | 'old'} UnbanOrder
 */

export type UnbanOrder = 'recent' | 'old'

/**
 * Requests sorted and cut in pages
 * @param {UnbanRequest[]} requests - Pending requests
 * @return {Object} - Page shown and the gestures to move around
 */

export const useUnbanQueue = (requests: UnbanRequest[]) => {
  const [order, setOrder] = useState<UnbanOrder>('recent')
  const [page, setPage] = useState(1)

  const sorted = useMemo(
    () =>
      [...requests].sort((left, right) =>
        order === 'recent'
          ? Date.parse(right.at) - Date.parse(left.at)
          : Date.parse(left.at) - Date.parse(right.at)
      ),
    [requests, order]
  )

  const pageCount = Math.max(1, Math.ceil(sorted.length / UNBAN_PAGE_SIZE))
  const current = Math.min(page, pageCount)
  const from = (current - 1) * UNBAN_PAGE_SIZE

  return {
    total: sorted.length,
    sorted,
    items: sorted.slice(from, from + UNBAN_PAGE_SIZE),
    page: current,
    pageCount,
    from: sorted.length === 0 ? 0 : from + 1,
    to: Math.min(from + UNBAN_PAGE_SIZE, sorted.length),
    order,
    setOrder: (next: UnbanOrder) => {
      setOrder(next)
      setPage(1)
    },
    setPage,
  }
}
