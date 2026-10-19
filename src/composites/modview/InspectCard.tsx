'use client'

import { Dotted } from '@/components/elements/display/Dotted'
import { useQuery } from '@tanstack/react-query'

import { Avatar } from '@/components/elements/display/Avatar'
import { Button } from '@/components/elements/actions/Button'
import { Tip } from '@/components/elements/feedback/Tip'
import { SkeletonList } from '@/components/elements/feedback/Skeleton'
import { apiGet } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import { ATTENDANCE_STATUS_REGISTRY } from '@/declarations/calendar/registries'
import { MODERATION_KINDS } from '@/declarations/lives/moderation'
import { MODVIEW_HISTORY_COPY, MODVIEW_INSPECT_COPY } from '@/declarations/modview/copy'
import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { MODVIEW_DOSSIER, MODVIEW_INSPECT, MODVIEW_VERDICT } from '@/declarations/ui/variants'
import type { ModeratorInspect } from '@/types/lives'
import { cn } from '@/utils/classnames'
import { formatClock, formatDuration } from '@/utils/format/modview'

export interface InspectCardProps {
  liveId: string
  accountId: string
  onClose: () => void
}

/**
 * Activity of one moderator on the live
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

  if (!data) {
    return (
      <div className={MODVIEW_INSPECT.body}>
        <SkeletonList shape="row" rows={4} />
      </div>
    )
  }

  const attendance = data.attendance ? ATTENDANCE_STATUS_REGISTRY.get(data.attendance) : null
  const AttendanceIcon = ICONS[attendance?.icon ?? 'clock']

  // Glyphs over figures, the name rides in the tip
  const figures: { icon: IconName; label: string; value: string; tone?: string }[] = [
    {
      icon: attendance?.icon ?? 'clock',
      label: MODVIEW_INSPECT_COPY.attendance,
      value: attendance?.label ?? MODVIEW_INSPECT_COPY.noAnswer,
      tone: attendance?.tone,
    },
    {
      icon: 'clock',
      label: MODVIEW_INSPECT_COPY.active,
      value: formatDuration(data.activeSeconds),
    },
    {
      icon: 'modActions',
      label: MODVIEW_INSPECT_COPY.gestures,
      value: String(data.gestures.length),
    },
  ]

  return (
    <div className={MODVIEW_INSPECT.body}>
      <header className={MODVIEW_INSPECT.head}>
        <Button
          variant="ghost"
          icon="back"
          className={MODVIEW_INSPECT.back}
          aria-label={MODVIEW_INSPECT_COPY.back}
          title={MODVIEW_INSPECT_COPY.back}
          onClick={onClose}
        />
        <Avatar name={data.name} src={data.avatar} size="md" />
        <h3 className={MODVIEW_INSPECT.name}>{data.name}</h3>
        {data.isAbsent && <p className={MODVIEW_INSPECT.warn}>{MODVIEW_INSPECT_COPY.absent}</p>}
      </header>

      <div className={MODVIEW_INSPECT.stats}>
        {figures.map(({ icon, label, value, tone }) => {
          const Icon = icon === figures[0]!.icon && tone ? AttendanceIcon : ICONS[icon]

          return (
            <Tip key={label} label={label} className={MODVIEW_INSPECT.stat}>
              <Icon
                className={cn(MODVIEW_INSPECT.statIcon, tone && `text-[var(--color-${tone})]`)}
                aria-hidden="true"
              />
              <span className={MODVIEW_INSPECT.statValue}>{value}</span>
              <span className="sr-only">{label}</span>
            </Tip>
          )
        })}
      </div>

      <section className={MODVIEW_INSPECT.section}>
        <h4 className={MODVIEW_INSPECT.label}>{MODVIEW_INSPECT_COPY.gestures}</h4>
        {data.gestures.length === 0 ? (
          <p className={MODVIEW_INSPECT.empty}>{MODVIEW_INSPECT_COPY.gesturesEmpty}</p>
        ) : (
          <div className={MODVIEW_DOSSIER.history}>
            {data.gestures.map((gesture) => (
              <article key={gesture.id} className={MODVIEW_DOSSIER.row}>
                <div className={MODVIEW_DOSSIER.rowHead}>
                  <p className={cn(MODVIEW_DOSSIER.rowKind, MODVIEW_VERDICT[gesture.kind]?.text)}>
                    <Dotted
                      items={[
                        MODERATION_KINDS[gesture.kind].label,
                        gesture.durationSeconds ? formatDuration(gesture.durationSeconds) : null,
                      ]}
                    />
                  </p>
                  <time className={MODVIEW_DOSSIER.rowDate} dateTime={gesture.occurredAt}>
                    {formatClock(gesture.occurredAt)}
                  </time>
                </div>
                {gesture.targetLogin && (
                  <p className={MODVIEW_INSPECT.target}>{gesture.targetLogin}</p>
                )}
                {gesture.reason && <p className={MODVIEW_DOSSIER.rowReason}>{gesture.reason}</p>}
                <p className={MODVIEW_DOSSIER.rowBy}>
                  <Dotted
                    items={[
                      gesture.fromPanel
                        ? MODVIEW_HISTORY_COPY.fromPanel
                        : MODVIEW_HISTORY_COPY.offPanel,
                      gesture.onBehalfOf
                        ? MODVIEW_INSPECT_COPY.onBehalf.replace('{name}', gesture.onBehalfOf)
                        : null,
                    ]}
                  />
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
