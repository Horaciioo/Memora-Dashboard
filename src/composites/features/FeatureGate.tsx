'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import { FeatureClosed } from '@/composites/features/FeatureClosed'
import { featureOfPath } from '@/declarations/features'
import { useFeatures } from '@/managers/front-end/FeaturesManager'

/**
 * Shows the closed screen instead of a page whose feature is off
 * @param {ReactNode} children - Routed page
 * @return {JSX.Element}
 */

export const FeatureGate = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname()
  const { closed } = useFeatures()
  const key = featureOfPath(pathname)
  const verdict = key ? closed[key] : undefined

  return key && verdict ? <FeatureClosed featureKey={key} verdict={verdict} /> : <>{children}</>
}
