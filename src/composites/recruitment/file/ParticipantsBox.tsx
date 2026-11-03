'use client'

import { useState } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { ConfirmDialog } from '@/components/structures/overlays/ConfirmDialog'
import { Section } from '@/components/structures/page/Section'
import { useSeatActions } from '@/core/hooks/data/people/useSeatActions'
import { useActionMenu } from '@/core/hooks/interaction/layout/useActionMenu'
import { PARTICIPATION_ROLE_COPY, MEMBER_COPY } from '@/declarations/members/copy'
import { SEAT_COPY } from '@/declarations/members/seats'
import type { SeatAction } from '@/declarations/members/seats'
import { PARTICIPATION_BOX } from '@/declarations/ui/blocks'
import { EMPTY_VALUE } from '@/declarations/ui/variants'
import type { MenuItem } from '@/managers/front-end'
import type { SessionParticipant } from '@/types/recruitment'
import { cn } from '@/utils/classnames'

export interface ParticipantsBoxProps {
  sessionId: string
  participants: SessionParticipant[]
  // Responsable and above take access back or delete archives
  canManage: boolean
}

/**
 * Facts under the name of one participant
 * @param {SessionParticipant} entry - Participant
 * @return {[string, string][]} - Label and value of each fact
 */

const factsOf = (entry: SessionParticipant): [string, string][] => [
  [
    MEMBER_COPY.participationRole,
    entry.roles.map((role) => PARTICIPATION_ROLE_COPY[role]).join(', '),
  ],
  ...(entry.roles.includes('recruiter')
    ? [[MEMBER_COPY.participationLed, String(entry.led)] as [string, string]]
    : []),
  ...(entry.roles.includes('observer')
    ? [[MEMBER_COPY.participationObserved, String(entry.observed)] as [string, string]]
    : []),
]

/**
 * One member of the session, a right click for their seat
 * @param {Object} props - Component props
 * @param {SessionParticipant} props.entry - Participant
 * @param {boolean} props.canManage - Viewer may act on the seat
 * @param {(action: SeatAction) => void} props.onAct - Asks a gesture on the seat
 * @return {JSX.Element}
 */

const ParticipantLine = ({
  entry,
  canManage,
  onAct,
}: {
  entry: SessionParticipant
  canManage: boolean
  onAct: (action: SeatAction) => void
}) => {
  const items: MenuItem[] =
    canManage && entry.isTemporary
      ? [
          entry.isRevoked
            ? {
                id: 'restore',
                label: SEAT_COPY.restore,
                icon: 'unlock',
                onSelect: () => onAct('restore'),
              }
            : {
                id: 'revoke',
                label: SEAT_COPY.revoke,
                icon: 'lock',
                onSelect: () => onAct('revoke'),
              },
          {
            id: 'forget',
            label: SEAT_COPY.forget,
            icon: 'remove',
            danger: true,
            separatorBefore: true,
            onSelect: () => onAct('forget'),
          },
        ]
      : []
  const menu = useActionMenu(items, SEAT_COPY.menuTitle)

  return (
    <div
      className={cn(PARTICIPATION_BOX.box, entry.isRevoked && PARTICIPATION_BOX.revoked)}
      onContextMenu={items.length > 0 ? menu.onContextMenu : undefined}
    >
      <span className={PARTICIPATION_BOX.head}>
        <Avatar name={entry.name} src={entry.avatarUrl} size="md" />
        <span className={PARTICIPATION_BOX.title}>{entry.name}</span>
      </span>
      <span className={PARTICIPATION_BOX.facts}>
        {factsOf(entry).map(([label, value]) => (
          <span key={label} className={PARTICIPATION_BOX.fact}>
            <span className={PARTICIPATION_BOX.factLabel}>{label} :</span>
            {value}
          </span>
        ))}
      </span>
    </div>
  )
}

/**
 * Everyone affiliated to the session: responsables, recruiters and observers
 * @param {ParticipantsBoxProps} props - Component props
 * @return {JSX.Element}
 */

export const ParticipantsBox = ({ sessionId, participants, canManage }: ParticipantsBoxProps) => {
  const { isSaving, act } = useSeatActions()
  const [forgetting, setForgetting] = useState<SessionParticipant | null>(null)

  const run = (entry: SessionParticipant, action: SeatAction) =>
    act({ accountId: entry.id, family: 'recruitment', sessionId, action })

  return (
    <Section title={SEAT_COPY.seatsTitle} raised>
      {participants.length === 0 && (
        <p className={cn('text-sm', EMPTY_VALUE)}>{SEAT_COPY.seatsEmpty}</p>
      )}
      <div className={PARTICIPATION_BOX.list}>
        {participants.map((entry, index) => (
          <ParticipantLine
            key={entry.id || `hidden-${index}`}
            entry={entry}
            canManage={canManage}
            onAct={(action) =>
              action === 'forget' ? setForgetting(entry) : void run(entry, action)
            }
          />
        ))}
      </div>
      <ConfirmDialog
        open={forgetting !== null}
        title={SEAT_COPY.forgetTitle}
        description={SEAT_COPY.forgetDescription.replace(
          '{label}',
          SEAT_COPY.unidentified[
            forgetting?.roles.includes('observer') && !forgetting.roles.includes('recruiter')
              ? 'observer'
              : 'recruiter'
          ]
        )}
        confirmLabel={SEAT_COPY.forget}
        tone="danger"
        pending={isSaving}
        onCancel={() => setForgetting(null)}
        onConfirm={() => {
          if (forgetting) void run(forgetting, 'forget').then(() => setForgetting(null))
        }}
      />
    </Section>
  )
}
