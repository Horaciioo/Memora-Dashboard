import Link from 'next/link'

import { LIVE_COPY } from '@/declarations/lives/copy'
import { ROUTES } from '@/declarations/navigation'
import { PERSONAL_COPY } from '@/declarations/personal/copy'
import { ICONS } from '@/declarations/ui/icons'
import { LIVE_NAV, LIVE_URGENT } from '@/declarations/ui/variants'
import type { LiveBeacon } from '@/types/lives'
import { cn } from '@/utils/classnames'
import { LiveStatuses } from '@/utils/constants/lives'
import { formatDayTime } from '@/utils/format/dates'

export interface HomeLiveCallProps {
  beacon: LiveBeacon | null
}

/**
 * Urgent lines leading to the open lives
 * @param {LiveBeacon | null} beacon - Open lives
 * @return {JSX.Element | null}
 */

export const HomeLiveCall = ({ beacon }: HomeLiveCallProps) => {
  if (!beacon) return null

  const DotIcon = ICONS.liveDot

  return (
    <section className={LIVE_URGENT.section}>
      <h2 className={LIVE_URGENT.label}>{PERSONAL_COPY.urgentTitle}</h2>
      <ul className={LIVE_URGENT.list}>
        {beacon.lives.map((live) => {
          const isLive = live.status === LiveStatuses.Live
          const text = isLive
            ? LIVE_COPY.urgentLive.replace('{creator}', live.creator)
            : LIVE_COPY.urgentAnnounced
                .replace('{creator}', live.creator)
                .replace('{time}', formatDayTime(live.plannedStartAt))

          return (
            <li key={live.id}>
              <Link
                href={isLive ? ROUTES.live(live.id) : ROUTES.livecon}
                className={cn(LIVE_URGENT.row, !isLive && LIVE_URGENT.rowAnnounced)}
              >
                <DotIcon className={cn(LIVE_URGENT.dot, isLive && LIVE_NAV.dotPulse)} />
                <span className={LIVE_URGENT.text}>{text}</span>
                <span className={LIVE_URGENT.go}>{LIVE_COPY.urgentOpen}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
