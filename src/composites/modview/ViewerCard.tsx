'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { DossierPosition } from '@/composites/modview/DossierPosition'
import { climbedLadders } from '@/composites/modview/DossierLadders'
import { ViewerBanBox } from '@/composites/modview/ViewerBanBox'
import { ViewerChatHistory } from '@/composites/modview/ViewerChatHistory'
import { ViewerMetrics } from '@/composites/modview/ViewerMetrics'
import { ViewerNotes } from '@/composites/modview/ViewerNotes'
import { ViewerSanctionList } from '@/composites/modview/ViewerSanctionList'
import { ViewerSanctions } from '@/composites/modview/ViewerSanctions'
import { ViewerTabs } from '@/composites/modview/ViewerTabs'
import type { ActRunner, GateCheck } from '@/composites/modview/types'
import { useViewerChat } from '@/core/hooks/data/lives/useViewerChat'
import { useViewerDossier } from '@/core/hooks/data/lives/useViewerDossier'
import type { PanelMemory } from '@/core/lib/modview/commands'
import { MODVIEW_USER_COPY } from '@/declarations/modview/copy'
import { ICONS } from '@/declarations/ui/icons'
import { MODVIEW_USER } from '@/declarations/ui/variants'
import type { ChatMessage, Chatter } from '@/types/modview'
import type { SanctionOffenseCard, SanctionPanelView } from '@/types/sanctions'
import { cn } from '@/utils/classnames'

type ViewerTab = 'sanctions' | 'notes' | 'situations'
type ListTab = 'messages' | 'sanctions'

export interface ViewerCardProps {
  chatter: Chatter
  messages: ChatMessage[]
  // Sanctions the viewer got on this live
  liveSanctions: number
  gate: GateCheck
  onAct: ActRunner
  onClose: () => void
  isWatched: boolean
  onWatch: () => void
  // Viewer card on Twitch's mod view
  twitchUrl?: string | null
  // Sits in the right column instead of over the stage
  isDocked?: boolean
  // Width of the docked column, in pixels
  width?: number
  // Dossier of a real live
  dossier?: {
    liveId: string
    panel: SanctionPanelView | null
    memory: PanelMemory
    onPrefill: (offense: SanctionOffenseCard, rung: number, chatter: Chatter) => void
  }
}

/**
 * One viewer: their Twitch, two figures, where they stand, what they said and the gestures
 * @param {ViewerCardProps} props - Card props
 * @return {JSX.Element}
 */

export const ViewerCard = ({
  chatter,
  messages,
  liveSanctions,
  gate,
  onAct,
  onClose,
  isWatched,
  onWatch,
  twitchUrl,
  isDocked,
  width,
  dossier,
}: ViewerCardProps) => {
  const [tab, setTab] = useState<ViewerTab>('sanctions')
  const [list, setList] = useState<ListTab>('messages')
  const liveId = dossier?.liveId ?? null
  const { history } = useViewerDossier(liveId, chatter.id)
  const chat = useViewerChat(liveId, chatter.id)
  const lastLine = [...messages].reverse().find((message) => !message.deletedBy)
  const TwitchIcon = ICONS.twitch

  // Notes need a real live to hang on
  const tabs: { key: ViewerTab; label: string }[] = [
    { key: 'sanctions', label: MODVIEW_USER_COPY.tabSanctions },
    ...(dossier
      ? [
          { key: 'notes' as const, label: MODVIEW_USER_COPY.tabNotes },
          { key: 'situations' as const, label: MODVIEW_USER_COPY.tabSituation },
        ]
      : []),
  ]

  const lists: { key: ListTab; label: string }[] = [
    { key: 'messages', label: MODVIEW_USER_COPY.tabMessages },
    { key: 'sanctions', label: MODVIEW_USER_COPY.tabSanctions },
  ]

  return (
    <aside
      className={isDocked ? MODVIEW_USER.docked : MODVIEW_USER.panel}
      style={isDocked && width ? { width } : undefined}
      aria-label={MODVIEW_USER_COPY.title}
    >
      <header className={MODVIEW_USER.head}>
        <Button
          variant="ghost"
          icon="close"
          className={MODVIEW_USER.close}
          aria-label={MODVIEW_USER_COPY.close}
          onClick={onClose}
        />
        {twitchUrl ? (
          <a
            href={twitchUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={MODVIEW_USER_COPY.openOnTwitch}
            className={cn(MODVIEW_USER.identity, MODVIEW_USER.identityLink)}
          >
            <TwitchIcon className={MODVIEW_USER.glyph} aria-hidden="true" />
            <h3 className={MODVIEW_USER.name}>{chatter.name}</h3>
          </a>
        ) : (
          <div className={MODVIEW_USER.identity}>
            <TwitchIcon className={MODVIEW_USER.glyph} aria-hidden="true" />
            <h3 className={MODVIEW_USER.name}>{chatter.name}</h3>
          </div>
        )}
      </header>

      <ViewerTabs tabs={tabs} value={tab} onChange={setTab} />

      <div className={MODVIEW_USER.scroll}>
        <ViewerMetrics
          messages={dossier ? chat.total : messages.length}
          sanctions={dossier ? (history?.length ?? null) : liveSanctions}
          liveMessages={dossier ? messages.length : 0}
          liveSanctions={dossier ? liveSanctions : 0}
        />

        {tab === 'sanctions' && (
          <div className={MODVIEW_USER.situation}>
            <div className={MODVIEW_USER.gestures}>
              <ViewerBanBox liveId={liveId} chatterId={chatter.id} />
              <ViewerSanctions
                chatter={chatter}
                lastLine={lastLine}
                gate={gate}
                onAct={onAct}
                isWatched={isWatched}
                onWatch={onWatch}
              />
            </div>

            <p className={MODVIEW_USER.listsTitle}>{MODVIEW_USER_COPY.historyTitle}</p>
            <section className={MODVIEW_USER.lists}>
              <ViewerTabs isBold tabs={lists} value={list} onChange={setList} />
              {list === 'messages' ? (
                <ViewerChatHistory liveId={liveId} chatterId={chatter.id} liveMessages={messages} />
              ) : (
                <ViewerSanctionList history={history} />
              )}
            </section>
          </div>
        )}
        {tab === 'situations' && dossier && (
          <div className={MODVIEW_USER.notes}>
            <DossierPosition
              ladders={climbedLadders(dossier.memory[chatter.id], dossier.panel)}
              chatter={chatter}
              onPrefill={dossier.onPrefill}
            />
          </div>
        )}
        {tab === 'notes' && dossier && (
          <ViewerNotes liveId={dossier.liveId} chatter={chatter} gate={gate} />
        )}
      </div>
    </aside>
  )
}
