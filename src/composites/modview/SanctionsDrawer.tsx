'use client'

import { useState } from 'react'

import { FloatingRail } from '@/composites/modview/FloatingRail'
import { OffenseRail } from '@/composites/modview/OffenseRail'
import { WatchPanel } from '@/composites/modview/WatchPanel'
import type { WatchPanelProps } from '@/composites/modview/WatchPanel'
import { SuggestionList } from '@/composites/modview/SuggestionList'
import type { SuggestionListProps } from '@/composites/modview/SuggestionList'
import { SplitHandle } from '@/composites/modview/workspace/SplitHandle'
import type { PanelMemory } from '@/core/lib/modview/commands'
import { MODVIEW_COPY, MODVIEW_PANEL_COPY } from '@/declarations/modview/copy'
import { MODVIEW_WATCH_COPY } from '@/declarations/modview/watch'
import { MODVIEW_WORKSPACE_COPY } from '@/declarations/modview/workspace'
import { MODVIEW_SUGGESTION_COPY } from '@/declarations/modview/suggestions'
import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { MODVIEW_SANCTIONS, MODVIEW_SANCTIONS_SPLIT } from '@/declarations/ui/variants'
import type { Chatter } from '@/types/modview'
import type { SanctionOffenseCard, SanctionPanelView } from '@/types/sanctions'
import { cn } from '@/utils/classnames'

export interface SanctionsDrawerProps {
  panel: SanctionPanelView | null
  levelName: string | null
  levelIcon: IconName | null
  target: Chatter | null
  memory: PanelMemory
  onPrefill: (offense: SanctionOffenseCard, rung: number) => void
  // Commands ready to paste, on a real live
  suggest?: SuggestionListProps
  // Viewers under watch, under the offences
  watch?: WatchPanelProps
}

/**
 * Sanctions panel at hand: the level in force, a search, three glyph tabs and the offences as
 * text boxes, the rungs already applied to the picked viewer struck through
 * @param {SanctionsDrawerProps} props - Drawer props
 * @return {JSX.Element}
 */

export const SanctionsDrawer = ({
  panel,
  levelName,
  levelIcon,
  target,
  memory,
  onPrefill,
  suggest,
  watch,
}: SanctionsDrawerProps) => {
  const [search, setSearch] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  // Share of the panel the offences keep
  const [topShare, setTopShare] = useState(0.5)
  const [column, setColumn] = useState<HTMLDivElement | null>(null)

  const SuggestionIcon = ICONS.spark
  const LevelIcon = levelIcon ? ICONS[levelIcon] : null

  const needle = search.trim().toLowerCase()
  const offenses = (panel?.offenses ?? []).filter(
    (offense) =>
      !needle ||
      offense.name.toLowerCase().includes(needle) ||
      offense.examples.some((example) => example.toLowerCase().includes(needle))
  )
  const opened = offenses.find((offense) => offense.id === openId) ?? null
  const empty = needle ? MODVIEW_PANEL_COPY.emptySearch : MODVIEW_COPY.sanctionsEmpty

  return (
    <>
      <div ref={setColumn} className={MODVIEW_SANCTIONS.column}>
        <aside
          className={MODVIEW_SANCTIONS.root}
          style={{ flex: `${watch ? topShare : 1} 1 0%` }}
          aria-label={MODVIEW_COPY.sanctions}
        >
          <h3 className={MODVIEW_SANCTIONS.toggle}>{MODVIEW_COPY.sanctions}</h3>

          <div className={MODVIEW_SANCTIONS.top}>
            <div className={MODVIEW_SANCTIONS.head}>
              {LevelIcon && (
                <LevelIcon className={MODVIEW_SANCTIONS.headGlyph} aria-hidden="true" />
              )}
              {levelName && <p className={MODVIEW_SANCTIONS.headName}>{levelName}</p>}
            </div>

            <input
              className={MODVIEW_SANCTIONS.search}
              placeholder={MODVIEW_PANEL_COPY.search}
              aria-label={MODVIEW_PANEL_COPY.search}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            {suggest && suggest.suggestions.length > 0 && (
              <>
                <div className={MODVIEW_SANCTIONS.divider} />
                <section
                  className={MODVIEW_SANCTIONS.suggestion}
                  aria-label={MODVIEW_SUGGESTION_COPY.title}
                >
                  <h4 className={MODVIEW_SANCTIONS.suggestionTitle}>
                    <SuggestionIcon
                      className={MODVIEW_SANCTIONS.suggestionIcon}
                      aria-hidden="true"
                    />
                    {MODVIEW_SUGGESTION_COPY.title}
                  </h4>
                  <SuggestionList {...suggest} />
                </section>
                <div className={MODVIEW_SANCTIONS.divider} />
              </>
            )}

            {offenses.length === 0 && <p className={MODVIEW_SANCTIONS.empty}>{empty}</p>}

            <div className={MODVIEW_SANCTIONS.list}>
              {offenses.map((offense) => (
                <button
                  key={offense.id}
                  type="button"
                  aria-pressed={offense.id === openId}
                  className={cn(
                    MODVIEW_SANCTIONS.title,
                    offense.id === openId && MODVIEW_SANCTIONS.titleOn
                  )}
                  onClick={() => setOpenId(offense.id === openId ? null : offense.id)}
                >
                  {offense.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {watch && (
          <>
            <SplitHandle
              orientation="horizontal"
              label={MODVIEW_WORKSPACE_COPY.resizeWindows}
              onMove={(pixels) =>
                setTopShare((share) =>
                  Math.min(
                    MODVIEW_SANCTIONS_SPLIT.max,
                    Math.max(
                      MODVIEW_SANCTIONS_SPLIT.min,
                      share + pixels / (column?.clientHeight || 1)
                    )
                  )
                )
              }
            />
            <section
              className={cn(MODVIEW_SANCTIONS.root, MODVIEW_SANCTIONS.bottom)}
              style={{ flex: `${1 - topShare} 1 0%` }}
              aria-label={MODVIEW_WATCH_COPY.watch}
            >
              <h4 className={MODVIEW_SANCTIONS.bottomTitle}>{MODVIEW_WATCH_COPY.watch}</h4>
              <div className={MODVIEW_SANCTIONS.bottomBody}>
                <WatchPanel {...watch} />
              </div>
            </section>
          </>
        )}
      </div>
      {opened && (
        <FloatingRail anchor={column}>
          <OffenseRail
            offense={opened}
            target={target}
            applied={target ? (memory[target.id]?.[opened.id] ?? []) : []}
            onPrefill={onPrefill}
            onClose={() => setOpenId(null)}
          />
        </FloatingRail>
      )}
    </>
  )
}
