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
 * Way back, level with the tabs from md, under them on a phone
 * @param {CandidateBackProps} props - Label and target
 * @return {JSX.Element}
 */

export const CandidateBack = ({ label, href }: CandidateBackProps) => {
  const router = useRouter()
  const host = useBannerHost(PAGE_TABS_HOST_ID)
  const Arrow = ICONS.back

  const button = (className: string) => (
    <button type="button" onClick={() => router.push(href)} className={className}>
      <Arrow className="size-4" aria-hidden="true" />
      {label}
    </button>
  )

  return (
    <>
      {button(CANDIDATE_RAIL.backInline)}
      {host && createPortal(button(CANDIDATE_RAIL.back), host)}
    </>
  )
}
