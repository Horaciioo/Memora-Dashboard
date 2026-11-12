'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { ViewerTabs } from '@/composites/modview/ViewerTabs'
import { MODVIEW_MOBILE_COPY as COPY } from '@/declarations/modview/mobile'
import { MODVIEW_MOBILE } from '@/declarations/ui/variants'

type FeedTab = 'automod' | 'modActions'

export interface MobileFeedPageProps {
  // Window behind each tab, a tab without one is left out
  windows: Partial<Record<FeedTab, ReactNode>>
}

/**
 * Action thread of the AutoMod and of the moderators
 * @param {MobileFeedPageProps} props - Page props
 * @return {JSX.Element}
 */

export const MobileFeedPage = ({ windows }: MobileFeedPageProps) => {
  const tabs: { key: FeedTab; label: string }[] = [
    ...(windows.automod ? [{ key: 'automod' as const, label: COPY.feedAutomod }] : []),
    { key: 'modActions', label: COPY.feedActions },
  ]
  const [tab, setTab] = useState<FeedTab>(tabs[0].key)

  return (
    <div className={MODVIEW_MOBILE.pageBody}>
      <div className={MODVIEW_MOBILE.tabs}>
        <ViewerTabs isBold tabs={tabs} value={tab} onChange={setTab} />
      </div>
      <div className={MODVIEW_MOBILE.window}>{windows[tab]}</div>
    </div>
  )
}
