'use client'

import { usePathname } from 'next/navigation'
import { RECORD_LABELS, SEGMENT_LABELS } from '@/declarations/navigation'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { useBreadcrumbOverrides } from '@/managers/front-end'

export interface RailSubPage {
  href: string
  label: string
}

/**
 * Pages opened under a destination
 * @param {string} base - Destination path
 * @return {RailSubPage[]} - Chain below it, empty off the destination
 */

export const useRailSubPages = (base: string): RailSubPage[] => {
  const pathname = usePathname()
  const overrides = useBreadcrumbOverrides()

  if (!pathname.startsWith(`${base}/`)) return []

  const baseDepth = base.split('/').filter(Boolean).length
  const segments = pathname.split('/').filter(Boolean)

  return segments.slice(baseDepth).map((segment, index) => {
    const href = `/${segments.slice(0, baseDepth + index + 1).join('/')}`
    const stand = RECORD_LABELS[segments[baseDepth + index - 1]] ?? NAV_COPY.crumbRecord

    return { href, label: overrides[href] ?? SEGMENT_LABELS[segment] ?? stand }
  })
}
