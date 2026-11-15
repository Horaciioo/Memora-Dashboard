'use client'

import { useEffect } from 'react'

import { PlayPodium } from '@/composites/play/results/PlayPodium'
import type { PlayFace } from '@/composites/play/session/BacSessionCrowd'
import { StopGoCardGlyph } from '@/composites/play/stopgo/art/StopGoCardGlyph'
import { StopGoStrip } from '@/composites/play/stopgo/result/StopGoStrip'
import { playStopGoSound } from '@/composites/play/stopgo/sound'
import type { StopGoBoardView } from '@/core/lib/play/stopgo'
import { fillPlayMessage } from '@/declarations/play/copy'
import { STOPGO_CARD_COPY, STOPGO_RESULT_COPY } from '@/declarations/play/stopgo/copy'
import type { StopGoCarColor } from '@/declarations/play/stopgo/art'
import { STOPGO_SETTINGS } from '@/declarations/play/stopgo/settings'
import { STOPGO_RESULT } from '@/declarations/ui/variants/games/play/stopgo'

export interface StopGoResultProps {
  board: StopGoBoardView
  faces: PlayFace[]
}

/**
 * Score line of one player
 * @param {number | null} place - Finishing place
 * @param {number} km - Distance
 * @param {boolean} hasLeft - Gone before the end
 * @return {string} - Words under the name
 */

const noteOf = (place: number | null, km: number, hasLeft: boolean): string => {
  if (hasLeft) return fillPlayMessage(STOPGO_RESULT_COPY.left, { km })
  if (place === 1) return fillPlayMessage(STOPGO_RESULT_COPY.first, { km })

  return fillPlayMessage(STOPGO_RESULT_COPY.place, { place: place ?? '', km })
}

/**
 * Podium of the race, then the final positions and the sealed cards left over
 * @param {StopGoResultProps} props - Finished race
 * @return {JSX.Element}
 */

export const StopGoResult = ({ board, faces }: StopGoResultProps) => {
  useEffect(() => playStopGoSound('finish'), [])

  const colorOf = (slot: number) =>
    STOPGO_SETTINGS.colors[slot % STOPGO_SETTINGS.colors.length] as StopGoCarColor
  const ranked = board.players.toSorted(
    (left, right) =>
      Number(left.hasLeft) - Number(right.hasLeft) ||
      (left.place ?? Infinity) - (right.place ?? Infinity) ||
      right.km - left.km
  )
  const sealed = board.players.flatMap(({ sealedLeft }) => sealedLeft)

  return (
    <div className={STOPGO_RESULT.root}>
      <PlayPodium
        hasWinner={ranked.some(({ place, hasLeft }) => place === 1 && !hasLeft)}
        ranked={ranked.map((player) => {
          const face = faces.find(({ id }) => id === player.accountId)

          return {
            accountId: player.accountId,
            name: face?.name ?? '',
            avatarUrl: face?.avatarUrl ?? null,
            note: noteOf(player.place, player.km, player.hasLeft),
          }
        })}
      />
      <div className={STOPGO_RESULT.under}>
        <span className={STOPGO_RESULT.caption}>{STOPGO_RESULT_COPY.strip}</span>
        <StopGoStrip
          target={board.target}
          cars={ranked.map(({ accountId, km, slot }) => ({
            id: accountId,
            km,
            color: colorOf(slot),
          }))}
        />
        {sealed.length > 0 && (
          <>
            <span className={STOPGO_RESULT.caption}>{STOPGO_RESULT_COPY.sealed}</span>
            <ul className={STOPGO_RESULT.sealedRow}>
              {sealed.map((key, index) => (
                <li key={`${key}-${index}`} className={STOPGO_RESULT.sealed}>
                  <span className={STOPGO_RESULT.sealedGlyph}>
                    <StopGoCardGlyph name={key} />
                  </span>
                  {STOPGO_CARD_COPY[key].name}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
