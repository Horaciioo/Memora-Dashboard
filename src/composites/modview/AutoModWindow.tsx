'use client'

import { DotMark } from '@/components/elements/display/Dotted'
import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { FlaggedText } from '@/composites/modview/FlaggedText'
import { ModWindow, WindowEmpty } from '@/composites/modview/ModWindow'
import { WatchPanel } from '@/composites/modview/WatchPanel'
import type { ActRunner, GateCheck } from '@/composites/modview/types'
import { useModPreferences } from '@/core/hooks/interaction/state/useModPreferences'
import type { Watchlist } from '@/core/hooks/interaction/state/useWatchlist'
import { MODVIEW_COPY } from '@/declarations/modview/copy'
import { ICONS } from '@/declarations/ui/icons'
import { MODVIEW_WATCH_COPY } from '@/declarations/modview/watch'
import {
  MODVIEW_FEED,
  MODVIEW_MODES,
  MODVIEW_SUGGEST,
  MODVIEW_TABS,
} from '@/declarations/ui/variants'
import type { Chatter, HeldMessage, ModAct } from '@/types/modview'
import { cn } from '@/utils/classnames'
import { formatSince } from '@/utils/format/dates'

// Resolved lines kept under the queue
const MAX_RESOLVED = 50

export interface AutoModWindowProps {
  held: HeldMessage[]
  // Acts of the team, where the handled messages are read
  acts: ModAct[]
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
  acts,
  isLit,
  gate,
  onAct,
  hasQueue,
  hasWatch = true,
  watchlist,
  onPick,
}: AutoModWindowProps) => {
  const [choice, setChoice] = useState<AutoModTab>('queue')
  const { preferences, update } = useModPreferences()
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

  // Handled messages stay in the queue as resolved when the moderator wants it
  const resolved = preferences.keepResolved
    ? acts
        .filter((act) => act.kind === 'automodApprove' || act.kind === 'automodDeny')
        .slice(0, MAX_RESOLVED)
    : []
  const rows = [
    ...held.map((entry) => ({ key: entry.id, at: entry.at, held: entry, act: null })),
    ...resolved.map((act) => ({ key: act.id, at: act.at, held: null, act })),
  ].sort((left, right) => Date.parse(right.at) - Date.parse(left.at))

  const keepToggle = tab === 'queue' && (
    <button
      type="button"
      className={MODVIEW_MODES.trigger}
      aria-pressed={preferences.keepResolved}
      title={
        preferences.keepResolved ? MODVIEW_COPY.keepResolvedHint : MODVIEW_COPY.dropResolvedHint
      }
      onClick={() => update({ keepResolved: !preferences.keepResolved })}
    >
      {preferences.keepResolved ? MODVIEW_COPY.keepResolved : MODVIEW_COPY.dropResolved}
    </button>
  )

  return (
    <ModWindow
      actions={keepToggle}
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
      ) : rows.length === 0 ? (
        <WindowEmpty
          icon="automod"
          title={MODVIEW_COPY.automodEmptyTitle}
          body={MODVIEW_COPY.automodEmptyBody}
        />
      ) : (
        <ul className={MODVIEW_FEED.list}>
          {rows.map((row) => {
            const entry = row.held
            if (!entry) return <ResolvedLine key={row.key} act={row.act} />
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

/**
 * A handled message kept in the queue, as Twitch keeps it
 * @param {ModAct} act - Accept or refusal of the held message
 * @return {JSX.Element}
 */

const ResolvedLine = ({ act }: { act: ModAct }) => {
  const isApproved = act.kind === 'automodApprove'
  const StatusIcon = ICONS[isApproved ? 'check' : 'close']

  return (
    <li className={cn(MODVIEW_FEED.item, MODVIEW_FEED.itemPending)}>
      <div className={MODVIEW_FEED.main}>
        <span className={MODVIEW_FEED.category}>{MODVIEW_COPY.resolved}</span>
        <p>
          <span className={MODVIEW_FEED.who}>{act.target}</span>
          <DotMark />
          {formatSince(act.at)}
        </p>
        {act.quote && <p className={MODVIEW_FEED.quote}>{act.quote}</p>}
        <p className={MODVIEW_FEED.line}>
          <StatusIcon className="mr-1 inline h-4 w-4 align-[-3px]" aria-hidden="true" />
          {(isApproved ? MODVIEW_COPY.resolvedApproved : MODVIEW_COPY.resolvedDenied).replace(
            '{name}',
            act.moderator
          )}
        </p>
      </div>
    </li>
  )
}
