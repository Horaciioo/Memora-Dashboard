import type { MouseEventHandler, ReactNode } from 'react'

import { ICONS, type IconName } from '@/declarations/ui/icons'
import { STAGE_COMPACT, STAGE_LIST } from '@/declarations/ui/blocks'
import { cn } from '@/utils/classnames'

export type TimelineState = 'done' | 'current' | 'late' | 'upcoming'

/**
 * One moment of a vertical timeline
 * @typedef {Object} TimelineItem
 * @property {string} id - Moment identifier
 * @property {TimelineState} state - Where it stands
 * @property {IconName} [icon] - Glyph overriding the state one
 * @property {string} title - Moment name
 * @property {ReactNode} [lead] - Line under the title
 * @property {ReactNode} [aside] - Right of the title
 * @property {ReactNode} [children] - Content under the lead
 * @property {() => void} [onSelect] - Called when the moment is clicked
 * @property {MouseEventHandler<HTMLLIElement>} [onContextMenu] - Right click handler
 */

export interface TimelineItem {
  id: string
  state: TimelineState
  icon?: IconName
  title: string
  lead?: ReactNode
  aside?: ReactNode
  children?: ReactNode
  onSelect?: () => void
  onContextMenu?: MouseEventHandler<HTMLLIElement>
}

export interface TimelineProps {
  items: TimelineItem[]
  label: string
  // Small and quiet, for a corner
  compact?: boolean
  // Moments spread over the height given
  fill?: boolean
  // A cleared moment is struck and greyed
  struckDone?: boolean
}

// Glyph carried by each state
const STATE_ICONS: Record<TimelineState, IconName> = {
  done: 'check',
  current: 'pending',
  late: 'warning',
  upcoming: 'clock',
}

// Glyph classes per state
const STATE_CHIPS: Record<TimelineState, string> = {
  done: STAGE_LIST.stageChipDone,
  current: STAGE_LIST.stageChip,
  late: STAGE_LIST.stageChipLate,
  upcoming: STAGE_LIST.stageChipOff,
}

/**
 * Part of a moment that turns into a button once it can be ticked
 * @param {Object} props - Component props
 * @param {TimelineItem} props.item - Moment drawn
 * @param {string} props.className - Classes of the part
 * @param {ReactNode} props.children - Part content
 * @return {JSX.Element}
 */

const Pick = ({
  item,
  className,
  children,
}: {
  item: TimelineItem
  className: string
  children: ReactNode
}) =>
  item.onSelect ? (
    <button type="button" onClick={item.onSelect} className={className}>
      {children}
    </button>
  ) : (
    <span className={className}>{children}</span>
  )

/**
 * Vertical timeline whose glyphs sit bare on a thread
 * @param {TimelineItem[]} items - Moments in display order
 * @param {string} label - Accessible name
 * @param {boolean} [compact] - Corner size
 * @param {boolean} [fill] - Spread over the height
 * @param {boolean} [struckDone] - Cleared moments struck and greyed
 * @return {JSX.Element}
 */

export const Timeline = ({ items, label, compact, fill, struckDone }: TimelineProps) => (
  <ol
    aria-label={label}
    className={cn(compact && STAGE_COMPACT.root, fill && 'flex flex-1 flex-col')}
  >
    {items.map((item, index) => {
      // A cleared moment is a check, the others keep their own glyph
      const Glyph =
        ICONS[item.state === 'done' ? STATE_ICONS.done : (item.icon ?? STATE_ICONS[item.state])]
      const isLast = index === items.length - 1

      return (
        <li
          key={item.id}
          aria-current={item.state === 'current' ? 'step' : undefined}
          onContextMenu={item.onContextMenu}
          className={cn(
            compact ? STAGE_COMPACT.stage : STAGE_LIST.stage,
            compact && !fill && STAGE_COMPACT.stageSpaced,
            fill && 'flex-1 last:flex-none'
          )}
        >
          {!isLast && (
            <span
              aria-hidden="true"
              className={cn(
                compact ? STAGE_COMPACT.stageRail : STAGE_LIST.stageRail,
                item.state === 'done' &&
                  (compact ? STAGE_COMPACT.stageRailDone : STAGE_LIST.stageRailDone)
              )}
            />
          )}
          <Pick
            item={item}
            className={
              compact
                ? cn(STAGE_COMPACT.stageChip, STAGE_COMPACT.tone[item.state])
                : STATE_CHIPS[item.state]
            }
          >
            <Glyph
              className={compact ? STAGE_COMPACT.stageGlyph : STAGE_LIST.stageGlyph}
              aria-hidden="true"
            />
          </Pick>
          <div className={cn(STAGE_LIST.stageBody, item.state === 'upcoming' && 'opacity-70')}>
            <span className={STAGE_LIST.stageHead}>
              <Pick
                item={item}
                className={cn(
                  STAGE_LIST.stageTitle,
                  struckDone &&
                    item.state === 'done' &&
                    'text-[var(--color-ink-subtle)] line-through',
                  item.onSelect && 'cursor-pointer text-left hover:underline',
                  compact && STAGE_COMPACT.stageTitle,
                  compact && item.state === 'done' && STAGE_COMPACT.stageTitleDone,
                  item.state === 'current' &&
                    (compact ? STAGE_COMPACT.stageTitleCurrent : STAGE_LIST.stageTitleCurrent)
                )}
              >
                {item.title}
              </Pick>
              {item.aside}
            </span>
            {item.lead && <span className={STAGE_LIST.stageLead}>{item.lead}</span>}
            {item.children}
          </div>
        </li>
      )
    })}
  </ol>
)
