'use client'

import { DotMark } from '@/components/elements/display/Dotted'
import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { FlaggedText } from '@/composites/modview/FlaggedText'
import { ModWindow, WindowEmpty } from '@/composites/modview/ModWindow'
import { WatchPanel } from '@/composites/modview/WatchPanel'
import type { ActRunner, GateCheck } from '@/composites/modview/types'
import type { Watchlist } from '@/core/hooks/interaction/state/useWatchlist'
import { MODVIEW_COPY } from '@/declarations/modview/copy'
import { MODVIEW_WATCH_COPY } from '@/declarations/modview/watch'
import { MODVIEW_FEED, MODVIEW_SUGGEST, MODVIEW_TABS } from '@/declarations/ui/variants'
import type { Chatter, HeldMessage } from '@/types/modview'
import { cn } from '@/utils/classnames'
import { formatSince } from '@/utils/format/dates'

export interface AutoModWindowProps {
  held: HeldMessage[]
  isLit: boolean
  gate: GateCheck
  onAct: ActRunner
  // The queue exists on Twitch only
  hasQueue: boolean
  // Watch tab beside the queue, the live page keeps it in the sanctions panel
  hasWatch?: boolean
  watchlist: Watchlist
  onPick: (chatter: Chatter) => void
}

type AutoModTab = 'queue' | 'watch'

/**
 * Queue of held messages, with the Surveillance tab beside it
 * @param {AutoModWindowProps} props - Window props
 * @return {JSX.Element}
 */

export const AutoModWindow = ({
  held,
  isLit,
  gate,
  onAct,
  hasQueue,
  hasWatch = true,
  watchlist,
  onPick,
}: AutoModWindowProps) => {
  const [choice, setChoice] = useState<AutoModTab>('queue')
  const tab: AutoModTab = hasQueue && (choice === 'queue' || hasWatch) ? choice : 'watch'

  // Looking at the tab, or leaving it, reads what is there
  const select = (next: AutoModTab) => {
    watchlist.markSeen()
    setChoice(next)
  }

  const tabs = [
    ...(hasQueue ? [{ key: 'queue' as const, label: MODVIEW_WATCH_COPY.queue, count: 0 }] : []),
    ...(hasWatch
      ? [
          {
            key: 'watch' as const,
            label: MODVIEW_WATCH_COPY.watch,
            count: tab === 'watch' ? 0 : watchlist.unseen,
          },
        ]
      : []),
  ]

  return (
    <ModWindow
      title={
        tabs.length === 1 ? (
          tabs[0]!.label
        ) : (
          <span className={MODVIEW_TABS.list} role="tablist" aria-label={MODVIEW_WATCH_COPY.tabs}>
            {tabs.map((entry) => (
              <button
                key={entry.key}
                type="button"
                role="tab"
                aria-selected={tab === entry.key}
                draggable={false}
                className={cn(
                  MODVIEW_TABS.tab,
                  tab === entry.key && MODVIEW_TABS.tabOn,
                  entry.key === 'watch' && MODVIEW_TABS.tabFixed
                )}
                onClick={() => select(entry.key)}
              >
                <span className={MODVIEW_TABS.tabLabel}>{entry.label}</span>
                {entry.count > 0 && <span className={MODVIEW_TABS.badge}>{entry.count}</span>}
              </button>
            ))}
          </span>
        )
      }
      label={MODVIEW_COPY.automod}
      isLit={isLit}
      grow
    >
      {tab === 'watch' ? (
        <WatchPanel watchlist={watchlist} gate={gate} onAct={onAct} onPick={onPick} />
      ) : held.length === 0 ? (
        <WindowEmpty
          icon="automod"
          title={MODVIEW_COPY.automodEmptyTitle}
          body={MODVIEW_COPY.automodEmptyBody}
        />
      ) : (
        <ul className={MODVIEW_FEED.list}>
          {held.map((entry) => {
            const check = gate({ kind: 'automod', heldId: entry.id, approve: true })

            return (
              <li key={entry.id} className={MODVIEW_FEED.item}>
                <div className={MODVIEW_FEED.main}>
                  <span className={MODVIEW_FEED.category}>{entry.category}</span>
                  <p>
                    <button
                      type="button"
                      className={MODVIEW_FEED.whoLink}
                      onClick={() => onPick(entry.author)}
                    >
                      {entry.author.name}
                    </button>
                    <DotMark />
                    {formatSince(entry.at)}
                  </p>
                  <p className={MODVIEW_FEED.quote}>
                    <FlaggedText text={entry.text} flagged={entry.flagged} />
                  </p>
                  <div className={MODVIEW_SUGGEST.actions}>
                    <Button
                      variant="ghost"
                      icon="visible"
                      className={MODVIEW_SUGGEST.watch}
                      aria-label={MODVIEW_WATCH_COPY.start}
                      title={MODVIEW_WATCH_COPY.start}
                      onClick={() => watchlist.watch(entry.author)}
                    />
                    <Button
                      variant="ghost"
                      icon="check"
                      className={MODVIEW_SUGGEST.accept}
                      aria-label={MODVIEW_COPY.approve}
                      title={check.reason ?? MODVIEW_COPY.approve}
                      disabled={!check.allowed}
                      onClick={() => onAct({ kind: 'automod', heldId: entry.id, approve: true })}
                    />
                    <Button
                      variant="ghost"
                      icon="close"
                      className={MODVIEW_SUGGEST.refuse}
                      aria-label={MODVIEW_COPY.deny}
                      title={check.reason ?? MODVIEW_COPY.deny}
                      disabled={!check.allowed}
                      onClick={() => onAct({ kind: 'automod', heldId: entry.id, approve: false })}
                    />
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </ModWindow>
  )
}
