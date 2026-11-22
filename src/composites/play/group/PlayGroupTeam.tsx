'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { PlayGroupInvite } from '@/composites/play/group/PlayGroupInvite'
import { PlayAvatar } from '@/composites/play/skin/PlayAvatar'
import { usePlayGroup } from '@/core/hooks/data/play/usePlayGroup'
import { fillPlayMessage, PLAY_GROUP_COPY, PLAY_GROUP_STACK_MAX } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_BOX, PLAY_CREW } from '@/declarations/ui/variants'
import type { PlayGroupView } from '@/types/play'
import { cn } from '@/utils/classnames'

export interface PlayGroupTeamProps {
  group: PlayGroupView
  onlineIds: Set<string>
  candidates: { id: string; displayName: string; avatarUrl: string | null }[]
}

/**
 * Members box: the host first, a divider under each member, invitation field for the host
 * @param {PlayGroupTeamProps} props - Group, who is online, people the host can call
 * @return {JSX.Element}
 */

export const PlayGroupTeam = ({ group, onlineIds, candidates }: PlayGroupTeamProps) => {
  const actions = usePlayGroup()
  const CrownIcon = ICONS.crown
  const AddIcon = ICONS.add
  const [isInviting, setInviting] = useState(false)
  const members = [...group.members].sort((a, b) => Number(b.isHost) - Number(a.isHost))

  return (
    <section className={PLAY_CREW.box} aria-label={PLAY_GROUP_COPY.tabMembers}>
      <h2 className={PLAY_CREW.boxTitle}>{PLAY_GROUP_COPY.tabMembers}</h2>
      <ul className={PLAY_CREW.list}>
        {members.map((member) => {
          const isOnline = onlineIds.has(member.accountId)

          return (
            <li key={member.accountId} className={PLAY_CREW.row}>
              <PlayAvatar
                accountId={member.accountId}
                name={member.name}
                src={member.avatarUrl}
                size="sm"
              />
              <span className={PLAY_CREW.rowName}>
                <span className={PLAY_CREW.rowText}>{member.name}</span>
                {member.isHost && <CrownIcon className={PLAY_CREW.crown} aria-hidden="true" />}
              </span>
              {group.isHost && !member.isHost ? (
                <button
                  type="button"
                  className={PLAY_CREW.kick}
                  disabled={actions.isSaving}
                  onClick={() => void actions.remove(group.id, member.accountId)}
                >
                  {PLAY_GROUP_COPY.remove}
                </button>
              ) : null}
              <span
                className={cn(PLAY_CREW.state, isOnline ? PLAY_CREW.stateOn : PLAY_CREW.stateOff)}
              >
                {isOnline ? PLAY_GROUP_COPY.statusOnline : PLAY_GROUP_COPY.statusOffline}
              </span>
            </li>
          )
        })}
      </ul>
      {group.invited.length > 0 && (
        <>
          <div className={PLAY_CREW.rule} />
          <h2 className={PLAY_CREW.boxTitle}>{PLAY_GROUP_COPY.invitedTitle}</h2>
          <ul className={PLAY_CREW.stack}>
            {group.invited.slice(0, PLAY_GROUP_STACK_MAX).map((person) => (
              <li key={person.accountId} className={PLAY_CREW.stackItem}>
                <PlayAvatar
                  accountId={person.accountId}
                  name={person.name}
                  src={person.avatarUrl}
                  size="sm"
                  title={person.name}
                  className={PLAY_CREW.stackFace}
                />
              </li>
            ))}
            {group.invited.length > PLAY_GROUP_STACK_MAX && (
              <li className={PLAY_CREW.stackMore}>
                {fillPlayMessage(PLAY_GROUP_COPY.moreInvited, {
                  count: group.invited.length - PLAY_GROUP_STACK_MAX,
                })}
              </li>
            )}
          </ul>
        </>
      )}
      {group.isHost && (
        <>
          <div className={PLAY_CREW.rule} />
          {isInviting ? (
            <PlayGroupInvite groupId={group.id} candidates={candidates} />
          ) : (
            <Button
              variant="arcadeGhost"
              className={PLAY_BOX.add}
              onClick={() => setInviting(true)}
            >
              <AddIcon className={PLAY_BOX.addIcon} aria-hidden="true" />
              {PLAY_GROUP_COPY.inviteButton}
            </Button>
          )}
        </>
      )}
    </section>
  )
}
