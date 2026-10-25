import { Avatar } from '@/components/elements/display/Avatar'
import { Tip } from '@/components/elements/feedback/Tip'
import type { PlayFace } from '@/composites/play/session/BacSessionCrowd'
import { BAC_SESSION_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { BAC_SESSION } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Players in a row, a check once their round is filled
 * @param {Object} props - Progress
 * @param {PlayFace[]} props.players - Seated
 * @param {string[]} props.done - Finished players
 * @return {JSX.Element}
 */

export const BacSessionProgress = ({ players, done }: { players: PlayFace[]; done: string[] }) => {
  const DoneIcon = ICONS.playTick
  const WritingIcon = ICONS.playWriting

  return (
    <ul className={BAC_SESSION.progress} aria-label={BAC_SESSION_COPY.progress}>
      {players.map((player) => {
        const isDone = done.includes(player.id)
        const Icon = isDone ? DoneIcon : WritingIcon

        return (
          <li key={player.id} className={BAC_SESSION.progressItem}>
            <Tip
              label={`${player.name} ${isDone ? BAC_SESSION_COPY.done : BAC_SESSION_COPY.writing}`}
              floating
            >
              <Avatar name={player.name} src={player.avatarUrl} size="md" />
              <span
                className={cn(
                  BAC_SESSION.badge,
                  isDone ? BAC_SESSION.badgeDone : BAC_SESSION.badgeWriting
                )}
              >
                <Icon className={BAC_SESSION.badgeIcon} aria-hidden="true" />
              </span>
            </Tip>
          </li>
        )
      })}
    </ul>
  )
}
