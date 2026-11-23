'use client'

import { DotMark } from '@/components/elements/display/Dotted'
import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { DecisionRing } from '@/composites/modview/DecisionRing'
import { FlaggedText } from '@/composites/modview/FlaggedText'
import { AutoModHistory } from '@/composites/modview/AutoModHistory'
import { ModWindow, WindowEmpty } from '@/composites/modview/ModWindow'
import { PersonalLine } from '@/composites/modview/PersonalLine'
import { WatchPanel } from '@/composites/modview/WatchPanel'
import type { ActRunner, GateCheck } from '@/composites/modview/types'
import { personalLines } from '@/core/lib/modview/personal'
import { useModPreferences } from '@/core/hooks/interaction/state/moderation/useModPreferences'
import type { Watchlist } from '@/core/hooks/interaction/state/moderation/useWatchlist'
import { MODVIEW_COPY } from '@/declarations/modview/copy'
import { MODVIEW_WATCH_COPY } from '@/declarations/modview/watch'
import { ICONS } from '@/declarations/ui/icons'
import { MODVIEW_FEED, MODVIEW_SUGGEST, MODVIEW_TABS } from '@/declarations/ui/variants'
import type { ChatMessage, Chatter, HeldMessage, ModAct } from '@/types/modview'
import { cn } from '@/utils/classnames'
import { chatColour } from '@/utils/format/chatColour'
import { formatSince } from '@/utils/format/time/dates'

// Lines of personal badwords kept in the queue
const MAX_PERSONAL = 50

// Seconds a decided message stays in the queue
const DECIDED_SECONDS = 10

interface Decided {
  entry: HeldMessage
  approve: boolean
  until: number
}

export interface AutoModWindowProps {
  held: HeldMessage[]
  // Chat lines, read for the moderator's own badwords
  messages: ChatMessage[]
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
  // Open the viewer behind a handled message
  onPickAct: (act: ModAct) => void
  // Name colour of a viewer
  colourOf: (id: string | null | undefined, name: string | null) => string | undefined
}

type AutoModTab = 'queue' | 'history' | 'watch'

/**
 * Queue of held messages, with the Surveillance tab beside it
 * @param {AutoModWindowProps} props - Window props
 * @return {JSX.Element}
 */

export const AutoModWindow = ({
  held,
  messages,
  acts,
  isLit,
  gate,
  onAct,
  hasQueue,
  hasWatch = true,
  watchlist,
  onPick,
  onPickAct,
  colourOf,
}: AutoModWindowProps) => {
  const [choice, setChoice] = useState<AutoModTab>('queue')
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [decided, setDecided] = useState<Record<string, Decided>>({})
  const [now, setNow] = useState(() => Date.now())
  const { preferences } = useModPreferences()
  const tab: AutoModTab = hasQueue ? choice : 'watch'

  // Looking at the tab, or leaving it, reads what is there
  const select = (next: AutoModTab) => {
    watchlist.markSeen()
    setChoice(next)
  }

  // One tick a second while a decision is counting down
  const counting = Object.keys(decided).length > 0
  useEffect(() => {
    if (!counting) return
    const timer = setInterval(() => {
      const time = Date.now()
      setNow(time)
      setDecided((current) => {
        const kept = Object.entries(current).filter(([, value]) => value.until > time)
        return kept.length === Object.keys(current).length ? current : Object.fromEntries(kept)
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [counting])

  // Act, then open the viewer so a sanction needs no search
  const decide = (entry: HeldMessage, approve: boolean) => {
    onAct({ kind: 'automod', heldId: entry.id, approve })
    const time = Date.now()
    setNow(time)
    setDecided((current) => ({
      ...current,
      [entry.id]: { entry, approve, until: time + DECIDED_SECONDS * 1000 },
    }))
    onPick(entry.author)
  }

  const personal = useMemo(
    () => personalLines(messages, preferences.badwords, MAX_PERSONAL),
    [messages, preferences.badwords]
  )
  const rows = [
    ...held
      .filter((entry) => !decided[entry.id])
      .map((entry) => ({ key: entry.id, at: entry.at, held: entry, line: null })),
    ...Object.values(decided).map(({ entry }) => ({
      key: entry.id,
      at: entry.at,
      held: entry,
      line: null,
    })),
    ...personal
      .filter((line) => !dismissed.has(line.message.id))
      .map((line) => ({
        key: line.message.id,
        at: line.message.sentAt,
        held: null,
        line,
      })),
  ].sort((left, right) => Date.parse(right.at) - Date.parse(left.at))

  const watchCount = tab === 'watch' ? 0 : watchlist.unseen

  return (
    <ModWindow
      title={
        hasQueue ? (
          <button
            type="button"
            draggable={false}
            className={MODVIEW_TABS.title}
            onClick={() => select('queue')}
          >
            {MODVIEW_WATCH_COPY.queue}
          </button>
        ) : (
          MODVIEW_WATCH_COPY.watch
        )
      }
      actions={
        hasQueue && (
          <>
            {hasWatch && (
              <button
                type="button"
                draggable={false}
                className={cn(
                  MODVIEW_TABS.tab,
                  tab === 'watch' && MODVIEW_TABS.tabOn,
                  MODVIEW_TABS.tabFixed
                )}
                onClick={() => select('watch')}
              >
                <span className={MODVIEW_TABS.tabLabel}>{MODVIEW_WATCH_COPY.watch}</span>
                {watchCount > 0 && <span className={MODVIEW_TABS.badge}>{watchCount}</span>}
              </button>
            )}
            <button
              type="button"
              draggable={false}
              className={cn(MODVIEW_TABS.icon, tab === 'history' && MODVIEW_TABS.iconOn)}
              aria-label={MODVIEW_WATCH_COPY.history}
              aria-pressed={tab === 'history'}
              title={MODVIEW_WATCH_COPY.history}
              onClick={() => select('history')}
            >
              <ICONS.history className={MODVIEW_TABS.iconGlyph} aria-hidden="true" />
            </button>
          </>
        )
      }
      label={MODVIEW_COPY.automod}
      isLit={isLit}
      grow
    >
      {tab === 'watch' ? (
        <WatchPanel watchlist={watchlist} gate={gate} onAct={onAct} onPick={onPick} />
      ) : tab === 'history' ? (
        <AutoModHistory acts={acts} onPickAct={onPickAct} colourOf={colourOf} />
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
            if (row.line) {
              return (
                <PersonalLine
                  key={row.key}
                  line={row.line}
                  onPick={onPick}
                  onWatch={watchlist.watch}
                  onDismiss={(id) => setDismissed((current) => new Set([...current, id]))}
                />
              )
            }
            if (!entry) return null

            const verdict = decided[entry.id]
            const check = gate({ kind: 'automod', heldId: entry.id, approve: true })

            return (
              <li key={entry.id} className={MODVIEW_FEED.item}>
                <div className={MODVIEW_FEED.main}>
                  <span className={MODVIEW_FEED.category}>{entry.category}</span>
                  <p>
                    <button
                      type="button"
                      className={MODVIEW_FEED.whoLink}
                      style={{
                        color: preferences.colouredNames ? chatColour(entry.author) : undefined,
                      }}
                      onClick={() => onPick(entry.author)}
                    >
                      {entry.author.name}
                    </button>
                    <DotMark />
                    {verdict ? (
                      <DecisionRing
                        left={Math.max(0, Math.ceil((verdict.until - now) / 1000))}
                        total={DECIDED_SECONDS}
                      />
                    ) : (
                      formatSince(entry.at)
                    )}
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
                      disabled={!check.allowed || !!verdict}
                      onClick={() => decide(entry, true)}
                    />
                    <Button
                      variant="ghost"
                      icon="close"
                      className={MODVIEW_SUGGEST.refuse}
                      aria-label={MODVIEW_COPY.deny}
                      title={check.reason ?? MODVIEW_COPY.deny}
                      disabled={!check.allowed || !!verdict}
                      onClick={() => decide(entry, false)}
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
