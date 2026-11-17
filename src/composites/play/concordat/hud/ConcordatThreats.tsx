'use client'

import { incomingOf, inboundOf } from '@/composites/play/concordat/hud/ConcordatAlerts'
import { playerRgb, rgbText, troopFigure } from '@/core/lib/play/concordat'
import type { ConcordatClientState } from '@/core/lib/play/concordat'
import { useConcordatViewStore } from '@/core/store/play/concordatView'
import { CONCORDAT_ART } from '@/declarations/play/concordat/art'
import { CONCORDAT_HUD_COPY } from '@/declarations/play/concordat/hudCopy'
import { fillPlayMessage } from '@/declarations/play/copy'
import { ICONS } from '@/declarations/ui/icons'
import { CONCORDAT_HUD } from '@/declarations/ui/variants'
import { ConcordatIntents } from '@/utils/constants/concordat'

// Assailants listed at once, the heaviest first
const LISTED = 3

export interface ConcordatThreatsProps {
  client: ConcordatClientState
  names: string[]
  act: (body: Record<string, unknown>) => Promise<boolean>
}

/**
 * Small vertical box glued to the pill: one row per assailant, icon keys only
 * @param {ConcordatThreatsProps} props - Game
 * @return {JSX.Element | null}
 */

export const ConcordatThreats = ({ client, names, act }: ConcordatThreatsProps) => {
  const percent = useConcordatViewStore((state) => state.percent)
  const incoming = incomingOf(client).slice(0, LISTED)
  const inbound = inboundOf(client)
  const DefendIcon = ICONS.shield
  const CounterIcon = ICONS.sword
  const StrikeIcon = ICONS.warning
  if (!incoming.length && !inbound.length) return null

  return (
    <div className={CONCORDAT_HUD.threats} role="alert">
      {inbound.map((strike) => (
        <div
          key={`${strike.owner}-${strike.kind}`}
          className={CONCORDAT_HUD.threat}
          title={fillPlayMessage(CONCORDAT_HUD_COPY.strikeInbound, {
            name: names[strike.owner],
            kind: (CONCORDAT_HUD_COPY as Record<string, string>)[strike.kind] ?? strike.kind,
          })}
        >
          <StrikeIcon className={CONCORDAT_HUD.threatIcon} aria-hidden="true" />
          <span className={CONCORDAT_HUD.threatFigure}>{Math.ceil(strike.left)}s</span>
        </div>
      ))}
      {incoming.map((corps) => (
        <div
          key={corps.owner}
          className={CONCORDAT_HUD.threat}
          title={fillPlayMessage(CONCORDAT_HUD_COPY.underAttack, { name: names[corps.owner] })}
        >
          <span
            className={CONCORDAT_HUD.swatch}
            style={{
              background: rgbText(playerRgb(client.players[corps.owner - 1], CONCORDAT_ART.nation)),
            }}
          />
          <span className={CONCORDAT_HUD.threatFigure}>{troopFigure(corps.troops)}</span>
          <button
            type="button"
            className={CONCORDAT_HUD.threatKey}
            aria-label={CONCORDAT_HUD_COPY.defendHint}
            title={CONCORDAT_HUD_COPY.defendHint}
            onClick={() =>
              void act({ type: ConcordatIntents.Defend, target: corps.owner, percent })
            }
          >
            <DefendIcon className={CONCORDAT_HUD.threatIcon} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={CONCORDAT_HUD.threatKey}
            aria-label={CONCORDAT_HUD_COPY.counterHint}
            title={CONCORDAT_HUD_COPY.counterHint}
            onClick={() =>
              void act({ type: ConcordatIntents.Engage, target: corps.owner, percent })
            }
          >
            <CounterIcon className={CONCORDAT_HUD.threatIcon} aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  )
}
