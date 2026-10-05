'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Status } from '@/components/elements/display/Status'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { FormDrawer } from '@/components/structures/FormDrawer'
import { LiveStrip } from '@/composites/lives/LiveStrip'
import { useLives } from '@/core/hooks/data/useLives'
import { LIVE_COPY } from '@/declarations/lives/copy'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import { LIVE_BOARD } from '@/declarations/ui/variants'
import type { FieldDefinition } from '@/types/forms'
import type { LiveView } from '@/types/lives'
import { Permissions } from '@/utils/constants/permissions'

export interface LivesBoardProps {
  initialLives: LiveView[]
  fields: FieldDefinition[]
  canAnnounce: boolean
  viewerId: string
}

/**
 * Open lives
 * @param {LiveView[]} initialLives - Lives resolved server-side
 * @param {FieldDefinition[]} fields - Announce form declarations
 * @param {boolean} canAnnounce - Viewer may announce
 * @param {string} viewerId - Signed-in member
 * @return {JSX.Element}
 */

export const LivesBoard = ({ initialLives, fields, canAnnounce, viewerId }: LivesBoardProps) => {
  const { lives, isSaving, issues, clearIssues, announce, move } = useLives(initialLives)
  const [isAnnouncing, setAnnouncing] = useState(false)

  const openAnnounce = () => {
    clearIssues()
    setAnnouncing(true)
  }

  return (
    <div className={LIVE_BOARD.wrapper}>
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
          <ul className={LIVE_BOARD.list}>
            {lives.map((live) => (
              <li key={live.id}>
                <LiveStrip
                  live={live}
                  canMove={
                    live.permissions.includes(Permissions.LiveAnnounce) ||
                    live.coordinator?.id === viewerId
                  }
                  isSaving={isSaving}
                  onMove={(status) => move(live.id, status)}
                />
              </li>
            ))}
          </ul>
        </>
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
