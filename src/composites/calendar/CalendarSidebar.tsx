'use client'

import { useState } from 'react'
import { Avatar } from '@/components/elements/display/Avatar'
import { CalendarMiniMonth } from '@/composites/calendar/CalendarMiniMonth'
import { CALENDAR_COPY } from '@/declarations/calendar/copy'
import { CALENDAR_LAYER_REGISTRY, layerAccent } from '@/declarations/calendar/registries'
import { ICONS } from '@/declarations/ui/icons'
import { accentPaint } from '@/declarations/ui/theme'
import { CALENDAR_SIDEBAR } from '@/declarations/ui/variants'
import type { FieldOption } from '@/types/forms'
import { cn } from '@/utils/classnames'
import type { CalendarLayerName } from '@/utils/constants/workflow'

export interface CalendarSidebarProps {
  cursor: string
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
 * Coloured tick box of one switch
 * @param {Object} props - Box state
 * @param {string | undefined} props.accent - Stored colour
 * @param {boolean} props.on - Switch is on
 * @return {JSX.Element}
 */

const TickBox = ({ accent, on }: { accent: string | undefined; on: boolean }) => {
  const paint = accentPaint(accent, 'brand')
  const Check = ICONS.picked

  return (
    <span
      className={cn(CALENDAR_SIDEBAR.box, paint.border, on && paint.solid)}
      style={paint.style}
      aria-hidden="true"
    >
      {on && <Check className={CALENDAR_SIDEBAR.boxCheck} />}
    </span>
  )
}

/**
 * Side rail of the calendar, the month in miniature, then what to draw and for which creator
 * @param {CalendarSidebarProps} props - Cursor, filters and their handlers
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
        <CalendarRail {...props} />
      </div>
    </aside>
  )
}

/**
 * Month in miniature then the switches, the body of the side rail
 * @param {CalendarSidebarProps} props - Cursor, filters and their handlers
 * @return {JSX.Element}
 */

const CalendarRail = ({
  cursor,
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
}: CalendarSidebarProps) => (
  <>
    <CalendarMiniMonth cursor={cursor} onPick={onPick} onCursor={onCursor} />

    <input
      type="search"
      value={search}
      onChange={(event) => onSearch(event.target.value)}
      placeholder={CALENDAR_COPY.search}
      aria-label={CALENDAR_COPY.search}
      className={CALENDAR_SIDEBAR.search}
    />

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
            className={CALENDAR_SIDEBAR.row}
          >
            <TickBox accent={layerAccent(layer)} on={on} />
            <Glyph className={CALENDAR_SIDEBAR.rowGlyph} aria-hidden="true" />
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
              className={CALENDAR_SIDEBAR.row}
            >
              <TickBox accent={creator.accent} on={on} />
              <Avatar name={creator.label} src={creator.image} size="xs" />
              <span className={CALENDAR_SIDEBAR.rowLabel}>{creator.label}</span>
            </button>
          )
        })}
      </div>
    )}
  </>
)
