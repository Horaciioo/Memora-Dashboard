'use client'

import { useCallback, useState } from 'react'

import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/useMutation'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import type { PimTimeline } from '@/types/academy'

/**
 * Vertical timeline state and its one move
 * @typedef {Object} PimTimelineState
 * @property {PimTimeline} timeline - Timeline on screen
 * @property {boolean} isSaving - Move in flight
 * @property {() => Promise<boolean>} advance - Clear the step in course
 */

export interface PimTimelineState {
  timeline: PimTimeline
  isSaving: boolean
  advance: () => Promise<boolean>
}

/**
 * Drive the vertical timeline of one junior
 * @param {PimTimeline} initial - Timeline resolved server-side
 * @return {PimTimelineState} - State and move
 */

export const usePimTimeline = (initial: PimTimeline): PimTimelineState => {
  const [timeline, setTimeline] = useState(initial)
  const { isSaving, run } = useMutation()

  const advance = useCallback(async () => {
    const next = await run(
      () => apiPost<PimTimeline>(API_ROUTES.juniorTimeline(timeline.juniorId), {}),
      ACADEMY_COPY.timelineAdvanced
    )

    if (next) setTimeline(next)

    return next !== null
  }, [run, timeline.juniorId])

  return { timeline, isSaving, advance }
}
