'use client'

import { useMemo, useState } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { Button } from '@/components/elements/actions/Button'
import { usePlayInvites } from '@/core/hooks/data/play/usePlayInvites'
import type { PlayInviteTarget } from '@/core/hooks/data/play/usePlayInvites'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_INVITE } from '@/declarations/ui/variants'
import type { PlayCandidate } from '@/types/play'
import { cn } from '@/utils/classnames'
import { PlayInviteRoles } from '@/utils/constants/play'
import type { PlayInviteRoleName } from '@/utils/constants/play'
import { foldText } from '@/utils/format/strings'

export interface PlayInvitePickerProps {
  sessionId: string
  candidates: PlayCandidate[]
  // Players can still sit down
  canSeat: boolean
  onDone: () => void
  alignEnd?: boolean
  // Sits in the flow instead of floating
  inline?: boolean
}

/**
 * Invite all of Memora, or chosen people, as players or spectators
 * @param {PlayInvitePickerProps} props - Game and candidates
 * @return {JSX.Element}
 */

export const PlayInvitePicker = ({
  sessionId,
  candidates,
  canSeat,
  onDone,
  alignEnd,
  inline,
}: PlayInvitePickerProps) => {
  const { isSaving, invite } = usePlayInvites()
  const [role, setRole] = useState<PlayInviteRoleName>(
    canSeat ? PlayInviteRoles.Player : PlayInviteRoles.Spectator
  )
  const [isPicking, setPicking] = useState(false)
  const [query, setQuery] = useState('')
  const [chosen, setChosen] = useState<string[]>([])

  const matches = useMemo(
    () => candidates.filter((entry) => foldText(entry.displayName).includes(foldText(query))),
    [candidates, query]
  )
  const send = async (target: PlayInviteTarget) => {
    if (await invite(sessionId, role, target)) onDone()
  }
  const flip = (id: string) =>
    setChosen((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]
    )
  const roles = [
    ...(canSeat ? [{ value: PlayInviteRoles.Player, label: PLAY_HUB_COPY.inviteAsPlayer }] : []),
    { value: PlayInviteRoles.Spectator, label: PLAY_HUB_COPY.inviteAsSpectator },
  ]
  const EveryoneIcon = ICONS.playCall
  const PeopleIcon = ICONS.playPlayers
  const CheckIcon = ICONS.playTick

  return (
    <div
      ref={(node) => {
        if (!node || !inline) return
        const trigger = node.previousElementSibling?.getBoundingClientRect()
        const box = node.getBoundingClientRect()
        if (trigger)
          node.style.setProperty('--arrow-x', `${trigger.left + trigger.width / 2 - box.left}px`)
        node.scrollIntoView({ block: 'nearest' })
      }}
      className={
        inline ? PLAY_INVITE.panelInline : cn(PLAY_INVITE.panel, alignEnd && PLAY_INVITE.panelEnd)
      }
    >
      {inline && <span aria-hidden="true" className={PLAY_INVITE.arrow} />}
      <div className={PLAY_INVITE.roles}>
        {roles.map((entry) => (
          <button
            key={entry.value}
            type="button"
            aria-pressed={role === entry.value}
            className={cn(PLAY_INVITE.role, role === entry.value && PLAY_INVITE.roleOn)}
            onClick={() => setRole(entry.value)}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {isPicking ? (
        <>
          <button type="button" className={PLAY_INVITE.back} onClick={() => setPicking(false)}>
            {PLAY_HUB_COPY.inviteBack}
          </button>
          <input
            autoFocus
            value={query}
            placeholder={PLAY_HUB_COPY.inviteSearch}
            aria-label={PLAY_HUB_COPY.inviteSearch}
            className={PLAY_INVITE.search}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className={PLAY_INVITE.people}>
            {matches.length === 0 && (
              <p className={PLAY_INVITE.empty}>{PLAY_HUB_COPY.inviteNobody}</p>
            )}
            {matches.map((entry) => {
              const isOn = chosen.includes(entry.id)

              return (
                <button
                  key={entry.id}
                  type="button"
                  aria-pressed={isOn}
                  className={cn(PLAY_INVITE.person, isOn && PLAY_INVITE.personOn)}
                  onClick={() => flip(entry.id)}
                >
                  <Avatar name={entry.displayName} src={entry.avatarUrl} size="xs" />
                  {entry.displayName}
                  {isOn && <CheckIcon className={PLAY_INVITE.check} />}
                </button>
              )
            })}
          </div>
          <Button
            variant="arcade"
            disabled={chosen.length === 0}
            isLoading={isSaving}
            onClick={() => void send({ accountIds: chosen })}
          >
            {PLAY_HUB_COPY.inviteSend}
          </Button>
        </>
      ) : (
        <>
          <button
            type="button"
            className={PLAY_INVITE.choice}
            disabled={isSaving}
            onClick={() => void send({ everyone: true })}
          >
            <EveryoneIcon className={PLAY_INVITE.choiceIcon} />
            {PLAY_HUB_COPY.inviteEveryoneOption}
          </button>
          <button type="button" className={PLAY_INVITE.choice} onClick={() => setPicking(true)}>
            <PeopleIcon className={PLAY_INVITE.choiceIcon} />
            {PLAY_HUB_COPY.invitePeopleOption}
          </button>
        </>
      )}
    </div>
  )
}
