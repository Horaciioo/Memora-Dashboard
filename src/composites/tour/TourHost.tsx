'use client'

import { PageTour } from '@/composites/tour/PageTour'
import { WelcomeFlow } from '@/composites/tour/WelcomeFlow'
import { useTour } from '@/managers/front-end/TourManager'

/**
 * Whatever the first visit shows right now
 * @return {JSX.Element | null}
 */

export const TourHost = () => {
  const { isIntroOpen, isTouring, next } = useTour()

  if (isIntroOpen) return <WelcomeFlow />
  if (isTouring && next) return <PageTour route={next} />

  return null
}
