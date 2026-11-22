'use client'

import type { ReactNode } from 'react'

import { useAppLinkStatus } from '@/components/elements/navigation/AppLink'
import { PlayPixelBrain } from '@/composites/play/brand/PlayPixelBrain'
import { PLAY_HUB_LOADING } from '@/declarations/play'

export interface PlayLoadingLabelProps {
  // Loading: moving logo and words replace the children
  isLoading: boolean
  children: ReactNode
}

/**
 * Button content swapped for Memora Play's own loader
 * @param {PlayLoadingLabelProps} props - State and resting content
 * @return {JSX.Element}
 */

export const PlayLoadingLabel = ({ isLoading, children }: PlayLoadingLabelProps) =>
  isLoading ? (
    <span className="inline-flex items-center gap-2.5" role="status">
      <PlayPixelBrain className="play-brain-load size-[1.25em] shrink-0" />
      {PLAY_HUB_LOADING}
    </span>
  ) : (
    children
  )

/**
 * Same swap inside a Link, driven by the navigation itself
 * @param {{ children: ReactNode }} props - Resting content
 * @return {JSX.Element}
 */

export const PlayLinkLabel = ({ children }: { children: ReactNode }) => {
  const { pending } = useAppLinkStatus()

  return <PlayLoadingLabel isLoading={pending}>{children}</PlayLoadingLabel>
}
