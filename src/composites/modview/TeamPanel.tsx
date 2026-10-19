'use client'

import { Avatar } from '@/components/elements/display/Avatar'
import { AddRow } from '@/components/structures/inline/AddRow'
import { ReinforcementTag } from '@/composites/lives/ReinforcementTag'
import { memberMenu } from '@/composites/modview/memberMenu'
import type { TeamTools } from '@/composites/modview/memberMenu'
import { WindowEmpty } from '@/composites/modview/ModWindow'
import { useLiveRoster } from '@/core/hooks/data/lives/useLiveRoster'
import { useActionMenu } from '@/core/hooks/interaction/layout/useActionMenu'
import { FOCUS_OFFLINE_ALLOWED, LIVE_COORDINATOR } from '@/declarations/lives/registries'
import { ICONS } from '@/declarations/ui/icons'
import { MODVIEW_TEAM_COPY as COPY } from '@/declarations/modview/watch'
import { MODVIEW_TEAM } from '@/declarations/ui/variants'
import type { LiveFocusView, LivePerson } from '@/types/lives'
import { AttendanceStatuses } from '@/utils/constants/workflow'
import { cn } from '@/utils/classnames'
import { formatHourMark } from '@/utils/format/dates'

export interface TeamPanelProps {
  liveId: string
  tools: TeamTools
  focuses: LiveFocusView[]
  // Members coordinating right now
  coordinatorIds: string[]
  // Viewer may call members from outside the team
  canReinforce: boolean
  // Opens the reinforcement drawer, kept outside this panel
  onReinforce: () => void
}

interface TeamMemberProps {
  member: LivePerson
  tools: TeamTools
  isOnline: boolean
  // Present on the roll-call, the only ones a Focus can follow
  isPresent: boolean
  // Coordinating right now
  isCoordinator: boolean
  // ISO hour planned, shown to Responsables
  plannedFrom: string | null
}

/**
 * One teammate: click or right click for Focus and Inspect Mod
 * @param {TeamMemberProps} props - Member props
 * @return {JSX.Element}
 */

const TeamMember = ({
  member,
  tools,
  isOnline,
  isPresent,
  isCoordinator,
  plannedFrom,
}: TeamMemberProps) => {
  const CoordinatorIcon = ICONS[LIVE_COORDINATOR.icon]
  // Only a connected member can be followed
  const handlers = useActionMenu(
    memberMenu(member, {
      ...tools,
      canFocus: (id) => isPresent && (isOnline || FOCUS_OFFLINE_ALLOWED) && tools.canFocus(id),
    }),
    member.name
  )
  const isFollowed = tools.followingId === member.id

  return (
    <button
      type="button"
      className={cn(MODVIEW_TEAM.member, isFollowed && MODVIEW_TEAM.memberFocus)}
      {...handlers}
    >
      <span className={MODVIEW_TEAM.portrait}>
        <Avatar name={member.name} src={member.avatar} size="sm" />
        {isCoordinator && (
          <span className={MODVIEW_TEAM.badge}>
            <CoordinatorIcon
              className={MODVIEW_TEAM.badgeGlyph}
              aria-label={LIVE_COORDINATOR.label}
            />
          </span>
        )}
      </span>
      <span
        className={cn(
          MODVIEW_TEAM.name,
          isCoordinator && !isFollowed && MODVIEW_TEAM.nameCoordinator
        )}
      >
        {member.name}
      </span>
      {member.isReinforcement && <ReinforcementTag />}
      {isFollowed && <span className={MODVIEW_TEAM.tag}>{COPY.following}</span>}
      {isOnline && <span className={MODVIEW_TEAM.dot} role="img" aria-label={COPY.online} />}
      {plannedFrom && (
        <span className={MODVIEW_TEAM.planned}>
          {COPY.planned.replace('{time}', formatHourMark(plannedFrom))}
        </span>
      )}
    </button>
  )
}

/**
 * Teammates of the live, with the Focus gestures on a click or a right click
 * @param {TeamPanelProps} props - Panel props
 * @return {JSX.Element}
 */

export const TeamPanel = ({
  liveId,
  tools,
  focuses,
  coordinatorIds,
  canReinforce,
  onReinforce,
}: TeamPanelProps) => {
  const { roster } = useLiveRoster(liveId, true)
  const online = new Set(roster?.connectedIds ?? [])
  const present = new Set(
    (roster?.people ?? [])
      .filter((person) => person.status === AttendanceStatuses.Present)
      .map((person) => person.id)
  )

  const planned = new Map(
    (roster?.people ?? []).map((person) => [person.id, person.plannedFrom] as const)
  )

  // Calling reinforcement closes the list
  const reinforce = canReinforce && (
    <div className={MODVIEW_TEAM.reinforce}>
      <AddRow label={COPY.reinforce} onClick={onReinforce} />
    </div>
  )

  if (tools.members.length === 0) {
    return (
      <>
        <WindowEmpty icon="teams" title={COPY.emptyTitle} body={COPY.emptyBody} />
        {reinforce}
      </>
    )
  }

  const groups = [
    { label: COPY.present, members: tools.members.filter((member) => present.has(member.id)) },
    { label: COPY.silent, members: tools.members.filter((member) => !present.has(member.id)) },
  ]

  return (
    <>
      {focuses.map((focus) => (
        <p key={focus.id} className={MODVIEW_TEAM.focus}>
          {COPY.focusBy
            .replace('{watcher}', focus.watcherName)
            .replace('{target}', focus.targetName)}
        </p>
      ))}
      {groups.map((group) => (
        <div key={group.label} className={MODVIEW_TEAM.list}>
          <p className={MODVIEW_TEAM.group}>{group.label}</p>
          {group.members.map((member) => (
            <TeamMember
              key={member.id}
              member={member}
              tools={tools}
              isOnline={online.has(member.id)}
              isPresent={present.has(member.id)}
              isCoordinator={coordinatorIds.includes(member.id)}
              plannedFrom={planned.get(member.id) ?? null}
            />
          ))}
        </div>
      ))}
      {reinforce}
    </>
  )
}
