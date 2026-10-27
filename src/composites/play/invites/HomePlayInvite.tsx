'use client'

import type { CSSProperties } from 'react'
import { createPortal } from 'react-dom'

import { Button } from '@/components/elements/actions/Button'
import { Avatar } from '@/components/elements/display/Avatar'
import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { PlayInviteSentence } from '@/composites/play/invites/PlayInviteSentence'
import { usePlayInviteAnswer } from '@/core/hooks/data/play/usePlayInviteAnswer'
import { usePendingInvite } from '@/core/store/playInvites'
import { playKeysOf } from '@/declarations/play/games'
import { PLAY_INVITE_COPY } from '@/declarations/play/invites'
import { HOME_PLAY_INVITE } from '@/declarations/ui/variants'
import type { PlayInviteView } from '@/types/play'

/**
 * The popup itself, for one invitation
 * @param {Object} props - Popup
 * @param {PlayInviteView} props.invite - Invitation
 * @return {JSX.Element}
 */

const InviteCard = ({ invite }: { invite: PlayInviteView }) => {
  const { isSaving, accept, decline } = usePlayInviteAnswer(invite)

  return (
    <aside
      className={HOME_PLAY_INVITE.anchor}
      style={playKeysOf(invite.game) as CSSProperties}
      aria-label={PLAY_INVITE_COPY.label}
      role="alertdialog"
    >
      <div className={HOME_PLAY_INVITE.card}>
        <PlayGameLogo game={invite.game} className={HOME_PLAY_INVITE.logo} />
        <div className={HOME_PLAY_INVITE.body}>
          <span className={HOME_PLAY_INVITE.eyebrow}>{PLAY_INVITE_COPY.eyebrow}</span>
          <p className={HOME_PLAY_INVITE.text}>
            <PlayInviteSentence
              invite={invite}
              nameClassName={HOME_PLAY_INVITE.name}
              face={
                <span className={HOME_PLAY_INVITE.inviter}>
                  <Avatar
                    name={invite.inviter.name}
                    src={invite.inviter.avatarUrl}
                    size="sm"
                  />{' '}
                </span>
              }
            />
          </p>
          <div className={HOME_PLAY_INVITE.actions}>
            <Button variant="arcade" isLoading={isSaving} onClick={() => void accept()}>
              {PLAY_INVITE_COPY.accept}
            </Button>
            <Button variant="arcadeGhost" disabled={isSaving} onClick={decline}>
              {PLAY_INVITE_COPY.decline}
            </Button>
          </div>
        </div>
      </div>
    </aside>
  )
}

/**
 * Home page popup: the game logo, then « name t'invite à jouer au jeu »
 * @return {JSX.Element | null}
 */

export const HomePlayInvite = () => {
  const invite = usePendingInvite()

  // Out of the page frame, never clipped by it
  return invite ? createPortal(<InviteCard key={invite.id} invite={invite} />, document.body) : null
}
