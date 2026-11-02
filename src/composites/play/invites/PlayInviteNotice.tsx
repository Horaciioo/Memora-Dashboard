'use client'

import { PlayInviteSentence } from '@/composites/play/invites/PlayInviteSentence'
import { usePlayInviteAnswer } from '@/core/hooks/data/play/usePlayInviteAnswer'
import { usePendingInvite } from '@/core/store/playInvites'
import { PLAY_INVITE_COPY } from '@/declarations/play/invites'
import { RELEASE_NOTICE } from '@/declarations/ui/blocks'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_INVITE_NOTICE } from '@/declarations/ui/variants'
import type { PlayInviteView } from '@/types/play'
import { cn } from '@/utils/classnames'

/**
 * The card itself, for one invitation
 * @param {Object} props - Card
 * @param {PlayInviteView} props.invite - Invitation
 * @param {number} [props.pointedAt] - Share of the shortcut row, 0 to 1
 * @return {JSX.Element}
 */

const InviteCard = ({ invite, pointedAt }: { invite: PlayInviteView; pointedAt?: number }) => {
  const { isSaving, accept, decline } = usePlayInviteAnswer(invite)
  const CloseIcon = ICONS.close
  const JoinIcon = ICONS.next
  const isPointed = pointedAt !== undefined

  return (
    <div
      className={cn(RELEASE_NOTICE.wrap, isPointed && RELEASE_NOTICE.wrapPointed)}
      role="alert"
      aria-label={PLAY_INVITE_COPY.label}
    >
      {isPointed && (
        <span
          className={RELEASE_NOTICE.caret}
          style={{ left: `calc(${pointedAt * 100}% - 0.375rem)` }}
          aria-hidden="true"
        />
      )}

      <div className={RELEASE_NOTICE.frame}>
        <span className={RELEASE_NOTICE.veil} aria-hidden="true" />
        <button
          type="button"
          className={cn(RELEASE_NOTICE.link, PLAY_INVITE_NOTICE.link)}
          disabled={isSaving}
          onClick={() => void accept()}
        >
          <span className={RELEASE_NOTICE.sheen} aria-hidden="true" />
          <span className={RELEASE_NOTICE.kicker}>{PLAY_INVITE_COPY.eyebrow}</span>
          <span className={RELEASE_NOTICE.title}>
            <PlayInviteSentence invite={invite} nameClassName={PLAY_INVITE_NOTICE.name} />
          </span>
          <span className={RELEASE_NOTICE.cta}>
            {PLAY_INVITE_COPY.join}
            <JoinIcon className={RELEASE_NOTICE.ctaIcon} aria-hidden="true" />
          </span>
        </button>

        <button
          type="button"
          aria-label={PLAY_INVITE_COPY.decline}
          title={PLAY_INVITE_COPY.decline}
          className={RELEASE_NOTICE.dismiss}
          disabled={isSaving}
          onClick={decline}
        >
          <CloseIcon className={RELEASE_NOTICE.dismissIcon} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

/**
 * Rail card like the release note: « name t'a invité à jouer au jeu », an arrow to join
 * @param {Object} props - Card
 * @param {number} [props.pointedAt] - Share of the shortcut row, 0 to 1
 * @return {JSX.Element | null}
 */

export const PlayInviteNotice = ({ pointedAt }: { pointedAt?: number }) => {
  const invite = usePendingInvite()

  return invite ? <InviteCard key={invite.id} invite={invite} pointedAt={pointedAt} /> : null
}
