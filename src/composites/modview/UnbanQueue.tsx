'use client'

import { Avatar } from '@/components/elements/display/Avatar'
import { useUnbanQueue } from '@/core/hooks/interaction/state/useUnbanQueue'
import type { UnbanOrder } from '@/core/hooks/interaction/state/useUnbanQueue'
import { MODVIEW_UNBAN_COPY as COPY } from '@/declarations/modview/copy'
import { ICONS } from '@/declarations/ui/icons'
import { MODVIEW_UNBAN } from '@/declarations/ui/variants'
import type { UnbanRequest } from '@/types/modview'
import { cn } from '@/utils/classnames'
import { formatSince } from '@/utils/format/dates'

// Orders offered
const ORDERS: { value: UnbanOrder; label: string }[] = [
  { value: 'recent', label: COPY.sortRecent },
  { value: 'old', label: COPY.sortOld },
]

export interface UnbanQueueProps {
  requests: UnbanRequest[]
  // Request open in the desk, none in the popover
  selectedId?: string | null
  onSelect: (request: UnbanRequest) => void
}

/**
 * Pending unban requests: count, order, rows and pages, as Twitch lists them
 * @param {UnbanRequest[]} requests - Pending requests
 * @param {string | null} [selectedId] - Request open in the desk
 * @param {(request: UnbanRequest) => void} onSelect - Row handler
 * @return {JSX.Element}
 */

export const UnbanQueue = ({ requests, selectedId = null, onSelect }: UnbanQueueProps) => {
  const queue = useUnbanQueue(requests)
  const BackIcon = ICONS.back
  const ForwardIcon = ICONS.forward

  return (
    <div className={MODVIEW_UNBAN.list}>
      <div className={MODVIEW_UNBAN.listHead}>
        <p className={MODVIEW_UNBAN.listCount}>
          {queue.total === 1 ? COPY.countOne : COPY.count.replace('{count}', String(queue.total))}
        </p>
        <span className={MODVIEW_UNBAN.sort} role="group" aria-label={COPY.sort}>
          {ORDERS.map((entry) => (
            <button
              key={entry.value}
              type="button"
              className={MODVIEW_UNBAN.sortButton}
              aria-pressed={queue.order === entry.value}
              onClick={() => queue.setOrder(entry.value)}
            >
              {entry.label}
            </button>
          ))}
        </span>
      </div>

      {queue.total === 0 ? (
        <p className={MODVIEW_UNBAN.empty}>{COPY.empty}</p>
      ) : (
        <ul className={MODVIEW_UNBAN.rows}>
          {queue.items.map((request) => (
            <li key={request.id}>
              <button
                type="button"
                className={cn(MODVIEW_UNBAN.row, request.id === selectedId && MODVIEW_UNBAN.rowOn)}
                aria-current={request.id === selectedId || undefined}
                onClick={() => onSelect(request)}
              >
                <Avatar name={request.author.name} size="sm" />
                <span className={MODVIEW_UNBAN.rowBody}>
                  <span className={MODVIEW_UNBAN.rowName}>{request.author.name}</span>
                  <span className={MODVIEW_UNBAN.rowMeta}>
                    {`${formatSince(request.at)} • ${request.text}`}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {queue.pageCount > 1 && (
        <nav className={MODVIEW_UNBAN.pager} aria-label={COPY.title}>
          <span className={MODVIEW_UNBAN.pagerLabel}>
            {COPY.range
              .replace('{from}', String(queue.from))
              .replace('{to}', String(queue.to))
              .replace('{total}', String(queue.total))}
          </span>
          <span className={MODVIEW_UNBAN.pagerButtons}>
            <button
              type="button"
              className={MODVIEW_UNBAN.iconButton}
              aria-label={COPY.previous}
              title={COPY.previous}
              disabled={queue.page <= 1}
              onClick={() => queue.setPage(queue.page - 1)}
            >
              <BackIcon className={MODVIEW_UNBAN.icon} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={MODVIEW_UNBAN.iconButton}
              aria-label={COPY.next}
              title={COPY.next}
              disabled={queue.page >= queue.pageCount}
              onClick={() => queue.setPage(queue.page + 1)}
            >
              <ForwardIcon className={MODVIEW_UNBAN.icon} aria-hidden="true" />
            </button>
          </span>
        </nav>
      )}
    </div>
  )
}
