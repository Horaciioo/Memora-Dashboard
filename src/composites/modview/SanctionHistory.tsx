'use client'

import { Dotted, DotMark } from '@/components/elements/display/Dotted'
import { Fragment, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { apiGet } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { nextRung } from '@/core/lib/modview/commands'
import type { PanelMemory } from '@/core/lib/modview/commands'
import { MODERATION_KINDS } from '@/declarations/lives/moderation'
import { ActSentence } from '@/composites/modview/ActSentence'
import { MOD_ACTS } from '@/declarations/modview/registries'
import { MODVIEW_ACT_COPY, MODVIEW_COPY, MODVIEW_HISTORY_COPY } from '@/declarations/modview/copy'
import { MODVIEW_HISTORY } from '@/declarations/ui/variants'
import type { ViewerSanction } from '@/types/lives'
import type { Chatter, ModViewState } from '@/types/modview'
import type { SanctionOffenseCard, SanctionPanelView } from '@/types/sanctions'
import { cn } from '@/utils/classnames'
import { formatDayTime, formatSince } from '@/utils/format/dates'
import { formatDuration } from '@/utils/format/modview'

// Acts that sanction a viewer
const SANCTION_ACTS = ['delete', 'warn', 'timeout', 'ban']

export interface SanctionHistoryProps {
  state: ModViewState
  panel: SanctionPanelView | null
  memory: PanelMemory
  // Real live whose channel holds the older sanctions
  liveId: string | null
  onPick: (chatter: Chatter) => void
  onPrefill: (offense: SanctionOffenseCard, rung: number, chatter: Chatter) => void
}

/**
 * Who was sanctioned during the live, with the next rung of each ladder
 * @param {SanctionHistoryProps} props - History props
 * @return {JSX.Element}
 */

export const SanctionHistory = ({
  state,
  panel,
  memory,
  liveId,
  onPick,
  onPrefill,
}: SanctionHistoryProps) => {
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
    if (!liveId) return
    setPast((current) => ({ ...current, [chatter.id]: null }))
    const rows = await apiGet<ViewerSanction[]>(API_ROUTES.liveViewer(liveId, chatter.id)).catch(
      () => []
    )
    setPast((current) => ({ ...current, [chatter.id]: rows }))
  }

  if (sanctioned.size === 0) {
    return <p className={MODVIEW_HISTORY.empty}>{MODVIEW_HISTORY_COPY.empty}</p>
  }

  return (
    <>
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
              {liveId && (
                <Button variant="ghost" icon="history" onClick={() => void loadPast(chatter)}>
                  {MODVIEW_HISTORY_COPY.past}
                </Button>
              )}
            </div>

            {lines.map((act) => (
              <p key={act.id} className={MODVIEW_HISTORY.line}>
                <ActSentence
                  text={MODVIEW_ACT_COPY[act.kind]}
                  verb={MOD_ACTS.get(act.kind).verb}
                  tone={MOD_ACTS.get(act.kind).tone}
                />
                {[
                  act.durationSeconds ? formatDuration(act.durationSeconds) : null,
                  MODVIEW_HISTORY_COPY.by.replace('{name}', act.moderator),
                  act.pending ? MODVIEW_COPY.pending : formatSince(act.at),
                ]
                  .filter(Boolean)
                  .map((part) => (
                    <Fragment key={part}>
                      <DotMark />
                      {part}
                    </Fragment>
                  ))}
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
                      <Dotted
                        items={[
                          MODERATION_KINDS[row.kind].label,
                          row.durationSeconds ? formatDuration(row.durationSeconds) : null,
                          row.reason,
                          row.actorName
                            ? MODVIEW_HISTORY_COPY.by.replace('{name}', row.actorName)
                            : null,
                          formatDayTime(row.occurredAt),
                        ]}
                      />
                    </p>
                  ))
                )}
              </div>
            )}
          </article>
        )
      })}
    </>
  )
}
