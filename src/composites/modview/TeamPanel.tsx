'use client'

import { Avatar } from '@/components/elements/display/Avatar'
import { AddRow } from '@/components/structures/inline/AddRow'
import { ReinforcementTag } from '@/composites/lives/coordination/ReinforcementTag'
import { memberMenu } from '@/composites/modview/memberMenu'
import type { TeamTools } from '@/composites/modview/memberMenu'
import { WindowEmpty } from '@/composites/modview/ModWindow'
import { useLiveRoster } from '@/core/hooks/data/lives/useLiveRoster'
import { useClock } from '@/core/hooks/interaction/state/time/useClock'
import { useActionMenu } from '@/core/hooks/interaction/layout/overlay/useActionMenu'
import { FOCUS_OFFLINE_ALLOWED } from '@/declarations/lives/registries'
import {
  ARRIVAL_FRESH_MINUTES,
  TEAM_ORDER,
  TEAM_ROLES,
  TEAM_SECTIONS,
  TEAM_JUNIOR_TONE,
  roleOf,
  sectionOf,
} from '@/declarations/modview/roles'
import { MODVIEW_TEAM_COPY as COPY } from '@/declarations/modview/watch'
import { MODVIEW_TEAM } from '@/declarations/ui/variants'
import type { LiveFocusView, LivePerson } from '@/types/lives'
import { AttendanceStatuses } from '@/utils/constants/workflow'
import { cn } from '@/utils/classnames'
import { MINUTE_MS } from '@/utils/constants/time'
import { formatHourMark } from '@/utils/format/time/dates'

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
  // ISO hour planned, coordinators and Responsables only
  plannedFrom: string | null
  // ISO arrival in the Mod View, none when not connected
  arrivedAt: string | null
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
  arrivedAt,
}: TeamMemberProps) => {
  const now = useClock()
  const role = roleOf(member.rank, isCoordinator)
  // Only a connected member can be followed
  const handlers = useActionMenu(
    memberMenu(member, {
      ...tools,
      canFocus: (id) => isPresent && (isOnline || FOCUS_OFFLINE_ALLOWED) && tools.canFocus(id),
    }),
    member.name
  )
  const isFollowed = tools.followingId === member.id
  const isFresh =
    arrivedAt !== null && now - new Date(arrivedAt).getTime() < ARRIVAL_FRESH_MINUTES * MINUTE_MS

  return (
    <button
      type="button"
      className={cn(
        MODVIEW_TEAM.member,
        isCoordinator && !isFollowed && MODVIEW_TEAM.memberCoordinator,
        isFollowed && MODVIEW_TEAM.memberFocus
      )}
      title={arrivedAt ? COPY.arrived.replace('{time}', formatHourMark(arrivedAt)) : undefined}
      {...handlers}
    >
      <span className={MODVIEW_TEAM.portrait}>
        <Avatar name={member.name} src={member.avatar} size="sm" />
      </span>
      <span
        className={cn(
          MODVIEW_TEAM.name,
          !isFollowed && (role ? TEAM_ROLES[role].tone : TEAM_JUNIOR_TONE)
        )}
      >
        {member.name}
      </span>
      {member.isReinforcement && <ReinforcementTag />}
      {isFollowed && <span className={MODVIEW_TEAM.tag}>{COPY.following}</span>}
      {isFresh && <span className={MODVIEW_TEAM.tag}>{COPY.justArrived}</span>}
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

  // Admins above Responsables inside a section
  const coordinating = new Set(coordinatorIds)
  const rankOf = (member: LivePerson) =>
    TEAM_ORDER.indexOf(roleOf(member.rank, coordinating.has(member.id)) ?? 'moderator')
  const ordered = [...tools.members].sort((a, b) => rankOf(a) - rankOf(b))

  return (
    <>
      {focuses.map((focus) => (
        <p key={focus.id} className={MODVIEW_TEAM.focus}>
          {COPY.focusBy
            .replace('{watcher}', focus.watcherName)
            .replace('{target}', focus.targetName)}
        </p>
      ))}
      <div className={MODVIEW_TEAM.list}>
        {TEAM_SECTIONS.map((section) => {
          const members = ordered.filter(
            (member) => sectionOf(member, coordinating.has(member.id)) === section.key
          )
          if (members.length === 0) return null
          const SectionGlyph = section.glyph

          return (
            <section key={section.key} className={MODVIEW_TEAM.section}>
              <h3 className={MODVIEW_TEAM.sectionHead}>
                <span className={MODVIEW_TEAM.sectionRule} aria-hidden="true" />
                <span className={MODVIEW_TEAM.sectionTitle}>
                  <SectionGlyph className={MODVIEW_TEAM.sectionGlyph} />
                  {section.label}
                </span>
                <span className={MODVIEW_TEAM.sectionRule} aria-hidden="true" />
              </h3>
              {members.map((member) => (
                <TeamMember
                  key={member.id}
                  member={member}
                  tools={tools}
                  isOnline={online.has(member.id)}
                  isPresent={present.has(member.id)}
                  isCoordinator={coordinating.has(member.id)}
                  plannedFrom={planned.get(member.id) ?? null}
                  arrivedAt={roster?.arrivals[member.id] ?? null}
                />
              ))}
            </section>
          )
        })}
      </div>
      {reinforce}
    </>
  )
}
