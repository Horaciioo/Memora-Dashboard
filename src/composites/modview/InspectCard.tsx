'use client'

import { useQuery } from '@tanstack/react-query'

import { Avatar } from '@/components/elements/display/Avatar'
import { Button } from '@/components/elements/actions/Button'
import { SkeletonList } from '@/components/elements/feedback/Skeleton'
import { apiGet } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import { ATTENDANCE_STATUS_REGISTRY } from '@/declarations/calendar/registries'
import { MODERATION_KINDS } from '@/declarations/lives/moderation'
import { MODVIEW_HISTORY_COPY, MODVIEW_INSPECT_COPY } from '@/declarations/modview/copy'
import { MODVIEW_HISTORY, MODVIEW_INSPECT } from '@/declarations/ui/variants'
import type { ModeratorInspect } from '@/types/lives'
import { cn } from '@/utils/classnames'
import { formatClock, formatDuration } from '@/utils/format/modview'

export interface InspectCardProps {
  liveId: string
  accountId: string
  onClose: () => void
}

/**
 * Activity of one moderator on the live, for the responsables
 * @param {string} liveId - Live
 * @param {string} accountId - Moderator inspected
 * @param {() => void} onClose - Close the card
 * @return {JSX.Element}
 */

export const InspectCard = ({ liveId, accountId, onClose }: InspectCardProps) => {
  const { data } = useQuery({
    queryKey: QUERY_KEYS.liveInspect(liveId, accountId),
    queryFn: ({ signal }) =>
      apiGet<ModeratorInspect>(API_ROUTES.liveInspect(liveId, accountId), signal),
  })

  return (
    <aside className={MODVIEW_INSPECT.card} aria-label={MODVIEW_INSPECT_COPY.title}>
      {!data ? (
        <SkeletonList shape="row" rows={4} />
      ) : (
        <>
          <header className={MODVIEW_INSPECT.head}>
            <Avatar name={data.name} src={data.avatar} size="sm" />
            <span className={MODVIEW_INSPECT.name}>{data.name}</span>
            <Button
              variant="icon"
              icon="close"
              aria-label={MODVIEW_INSPECT_COPY.close}
              onClick={onClose}
            />
          </header>

          {data.isAbsent && <p className={MODVIEW_INSPECT.warn}>{MODVIEW_INSPECT_COPY.absent}</p>}

          <div className={MODVIEW_INSPECT.facts}>
            <div className={MODVIEW_INSPECT.fact}>
              <span className={MODVIEW_INSPECT.factLabel}>{MODVIEW_INSPECT_COPY.attendance}</span>
              <span className={MODVIEW_INSPECT.factValue}>
                {data.attendance
                  ? ATTENDANCE_STATUS_REGISTRY.label(data.attendance)
                  : MODVIEW_INSPECT_COPY.noAnswer}
              </span>
            </div>
            <div className={MODVIEW_INSPECT.fact}>
              <span className={MODVIEW_INSPECT.factLabel}>{MODVIEW_INSPECT_COPY.active}</span>
              <span className={MODVIEW_INSPECT.factValue}>
                {formatDuration(data.activeSeconds)}
              </span>
            </div>
          </div>

          <div className={MODVIEW_INSPECT.list}>
            <span className={MODVIEW_INSPECT.factLabel}>{MODVIEW_INSPECT_COPY.gestures}</span>
            {data.gestures.length === 0 && (
              <p className={MODVIEW_HISTORY.empty}>{MODVIEW_INSPECT_COPY.gesturesEmpty}</p>
            )}
            {data.gestures.map((gesture) => (
              <p key={gesture.id} className={MODVIEW_INSPECT.line}>
                <span
                  className={cn(
                    MODVIEW_HISTORY.tag,
                    gesture.fromPanel ? MODVIEW_HISTORY.tagPanel : MODVIEW_HISTORY.tagOff
                  )}
                >
                  {gesture.fromPanel
                    ? MODVIEW_HISTORY_COPY.fromPanel
                    : MODVIEW_HISTORY_COPY.offPanel}
                </span>{' '}
                {[
                  formatClock(gesture.occurredAt),
                  MODERATION_KINDS[gesture.kind].label,
                  gesture.targetLogin,
                  gesture.durationSeconds ? formatDuration(gesture.durationSeconds) : null,
                  gesture.reason,
                  gesture.onBehalfOf
                    ? MODVIEW_INSPECT_COPY.onBehalf.replace('{name}', gesture.onBehalfOf)
                    : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            ))}
          </div>
        </>
      )}
    </aside>
  )
}
