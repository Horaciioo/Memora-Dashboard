'use client'

import type { CSSProperties } from 'react'

import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { PlayInviteSentence } from '@/composites/play/invites/PlayInviteSentence'
import { usePlayInviteAnswer } from '@/core/hooks/data/play/usePlayInviteAnswer'
import { usePendingInvite } from '@/core/store/playInvites'
import { playKeysOf } from '@/declarations/play/games'
import { PLAY_INVITE_COPY } from '@/declarations/play/invites'
import { ICONS } from '@/declarations/ui/icons'
import { HOME_PLAY_INVITE } from '@/declarations/ui/variants'
import type { PlayInviteView } from '@/types/play'

/**
 * The box itself, for one invitation
 * @param {Object} props - Box
 * @param {PlayInviteView} props.invite - Invitation
 * @return {JSX.Element}
 */

const InviteBox = ({ invite }: { invite: PlayInviteView }) => {
  const { isSaving, accept, decline } = usePlayInviteAnswer(invite)
  const JoinIcon = ICONS.next

  return (
    <aside
      className={HOME_PLAY_INVITE.box}
      style={playKeysOf(invite.game) as CSSProperties}
      aria-label={PLAY_INVITE_COPY.label}
    >
      <PlayGameLogo game={invite.game} className={HOME_PLAY_INVITE.logo} />
      <div className={HOME_PLAY_INVITE.body}>
        <span className={HOME_PLAY_INVITE.eyebrow}>{PLAY_INVITE_COPY.eyebrow}</span>
        <p className={HOME_PLAY_INVITE.text}>
          <PlayInviteSentence invite={invite} nameClassName={HOME_PLAY_INVITE.name} />
        </p>
      </div>
      <button
        type="button"
        className={HOME_PLAY_INVITE.decline}
        disabled={isSaving}
        onClick={decline}
      >
        {PLAY_INVITE_COPY.decline}
      </button>
      <button
        type="button"
        className={HOME_PLAY_INVITE.join}
        disabled={isSaving}
        aria-label={PLAY_INVITE_COPY.accept}
        onClick={() => void accept()}
      >
        <JoinIcon className={HOME_PLAY_INVITE.joinIcon} aria-hidden="true" />
      </button>
    </aside>
  )
}

/**
 * Home page box: « name t'invite à jouer au jeu », an arrow to join
 * @return {JSX.Element | null}
 */

export const HomePlayInvite = () => {
  const invite = usePendingInvite()

  return invite ? <InviteBox key={invite.id} invite={invite} /> : null
}
