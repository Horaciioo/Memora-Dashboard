'use client'

import { ConcordatGlyph } from '@/composites/play/concordat/hud/ConcordatGlyph'
import {
  clockText,
  compactFigure,
  troopFigure,
  landShareText,
  landTilesOf,
  playerRgb,
  rgbText,
  tieOfRows,
} from '@/core/lib/play/concordat'
import type { ConcordatClientState } from '@/core/lib/play/concordat'
import { CONCORDAT_ART } from '@/declarations/play/concordat/art'
import { ConcordatCoin } from '@/composites/play/concordat/hud/ConcordatCoin'
import { CONCORDAT_STAT_GLYPHS } from '@/declarations/play/concordat/glyphs'
import {
  CONCORDAT_BUILDING_TITLES,
  CONCORDAT_HOVER_COPY,
  CONCORDAT_HUD_COPY,
  CONCORDAT_TIE_LABELS,
} from '@/declarations/play/concordat/hudCopy'
import { CONCORDAT_TICKS_PER_SECOND } from '@/declarations/play/concordat/rules'
import { fillPlayMessage } from '@/declarations/play/copy'
import { CONCORDAT_HOVER } from '@/declarations/ui/variants'
import { ConcordatPowers, ConcordatShipKinds, ConcordatTerrains } from '@/utils/constants/concordat'

// Counted buildings, always shown even at zero
const CONCORDAT_HOVER_BUILDINGS = ['market', 'barracks', 'port', 'silo', 'sam'] as const

export interface ConcordatHoverCardProps {
  client: ConcordatClientState
  names: string[]
  tile: number
  holder: number
}

/**
 * Nation under the pointer, pinned at the top of the screen: gold, troops against the ceiling,
 * the troops it is sending, how it stands with me and what it has built
 * @param {ConcordatHoverCardProps} props - Tile and holder
 * @return {JSX.Element | null}
 */

export const ConcordatHoverCard = ({ client, names, tile, holder }: ConcordatHoverCardProps) => {
  const province = client.map.provinces[client.map.province[tile] - 1]
  const player = client.players[holder - 1]
  if (!player) {
    return province ? (
      <div className={CONCORDAT_HOVER.card} data-hud="concordat">
        <span className={CONCORDAT_HOVER.name}>{CONCORDAT_HUD_COPY.free}</span>
        <span className={CONCORDAT_HOVER.faint}>{province.name}</span>
      </div>
    ) : null
  }

  const figure = client.systems.figures[holder - 1]
  const max = Math.max(1, figure?.maxTroops ?? player.troops)
  const sending = client.corps
    .filter((corps) => corps.owner === holder)
    .reduce((sum, corps) => sum + corps.troops, 0)
  const fill = Math.min(100, (player.troops / max) * 100)
  const push = Math.min(100 - fill, (sending / max) * 100)
  const rgb = playerRgb(player, CONCORDAT_ART.nation)
  const land = landTilesOf(client.map.terrain, ConcordatTerrains.Sea)

  const isOther = Boolean(client.me) && holder !== client.me
  const tie = isOther ? tieOfRows(client.systems.ties, client.me, holder) : null
  const tieRow = isOther
    ? client.systems.ties.find(
        (row) =>
          row.a === Math.min(client.me, holder) &&
          row.b === Math.max(client.me, holder) &&
          row.until > client.tick
      )
    : null

  const badges = [
    ...CONCORDAT_HOVER_BUILDINGS.map((kind) => ({
      key: kind,
      title: CONCORDAT_BUILDING_TITLES[kind],
      count: client.systems.buildings.filter(
        (building) => building.owner === holder && building.kind === kind
      ).length,
      glyph: kind,
    })),
    {
      key: 'ships',
      title: CONCORDAT_HOVER_COPY.ships,
      count: client.ships.filter(
        (ship) => ship.owner === holder && ship.kind === ConcordatShipKinds.War
      ).length,
      glyph: 'fighter' as const,
    },
  ]

  const kindLabel =
    player.kind === ConcordatPowers.Human
      ? CONCORDAT_HOVER_COPY.human
      : player.kind === ConcordatPowers.Tribe
        ? CONCORDAT_HOVER_COPY.tribe
        : CONCORDAT_HOVER_COPY.country

  return (
    <div className={CONCORDAT_HOVER.card} data-hud="concordat">
      <span className={CONCORDAT_HOVER.gold}>
        <ConcordatCoin />
        {compactFigure(player.gold)}
      </span>
      <div
        className={CONCORDAT_HOVER.bar}
        role="img"
        aria-label={fillPlayMessage(CONCORDAT_HOVER_COPY.troopsOf, {
          troops: troopFigure(player.troops),
          max: troopFigure(max),
        })}
      >
        <span className={CONCORDAT_HOVER.barFill} style={{ width: `${fill}%` }} />
        <span className={CONCORDAT_HOVER.barPush} style={{ left: `${fill}%`, width: `${push}%` }} />
        <span className={CONCORDAT_HOVER.barText}>
          <svg width={13} height={13} viewBox="0 0 24 24" aria-hidden="true">
            <path d={CONCORDAT_STAT_GLYPHS.troops} fill="currentColor" fillRule="evenodd" />
          </svg>
          {troopFigure(player.troops)} / {troopFigure(max)}
        </span>
      </div>
      <span className={CONCORDAT_HOVER.sending} title={CONCORDAT_HOVER_COPY.sending}>
        ↑ {troopFigure(sending)}
      </span>
      <div className={CONCORDAT_HOVER.right}>
        <span className={CONCORDAT_HOVER.nameRow}>
          <span className={CONCORDAT_HOVER.swatch} style={{ background: rgbText(rgb) }} />
          <span className={CONCORDAT_HOVER.name}>{names[holder]}</span>
          <span className={CONCORDAT_HOVER.faint}>
            {player.alive ? kindLabel : CONCORDAT_HUD_COPY.fallen}
          </span>
        </span>
        <span className={CONCORDAT_HOVER.faint}>
          {fillPlayMessage(CONCORDAT_HUD_COPY.engageValue, {
            percent: landShareText(player.tiles, land),
          })}
          {province ? ` · ${province.name}` : ''}
          {(client.systems.traitors[holder - 1] ?? 0) > client.tick &&
            ` · ${CONCORDAT_HOVER_COPY.traitor}`}
          {isOther &&
            client.systems.embargoes.some(
              (ban) =>
                (ban.until === 0 || ban.until > client.tick) &&
                ((ban.from === client.me && ban.to === holder) ||
                  (ban.from === holder && ban.to === client.me))
            ) &&
            ` · ${CONCORDAT_HOVER_COPY.embargo}`}
          {tie && (
            <>
              {' · '}
              {CONCORDAT_TIE_LABELS[tie]}
              {tieRow
                ? ` · ${clockText((tieRow.until - client.tick) / CONCORDAT_TICKS_PER_SECOND)}`
                : ''}
            </>
          )}
        </span>
      </div>
      <span className={CONCORDAT_HOVER.badges}>
        {badges.map((badge) => (
          <span key={badge.key} className={CONCORDAT_HOVER.badge} title={badge.title}>
            <ConcordatGlyph kind={badge.glyph} size={16} />
            {badge.count}
          </span>
        ))}
      </span>
    </div>
  )
}
