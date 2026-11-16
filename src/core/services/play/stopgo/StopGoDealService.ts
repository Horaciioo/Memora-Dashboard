import 'server-only'

import type { Prisma } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { after, openingEnd } from '@/core/lib/play/clock'
import {
  buildDeck,
  deal,
  freshCar,
  secureRandom,
  shuffle,
  deckOf,
  stopGoSettingsOf,
} from '@/core/lib/play/stopgo'
import { STOPGO_SETTINGS } from '@/declarations/play/stopgo/settings'
import type { EngineSession, EngineStep } from '@/types/play'
import { StopGoPhases } from '@/utils/constants/play'

/**
 * Open a race: places drawn, deck shuffled, hands dealt
 * @param {EngineSession} session - Game
 * @return {Promise<EngineStep>} - Step with the first deadline
 */

export const openRace = async (session: EngineSession): Promise<EngineStep> => {
  const settings = stopGoSettingsOf(session.settings)
  const order = shuffle(session.players, secureRandom)
  const dealt = deal(
    shuffle(buildDeck(deckOf(settings.safeties)), secureRandom),
    order,
    STOPGO_SETTINGS.handSize
  )

  const hands = dealt.hands
  const startsAt = openingEnd(new Date(), STOPGO_SETTINGS.countdownSeconds)
  // The first player's clock waits for the opening deal animation
  const dealMs =
    STOPGO_SETTINGS.handSize * STOPGO_SETTINGS.dealGapMs +
    STOPGO_SETTINGS.revealMs +
    STOPGO_SETTINGS.drawMs
  const turnEndsAt = after(startsAt, settings.turnSeconds + Math.ceil(dealMs / 1000))
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
        drawPile: dealt.pile as unknown as Prisma.InputJsonValue,
        discard: [],
        reshuffles: 0,
      },
    }),
  ])

  return { changed: true, finished: false, deadline: turnEndsAt }
}
