'use client'

import { usePathname } from 'next/navigation'
import { useBreadcrumbLabel } from '@/managers/front-end'

export interface BreadcrumbLabelProps {
  label: string
}

/**
 * Names the current page in the trail
 * @param {string} label - Record name
 * @return {null}
 */

export const BreadcrumbLabel = ({ label }: BreadcrumbLabelProps) => {
  useBreadcrumbLabel(usePathname(), label)

  return null
}
