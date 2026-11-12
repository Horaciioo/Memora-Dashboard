'use client'

import type { CSSProperties } from 'react'

import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { PlayInviteSentence } from '@/composites/play/invites/PlayInviteSentence'
import { usePlayNoticeAnswer } from '@/core/hooks/data/play/usePlayNoticeAnswer'
import { noticeLabels } from '@/core/lib/play/notices'
import { usePendingNotice } from '@/core/store/play/playNotices'
import { playKeysOf } from '@/declarations/play/games'
import { PLAY_INVITE_COPY } from '@/declarations/play/invites'
import { ICONS } from '@/declarations/ui/icons'
import { HOME_PLAY_INVITE } from '@/declarations/ui/variants'
import type { PlayNoticeView } from '@/types/play'

/**
 * The box itself, for one invitation
 * @param {Object} props - Box
 * @param {PlayNoticeView} props.invite - Invitation
 * @param {boolean} [props.isAside] - Hub sidebar dress, shown at every width
 * @return {JSX.Element}
 */

const InviteBox = ({ invite, isAside }: { invite: PlayNoticeView; isAside?: boolean }) => {
  const { isSaving, accept, decline } = usePlayNoticeAnswer(invite)
  const labels = noticeLabels(invite)
  const JoinIcon = ICONS.next

  return (
    <aside
      className={isAside ? HOME_PLAY_INVITE.aside : HOME_PLAY_INVITE.box}
      style={playKeysOf(invite.game) as CSSProperties}
      aria-label={PLAY_INVITE_COPY.label}
    >
      <PlayGameLogo game={invite.game} className={HOME_PLAY_INVITE.logo} />
      <div className={HOME_PLAY_INVITE.body}>
        <span className={HOME_PLAY_INVITE.eyebrow}>{PLAY_INVITE_COPY.eyebrow}</span>
        <p className={HOME_PLAY_INVITE.text}>
          <PlayInviteSentence notice={invite} nameClassName={HOME_PLAY_INVITE.name} />
        </p>
      </div>
      <button
        type="button"
        className={HOME_PLAY_INVITE.decline}
        disabled={isSaving}
        onClick={decline}
      >
        {labels.decline}
      </button>
      <button
        type="button"
        className={HOME_PLAY_INVITE.join}
        disabled={isSaving}
        aria-label={labels.accept}
        onClick={() => void accept()}
      >
        <JoinIcon className={HOME_PLAY_INVITE.joinIcon} aria-hidden="true" />
      </button>
    </aside>
  )
}

/**
 * Home page box: « name t'invite à jouer au jeu », an arrow to join
 * @param {Object} props - Box
 * @param {boolean} [props.isAside] - Hub sidebar dress
 * @return {JSX.Element | null}
 */

export const HomePlayInvite = ({ isAside }: { isAside?: boolean }) => {
  const invite = usePendingNotice()

  return invite ? <InviteBox key={invite.id} invite={invite} isAside={isAside} /> : null
}
