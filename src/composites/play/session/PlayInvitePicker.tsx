'use client'

import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { PlayInviteSection } from '@/composites/play/session/PlayInviteSection'
import { usePlayOnline } from '@/composites/play/mobile/PlayOnline'
import { usePlayInvites } from '@/core/hooks/data/play/usePlayInvites'
import { groupCandidates, PlayInviteGroups } from '@/core/lib/play/inviteGroups'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_INVITE } from '@/declarations/ui/variants'
import type { PlayInviteCandidate } from '@/types/play'
import { cn } from '@/utils/classnames'
import { PlayInviteRoles } from '@/utils/constants/play'
import { foldText } from '@/utils/format/strings'

export interface PlayInvitePickerProps {
  sessionId: string
  candidates: PlayInviteCandidate[]
  // Players can still sit down
  canSeat: boolean
  onDone: () => void
  alignEnd?: boolean
  // Centred under its trigger
  centered?: boolean
  // Opens over its trigger, at the foot of a column
  above?: boolean
  // Sits in the flow instead of floating
  inline?: boolean
  // Lobby tools under the list
  extras?: ReactNode
}

/**
 * Search then one tap invites a member, online ones first
 * @param {PlayInvitePickerProps} props - Game and candidates
 * @return {JSX.Element}
 */

export const PlayInvitePicker = ({
  sessionId,
  candidates,
  canSeat,
  onDone,
  alignEnd,
  centered,
  above,
  inline,
  extras,
}: PlayInvitePickerProps) => {
  const { isSaving, invite } = usePlayInvites()
  const online = usePlayOnline()
  const [isSpectator, setSpectator] = useState(!canSeat)
  const [query, setQuery] = useState('')
  const [sent, setSent] = useState<string[]>([])

  const groups = useMemo(
    () => groupCandidates(candidates, new Set(online.map((member) => member.accountId))),
    [candidates, online]
  )
  // Live members first, then the lately seen ones
  const sections = [
    {
      title: PLAY_HUB_COPY.inviteOnline,
      people: [...groups[PlayInviteGroups.Online], ...groups[PlayInviteGroups.Recent]],
    },
    { title: PLAY_HUB_COPY.invitePlayedWith, people: groups[PlayInviteGroups.PlayedWith] },
  ]
  const matches = useMemo(
    () => candidates.filter((entry) => foldText(entry.displayName).includes(foldText(query))),
    [candidates, query]
  )
  const role = isSpectator ? PlayInviteRoles.Spectator : PlayInviteRoles.Player
  const EveryoneIcon = ICONS.playCall
  const CloseIcon = ICONS.playClose
  const TickIcon = ICONS.playTick
  const SpectatorIcon = ICONS.playSpectators

  const send = async (id: string) => {
    if (sent.includes(id)) return
    if (await invite(sessionId, role, { accountIds: [id] })) setSent((current) => [...current, id])
  }
  const everyone = async () => {
    if (await invite(sessionId, role, { everyone: true })) onDone()
  }

  return (
    <>
      {!above && <div aria-hidden="true" className={PLAY_INVITE.scrim} onClick={onDone} />}
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
          inline
            ? PLAY_INVITE.panelInline
            : above
              ? PLAY_INVITE.panelDock
              : cn(
                  PLAY_INVITE.panel,
                  alignEnd && PLAY_INVITE.panelEnd,
                  centered && PLAY_INVITE.panelCentered
                )
        }
      >
        {!above && <span aria-hidden="true" className={PLAY_INVITE.arrow} />}
        <div className={PLAY_INVITE.head}>
          <input
            autoFocus
            value={query}
            placeholder={PLAY_HUB_COPY.inviteSearch}
            aria-label={PLAY_HUB_COPY.inviteSearch}
            className={PLAY_INVITE.search}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button
            type="button"
            className={cn(PLAY_INVITE.close, PLAY_INVITE.closeMobile)}
            aria-label={PLAY_HUB_COPY.inviteClose}
            onClick={onDone}
          >
            <CloseIcon className={PLAY_INVITE.closeIcon} aria-hidden="true" />
          </button>
        </div>

        <div className={PLAY_INVITE.people}>
          {query.trim() !== '' ? (
            <>
              <PlayInviteSection people={matches} sent={sent} onSend={send} />
              {matches.length === 0 && (
                <p className={PLAY_INVITE.empty}>{PLAY_HUB_COPY.inviteNobody}</p>
              )}
            </>
          ) : (
            <>
              {sections.map(({ title, people }) => (
                <PlayInviteSection
                  key={title}
                  title={title}
                  people={people}
                  sent={sent}
                  onSend={send}
                />
              ))}
              {sections.every(({ people }) => people.length === 0) && (
                <p className={PLAY_INVITE.empty}>{PLAY_HUB_COPY.inviteHint}</p>
              )}
            </>
          )}
        </div>

        <div className={PLAY_INVITE.foot}>
          <div className={PLAY_INVITE.footGroup}>
            <h3 className={PLAY_INVITE.sectionTitle}>{PLAY_HUB_COPY.inviteOptionsTitle}</h3>
            <button
              type="button"
              className={PLAY_INVITE.choice}
              disabled={isSaving}
              onClick={everyone}
            >
              <EveryoneIcon className={PLAY_INVITE.choiceIcon} />
              {PLAY_HUB_COPY.inviteEveryoneOption}
            </button>
            {canSeat && (
              <button
                type="button"
                aria-pressed={isSpectator}
                className={PLAY_INVITE.choice}
                onClick={() => setSpectator((current) => !current)}
              >
                <SpectatorIcon className={PLAY_INVITE.choiceIcon} />
                {PLAY_HUB_COPY.inviteSpectatorOption}
                {isSpectator && <TickIcon className={PLAY_INVITE.check} />}
              </button>
            )}
          </div>
          {extras}
        </div>
      </div>
    </>
  )
}
