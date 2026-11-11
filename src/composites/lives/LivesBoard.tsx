'use client'

import { useRouter } from 'next/navigation'

import AppLink from '@/components/elements/navigation/AppLink'
import { FloatingAdd } from '@/composites/search/assistant/FloatingAdd'
import { ASSISTANT_OFFERS } from '@/declarations/assistant/offers'
import { Status } from '@/components/elements/display/Status'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { FakeLivePanel } from '@/composites/lives/FakeLivePanel'
import { LiveEndedDialog } from '@/composites/lives/notices/LiveEndedDialog'
import { LiveRecent } from '@/composites/lives/LiveRecent'
import { LiveTile } from '@/composites/lives/LiveTile'
import { useLives } from '@/core/hooks/data/lives/useLives'
import { LIVE_COPY } from '@/declarations/lives/copy'
import { LIVE_PRESET } from '@/declarations/lives/registries'
import { ROUTES } from '@/declarations/navigation'
import { BUTTON_STYLES, LIVE_BOARD, LIVE_RECENT } from '@/declarations/ui/variants'
import type { LiveView } from '@/types/lives'
import { cn } from '@/utils/classnames'
import { LiveStatuses } from '@/utils/constants/lives'
import { Permissions } from '@/utils/constants/permissions'

export interface LivesBoardProps {
  initialLives: LiveView[]
  initialRecent: LiveView[]
  canAnnounce: boolean
  canReport: boolean
  // Dev only: simulated live controls
  showFakeLive?: boolean
  // Sits under the personal Live hub
  isEmbedded?: boolean
}

/**
 * Open lives
 * @param {LiveView[]} initialLives - Lives resolved server-side
 * @param {LiveView[]} initialRecent - Lives closed within the day
 * @param {boolean} canAnnounce - Viewer may announce
 * @param {boolean} canReport - Viewer reads the Bilan
 * @param {boolean} [showFakeLive] - Dev controls of the fake live
 * @param {boolean} [isEmbedded] - Drops the empty state
 * @return {JSX.Element}
 */

export const LivesBoard = ({
  initialLives,
  initialRecent,
  canAnnounce,
  canReport,
  showFakeLive = false,
  isEmbedded = false,
}: LivesBoardProps) => {
  const { lives, recent, isSaving, endedId, dismissEnded, move, reopen } = useLives(
    initialLives,
    initialRecent
  )
  const router = useRouter()
  const upcoming = lives.filter((live) => live.status === LiveStatuses.Announced)
  const onAir = lives.filter((live) => live.status === LiveStatuses.Live)

  // A live is planned on the calendar
  const announceButton = (
    <AppLink
      href={ROUTES.calendarNew(LIVE_PRESET)}
      className={cn(BUTTON_STYLES.base, BUTTON_STYLES.primary)}
    >
      {LIVE_COPY.announce}
    </AppLink>
  )

  return (
    <div className={LIVE_BOARD.wrapper}>
      {lives.length === 0 && recent.length === 0 ? (
        isEmbedded ? null : (
          <EmptyState
            figure="livecon"
            title={LIVE_COPY.emptyTitle}
            description={LIVE_COPY.emptyDescription}
            action={
              canAnnounce ? announceButton : <Status label={LIVE_COPY.emptyTitle} tone="neutral" />
            }
          />
        )
      ) : (
        <>
          {[
            {
              key: 'onAir',
              title: LIVE_COPY.liveSection,
              rows: onAir,
              Card: LiveTile,
              list: LIVE_BOARD.tiles,
            },
            {
              key: 'upcoming',
              title: LIVE_COPY.upcomingSection,
              rows: upcoming,
              Card: LiveTile,
              list: LIVE_BOARD.tiles,
            },
          ]
            .filter((group) => group.rows.length > 0 && !(isEmbedded && group.key === 'onAir'))
            .map(({ key, title, rows, Card, list }) => (
              <section key={key} className={LIVE_BOARD.group}>
                <h2 className={LIVE_BOARD.groupTitle}>{title}</h2>
                <ul className={list}>
                  {rows.map((live) => (
                    <li key={live.id}>
                      <Card
                        live={live}
                        canMove={
                          live.permissions.includes(Permissions.LiveAnnounce) || live.isCoordinating
                        }
                        isSaving={isSaving}
                        onMove={(status) => move(live.id, status)}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
        </>
      )}

      {recent.length > 0 && (
        <section className={LIVE_BOARD.group}>
          <h2 className={LIVE_BOARD.groupTitle}>{LIVE_COPY.recentSection}</h2>
          <ul className={LIVE_RECENT.list}>
            {recent.map((live) => (
              <li key={live.id}>
                <LiveRecent live={live} isSaving={isSaving} onReopen={() => void reopen(live.id)} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {canAnnounce && (lives.length > 0 || recent.length > 0) && (
        <FloatingAdd
          offer={ASSISTANT_OFFERS.live}
          onClick={() => router.push(ROUTES.calendarNew(LIVE_PRESET))}
        />
      )}

      {showFakeLive && <FakeLivePanel />}

      <LiveEndedDialog liveId={canReport ? endedId : null} onClose={dismissEnded} />
    </div>
  )
}
