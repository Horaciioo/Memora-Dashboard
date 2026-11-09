'use client'

import dynamic from 'next/dynamic'

import { useTour } from '@/managers/front-end/TourManager'

// Loaded for the first visit only
const PageTour = dynamic(
  () => import('@/composites/tour/PageTour').then((module) => module.PageTour),
  { ssr: false }
)
const TourCelebration = dynamic(
  () => import('@/composites/tour/TourCelebration').then((module) => module.TourCelebration),
  { ssr: false }
)
const WelcomeFlow = dynamic(
  () => import('@/composites/tour/WelcomeFlow').then((module) => module.WelcomeFlow),
  { ssr: false }
)

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
