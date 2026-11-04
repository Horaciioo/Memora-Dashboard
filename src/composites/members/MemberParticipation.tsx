'use client'

import { useState } from 'react'

import { SegmentedControl } from '@/components/elements/actions/SegmentedControl'
import { Avatar } from '@/components/elements/display/Avatar'
import Link from '@/components/elements/navigation/AppLink'
import { ConfirmDialog } from '@/components/structures/overlays/ConfirmDialog'
import { Section } from '@/components/structures/page/Section'
import { useSeatActions } from '@/core/hooks/data/people/useSeatActions'
import { useActionMenu } from '@/core/hooks/interaction/layout/useActionMenu'
import { SEAT_COPY } from '@/declarations/members/seats'
import type { SeatAction, SeatFamily, TemporaryKind } from '@/declarations/members/seats'
import {
  PARTICIPATION_ROLE_COPY,
  PARTICIPATION_TABS,
  MEMBER_COPY,
} from '@/declarations/members/copy'
import { ROUTES } from '@/declarations/navigation'
import { MEMBER_FILE, PARTICIPATION_BOX } from '@/declarations/ui/blocks'
import { EMPTY_VALUE } from '@/declarations/ui/variants'
import type { MenuItem } from '@/managers/front-end'
import type { MemberParticipation as Participation } from '@/types/members'
import { cn } from '@/utils/classnames'
import { formatDay, formatDayRange } from '@/utils/format/dates'
import { formatSpent } from '@/utils/format/modview'

// Sessions previewed before sending to the path tab
const PREVIEW_PARTICIPATION = 3

export interface ParticipantIdentity {
  id: string
  name: string
  avatarUrl: string | null
}

export interface MemberParticipationProps {
  member: ParticipantIdentity
  participations: Participation[]
  // Names of the functions the member holds, they decide the tabs
  functions: string[]
  // Responsable and above take access back or delete archives
  canManageSeats: boolean
  onNavigate: (tab: string) => void
}

/**
 * Facts under the title of one line
 * @param {Participation} entry - Session line
 * @return {[string, string][]} - Label and value of each fact
 */

const factsOf = (entry: Participation): [string, string][] => {
  if (entry.kind === 'academy') {
    return [
      // A bare list, no label
      ['', entry.juniors.join(', ') || MEMBER_COPY.participationJuniorsEmpty],
    ]
  }

  if (entry.kind === 'coordination') {
    return [
      [MEMBER_COPY.participationSpent, formatSpent(entry.spentSeconds)],
      [MEMBER_COPY.participationActions, String(entry.actions)],
    ]
  }

  return [
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
}

/**
 * Seat the unidentified label of a session line stands for
 * @param {Participation} entry - Session line
 * @return {TemporaryKind} - Trainer, recruiter, or observer alone
 */

const seatKindOf = (entry: Participation): TemporaryKind =>
  entry.kind === 'academy'
    ? 'trainer'
    : entry.roles.includes('recruiter') || !entry.roles.includes('observer')
      ? 'recruiter'
      : 'observer'

/**
 * One session the member took part in, a right click for its seat
 * @param {Object} props - Component props
 * @param {Participation} props.entry - Session line
 * @param {boolean} props.canManageSeats - Viewer may act on the seat
 * @param {(action: SeatAction) => void} props.onAct - Asks a gesture on the seat
 * @return {JSX.Element}
 */

const ParticipationLine = ({
  entry,
  canManageSeats,
  onAct,
}: {
  entry: Participation
  canManageSeats: boolean
  onAct: (action: SeatAction) => void
}) => {
  const items: MenuItem[] =
    canManageSeats && entry.isTemporary
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

  const period = entry.endsAt
    ? formatDayRange(entry.startsAt, entry.endsAt)
    : formatDay(entry.startsAt)
  const href = {
    recruitment: ROUTES.recruitment,
    academy: ROUTES.session,
    coordination: ROUTES.live,
  }[entry.kind](entry.id)
  const isLink = entry.canOpen && !entry.isRevoked

  const body = (
    <span className={PARTICIPATION_BOX.head}>
      <Avatar name={entry.youtuberName ?? entry.title} src={entry.youtuberAvatar} size="md" />
      <span className={PARTICIPATION_BOX.body}>
        <span className={PARTICIPATION_BOX.title}>
          {entry.title}
          {entry.kind === 'recruitment' && (
            <span className={PARTICIPATION_BOX.period}> • {period}</span>
          )}
        </span>
        <span className={PARTICIPATION_BOX.facts}>
          {factsOf(entry).map(([label, value]) => (
            <span
              key={label || value}
              className={cn(
                PARTICIPATION_BOX.fact,
                entry.kind === 'academy' && entry.juniors.length === 0 && EMPTY_VALUE
              )}
            >
              {label ? (
                <>
                  <span aria-hidden="true">-</span>
                  <span className={PARTICIPATION_BOX.factLabel}>{label} :</span>
                  {value}
                </>
              ) : (
                value
              )}
            </span>
          ))}
        </span>
      </span>
    </span>
  )
  const className = cn(
    PARTICIPATION_BOX.box,
    isLink && PARTICIPATION_BOX.link,
    entry.isRevoked && PARTICIPATION_BOX.revoked
  )
  const handlers = items.length > 0 ? { onContextMenu: menu.onContextMenu } : {}

  return isLink ? (
    <Link href={href} className={className} {...handlers}>
      {body}
    </Link>
  ) : (
    <div className={className} {...handlers}>
      {body}
    </div>
  )
}

/**
 * Sessions a moderator took part in
 * @param {ParticipantIdentity} member - Member the file belongs to
 * @param {Participation[]} participations - Sessions, latest first
 * @param {string[]} functions - Names of the functions held
 * @param {boolean} canManageSeats - Viewer may act on the seats
 * @param {(tab: string) => void} onNavigate - Opens another tab
 * @return {JSX.Element}
 */

export const MemberParticipation = ({
  member,
  participations,
  functions,
  canManageSeats,
  onNavigate,
}: MemberParticipationProps) => {
  const { isSaving, act } = useSeatActions()
  const [forgetting, setForgetting] = useState<Participation | null>(null)

  // One tab per function held
  const tabs = PARTICIPATION_TABS.filter((tab) =>
    tab.functions.some((name) => functions.includes(name))
  )
  const [picked, setPicked] = useState<string>('')
  const current = tabs.find((tab) => tab.value === picked) ?? tabs[0]
  const shown = participations.filter((entry) => entry.kind === current?.value)

  const run = (entry: Participation, action: SeatAction) =>
    act({
      accountId: member.id,
      family: entry.kind as SeatFamily,
      sessionId: entry.id,
      action,
    })

  return (
    <Section
      title={MEMBER_COPY.participationTitle}
      action={
        shown.length > PREVIEW_PARTICIPATION && (
          <button type="button" className={MEMBER_FILE.more} onClick={() => onNavigate('path')}>
            {MEMBER_COPY.seeMore}
          </button>
        )
      }
      raised
    >
      {tabs.length > 1 && (
        <div className={PARTICIPATION_BOX.tabs}>
          <SegmentedControl
            options={tabs.map(({ value, label }) => ({ value, label }))}
            value={current.value}
            onChange={setPicked}
            label={MEMBER_COPY.participationTabs}
          />
        </div>
      )}
      {shown.length === 0 && (
        <p className={cn('text-sm', EMPTY_VALUE)}>{MEMBER_COPY.participationEmpty}</p>
      )}
      <div className={PARTICIPATION_BOX.list}>
        {shown.slice(0, PREVIEW_PARTICIPATION).map((entry) => (
          <ParticipationLine
            key={`${entry.kind}:${entry.id}`}
            entry={entry}
            canManageSeats={canManageSeats}
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
          SEAT_COPY.unidentified[forgetting ? seatKindOf(forgetting) : 'recruiter']
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
