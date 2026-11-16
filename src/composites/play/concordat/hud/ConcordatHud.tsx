'use client'

import { useMemo } from 'react'

import { ConcordatPanels } from '@/composites/play/concordat/hud/ConcordatPanels'
import { ConcordatMeter } from '@/composites/play/concordat/hud/ConcordatMeter'
import { ConcordatZones } from '@/composites/play/concordat/hud/ConcordatZones'
import { ConcordatPill } from '@/composites/play/concordat/hud/ConcordatPill'
import { ConcordatNotices } from '@/composites/play/concordat/hud/ConcordatNotices'
import { PlayHud } from '@/composites/play/hud/PlayHud'
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

  const blocks = [{ key: 'clock', caption: CONCORDAT_HUD_COPY.time, figure: clockText(seconds) }]
  const figures = me
    ? [
        {
          key: 'tiles',
          caption: CONCORDAT_HUD_COPY.tiles,
          figure: fillPlayMessage(CONCORDAT_HUD_COPY.engageValue, {
            percent: landShareText(me.tiles, land),
          }),
        },
        { key: 'troops', caption: CONCORDAT_HUD_COPY.troops, figure: troopFigure(me.troops) },
        { key: 'gold', caption: CONCORDAT_HUD_COPY.gold, figure: compactFigure(me.gold) },
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
    >
      <ConcordatNotices client={client} isSeated={isSeated} />
      <ConcordatMeter client={client} />
      <ConcordatZones client={client} />
      <ConcordatPanels client={client} names={names} land={land} />
      {isPlaying && (
        <div className={CONCORDAT_HUD.dock}>
          <ConcordatPill figures={figures} client={client} names={names} act={act} />
        </div>
      )}
    </PlayHud>
  )
}
