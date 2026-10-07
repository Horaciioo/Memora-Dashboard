import Link from 'next/link'

import { Avatar } from '@/components/elements/display/Avatar'
import { LIVE_COPY } from '@/declarations/lives/copy'
import { ROUTES } from '@/declarations/navigation'
import { PERSONAL_COPY } from '@/declarations/personal/copy'
import { ICONS } from '@/declarations/ui/icons'
import { HOME_LIVE, LIVE_URGENT } from '@/declarations/ui/variants'
import type { LiveBeacon } from '@/types/lives'
import { cn } from '@/utils/classnames'
import { LiveStatuses } from '@/utils/constants/lives'
import { formatDayTime } from '@/utils/format/dates'

export interface HomeLiveCallProps {
  beacon: LiveBeacon | null
}

/**
 * A card per live in progress, the creator's logo on its right, then a line per announced live
 * @param {LiveBeacon | null} beacon - Open lives
 * @return {JSX.Element | null}
 */

export const HomeLiveCall = ({ beacon }: HomeLiveCallProps) => {
  if (!beacon) return null

  const DotIcon = ICONS.liveDot
  const onAir = beacon.lives.filter((live) => live.status === LiveStatuses.Live)
  const announced = beacon.lives.filter((live) => live.status !== LiveStatuses.Live)

  return (
    <>
      {onAir.length > 0 && (
        <div className={HOME_LIVE.list}>
          {onAir.map((live) => {
            const [before, after] = LIVE_COPY.liveNow.split('{strong}')

            return (
              <article key={live.id} className={HOME_LIVE.card}>
                <div className={HOME_LIVE.body}>
                  <span className={HOME_LIVE.eyebrow}>
                    <DotIcon className={HOME_LIVE.pulse} aria-hidden="true" />
                    {LIVE_COPY.liveBadge}
                  </span>
                  <p className={HOME_LIVE.text}>
                    {before.replace('{creator}', live.creator)}
                    <strong className={HOME_LIVE.strong}>{LIVE_COPY.liveNowStrong}</strong>
                    {after}
                  </p>
                  <div className={HOME_LIVE.actions}>
                    <Link href={ROUTES.live(live.id)} className={HOME_LIVE.join}>
                      {LIVE_COPY.liveJoin}
                      <ICONS.next className={HOME_LIVE.joinGlyph} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
                <div className={HOME_LIVE.logo}>
                  <span className={HOME_LIVE.logoRing} aria-hidden="true" />
                  <Avatar
                    name={live.creator}
                    src={live.creatorAvatar}
                    size="hero"
                    className={HOME_LIVE.logoImage}
                  />
                </div>
              </article>
            )
          })}
        </div>
      )}

      {announced.length > 0 && (
        <section className={LIVE_URGENT.section}>
          <h2 className={LIVE_URGENT.label}>{PERSONAL_COPY.urgentTitle}</h2>
          <ul className={LIVE_URGENT.list}>
            {announced.map((live) => (
              <li key={live.id}>
                <Link href={ROUTES.lives} className={cn(LIVE_URGENT.row, LIVE_URGENT.rowAnnounced)}>
                  <DotIcon className={LIVE_URGENT.dot} />
                  <span className={LIVE_URGENT.text}>
                    {LIVE_COPY.urgentAnnounced
                      .replace('{creator}', live.creator)
                      .replace('{time}', formatDayTime(live.plannedStartAt))}
                  </span>
                  <span className={LIVE_URGENT.go}>{LIVE_COPY.urgentOpen}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
