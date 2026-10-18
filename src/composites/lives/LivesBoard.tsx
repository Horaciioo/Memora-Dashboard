'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Status } from '@/components/elements/display/Status'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { FormDrawer } from '@/components/structures/overlays/FormDrawer'
import { PageOptions } from '@/components/structures/page/PageOptions'
import { LiveStage } from '@/composites/lives/LiveStage'
import { LiveTile } from '@/composites/lives/LiveTile'
import { PastLives } from '@/composites/lives/PastLives'
import { useLives } from '@/core/hooks/data/lives/useLives'
import { LIVE_COPY } from '@/declarations/lives/copy'
import { PAGE_OPTIONS_COPY } from '@/declarations/ui/copy'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import { LIVE_BOARD } from '@/declarations/ui/variants'
import type { FieldDefinition } from '@/types/forms'
import type { LiveView } from '@/types/lives'
import { LiveStatuses } from '@/utils/constants/lives'
import { Permissions } from '@/utils/constants/permissions'

export interface LivesBoardProps {
  initialLives: LiveView[]
  fields: FieldDefinition[]
  canAnnounce: boolean
  past: LiveView[]
  canReport: boolean
  canCreatorReport: boolean
}

/**
 * Open lives
 * @param {LiveView[]} initialLives - Lives resolved server-side
 * @param {FieldDefinition[]} fields - Announce form declarations
 * @param {boolean} canAnnounce - Viewer may announce
 * @param {LiveView[]} past - Finished lives
 * @param {boolean} canReport - Viewer reads the Bilan
 * @param {boolean} canCreatorReport - Viewer reads the creator Bilan
 * @return {JSX.Element}
 */

export const LivesBoard = ({
  initialLives,
  fields,
  canAnnounce,
  past,
  canReport,
  canCreatorReport,
}: LivesBoardProps) => {
  const { lives, isSaving, issues, clearIssues, announce, move } = useLives(initialLives)
  const [isAnnouncing, setAnnouncing] = useState(false)
  const [showPast, setShowPast] = useState(false)
  const onAir = lives.filter((live) => live.status === LiveStatuses.Live)
  const upcoming = lives.filter((live) => live.status !== LiveStatuses.Live)

  const openAnnounce = () => {
    clearIssues()
    setAnnouncing(true)
  }

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
            canAnnounce ? (
              <Button variant="primary" onClick={openAnnounce}>
                {LIVE_COPY.announce}
              </Button>
            ) : (
              <Status label={LIVE_COPY.emptyTitle} tone="neutral" />
            )
          }
        />
      ) : (
        <>
          {canAnnounce && (
            <div className={LIVE_BOARD.toolbar}>
              <Button variant="primary" onClick={openAnnounce}>
                {LIVE_COPY.announce}
              </Button>
            </div>
          )}
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

      <FormDrawer
        subject={FORM_SUBJECTS.live}
        open={isAnnouncing}
        title={LIVE_COPY.announceTitle}
        description={LIVE_COPY.announceLead}
        fields={fields}
        issues={issues}
        isSaving={isSaving}
        submitVerb={LIVE_COPY.announceVerb}
        onSubmit={async (values) => {
          const saved = await announce(values)
          if (saved) setAnnouncing(false)

          return saved
        }}
        onClose={() => setAnnouncing(false)}
      />
    </div>
  )
}
