import {
  PLAY_INVITE_COPY,
  PLAY_INVITE_GAMES,
  PLAY_NOTICE_ACTIONS,
  PLAY_NOTICE_FOLLOWED,
  PLAY_NOTICE_SENTENCES,
} from '@/declarations/play/invites'
import type { PlayNoticeView } from '@/types/play'
import { PlayNoticeKinds } from '@/utils/constants/play'

/**
 * News that only opens the game
 * @param {PlayNoticeView} notice - News
 * @return {boolean} - Followed game news
 */

export const isFollowedNotice = (notice: PlayNoticeView): boolean =>
  PLAY_NOTICE_FOLLOWED.includes(notice.kind)

/**
 * Sentence around the name
 * @param {PlayNoticeView} notice - News
 * @return {{ before: string, after: string }} - Text before and after the name
 */

export const noticeParts = (notice: PlayNoticeView): { before: string; after: string } => {
  const template =
    notice.isEveryone && notice.kind !== PlayNoticeKinds.Rematch
      ? PLAY_INVITE_COPY.everyone
      : PLAY_NOTICE_SENTENCES[notice.kind]
  const words = PLAY_INVITE_GAMES[notice.game]
  const game = notice.kind === PlayNoticeKinds.Invite ? words.play : words.watch
  const [before, after] = template.replace('{game}', game).split('{name}')

  return { before, after: after ?? '' }
}

/**
 * Words of the two buttons of a news
 * @param {PlayNoticeView} notice - News
 * @return {{ accept: string, decline: string }} - Main gesture and the way out
 */

export const noticeLabels = (notice: PlayNoticeView): { accept: string; decline: string } => ({
  accept: PLAY_NOTICE_ACTIONS[notice.kind],
  decline:
    notice.kind === PlayNoticeKinds.Rematch ? PLAY_INVITE_COPY.decline : PLAY_INVITE_COPY.ignore,
})
