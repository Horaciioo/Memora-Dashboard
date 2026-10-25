'use client'

import { useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { FavoriteToggle } from '@/components/structures/page/FavoriteToggle'
import { useIsMobileShell } from '@/core/hooks/interaction/layout/useBreakpoint'
import { PAGE_OPTIONS_HOST_ID, TOP_BAR_TOOLS_HOST_ID } from '@/declarations/ui/banners'
import { PAGE_STYLES } from '@/declarations/ui/variants'

export interface BannerToolsProps {
  // Name of the page when the trail holds none
  title: string
}

// The host never changes under a mounted page
const subscribeNothing = () => () => {}

/**
 * Page options and star: in the banner bar, in the top bar of a phone
 * @param {string} title - Page name stand-in for the star
 * @return {JSX.Element}
 */

export const BannerTools = ({ title }: BannerToolsProps) => {
  const isMobile = useIsMobileShell()
  const host = useSyncExternalStore(
    subscribeNothing,
    () => document.getElementById(TOP_BAR_TOOLS_HOST_ID),
    () => null
  )

  const tools = (
    <div className={PAGE_STYLES.bannerOptions}>
      <div id={PAGE_OPTIONS_HOST_ID} className="contents" />
      <FavoriteToggle title={title} />
    </div>
  )

  return isMobile && host ? createPortal(tools, host) : tools
}
