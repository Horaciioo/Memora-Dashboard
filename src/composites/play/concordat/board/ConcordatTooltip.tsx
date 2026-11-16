'use client'

import type { ConcordatClientState } from '@/core/lib/play/concordat'
import { tieOfRows } from '@/core/lib/play/concordat'
import { CONCORDAT_ART } from '@/declarations/play/concordat/art'
import { fillPlayMessage } from '@/declarations/play/copy'
import { CONCORDAT_HUD_COPY, CONCORDAT_TIE_LABELS } from '@/declarations/play/concordat/hudCopy'
import { CONCORDAT_BOARD } from '@/declarations/ui/variants'

const { tip } = CONCORDAT_ART

export interface ConcordatTooltipProps {
  client: ConcordatClientState
  names: string[]
  tile: number
  holder: number
  x: number
  y: number
  width: number
  height: number
}

/**
 * What lies under the pointer
 * @param {ConcordatTooltipProps} props - Tile and place
 * @return {JSX.Element}
 */

export const ConcordatTooltip = ({
  client,
  names,
  tile,
  holder,
  x,
  y,
  width,
  height,
}: ConcordatTooltipProps) => {
  const province = client.map.provinces[client.map.province[tile] - 1]
  const player = client.players[holder - 1]
  const tie =
    holder && client.me && holder !== client.me
      ? CONCORDAT_TIE_LABELS[tieOfRows(client.systems.ties, client.me, holder)]
      : null

  return (
    <div
      data-hud="concordat"
      className={CONCORDAT_BOARD.tooltip}
      style={{
        left: Math.max(tip.gap, Math.min(width - tip.width - tip.gap, x + tip.gap)),
        top: Math.max(tip.gap, Math.min(height - tip.height - tip.gap, y + tip.gap)),
      }}
    >
      <span className={CONCORDAT_BOARD.tooltipName}>
        {player ? names[holder] : CONCORDAT_HUD_COPY.free}
      </span>
      {player && (
        <span className={CONCORDAT_BOARD.tooltipLine}>
          {player.alive
            ? `${fillPlayMessage(CONCORDAT_HUD_COPY.tooltipTiles, { tiles: player.tiles })} · ${fillPlayMessage(CONCORDAT_HUD_COPY.tooltipTroops, { troops: player.troops })}`
            : CONCORDAT_HUD_COPY.fallen}
        </span>
      )}
      {tie && <span className={CONCORDAT_BOARD.tooltipLine}>{tie}</span>}
      {province && <span className={CONCORDAT_BOARD.tooltipLine}>{province.name}</span>}
    </div>
  )
}
