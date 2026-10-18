'use client'

import { Avatar } from '@/components/elements/display/Avatar'
import { memberMenu } from '@/composites/modview/memberMenu'
import type { TeamTools } from '@/composites/modview/memberMenu'
import { WindowEmpty } from '@/composites/modview/ModWindow'
import { useActionMenu } from '@/core/hooks/interaction/layout/useActionMenu'
import { MODVIEW_TEAM_COPY as COPY } from '@/declarations/modview/watch'
import { MODVIEW_TEAM } from '@/declarations/ui/variants'
import type { LiveFocusView, LivePerson } from '@/types/lives'
import { cn } from '@/utils/classnames'

export interface TeamPanelProps {
  tools: TeamTools
  focuses: LiveFocusView[]
}

interface TeamMemberProps {
  member: LivePerson
  tools: TeamTools
}

/**
 * One teammate: click or right click for Focus and Inspect Mod
 * @param {TeamMemberProps} props - Member props
 * @return {JSX.Element}
 */

const TeamMember = ({ member, tools }: TeamMemberProps) => {
  const handlers = useActionMenu(memberMenu(member, tools), member.name)
  const isFollowed = tools.followingId === member.id

  return (
    <button
      type="button"
      className={cn(MODVIEW_TEAM.member, isFollowed && MODVIEW_TEAM.memberFocus)}
      {...handlers}
    >
      <Avatar name={member.name} src={member.avatar} size="sm" />
      <span className={MODVIEW_TEAM.name}>{member.name}</span>
      {isFollowed && <span className={MODVIEW_TEAM.tag}>{COPY.following}</span>}
    </button>
  )
}

/**
 * Teammates of the live, with the Focus gestures on a click or a right click
 * @param {TeamPanelProps} props - Panel props
 * @return {JSX.Element}
 */

export const TeamPanel = ({ tools, focuses }: TeamPanelProps) =>
  tools.members.length === 0 ? (
    <WindowEmpty icon="teams" title={COPY.emptyTitle} body={COPY.emptyBody} />
  ) : (
    <>
      {focuses.map((focus) => (
        <p key={focus.id} className={MODVIEW_TEAM.focus}>
          {COPY.focusBy
            .replace('{watcher}', focus.watcherName)
            .replace('{target}', focus.targetName)}
        </p>
      ))}
      <div className={MODVIEW_TEAM.list}>
        {tools.members.map((member) => (
          <TeamMember key={member.id} member={member} tools={tools} />
        ))}
      </div>
      <p className={MODVIEW_TEAM.hint}>{COPY.hint}</p>
    </>
  )
