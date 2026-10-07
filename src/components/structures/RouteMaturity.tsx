'use client'

import { usePathname } from 'next/navigation'

import { MaturityTag } from '@/components/elements/display/MaturityTag'
import { maturityOfPath } from '@/declarations/navigation'

/**
 * Tag of the page on screen when its navigation entry declares a stage
 * @return {JSX.Element | null}
 */

export const RouteMaturity = () => {
  const maturity = maturityOfPath(usePathname())

  return maturity ? <MaturityTag maturity={maturity} /> : null
}
