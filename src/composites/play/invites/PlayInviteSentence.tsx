import type { ReactNode } from 'react'

import { noticeParts } from '@/core/lib/play/notices'
import type { PlayNoticeView } from '@/types/play'

/**
 * « Name t'invite à jouer au jeu », the name in bold
 * @param {Object} props - Sentence
 * @param {PlayNoticeView} props.notice - News
 * @param {string} props.nameClassName - Name classes
 * @param {ReactNode} [props.face] - Avatar before the sentence
 * @return {JSX.Element}
 */

export const PlayInviteSentence = ({
  notice,
  nameClassName,
  face,
}: {
  notice: PlayNoticeView
  nameClassName: string
  face?: ReactNode
}) => {
  const { before, after } = noticeParts(notice)

  return (
    <>
      {face}
      {before}
      <strong className={nameClassName}>{notice.actor.name}</strong>
      {after}
    </>
  )
}
