'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { Avatar } from '@/components/elements/display/Avatar'
import { CalendarMiniMonth } from '@/composites/calendar/CalendarMiniMonth'
import { CALENDAR_COPY } from '@/declarations/calendar/copy'
import { CALENDAR_LAYER_REGISTRY } from '@/declarations/calendar/registries'
import { ROUTES } from '@/declarations/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { accentPaint } from '@/declarations/ui/theme'
import { CALENDAR_SIDEBAR } from '@/declarations/ui/variants'
import type { FieldOption } from '@/types/forms'
import { cn } from '@/utils/classnames'
import type { CalendarUnit } from '@/utils/format/calendar'
import type { CalendarLayerName } from '@/utils/constants/workflow'

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
  youtubers: FieldOption[]
  hiddenCreators: string[]
  onToggleCreator: (creatorId: string) => void
}

/**
 * Mark of one switch: the tick stands where the icon is
 * @param {Object} props - Mark state
 * @param {string | undefined} props.accent - Stored colour
 * @param {boolean} props.on - Switch is on
 * @param {ReactNode} props.children - Icon or portrait shown while off
 * @return {JSX.Element}
 */

const FilterMark = ({
  accent,
  on,
  children,
}: {
  accent: string | undefined
  on: boolean
  children: ReactNode
}) => {
  const paint = accentPaint(accent, 'brand')
  const Check = ICONS.picked

  if (!on) return <span className={CALENDAR_SIDEBAR.mark}>{children}</span>

  return (
    <span
      className={cn(CALENDAR_SIDEBAR.mark, CALENDAR_SIDEBAR.markOn, paint.solid)}
      style={paint.style}
      aria-hidden="true"
    >
      <Check className={CALENDAR_SIDEBAR.markCheck} />
    </span>
  )
}

/**
 * Rail folded behind one button
 * @param {CalendarSidebarProps} props - Cursor
 * @return {JSX.Element}
 */

export const CalendarSidebar = (props: CalendarSidebarProps) => {
  const [isOpen, setOpen] = useState(false)
  const Chevron = ICONS.expand

  return (
    <aside className={CALENDAR_SIDEBAR.rail}>
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setOpen(!isOpen)}
        className={CALENDAR_SIDEBAR.toggle}
      >
        {CALENDAR_COPY.sidebarToggle}
        <Chevron className={cn('h-4 w-4', isOpen && 'rotate-180')} aria-hidden="true" />
      </button>
      <div className={cn(CALENDAR_SIDEBAR.railBody, isOpen ? 'flex' : 'hidden')}>
        <CalendarRailBody {...props} withSearch />
      </div>
    </aside>
  )
}

/**
 * Month in miniature then the switches
 * @param {CalendarSidebarProps} props - Cursor
 * @return {JSX.Element}
 */

export const CalendarRailBody = ({
  withSearch,
  cursor,
  unit,
  onPick,
  onCursor,
  search,
  onSearch,
  layers,
  hiddenLayers,
  onToggleLayer,
  youtubers,
  hiddenCreators,
  onToggleCreator,
}: CalendarSidebarProps & { withSearch?: boolean }) => (
  <>
    <CalendarMiniMonth cursor={cursor} unit={unit} onPick={onPick} onCursor={onCursor} />

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

    <div className={CALENDAR_SIDEBAR.group}>
      <h2 className={CALENDAR_SIDEBAR.groupTitle}>{CALENDAR_COPY.sidebarLayers}</h2>
      {layers.map((layer) => {
        const meta = CALENDAR_LAYER_REGISTRY.get(layer)
        const Glyph = ICONS[meta.icon]
        const on = !hiddenLayers.includes(layer)

        return (
          <button
            key={layer}
            type="button"
            role="checkbox"
            aria-checked={on}
            onClick={() => onToggleLayer(layer)}
            className={cn(CALENDAR_SIDEBAR.row, !on && CALENDAR_SIDEBAR.rowOff)}
          >
            <FilterMark accent={undefined} on={on}>
              <Glyph className={CALENDAR_SIDEBAR.rowGlyph} aria-hidden="true" />
            </FilterMark>
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
              className={cn(CALENDAR_SIDEBAR.row, !on && CALENDAR_SIDEBAR.rowOff)}
            >
              <FilterMark accent={creator.accent} on={on}>
                <Avatar name={creator.label} src={creator.image} size="xs" />
              </FilterMark>
              <span className={CALENDAR_SIDEBAR.rowLabel}>{creator.label}</span>
            </button>
          )
        })}
      </div>
    )}
  </>
)

/**
 * Left sidebar of the calendar
 * @param {CalendarSidebarProps} props - Cursor
 * @return {JSX.Element}
 */

export const CalendarRailPanel = (props: CalendarSidebarProps) => {
  const BackIcon = ICONS.back

  return (
    <div className={CALENDAR_SIDEBAR.panel}>
      <Link href={ROUTES.dashboard} className={CALENDAR_SIDEBAR.back}>
        <BackIcon className="h-4 w-4" aria-hidden="true" />
        {CALENDAR_COPY.railBack}
      </Link>
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
  const SearchIcon = ICONS.search

  return (
    <label className={CALENDAR_SIDEBAR.searchBar}>
      <SearchIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
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
