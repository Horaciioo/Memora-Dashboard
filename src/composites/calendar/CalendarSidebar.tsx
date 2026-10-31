'use client'

import { LEFT_SIDEBAR } from '@/declarations/ui/blocks'
import { Tip } from '@/components/elements/feedback/Tip'
import { useState } from 'react'
import { Button } from '@/components/elements/actions/Button'
import { BottomSheet } from '@/components/structures/overlays/BottomSheet'
import { ICONS } from '@/declarations/ui/icons'
import { Avatar } from '@/components/elements/display/Avatar'
import { CalendarMiniMonth } from '@/composites/calendar/CalendarMiniMonth'
import { CALENDAR_COPY } from '@/declarations/calendar/copy'
import { CALENDAR_KIND_REGISTRY, CALENDAR_LAYER_REGISTRY } from '@/declarations/calendar/registries'
import { railIcon } from '@/declarations/ui/railIcons'
import { BOTTOM_SHEET, CALENDAR_SIDEBAR } from '@/declarations/ui/variants'
import type { FieldOption } from '@/types/forms'
import { cn } from '@/utils/classnames'
import type { CalendarUnit } from '@/utils/format/calendar'
import type { CalendarKindName, CalendarLayerName } from '@/utils/constants/workflow'

export interface CalendarSidebarProps {
  cursor: string
  unit: CalendarUnit
  onPick: (dayKey: string) => void
  onCursor: (dayKey: string) => void
  search: string
  onSearch: (value: string) => void
  // Calendars the viewer may read at all
  layers: CalendarLayerName[]
  hiddenLayers: CalendarLayerName[]
  onToggleLayer: (layer: CalendarLayerName) => void
  // Shapes switched off: zones, periods, entries
  hiddenKinds: CalendarKindName[]
  onToggleKind: (kind: CalendarKindName) => void
  youtubers: FieldOption[]
  hiddenCreators: string[]
  onToggleCreator: (creatorId: string) => void
}

/**
 * Filters button lifting the rail from the bottom
 * @param {CalendarSidebarProps} props - Cursor
 * @return {JSX.Element}
 */

export const CalendarSidebar = (props: CalendarSidebarProps) => {
  const [isOpen, setOpen] = useState(false)
  const hiddenTally =
    props.hiddenLayers.length + props.hiddenCreators.length + props.hiddenKinds.length

  return (
    <>
      <Button
        icon="filter"
        title={CALENDAR_COPY.sidebarToggle}
        aria-label={CALENDAR_COPY.sidebarToggle}
        aria-expanded={isOpen}
        className={cn(CALENDAR_SIDEBAR.trigger, hiddenTally > 0 && CALENDAR_SIDEBAR.triggerActive)}
        onClick={() => setOpen(true)}
      />
      <BottomSheet
        open={isOpen}
        onClose={() => setOpen(false)}
        title={CALENDAR_COPY.sidebarToggle}
        figure={
          <h2 className={BOTTOM_SHEET.figureTitle} aria-hidden="true">
            {CALENDAR_COPY.sidebarToggle}
          </h2>
        }
      >
        <div className={CALENDAR_SIDEBAR.sheetBody}>
          <CalendarRailBody {...props} withSearch hideMonth />
        </div>
      </BottomSheet>
    </>
  )
}

// Glyph a selected row shows in place of its own
const Tick = railIcon('check')

/**
 * Month in miniature then the switches
 * @param {CalendarSidebarProps} props - Cursor
 * @return {JSX.Element}
 */

export const CalendarRailBody = ({
  withSearch,
  hideMonth,
  cursor,
  unit,
  onPick,
  onCursor,
  search,
  onSearch,
  layers,
  hiddenLayers,
  onToggleLayer,
  hiddenKinds,
  onToggleKind,
  youtubers,
  hiddenCreators,
  onToggleCreator,
}: CalendarSidebarProps & { withSearch?: boolean; hideMonth?: boolean }) => {
  // What is filtered: the shapes drawn, or the calendars read
  const [tab, setTab] = useState<'types' | 'calendars'>('types')

  return (
    <>
      {!hideMonth && (
        <CalendarMiniMonth cursor={cursor} unit={unit} onPick={onPick} onCursor={onCursor} />
      )}

      {withSearch && (
        <input
          type="search"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder={CALENDAR_COPY.search}
          aria-label={CALENDAR_COPY.search}
          className={CALENDAR_SIDEBAR.search}
        />
      )}

      <div
        className={LEFT_SIDEBAR.viewButtons}
        role="group"
        aria-label={CALENDAR_COPY.sidebarToggle}
      >
        {(
          [
            ['types', CALENDAR_COPY.sidebarTypes],
            ['calendars', CALENDAR_COPY.sidebarLayers],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={tab === value}
            onClick={() => setTab(value)}
            className={cn(LEFT_SIDEBAR.viewButton, tab === value && LEFT_SIDEBAR.viewButtonActive)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'types' && (
        <div className={CALENDAR_SIDEBAR.group}>
          {CALENDAR_KIND_REGISTRY.keys.map((kind) => {
            const meta = CALENDAR_KIND_REGISTRY.get(kind)
            const Glyph = railIcon(meta.icon)
            const on = !hiddenKinds.includes(kind)
            const Shown = on ? Tick : Glyph

            return (
              <Tip key={kind} label={meta.summary} floating className="w-full">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  onClick={() => onToggleKind(kind)}
                  className={cn(
                    CALENDAR_SIDEBAR.row,
                    on ? CALENDAR_SIDEBAR.rowOn : CALENDAR_SIDEBAR.rowOff
                  )}
                >
                  <Shown
                    className={cn(CALENDAR_SIDEBAR.rowGlyph, on && CALENDAR_SIDEBAR.rowGlyphOn)}
                    aria-hidden="true"
                  />
                  <span className={CALENDAR_SIDEBAR.rowLabel}>{meta.plural ?? meta.label}</span>
                </button>
              </Tip>
            )
          })}
        </div>
      )}

      {tab === 'calendars' && (
        <>
          <div className={CALENDAR_SIDEBAR.group}>
            {layers.map((layer) => {
              const meta = CALENDAR_LAYER_REGISTRY.get(layer)
              const Glyph = railIcon(meta.icon)
              const on = !hiddenLayers.includes(layer)
              const Shown = on ? Tick : Glyph

              return (
                <button
                  key={layer}
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  onClick={() => onToggleLayer(layer)}
                  className={cn(
                    CALENDAR_SIDEBAR.row,
                    on ? CALENDAR_SIDEBAR.rowOn : CALENDAR_SIDEBAR.rowOff
                  )}
                >
                  <Shown
                    className={cn(CALENDAR_SIDEBAR.rowGlyph, on && CALENDAR_SIDEBAR.rowGlyphOn)}
                    aria-hidden="true"
                  />
                  <span className={CALENDAR_SIDEBAR.rowLabel}>{meta.label}</span>
                </button>
              )
            })}
          </div>

          {/* One creator leaves nothing to choose from */}
          {youtubers.length > 1 && (
            <div className={CALENDAR_SIDEBAR.group}>
              <h2 className={CALENDAR_SIDEBAR.groupTitle}>{CALENDAR_COPY.sidebarCreators}</h2>
              {youtubers.map((creator) => {
                const on = !hiddenCreators.includes(creator.value)

                return (
                  <button
                    key={creator.value}
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    onClick={() => onToggleCreator(creator.value)}
                    className={cn(
                      CALENDAR_SIDEBAR.row,
                      on ? CALENDAR_SIDEBAR.rowOn : CALENDAR_SIDEBAR.rowOff
                    )}
                  >
                    <span className={cn(CALENDAR_SIDEBAR.mark, !on && CALENDAR_SIDEBAR.markOff)}>
                      <Avatar name={creator.label} src={creator.image} size="xs" />
                    </span>
                    <span className={CALENDAR_SIDEBAR.rowLabel}>{creator.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </>
      )}
    </>
  )
}

/**
 * Left sidebar of the calendar
 * @param {CalendarSidebarProps} props - Cursor
 * @return {JSX.Element}
 */

export const CalendarRailPanel = (props: CalendarSidebarProps) => {
  return (
    <div className={CALENDAR_SIDEBAR.panel}>
      <CalendarRailBody {...props} />
    </div>
  )
}

/**
 * Search bar of the sidebar while the calendar is open
 * @param {Object} props - Field state
 * @param {string} props.value - Typed words
 * @param {(value: string) => void} props.onChange - Change handler
 * @return {JSX.Element}
 */

export const CalendarSearchBar = ({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) => {
  return (
    <label className={CALENDAR_SIDEBAR.searchBar}>
      <ICONS.search className="size-4 shrink-0" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={CALENDAR_COPY.search}
        aria-label={CALENDAR_COPY.search}
        className={CALENDAR_SIDEBAR.searchInput}
      />
    </label>
  )
}
