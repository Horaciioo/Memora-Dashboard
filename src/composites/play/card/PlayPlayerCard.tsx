'use client'

import type { CSSProperties } from 'react'
import { createPortal } from 'react-dom'

import { PlayCardActions } from '@/composites/play/card/PlayCardActions'
import { PlayCardGames } from '@/composites/play/card/PlayCardGames'
import { PlayCardHead } from '@/composites/play/card/PlayCardHead'
import { PlayCardRecent } from '@/composites/play/card/PlayCardRecent'
import { PlayCardStats } from '@/composites/play/card/PlayCardStats'
import { usePlayCard } from '@/core/hooks/data/play/usePlayCard'
import { useFocusTrap } from '@/core/hooks/interaction/layout/overlay/useFocusTrap'
import { useScrollLock } from '@/core/hooks/interaction/layout/overlay/useScrollLock'
import { usePlayCardStore } from '@/core/store/play/playCard'
import { PLAY_CARD_COPY as COPY, tierOf } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_CARD } from '@/declarations/ui/variants'

/**
 * Card of the player whose portrait was clicked
 * @param {Object} props - Card
 * @param {string} props.accountId - Player
 * @return {JSX.Element | null}
 */

export const PlayPlayerCard = ({ accountId }: { accountId: string }) => {
  const close = usePlayCardStore((state) => state.close)
  const { card, isFailed } = usePlayCard(accountId)
  const trap = useFocusTrap(true, close)
  useScrollLock(true)
  const CloseIcon = ICONS.close

  return createPortal(
    <div
      className={PLAY_CARD.layer}
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && close()}
    >
      <div
        ref={trap}
        role="dialog"
        aria-modal="true"
        aria-label={card?.name ?? COPY.loading}
        className={PLAY_CARD.card}
        style={
          card
            ? ({ '--tier': `var(${tierOf(card.level.level).tier.tone})` } as CSSProperties)
            : undefined
        }
      >
        <button type="button" aria-label={COPY.close} onClick={close} className={PLAY_CARD.close}>
          <CloseIcon className={PLAY_CARD.closeIcon} aria-hidden="true" />
        </button>
        {!card && <p className={PLAY_CARD.empty}>{isFailed ? COPY.failed : COPY.loading}</p>}
        {card && (
          <>
            <PlayCardHead card={card} />
            <PlayCardStats card={card} />
            <PlayCardGames games={card.topGames} />
            <PlayCardRecent games={card.recent} />
            <PlayCardActions card={card} onClose={close} />
          </>
        )}
      </div>
    </div>,
    document.body
  )
}
