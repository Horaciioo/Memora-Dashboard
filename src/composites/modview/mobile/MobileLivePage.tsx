'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { MobileInfoTicker } from '@/composites/modview/mobile/MobileInfoTicker'
import { MobileInfoTab } from '@/composites/modview/mobile/MobileInfoTab'
import { MobileStream } from '@/composites/modview/mobile/MobileStream'
import { MobileSuggestions } from '@/composites/modview/mobile/MobileSuggestions'
import type { SuggestionListProps } from '@/composites/modview/SuggestionList'
import type { ActRunner, GateCheck } from '@/composites/modview/types'
import { ViewerTabs } from '@/composites/modview/ViewerTabs'
import { useModPreferences } from '@/core/hooks/interaction/state/moderation/useModPreferences'
import { MODVIEW_MOBILE_COPY as COPY } from '@/declarations/modview/mobile'
import { MODVIEW_MOBILE } from '@/declarations/ui/variants'
import type { ModViewState } from '@/types/modview'

type LiveTab = 'chat' | 'info'

const TABS: { key: LiveTab; label: string }[] = [
  { key: 'chat', label: COPY.tabChat },
  { key: 'info', label: COPY.tabInfo },
]

export interface MobileLivePageProps {
  state: ModViewState
  gate: GateCheck
  onAct: ActRunner
  suggest: SuggestionListProps
  // The chat window
  chat: ReactNode
}

/**
 * Stream on top, then the chat and the information as two tabs
 * @param {MobileLivePageProps} props - Page props
 * @return {JSX.Element}
 */

export const MobileLivePage = ({ state, gate, onAct, suggest, chat }: MobileLivePageProps) => {
  const [tab, setTab] = useState<LiveTab>('chat')
  const { preferences } = useModPreferences()

  return (
    <div className={MODVIEW_MOBILE.pageBody}>
      {preferences.showStream && <MobileStream state={state} />}
      <div className={MODVIEW_MOBILE.tabs}>
        <ViewerTabs isBold tabs={TABS} value={tab} onChange={setTab} />
      </div>
      {tab === 'chat' ? (
        <>
          <MobileSuggestions {...suggest} />
          <MobileInfoTicker state={state} onOpen={() => setTab('info')} />
          {chat}
        </>
      ) : (
        <MobileInfoTab state={state} gate={gate} onAct={onAct} />
      )}
    </div>
  )
}
