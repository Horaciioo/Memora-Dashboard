import type { ReactNode } from 'react'

import { PLAY_INVITE_COPY, PLAY_INVITE_GAMES } from '@/declarations/play/invites'
import type { PlayInviteView } from '@/types/play'
import { PlayInviteRoles } from '@/utils/constants/play'

/**
 * « Name t'invite à jouer au jeu », the name in bold
 * @param {Object} props - Sentence
 * @param {PlayInviteView} props.invite - Invitation
 * @param {string} props.nameClassName - Name classes
 * @param {ReactNode} [props.face] - Inviter avatar before the name
 * @return {JSX.Element}
 */

export const PlayInviteSentence = ({
  invite,
  nameClassName,
  face,
}: {
  invite: PlayInviteView
  nameClassName: string
  face?: ReactNode
}) => {
  const isPlayer = invite.role === PlayInviteRoles.Player
  const template = isPlayer ? PLAY_INVITE_COPY.play : PLAY_INVITE_COPY.watch
  const game = PLAY_INVITE_GAMES[invite.game]
  const [, rest] = template.split('{name}')

  return (
    <>
      {face}
      <strong className={nameClassName}>{invite.inviter.name}</strong>
      {rest.replace('{game}', isPlayer ? game.play : game.watch)}
    </>
  )
}
