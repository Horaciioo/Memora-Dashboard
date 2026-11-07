import type { NavalCaptainView } from '@/composites/play/naval/captains'
import type { NavalEvent, NavalPlayback } from '@/composites/play/naval/useNavalPlayback'
import type { NavalBoardState } from '@/core/lib/play/naval/state'
import { fillPlayMessage } from '@/declarations/play/copy'
import { NAVAL_BOARD_COPY, NAVAL_SHIP_NAMES } from '@/declarations/play/naval/copy'

/**
 * Sentence of the turn and its tone
 * @param {Object} input - Table
 * @param {NavalBoardState} input.board - Board
 * @param {number} input.match - Match on screen
 * @param {number} input.viewer - Seat of the viewer, minus one when watching
 * @param {NavalCaptainView[]} input.captains - Captains
 * @param {NavalPlayback} input.playback - Playback
 * @return {{ call: string; tone: 'mine' | 'danger' | 'calm' }} - Call
 */

export const callOf = ({
  board,
  match,
  viewer,
  captains,
  playback,
}: {
  board: NavalBoardState
  match: number
  viewer: number
  captains: NavalCaptainView[]
  playback: NavalPlayback
}): { call: string; tone: 'mine' | 'danger' | 'calm' } => {
  const current = board.matches[match]
  const me = captains[viewer]
  if (me?.isOut && !playback.isBusy) return { call: NAVAL_BOARD_COPY.youEliminated, tone: 'danger' }
  if (viewer < 0) return { call: NAVAL_BOARD_COPY.spectating, tone: 'calm' }
  if (!current || !current.fighters.includes(viewer) || current.status !== 'LIVE') {
    return { call: NAVAL_BOARD_COPY.waitingRound, tone: 'calm' }
  }

  // Shell coming for the viewer
  if (playback.playing?.shot.target === viewer) {
    return { call: NAVAL_BOARD_COPY.incoming, tone: 'danger' }
  }
  if (current.turn === viewer) {
    const last = board.shots.filter((shot) => shot[1] === match).at(-1)
    const isAgain = last?.[2] === viewer && last[6] > 0 && board.settings.rules.hitReplay

    return {
      call: isAgain ? NAVAL_BOARD_COPY.yourTurnAgain : NAVAL_BOARD_COPY.yourTurn,
      tone: 'mine',
    }
  }

  return {
    call: fillPlayMessage(NAVAL_BOARD_COPY.theirTurn, { name: captains[current.turn]?.name ?? '' }),
    tone: 'calm',
  }
}

/**
 * Callout for a shot just landed
 * @param {NavalEvent} event - Shot
 * @param {NavalCaptainView[]} captains - Captains
 * @param {number} viewer - Seat of the viewer
 * @return {{ text: string; tone: 'hit' | 'sunk' | 'miss' | 'eliminated' }} - Callout
 */

export const calloutOf = (
  { shot, shipLength, isEliminated }: NavalEvent,
  captains: NavalCaptainView[],
  viewer: number
): { text: string; tone: 'hit' | 'sunk' | 'miss' | 'eliminated' } => {
  if (isEliminated) {
    return {
      text: fillPlayMessage(NAVAL_BOARD_COPY.captainOut, {
        name: captains[shot.target]?.name ?? '',
      }),
      tone: 'eliminated',
    }
  }
  if (shot.code === 2) {
    const ship = NAVAL_SHIP_NAMES[shipLength] ?? NAVAL_BOARD_COPY.wreck
    const template = shot.target === viewer ? NAVAL_BOARD_COPY.youSunk : NAVAL_BOARD_COPY.sunk

    return { text: fillPlayMessage(template, { ship }), tone: 'sunk' }
  }

  return shot.code === 1
    ? { text: NAVAL_BOARD_COPY.hit, tone: 'hit' }
    : { text: NAVAL_BOARD_COPY.miss, tone: 'miss' }
}
