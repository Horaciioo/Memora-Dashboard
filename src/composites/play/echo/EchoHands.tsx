import { Avatar } from '@/components/elements/display/Avatar'
import { EchoCard } from '@/composites/play/echo/EchoCard'
import type { EchoBoardView, EchoFace } from '@/composites/play/echo/types'
import { ECHO_BOARD_COPY } from '@/declarations/play'
import { ECHO_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Every card of the table in small, each one sharing a symbol with the center
 * @param {Object} props - Hands
 * @param {EchoBoardView['hands']} props.hands - Cards dealt
 * @param {EchoFace[]} props.seats - Players with faces
 * @param {number} props.seed - Layout seed of the round
 * @param {string} props.viewerId - Reader, left out
 * @return {JSX.Element | null}
 */

export const EchoHands = ({
  hands,
  seats,
  seed,
  viewerId,
}: {
  hands: EchoBoardView['hands']
  seats: EchoFace[]
  seed: number
  viewerId: string
}) => {
  const others = hands.filter((hand) => hand.accountId !== viewerId)
  if (!others.length) return null

  return (
    <section className={ECHO_BOARD.hands} aria-label={ECHO_BOARD_COPY.hands}>
      {others.map((hand, index) => {
        const seat = seats.find((entry) => entry.accountId === hand.accountId)

        return (
          <figure
            key={hand.accountId}
            className={cn(ECHO_BOARD.hand, seat?.rank && ECHO_BOARD.handDone)}
          >
            <EchoCard card={hand.card} seed={seed + index + 1} answer={hand.answer} isSmall />
            <figcaption className={ECHO_BOARD.handName}>
              <Avatar name={seat?.name ?? ''} src={seat?.avatarUrl ?? null} size="xs" />
              <span className="truncate">{seat?.name}</span>
            </figcaption>
          </figure>
        )
      })}
    </section>
  )
}
