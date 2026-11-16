'use client'

import type { CSSProperties } from 'react'

import { PlayAvatar } from '@/composites/play/skin/PlayAvatar'
import type { StopGoOpponent } from '@/composites/play/stopgo/cards/types'
import { useStopGoAimStore } from '@/core/store/play/stopgoAim'
import { STOPGO_HAND } from '@/declarations/ui/variants/games/play/stopgo'
import { cn } from '@/utils/classnames'

export interface StopGoRivalRowProps {
  rivals: StopGoOpponent[]
  avatars: Record<string, string | null>
}

/**
 * Phone row of rivals: a touch aims the card in hand
 * @param {StopGoRivalRowProps} props - Rivals
 * @return {JSX.Element}
 */

export const StopGoRivalRow = ({ rivals, avatars }: StopGoRivalRowProps) => {
  const aimable = useStopGoAimStore((state) => state.aimable)
  const picked = useStopGoAimStore((state) => state.picked)
  const tap = useStopGoAimStore((state) => state.tap)

  return (
    <div className={STOPGO_HAND.rivalRow} data-aiming={aimable.length ? '' : undefined}>
      {rivals.map((rival) => {
        const isAimable = aimable.includes(rival.id)

        return (
          <button
            key={rival.id}
            type="button"
            aria-label={rival.name}
            aria-pressed={isAimable ? picked.includes(rival.id) : undefined}
            disabled={!!tap && !isAimable}
            className={cn(
              STOPGO_HAND.rival,
              isAimable && STOPGO_HAND.rivalAim,
              picked.includes(rival.id) && STOPGO_HAND.targetOn
            )}
            style={{ '--car': `var(--stopgo-car-${rival.color})` } as CSSProperties}
            onClick={() => isAimable && tap && tap(rival.id)}
          >
            <PlayAvatar accountId={rival.id} name={rival.name} src={avatars[rival.id]} size="md" />
          </button>
        )
      })}
    </div>
  )
}
