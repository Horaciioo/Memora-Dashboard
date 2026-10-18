'use client'

import { useState } from 'react'

import AppLink from '@/components/elements/navigation/AppLink'
import { Status } from '@/components/elements/display/Status'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { PageOptions } from '@/components/structures/page/PageOptions'
import { LiveStage } from '@/composites/lives/LiveStage'
import { LiveTile } from '@/composites/lives/LiveTile'
import { PastLives } from '@/composites/lives/PastLives'
import { useLives } from '@/core/hooks/data/lives/useLives'
import { LIVE_COPY } from '@/declarations/lives/copy'
import { LIVE_PRESET } from '@/declarations/lives/registries'
import { ROUTES } from '@/declarations/navigation'
import { PAGE_OPTIONS_COPY } from '@/declarations/ui/copy'
import { BUTTON_STYLES, LIVE_BOARD } from '@/declarations/ui/variants'
import type { LiveView } from '@/types/lives'
import { cn } from '@/utils/classnames'
import { LiveStatuses } from '@/utils/constants/lives'
import { Permissions } from '@/utils/constants/permissions'

export interface LivesBoardProps {
  initialLives: LiveView[]
  canAnnounce: boolean
  past: LiveView[]
  canReport: boolean
  canCreatorReport: boolean
}

/**
 * Open lives
 * @param {LiveView[]} initialLives - Lives resolved server-side
 * @param {boolean} canAnnounce - Viewer may announce
 * @param {LiveView[]} past - Finished lives
 * @param {boolean} canReport - Viewer reads the Bilan
 * @param {boolean} canCreatorReport - Viewer reads the creator Bilan
 * @return {JSX.Element}
 */

export const LivesBoard = ({
  initialLives,
  canAnnounce,
  past,
  canReport,
  canCreatorReport,
}: LivesBoardProps) => {
  const { lives, isSaving, move } = useLives(initialLives)
  const [showPast, setShowPast] = useState(false)
  const onAir = lives.filter((live) => live.status === LiveStatuses.Live)
  const upcoming = lives.filter((live) => live.status !== LiveStatuses.Live)

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
      <PageOptions
        options={
          canReport
            ? [
                {
                  id: 'past',
                  label: PAGE_OPTIONS_COPY.showPastLives,
                  checked: showPast,
                  onChange: setShowPast,
                },
              ]
            : []
        }
      />
      {lives.length === 0 ? (
        <EmptyState
          figure="livecon"
          title={LIVE_COPY.emptyTitle}
          description={LIVE_COPY.emptyDescription}
          action={
            canAnnounce ? announceButton : <Status label={LIVE_COPY.emptyTitle} tone="neutral" />
          }
        />
      ) : (
        <>
          {canAnnounce && <div className={LIVE_BOARD.toolbar}>{announceButton}</div>}
          {[
            {
              key: 'live',
              title: LIVE_COPY.liveSection,
              rows: onAir,
              Card: LiveStage,
              list: LIVE_BOARD.list,
            },
            {
              key: 'upcoming',
              title: LIVE_COPY.upcomingSection,
              rows: upcoming,
              Card: LiveTile,
              list: LIVE_BOARD.tiles,
            },
          ]
            .filter((group) => group.rows.length > 0)
            .map(({ key, title, rows, Card, list }) => (
              <section key={key} className={LIVE_BOARD.group}>
                {key !== 'live' && <h2 className={LIVE_BOARD.groupTitle}>{title}</h2>}
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

      {showPast && (
        <PastLives lives={past} canReport={canReport} canCreatorReport={canCreatorReport} />
      )}
    </div>
  )
}
