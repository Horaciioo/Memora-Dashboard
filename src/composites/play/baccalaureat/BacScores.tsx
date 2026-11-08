import type { CSSProperties } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { rankPlayers } from '@/composites/play/baccalaureat/types'
import type { BacBoardView, BacPlayer } from '@/composites/play/baccalaureat/types'
import { BAC_BOARD_COPY, fillPlayMessage } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { BAC_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface BacScoresProps {
  history: BacBoardView['history']
  players: BacPlayer[]
  // Round just counted
  roundIndex: number
}

/**
 * Reward moment: the round winner, then every total with what each just earned
 * @param {BacScoresProps} props - Scores
 * @return {JSX.Element}
 */

export const BacScores = ({ history, players, roundIndex }: BacScoresProps) => {
  const CrownIcon = ICONS.playCrown
  const gains = history.find((entry) => entry.index === roundIndex)?.points ?? {}
  const ranked = rankPlayers(history, players)
  const topTotal = Math.max(1, ...ranked.map((player) => player.points))
  const best = Math.max(0, ...Object.values(gains))
  const winners = best > 0 ? players.filter((player) => gains[player.accountId] === best) : []

  return (
    <div className={BAC_BOARD.scores}>
      <div className={BAC_BOARD.hero}>
        {winners.length > 0 ? (
          <>
            <div className={BAC_BOARD.heroFace}>
              <CrownIcon className={BAC_BOARD.heroCrown} aria-hidden="true" />
              <Avatar name={winners[0].name} src={winners[0].avatarUrl} size="lg" />
            </div>
            <span className={BAC_BOARD.heroTitle}>
              {fillPlayMessage(BAC_BOARD_COPY.roundWinner, {
                names: winners.map((player) => player.name).join(' et '),
              })}{' '}
              <span className={BAC_BOARD.heroPoints}>
                {fillPlayMessage(BAC_BOARD_COPY.roundPoints, { points: best })}
              </span>
            </span>
          </>
        ) : (
          <span className={BAC_BOARD.heroTitle}>{BAC_BOARD_COPY.roundNoWinner}</span>
        )}
      </div>
      <ol className={BAC_BOARD.scoreList}>
        {ranked.map((player, index) => {
          const gain = gains[player.accountId] ?? 0

          return (
            <li
              key={player.accountId}
              className={cn(
                BAC_BOARD.scoreRow,
                BAC_BOARD.scoreRowMedals[index] ?? BAC_BOARD.scoreRowPlain
              )}
              style={{ '--row': index } as CSSProperties}
            >
              <span
                className={cn(
                  BAC_BOARD.scoreBar,
                  index < 3 ? BAC_BOARD.scoreBarMedal : BAC_BOARD.scoreBarPlain
                )}
                aria-hidden="true"
                style={
                  {
                    scale: `${player.points / topTotal} 1`,
                    '--bar-from': (player.points - gain) / topTotal,
                  } as CSSProperties
                }
              />
              <span className={BAC_BOARD.scoreRank}>{index + 1}</span>
              <Avatar name={player.name} src={player.avatarUrl} size="sm" />
              <span className={BAC_BOARD.scoreName}>{player.name}</span>
              <span className={BAC_BOARD.scoreSum}>
                {gain > 0 && (
                  <span className={BAC_BOARD.scoreGain}>
                    {fillPlayMessage(BAC_BOARD_COPY.gain, { points: gain })}
                  </span>
                )}
                <span
                  className={cn(BAC_BOARD.scoreDivider, gain === 0 && 'invisible')}
                  aria-hidden="true"
                />
                <span className={BAC_BOARD.scoreTotal}>{player.points}</span>
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
