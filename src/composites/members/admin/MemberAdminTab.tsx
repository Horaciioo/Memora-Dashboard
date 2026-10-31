'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { ReactNode } from 'react'

import { ActionRow } from '@/components/structures/data/ActionRow'
import { ConfirmDialog } from '@/components/structures/overlays/ConfirmDialog'
import { Section } from '@/components/structures/page/Section'
import { Button } from '@/components/elements/actions/Button'
import { AdminCell } from '@/composites/members/admin/AdminCell'
import { MemberStateList } from '@/composites/members/admin/MemberStateList'
import type { MemberAdmin } from '@/core/hooks/data/people/useMemberAdmin'
import { MEMBER_ADMIN_COPY } from '@/declarations/members/admin'
import { ROUTES } from '@/declarations/navigation'
import { MEMBER_ADMIN } from '@/declarations/ui/variants'
import { DepartureKinds } from '@/utils/constants/hierarchy'
import type { DepartureKindName } from '@/utils/constants/hierarchy'

type Gesture = 'freeze' | 'dismiss' | 'resign' | 'delete'

export interface MemberAdminTabProps {
  admin: MemberAdmin
  // Departure and its message
  onDepart: (kind: DepartureKindName) => Promise<boolean>
  onShowMessage: (body: string) => void
  // Open the sanction drawer
  onSanction: () => void
  canDelete: boolean
  // Role box beside the state
  roleSection?: ReactNode
}

// Copy of the confirmation behind each gesture
const CONFIRMS: Record<Gesture, { title: string; description: string }> = {
  freeze: {
    title: MEMBER_ADMIN_COPY.freezeConfirmTitle,
    description: MEMBER_ADMIN_COPY.freezeConfirmDescription,
  },
  dismiss: {
    title: MEMBER_ADMIN_COPY.dismissConfirmTitle,
    description: MEMBER_ADMIN_COPY.dismissConfirmDescription,
  },
  resign: {
    title: MEMBER_ADMIN_COPY.resignConfirmTitle,
    description: MEMBER_ADMIN_COPY.resignConfirmDescription,
  },
  delete: { title: MEMBER_ADMIN_COPY.deleteAction, description: MEMBER_ADMIN_COPY.deleteLead },
}

/**
 * Heavy gestures on a moderator: let go, freeze, erase. Each one lands in the base at once
 * @param {MemberAdmin} admin - Gestures and state
 * @param {(kind: DepartureKindName) => Promise<boolean>} onDepart - Let them go
 * @param {(body: string) => void} onShowMessage - Open the departure message
 * @param {() => void} onSanction - Open the sanction drawer
 * @param {boolean} canDelete - Viewer may erase the file
 * @param {ReactNode} [roleSection] - Role box beside the state
 * @return {JSX.Element}
 */

export const MemberAdminTab = ({
  admin,
  onDepart,
  onShowMessage,
  onSanction,
  canDelete,
  roleSection,
}: MemberAdminTabProps) => {
  const router = useRouter()
  const { state } = admin
  const [asking, setAsking] = useState<Gesture | null>(null)

  // Run the gesture a confirmation guarded
  const confirm = async (gesture: Gesture) => {
    if (gesture === 'freeze') await admin.freeze()
    if (gesture === 'dismiss') await onDepart(DepartureKinds.Dismissal)
    if (gesture === 'resign') await onDepart(DepartureKinds.Resignation)

    if (gesture === 'delete' && (await admin.remove())) {
      router.push(ROUTES.members)
      router.refresh()
    }

    setAsking(null)
  }

  return (
    <div className={MEMBER_ADMIN.stack}>
      <div className={MEMBER_ADMIN.pair}>
        {roleSection}
        <Section title={MEMBER_ADMIN_COPY.sectionState} raised>
          <MemberStateList state={state} />
          {!state.isGone && (
            <div className={MEMBER_ADMIN.stateActions}>
              <Button
                variant={state.suspension ? 'primary' : 'danger'}
                isLoading={state.suspension ? admin.isSaving : undefined}
                onClick={() => (state.suspension ? void admin.lift() : onSanction())}
              >
                {state.suspension ? MEMBER_ADMIN_COPY.liftAction : MEMBER_ADMIN_COPY.sanctionAction}
              </Button>
            </div>
          )}
        </Section>
      </div>

      {state.isGone && state.departure && (
        <Section title={MEMBER_ADMIN_COPY.sectionDeparture} raised>
          <ActionRow title={MEMBER_ADMIN_COPY.gone} description={MEMBER_ADMIN_COPY.departureLead}>
            <Button variant="primary" onClick={() => onShowMessage(state.departure!.body)}>
              {MEMBER_ADMIN_COPY.showMessage}
            </Button>
          </ActionRow>
        </Section>
      )}

      {!state.isGone && (
        <Section title={MEMBER_ADMIN_COPY.sectionDeparture} raised>
          <div className={MEMBER_ADMIN.split}>
            <AdminCell
              variant="danger"
              label={MEMBER_ADMIN_COPY.dismissAction}
              note={MEMBER_ADMIN_COPY.dismissNote}
              onClick={() => setAsking('dismiss')}
            />
            <AdminCell
              label={MEMBER_ADMIN_COPY.resignAction}
              note={MEMBER_ADMIN_COPY.resignNote}
              onClick={() => setAsking('resign')}
            />
          </div>
        </Section>
      )}

      {(!state.isGone || canDelete) && (
        <Section title={MEMBER_ADMIN_COPY.sectionMemora} raised>
          <div className={MEMBER_ADMIN.split}>
            {!state.isGone &&
              (state.frozenAt ? (
                <AdminCell
                  label={MEMBER_ADMIN_COPY.unfreezeAction}
                  note={MEMBER_ADMIN_COPY.unfreezeNote}
                  isLoading={admin.isSaving}
                  onClick={() => void admin.thaw()}
                />
              ) : (
                <AdminCell
                  label={MEMBER_ADMIN_COPY.freezeAction}
                  note={MEMBER_ADMIN_COPY.freezeNote}
                  onClick={() => setAsking('freeze')}
                />
              ))}
            {canDelete && (
              <AdminCell
                variant="danger"
                label={MEMBER_ADMIN_COPY.deleteAction}
                note={MEMBER_ADMIN_COPY.deleteNote}
                onClick={() => setAsking('delete')}
              />
            )}
          </div>
        </Section>
      )}

      {asking && (
        <ConfirmDialog
          open
          title={CONFIRMS[asking].title}
          description={CONFIRMS[asking].description}
          pending={admin.isSaving}
          onCancel={() => setAsking(null)}
          onConfirm={() => void confirm(asking)}
        />
      )}
    </div>
  )
}
