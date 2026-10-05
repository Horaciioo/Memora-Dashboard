'use client'

import { useState } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { Button } from '@/components/elements/actions/Button'
import { CommunityWindow } from '@/composites/modview/CommunityWindow'
import { ModWindow } from '@/composites/modview/ModWindow'
import { apiGet } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { nextRung } from '@/core/lib/modview/commands'
import type { PanelMemory } from '@/core/lib/modview/commands'
import { MODERATION_KINDS } from '@/declarations/lives/moderation'
import { MODVIEW_ACT_COPY, MODVIEW_COPY, MODVIEW_HISTORY_COPY } from '@/declarations/modview/copy'
import { MODVIEW_HISTORY } from '@/declarations/ui/variants'
import type { LiveFocusView, LivePerson, ViewerSanction } from '@/types/lives'
import type { Chatter, ModViewState, ModViewTarget } from '@/types/modview'
import type { SanctionOffenseCard, SanctionPanelView } from '@/types/sanctions'
import { cn } from '@/utils/classnames'
import { formatDayTime, formatSince } from '@/utils/format/dates'
import { formatDuration } from '@/utils/format/modview'

// Acts that sanction a viewer
const SANCTION_ACTS = ['delete', 'warn', 'timeout', 'ban']

/**
 * What only a real live adds to the history view
 * @typedef {Object} HistoryLiveTools
 */

export interface HistoryLiveTools {
  id: string
  members: LivePerson[]
  canInspect: boolean
  canFocus: (accountId: string) => boolean
  focuses: LiveFocusView[]
  onInspect: (accountId: string) => void
  onFocus: (accountId: string) => void
}

export interface HistoryWindowProps {
  state: ModViewState
  spotlight: ModViewTarget | null
  panel: SanctionPanelView | null
  memory: PanelMemory
  onPick: (chatter: Chatter) => void
  onPrefill: (offense: SanctionOffenseCard, rung: number, chatter: Chatter) => void
  live?: HistoryLiveTools
}

/**
 * Who was sanctioned during the live
 * @param {HistoryWindowProps} props - Window props
 * @return {JSX.Element}
 */

export const HistoryWindow = ({
  state,
  spotlight,
  panel,
  memory,
  onPick,
  onPrefill,
  live,
}: HistoryWindowProps) => {
  const [past, setPast] = useState<Record<string, ViewerSanction[] | null>>({})

  // Every chatter seen on screen
  const known = new Map<string, Chatter>()
  for (const message of state.messages) known.set(message.author.id, message.author)
  for (const group of Object.values(state.community)) {
    for (const chatter of group) known.set(chatter.id, chatter)
  }
  const byName = (name: string) =>
    [...known.values()].find(
      (chatter) => chatter.name === name || chatter.login === name.toLowerCase()
    ) ?? null

  // Sanctioned viewers: the panel memory first
  const sanctioned = new Map<string, Chatter>()
  for (const id of Object.keys(memory)) {
    const chatter = known.get(id)
    if (chatter) sanctioned.set(chatter.id, chatter)
  }
  for (const act of state.acts) {
    if (!act.target || !SANCTION_ACTS.includes(act.kind)) continue
    const chatter = byName(act.target)
    if (chatter) sanctioned.set(chatter.id, chatter)
  }

  const loadPast = async (chatter: Chatter) => {
    if (!live) return
    setPast((current) => ({ ...current, [chatter.id]: null }))
    const rows = await apiGet<ViewerSanction[]>(API_ROUTES.liveViewer(live.id, chatter.id)).catch(
      () => []
    )
    setPast((current) => ({ ...current, [chatter.id]: rows }))
  }

  return (
    <ModWindow title={MODVIEW_HISTORY_COPY.title} isLit={spotlight === 'community'} grow>
      <section className={MODVIEW_HISTORY.section}>
        <h4 className={MODVIEW_HISTORY.label}>{MODVIEW_HISTORY_COPY.sanctioned}</h4>
        {sanctioned.size === 0 && (
          <p className={MODVIEW_HISTORY.empty}>{MODVIEW_HISTORY_COPY.empty}</p>
        )}

        {[...sanctioned.values()].map((chatter) => {
          const lines = state.acts.filter(
            (act) => act.target && byName(act.target)?.id === chatter.id
          )
          const offenses = Object.entries(memory[chatter.id] ?? {})
            .map(([offenseId, applied]) => {
              const offense = panel?.offenses.find((entry) => entry.id === offenseId)
              const next = offense ? nextRung(applied, offense.rungs.length) : null

              return offense && next !== null && !applied.includes(next) ? { offense, next } : null
            })
            .filter((entry): entry is { offense: SanctionOffenseCard; next: number } =>
              Boolean(entry)
            )
          const history = past[chatter.id]

          return (
            <article key={chatter.id} className={MODVIEW_HISTORY.viewer}>
              <div className={MODVIEW_HISTORY.viewerHead}>
                <button
                  type="button"
                  className={MODVIEW_HISTORY.name}
                  style={chatter.colour ? { color: chatter.colour } : undefined}
                  onClick={() => onPick(chatter)}
                >
                  {chatter.name}
                </button>
                {live && (
                  <Button variant="ghost" icon="history" onClick={() => void loadPast(chatter)}>
                    {MODVIEW_HISTORY_COPY.past}
                  </Button>
                )}
              </div>

              {lines.map((act) => (
                <p key={act.id} className={MODVIEW_HISTORY.line}>
                  {[
                    MODVIEW_ACT_COPY[act.kind],
                    act.durationSeconds ? formatDuration(act.durationSeconds) : null,
                    MODVIEW_HISTORY_COPY.by.replace('{name}', act.moderator),
                    act.pending ? MODVIEW_COPY.pending : formatSince(act.at),
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              ))}

              {offenses.map(({ offense, next }) => (
                <Button
                  key={offense.id}
                  variant="secondary"
                  className={MODVIEW_HISTORY.propose}
                  onClick={() => onPrefill(offense, next, chatter)}
                >
                  {MODVIEW_HISTORY_COPY.propose
                    .replace('{offense}', offense.name)
                    .replace('{n}', String(next + 1))}
                </Button>
              ))}

              {history !== undefined && (
                <div className={MODVIEW_HISTORY.past}>
                  {history === null ? (
                    <p className={MODVIEW_HISTORY.empty}>{MODVIEW_HISTORY_COPY.pastLoading}</p>
                  ) : history.length === 0 ? (
                    <p className={MODVIEW_HISTORY.empty}>{MODVIEW_HISTORY_COPY.pastEmpty}</p>
                  ) : (
                    history.map((row) => (
                      <p key={row.id} className={MODVIEW_HISTORY.line}>
                        <span
                          className={cn(
                            MODVIEW_HISTORY.tag,
                            row.fromPanel ? MODVIEW_HISTORY.tagPanel : MODVIEW_HISTORY.tagOff
                          )}
                        >
                          {row.fromPanel
                            ? MODVIEW_HISTORY_COPY.fromPanel
                            : MODVIEW_HISTORY_COPY.offPanel}
                        </span>{' '}
                        {[
                          MODERATION_KINDS[row.kind].label,
                          row.durationSeconds ? formatDuration(row.durationSeconds) : null,
                          row.reason,
                          MODVIEW_HISTORY_COPY.by.replace('{name}', row.actorName),
                          formatDayTime(row.occurredAt),
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    ))
                  )}
                </div>
              )}
            </article>
          )
        })}
      </section>

      {live && (
        <section className={MODVIEW_HISTORY.section}>
          <h4 className={MODVIEW_HISTORY.label}>{MODVIEW_HISTORY_COPY.team}</h4>
          {live.focuses.map((focus) => (
            <p key={focus.id} className={MODVIEW_HISTORY.focus}>
              {MODVIEW_HISTORY_COPY.focusBy
                .replace('{watcher}', focus.watcherName)
                .replace('{target}', focus.targetName)}
            </p>
          ))}
          {live.members.map((member) => (
            <div key={member.id} className={MODVIEW_HISTORY.member}>
              <Avatar name={member.name} src={member.avatar} size="xs" />
              <span className={MODVIEW_HISTORY.memberName}>{member.name}</span>
              {live.canInspect && (
                <Button variant="ghost" icon="search" onClick={() => live.onInspect(member.id)}>
                  {MODVIEW_HISTORY_COPY.inspect}
                </Button>
              )}
              {live.canFocus(member.id) && (
                <Button variant="ghost" icon="visible" onClick={() => live.onFocus(member.id)}>
                  {MODVIEW_HISTORY_COPY.focus}
                </Button>
              )}
            </div>
          ))}
        </section>
      )}

      <details className={MODVIEW_HISTORY.connected}>
        <summary className={MODVIEW_HISTORY.connectedSummary}>
          {MODVIEW_HISTORY_COPY.connected}
        </summary>
        <CommunityWindow community={state.community} spotlight={spotlight} onPick={onPick} bare />
      </details>
    </ModWindow>
  )
}
