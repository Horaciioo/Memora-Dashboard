import { playLudoSound, playLudoTake } from '@/composites/play/ludo/sound'
import { ghostsOf, HIDDEN_STEP, readGhostTag } from '@/core/lib/play/ludo'
import type { LudoBoardState, LudoGhostView, LudoLineView } from '@/core/lib/play/ludo'
import { LUDO_BONUSES, LUDO_CHAOS, LUDO_STORM_TAG } from '@/declarations/play/ludo/chaos'
import type { LudoEffectName } from '@/declarations/play/ludo/chaos'
import { LUDO_SETTINGS } from '@/declarations/play/ludo/settings'
import { LUDO_MIX } from '@/declarations/play/ludo/sounds'

/**
 * Chaos effect told over the board
 * @typedef {Object} LudoCue
 */

export interface LudoCue {
  key: number
  // Effect, or the joker shielding a malus
  effect: LudoEffectName
  kind: 'bonus' | 'malus' | 'joker' | 'end'
  accountId: string
  pawn: number | null
  to: number | null
}

/**
 * Duel of dice on screen
 * @typedef {Object} LudoDuelState
 */

export interface LudoDuelState {
  key: number
  rolls: { accountId: string; dice: number }[]
  winnerId: string | null
  isDraw: boolean
  // A storm of dice: nobody wins, everyone just throws
  isStorm: boolean
}

/**
 * Chaos part of the board on screen
 * @typedef {Object} LudoChaosMotion
 */

export interface LudoChaosMotion {
  dice2: number | null
  isRolling2: boolean
  // Die kept of a double throw
  kept: 0 | 1 | null
  // Colour each player is drawn in
  looks: Record<string, number>
  ghosts: Record<string, LudoGhostView>
  // Decoy vanishing, pawn pushed back
  fading: { accountId: string; pawn: number } | null
  rewind: { accountId: string; pawn: number } | null
  cue: LudoCue | null
  duel: LudoDuelState | null
  // Player losing a turn
  stalled: string | null
}

/**
 * Chaos part of a board read
 * @param {LudoBoardState} board - Board
 * @return {LudoChaosMotion} - Idle chaos
 */

export const chaosIdle = (board: LudoBoardState): LudoChaosMotion => ({
  dice2: null,
  isRolling2: false,
  kept: null,
  looks: board.looks,
  ghosts: ghostsOf(board.players),
  fading: null,
  rewind: null,
  cue: null,
  duel: null,
  stalled: null,
})

/**
 * Wait a moment
 * @param {number} ms - Delay
 * @return {Promise<void>} - Done
 */

const wait = (ms: number): Promise<void> => new Promise((done) => window.setTimeout(done, ms))

type Setter = (update: (current: LudoChaosMotion) => LudoChaosMotion) => void
type Placer = (accountId: string, pawn: number, step: number) => void

interface ChaosPlay {
  line: LudoLineView
  next: LudoLineView | undefined
  board: LudoBoardState
  place: Placer
  set: Setter
}

// Chaos kinds each handled by one beat
const BEATS: Record<string, (play: ChaosPlay) => Promise<void>> = {
  EFFECT: async ({ line, board, set }) => {
    const effect = line.effect as LudoEffectName
    const kind = (LUDO_BONUSES as readonly string[]).includes(effect) ? 'bonus' : 'malus'
    set((current) => ({
      ...current,
      cue: { key: line.rev, effect, kind, accountId: line.accountId, pawn: line.pawn, to: line.to },
    }))
    playLudoSound(kind === 'bonus' ? 'star' : 'penalty')

    // The colours turn while the card is up
    if (effect === 'chameleon') {
      await wait(LUDO_CHAOS.effectMs * 0.35)
      set((current) => ({ ...current, looks: board.looks }))
      await wait(LUDO_CHAOS.effectMs * 0.65)
    } else await wait(LUDO_CHAOS.effectMs)
    set((current) => ({ ...current, cue: null }))
  },
  OFFER: () => wait(LUDO_SETTINGS.stepMs),
  JOKER: async ({ line, set }) => {
    set((current) => ({
      ...current,
      cue: {
        key: line.rev,
        effect: line.effect as LudoEffectName,
        kind: 'joker',
        accountId: line.accountId,
        pawn: line.pawn,
        to: line.to,
      },
    }))
    playLudoSound('home')
    await wait(LUDO_CHAOS.effectMs)
    set((current) => ({ ...current, cue: null }))
  },
  DOUBLE: async ({ line, set }) => {
    set((current) => ({ ...current, dice2: line.dice, isRolling2: true }))
    playLudoTake('roll', LUDO_MIX.roll)
    await wait(LUDO_SETTINGS.rollMs)
    set((current) => ({ ...current, isRolling2: false }))
  },
  PICK: async ({ line, set }) => {
    set((current) => ({ ...current, kept: line.value === 1 ? 1 : 0 }))
    await wait(LUDO_SETTINGS.stepMs * 3)
  },
  SPLIT: async ({ line, place, set }) => {
    const tag = readGhostTag(line.effect)
    if (!tag || line.pawn === null || line.from === null || line.to === null) return
    const { pawn: jumper, from, to, value: stayer, dice: real } = line
    const stay = stayer ?? 0
    place(line.accountId, stay, from)
    place(line.accountId, jumper, from)

    // The real pawn's own slot is blanked for the others
    if (real !== null && real !== jumper && real !== stay) place(line.accountId, real, HIDDEN_STEP)
    set((current) => ({
      ...current,
      ghosts: {
        ...current.ghosts,
        [line.accountId]: {
          pair: [jumper, stay],
          real: current.ghosts[line.accountId]?.real ?? null,
        },
      },
    }))
    playLudoSound('exit')
    await wait(LUDO_SETTINGS.stepMs * 3)
    for (let step = from + 1; step <= to; step += 1) {
      place(line.accountId, jumper, step)
      await wait(LUDO_SETTINGS.stepMs)
    }
  },
  FADE: async ({ line, place, set }) => {
    if (line.pawn === null) return
    const target = { accountId: line.accountId, pawn: line.pawn }
    set((current) => ({ ...current, fading: target }))
    await wait(LUDO_SETTINGS.stepMs * 3)
    place(target.accountId, target.pawn, HIDDEN_STEP)
    set((current) => {
      const ghosts = Object.fromEntries(
        Object.entries(current.ghosts).filter(([accountId]) => accountId !== line.accountId)
      )

      return { ...current, fading: null, ghosts }
    })
  },
  EXPIRE: async ({ line, board, set }) => {
    const effect = line.effect as LudoEffectName
    set((current) => ({
      ...current,
      looks: effect === 'chameleon' ? board.looks : current.looks,
      cue: { key: line.rev, effect, kind: 'end', accountId: line.accountId, pawn: null, to: null },
    }))
    await wait(LUDO_CHAOS.effectMs * 0.7)
    set((current) => ({ ...current, cue: null }))
  },
  DUEL: async ({ line, next, set }) => {
    const roll = { accountId: line.accountId, dice: line.dice ?? 1 }
    set((current) => {
      const rolls = [...(current.duel?.rolls ?? []), roll]

      return {
        ...current,
        duel: {
          key: current.duel?.key ?? line.rev,
          rolls,
          winnerId: null,
          isDraw: false,
          isStorm: line.effect === LUDO_STORM_TAG,
        },
      }
    })
    playLudoTake('roll', LUDO_MIX.roll)
    await wait(LUDO_CHAOS.duelMs)
    // A storm crowns nobody, it clears once the last die has shown
    if (line.effect === LUDO_STORM_TAG) {
      if (line.value === 1) {
        await wait(LUDO_CHAOS.duelMs)
        set((current) => ({ ...current, duel: null }))
      }
      return
    }
    // Throws come one by one: only the last one crowns (older lines carry no flag)
    if (line.value === 0 || (line.value === undefined && next?.kind === 'DUEL')) return

    // Last roll in: the best one is crowned
    set((current) => {
      const rolls = current.duel?.rolls ?? []
      const best = Math.max(...rolls.map((entry) => entry.dice))
      const winners = rolls.filter((entry) => entry.dice === best)

      return current.duel
        ? {
            ...current,
            duel: {
              ...current.duel,
              winnerId: winners.length === 1 ? winners[0].accountId : null,
              isDraw: winners.length !== 1,
            },
          }
        : current
    })
    playLudoSound('six')
    await wait(LUDO_CHAOS.duelMs)
    if (next?.kind !== 'RECOIL') set((current) => ({ ...current, duel: null }))
  },
  RECOIL: async ({ line, place, set }) => {
    if (line.pawn === null || line.from === null || line.to === null) return
    const target = { accountId: line.accountId, pawn: line.pawn }
    set((current) => ({ ...current, rewind: target, duel: null }))
    playLudoSound('eaten')
    for (let step = line.from - 1; step >= line.to; step -= 1) {
      place(target.accountId, target.pawn, step)
      await wait(LUDO_SETTINGS.stepMs * 0.8)
    }
    await wait(LUDO_SETTINGS.stepMs)
    set((current) => ({ ...current, rewind: null }))
  },
  STALL: async ({ line, set }) => {
    set((current) => ({ ...current, stalled: line.accountId }))
    playLudoSound('blocked')
    await wait(LUDO_CHAOS.effectMs * 0.8)
    set((current) => ({ ...current, stalled: null }))
  },
}

/**
 * Play a chaos line, false when the line is not one
 * @param {ChaosPlay} play - Line and screen
 * @return {Promise<boolean>} - Handled
 */

export const playChaosLine = async (play: ChaosPlay): Promise<boolean> => {
  const beat = BEATS[play.line.kind]
  if (!beat) return false
  await beat(play)

  return true
}
