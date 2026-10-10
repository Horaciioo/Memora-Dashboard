'use client'

import { usePathname } from 'next/navigation'
import { useCallback } from 'react'

import { RailPointer } from '@/composites/tour/RailPointer'
import { StepsTour } from '@/composites/tour/StepsTour'
import { routeLabel } from '@/core/lib/tour/progress'
import { TOUR_COPY } from '@/declarations/tour/copy'
import { TOUR_PAGES } from '@/declarations/tour/pages'
import { useTour } from '@/managers/front-end/TourManager'
import { useNotifications } from '@/managers/infrastructure/Network/NotificationsManager'

/**
 * The page waiting to be explained: pointed at in the menu, then lit part by part once opened
 * @param {{ route: string }} props - Page route
 * @return {JSX.Element | null}
 */

export const PageTour = ({ route }: { route: string }) => {
  const pathname = usePathname()
  const { finishPage, remaining, skip } = useTour()
  const { notify } = useNotifications()
  const page = TOUR_PAGES.find((entry) => entry.route === route)

  const finish = useCallback(() => {
    finishPage(route)
    if (remaining === 1) notify({ tone: 'success', title: TOUR_COPY.doneTitle })
  }, [finishPage, route, remaining, notify])

  if (!page) return null
  if (pathname !== route) return <RailPointer route={route} label={routeLabel(route)} />

  return <StepsTour key={route} page={page} onFinish={finish} onSkip={skip} />
}
