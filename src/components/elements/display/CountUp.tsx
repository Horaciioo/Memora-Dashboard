'use client'

import { useCountUp } from '@/core/hooks/interaction/useCountUp'
import { DATE_LOCALE } from '@/declarations/ui/dates'

export interface CountUpProps {
  value: number
}

/**
 * Figure counting up once
 * @param {number} value - Target figure
 * @return {JSX.Element}
 */

export const CountUp = ({ value }: CountUpProps) => (
  <>{useCountUp(value).toLocaleString(DATE_LOCALE)}</>
)
