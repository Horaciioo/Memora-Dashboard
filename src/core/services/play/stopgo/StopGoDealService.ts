import 'server-only'

import type { Prisma } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { after, openingEnd } from '@/core/lib/play/clock'
import {
  buildDeck,
  deal,
  drawFor,
  freshCar,
  secureRandom,
  shuffle,
  stopGoSettingsOf,
} from '@/core/lib/play/stopgo'
import { STOPGO_SETTINGS } from '@/declarations/play/stopgo/settings'
import type { EngineSession, EngineStep } from '@/types/play'
import { StopGoPhases } from '@/utils/constants/play'

/**
 * Open a race: places drawn, deck shuffled, hands dealt, first card drawn
 * @param {EngineSession} session - Game
 * @return {Promise<EngineStep>} - Step with the first deadline
 */

export const openRace = async (session: EngineSession): Promise<EngineStep> => {
  const settings = stopGoSettingsOf(session.settings)
  const order = shuffle(session.players, secureRandom)
  const dealt = deal(
    shuffle(buildDeck(STOPGO_SETTINGS.deck), secureRandom),
    order,
    STOPGO_SETTINGS.handSize
  )

  // The first player draws before the count ends
  const first = drawFor(dealt.pile, [], 0, secureRandom)
  const hands = { ...dealt.hands }
  if (first.card) hands[order[0]] = [...hands[order[0]], first.card]
  const startsAt = openingEnd(new Date(), STOPGO_SETTINGS.countdownSeconds)
  const turnEndsAt = after(startsAt, settings.turnSeconds)
  const car = freshCar()

  await prisma.$transaction([
    prisma.stopGoPlayer.createMany({
      data: order.map((accountId, slot) => ({
        sessionId: session.id,
        accountId,
        slot,
        hand: hands[accountId] as unknown as Prisma.InputJsonValue,
        sealed: [],
        isGreen: car.isGreen,
      })),
    }),
    prisma.stopGoGame.create({
      data: {
        sessionId: session.id,
        phase: StopGoPhases.Playing,
        turnId: order[0],
        turnNo: 1,
        startsAt,
        turnEndsAt,
        drawPile: first.piles.pile as unknown as Prisma.InputJsonValue,
        discard: [],
        reshuffles: 0,
      },
    }),
  ])

  return { changed: true, finished: false, deadline: turnEndsAt }
}
