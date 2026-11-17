'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { ConcordatFronts } from '@/composites/play/concordat/hud/ConcordatFronts'
import { ConcordatAlerts } from '@/composites/play/concordat/hud/ConcordatAlerts'
import { ConcordatThreats } from '@/composites/play/concordat/hud/ConcordatThreats'
import { ConcordatPanels } from '@/composites/play/concordat/hud/ConcordatPanels'
import { ConcordatMeter } from '@/composites/play/concordat/hud/ConcordatMeter'
import { ConcordatZones } from '@/composites/play/concordat/hud/ConcordatZones'
import { ConcordatPill } from '@/composites/play/concordat/hud/ConcordatPill'
import { ConcordatNotices } from '@/composites/play/concordat/hud/ConcordatNotices'
import { PlayHud } from '@/composites/play/hud/PlayHud'
import { useIsMobileShell } from '@/core/hooks/interaction/layout/measure/useBreakpoint'
import type { ConcordatClientState } from '@/core/lib/play/concordat'
import {
  clockText,
  featuredPlayers,
  compactFigure,
  troopFigure,
  landShareText,
  landTilesOf,
} from '@/core/lib/play/concordat'
import { fillPlayMessage } from '@/declarations/play/copy'
import { CONCORDAT_TICKS_PER_SECOND } from '@/declarations/play/concordat/rules'
import { CONCORDAT_HUD_COPY } from '@/declarations/play/concordat/hudCopy'
import { CONCORDAT_HUD } from '@/declarations/ui/variants'
import { ConcordatPhases, ConcordatTerrains } from '@/utils/constants/concordat'
import { PlayGames } from '@/utils/constants/play'

// Smallest jump shown as a gain, and how long it stays
const GAIN_FLOOR = 800
const GAIN_MS = 2000

// Nations listed in the ranking, tribes never
const SCOREBOARD_SIZE = 12

export interface ConcordatHudProps {
  sessionId: string
  client: ConcordatClientState
  names: string[]
  act: (body: Record<string, unknown>) => Promise<boolean>
  isSeated: boolean
}

/**
 * Concordat HUD: clock on top, one pill below, ranking on demand
 * @param {ConcordatHudProps} props - Game
 * @return {JSX.Element}
 */

export const ConcordatHud = ({ sessionId, client, names, act, isSeated }: ConcordatHudProps) => {
  const isMobile = useIsMobileShell()
  const me = client.players[client.me - 1]
  const land = useMemo(
    () => landTilesOf(client.map.terrain, ConcordatTerrains.Sea),
    [client.map.terrain]
  )
  const isPicking = client.phase === ConcordatPhases.Picking
  // No time limit, the clock counts up from the start
  const isCountingUp = !isPicking && client.endTick === 0
  const lastTick = isPicking ? client.pickEnd : client.endTick
  const seconds =
    (isCountingUp ? client.tick - client.pickEnd : lastTick - client.tick) /
    CONCORDAT_TICKS_PER_SECOND

  // No clock on a phone, the keys alone sit flush right
  const blocks = isMobile
    ? []
    : [{ key: 'clock', caption: CONCORDAT_HUD_COPY.time, figure: clockText(seconds) }]
  const economy = client.systems.figures[client.me - 1]

  // A jump of gold well above the income, spoils or a gift, pops for two seconds
  const [gain, setGain] = useState(0)
  const gold = me?.gold ?? 0
  const income = economy?.income ?? 0
  const lastGold = useRef(gold)
  const gainTimer = useRef(0)
  useEffect(() => {
    const delta = gold - lastGold.current
    lastGold.current = gold
    const expected = (Math.max(0, income) / 600) * client.speed
    if (delta <= expected * 4 + GAIN_FLOOR) return

    setGain((current) => current + delta)
    window.clearTimeout(gainTimer.current)
    gainTimer.current = window.setTimeout(() => setGain(0), GAIN_MS)
  }, [gold, income, client.speed])
  useEffect(() => () => window.clearTimeout(gainTimer.current), [])
  const figures = me
    ? [
        {
          key: 'tiles',
          caption: CONCORDAT_HUD_COPY.tiles,
          figure: fillPlayMessage(CONCORDAT_HUD_COPY.engageValue, {
            percent: landShareText(me.tiles, land),
          }),
        },
        {
          key: 'troops',
          caption: CONCORDAT_HUD_COPY.troops,
          figure: economy
            ? fillPlayMessage(CONCORDAT_HUD_COPY.troopsOf, {
                troops: troopFigure(me.troops),
                max: troopFigure(economy.maxTroops),
              })
            : troopFigure(me.troops),
        },
        {
          key: 'gold',
          caption: CONCORDAT_HUD_COPY.gold,
          figure: (
            <>
              {compactFigure(me.gold)}
              {economy && (
                <span className={CONCORDAT_HUD.statRate}>
                  {' '}
                  {fillPlayMessage(CONCORDAT_HUD_COPY.goldRate, {
                    rate: `${economy.income < 0 ? '-' : '+'}${compactFigure(Math.abs(economy.income))}`,
                  })}
                </span>
              )}
              {gain > 0 && (
                <span key={gain} className={CONCORDAT_HUD.gain}>
                  +{compactFigure(gain)}
                </span>
              )}
            </>
          ),
        },
      ]
    : []
  const rows = featuredPlayers(client.players, SCOREBOARD_SIZE).map((player) => ({
    accountId: player.accountId ?? `nation-${player.id}`,
    name: names[player.id],
    avatarUrl: null,
    value: player.alive
      ? fillPlayMessage(CONCORDAT_HUD_COPY.engageValue, {
          percent: landShareText(player.tiles, land),
        })
      : CONCORDAT_HUD_COPY.fallen,
    isMine: player.id === client.me,
    isGone: !player.alive,
  }))
  const isPlaying = isSeated && !!me?.alive && client.phase === ConcordatPhases.Playing

  return (
    <PlayHud
      game={PlayGames.Concordat}
      sessionId={sessionId}
      isSeated={isSeated}
      blocks={blocks}
      rows={rows}
      hasStrip={false}
      isCompact
      isFlush={isMobile}
    >
      <ConcordatNotices client={client} isSeated={isSeated} />
      {isPlaying && <ConcordatAlerts client={client} act={act} />}
      <ConcordatMeter client={client} />
      <ConcordatZones client={client} names={names} />
      <ConcordatPanels client={client} names={names} land={land} />
      {isPlaying && (
        <div className={CONCORDAT_HUD.dock}>
          <ConcordatFronts client={client} names={names} act={act} />
          <ConcordatThreats client={client} names={names} act={act} />
          <ConcordatPill figures={figures} client={client} names={names} act={act} />
        </div>
      )}
    </PlayHud>
  )
}
