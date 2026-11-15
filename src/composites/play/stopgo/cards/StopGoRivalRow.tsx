'use client'

import { useState } from 'react'
import type { CSSProperties } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { StopGoCarState } from '@/composites/play/stopgo/cards/StopGoCarState'
import type { StopGoOpponent } from '@/composites/play/stopgo/cards/types'
import type { StopGoBoardView } from '@/core/lib/play/stopgo'
import { useStopGoAimStore } from '@/core/store/play/stopgoAim'
import { STOPGO_HAND } from '@/declarations/ui/variants/games/play/stopgo'
import { cn } from '@/utils/classnames'

type Player = StopGoBoardView['players'][number]

export interface StopGoRivalRowProps {
  players: Player[]
  rivals: StopGoOpponent[]
  avatars: Record<string, string | null>
}

/**
 * Phone row of rivals: a touch aims the card in hand, else opens the sheet of that rival
 * @param {StopGoRivalRowProps} props - Rivals
 * @return {JSX.Element}
 */

export const StopGoRivalRow = ({ players, rivals, avatars }: StopGoRivalRowProps) => {
  const [openId, setOpenId] = useState<string | null>(null)
  const aimable = useStopGoAimStore((state) => state.aimable)
  const picked = useStopGoAimStore((state) => state.picked)
  const tap = useStopGoAimStore((state) => state.tap)
  const open = players.find(({ accountId }) => accountId === openId)

  return (
    <div className={STOPGO_HAND.rivalRow}>
      {open && !tap && (
        <div className={STOPGO_HAND.fiche}>
          <StopGoCarState
            player={open}
            name={rivals.find(({ id }) => id === open.accountId)?.name ?? ''}
          />
        </div>
      )}
      {rivals.map((rival) => {
        const isAimable = aimable.includes(rival.id)

        return (
          <button
            key={rival.id}
            type="button"
            aria-label={rival.name}
            aria-pressed={isAimable ? picked.includes(rival.id) : openId === rival.id}
            disabled={!!tap && !isAimable}
            className={cn(
              STOPGO_HAND.rival,
              isAimable && STOPGO_HAND.rivalAim,
              picked.includes(rival.id) && STOPGO_HAND.targetOn
            )}
            style={{ '--car': `var(--stopgo-car-${rival.color})` } as CSSProperties}
            onClick={() =>
              isAimable && tap ? tap(rival.id) : setOpenId(openId === rival.id ? null : rival.id)
            }
          >
            <Avatar name={rival.name} src={avatars[rival.id]} size="md" />
          </button>
        )
      })}
    </div>
  )
}
