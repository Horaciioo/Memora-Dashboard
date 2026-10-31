'use client'

import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'

import { useBannerHost } from '@/core/hooks/interaction/layout/useBannerHost'
import { PAGE_TABS_HOST_ID } from '@/declarations/ui/banners'
import { ICONS } from '@/declarations/ui/icons'
import { CANDIDATE_RAIL } from '@/declarations/ui/variants'

export interface CandidateBackProps {
  label: string
  href: string
}

/**
 * Way back, level with the tabs
 * @param {CandidateBackProps} props - Label and target
 * @return {JSX.Element | null}
 */

export const CandidateBack = ({ label, href }: CandidateBackProps) => {
  const router = useRouter()
  const host = useBannerHost(PAGE_TABS_HOST_ID)
  const Arrow = ICONS.back

  if (!host) return null

  return createPortal(
    <button type="button" onClick={() => router.push(href)} className={CANDIDATE_RAIL.back}>
      <Arrow className="size-4" aria-hidden="true" />
      {label}
    </button>,
    host
  )
}
