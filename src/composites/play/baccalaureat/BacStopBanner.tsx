import { Avatar } from '@/components/elements/display/Avatar'
import type { BacPlayer } from '@/composites/play/baccalaureat/types'
import { BAC_BOARD_COPY, fillPlayMessage } from '@/declarations/play'
import { BAC_BOARD } from '@/declarations/ui/variants'

/**
 * The shout that takes the clock's place: the caller's face, then STOP
 * @param {Object} props - Banner
 * @param {BacPlayer} props.stopper - Who called it
 * @return {JSX.Element}
 */

export const BacStopBanner = ({ stopper }: { stopper: BacPlayer }) => (
  <div
    className={BAC_BOARD.stop}
    role="status"
    aria-label={fillPlayMessage(BAC_BOARD_COPY.stopped, { name: stopper.name })}
  >
    <Avatar name={stopper.name} src={stopper.avatarUrl} size="lg" />
    <span className={BAC_BOARD.stopWord} aria-hidden="true">
      {BAC_BOARD_COPY.stopShout}
    </span>
  </div>
)
