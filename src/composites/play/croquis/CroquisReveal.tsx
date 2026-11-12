import { Avatar } from '@/components/elements/display/Avatar'
import type { CroquisBoardView, CroquisFace } from '@/composites/play/croquis/types'
import { CROQUIS_BOARD_COPY, fillPlayMessage } from '@/declarations/play'
import { CROQUIS_BOARD } from '@/declarations/ui/variants'

/**
 * What the drawing was and what it paid the drawer
 * @param {Object} props - Banner
 * @param {NonNullable<CroquisBoardView['reveal']>} props.reveal - Round result
 * @param {CroquisFace | undefined} props.drawer - Face of the drawer
 * @return {JSX.Element}
 */

export const CroquisReveal = ({
  reveal,
  drawer,
}: {
  reveal: NonNullable<CroquisBoardView['reveal']>
  drawer: CroquisFace | undefined
}) => (
  <div className={CROQUIS_BOARD.reveal} aria-live="polite">
    {reveal.solvers === 0 ? (
      <span className={CROQUIS_BOARD.timeout}>{CROQUIS_BOARD_COPY.nobody}</span>
    ) : (
      drawer && (
        <>
          <Avatar name={drawer.name} src={drawer.avatarUrl} size="lg" />
          <span className={CROQUIS_BOARD.revealName}>
            {fillPlayMessage(CROQUIS_BOARD_COPY.drawerGain, {
              name: drawer.name,
              points: reveal.drawerPoints,
            })}
          </span>
        </>
      )
    )}
    <span className={CROQUIS_BOARD.itWas}>{CROQUIS_BOARD_COPY.itWas}</span>
    <span className={CROQUIS_BOARD.revealWord}>{reveal.word}</span>
  </div>
)
