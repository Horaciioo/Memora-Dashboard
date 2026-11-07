'use client'

import { Avatar } from '@/components/elements/display/Avatar'
import { Button } from '@/components/elements/actions/Button'
import { usePlayNoticeAnswer } from '@/core/hooks/data/play/usePlayNoticeAnswer'
import { noticeLabels, noticeParts } from '@/core/lib/play/notices'
import { PLAY_GAMES } from '@/declarations/play'
import { PLAY_DOCK } from '@/declarations/ui/variants'
import type { PlayNoticeView } from '@/types/play'

/**
 * Row of a news: one main gesture and the way out
 * @param {Object} props - Row
 * @param {PlayNoticeView} props.notice - News
 * @return {JSX.Element}
 */

export const PlayDockNotice = ({ notice }: { notice: PlayNoticeView }) => {
  const { isSaving, accept, decline } = usePlayNoticeAnswer(notice)
  const labels = noticeLabels(notice)
  const { before, after } = noticeParts(notice)

  return (
    <div className={PLAY_DOCK.row}>
      <span className={PLAY_DOCK.rowName}>
        <Avatar name={notice.actor.name} src={notice.actor.avatarUrl} size="xs" />
        {before}
        {notice.actor.name}
        {after}
      </span>
      <span className={PLAY_DOCK.rowNote}>{PLAY_GAMES.label(notice.game)}</span>
      <span className={PLAY_DOCK.rowActions}>
        <Button variant="arcadeSmall" isLoading={isSaving} onClick={() => void accept()}>
          {labels.accept}
        </Button>
        <Button variant="arcadeGhostSmall" isLoading={isSaving} onClick={decline}>
          {labels.decline}
        </Button>
      </span>
    </div>
  )
}
