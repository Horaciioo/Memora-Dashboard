'use client'

import { PageTour } from '@/composites/tour/PageTour'
import { TourCelebration } from '@/composites/tour/TourCelebration'
import { WelcomeFlow } from '@/composites/tour/WelcomeFlow'
import { useTour } from '@/managers/front-end/TourManager'

/**
 * Whatever the first visit shows right now
 * @return {JSX.Element | null}
 */

export const TourHost = () => {
  const { isIntroOpen, isTouring, isCelebrating, next } = useTour()

  if (isCelebrating) return <TourCelebration />
  if (isIntroOpen) return <WelcomeFlow />
  if (isTouring && next) return <PageTour route={next} />

  return null
}
