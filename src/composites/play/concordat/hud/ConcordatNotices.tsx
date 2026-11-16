'use client'

import type { ConcordatClientState } from '@/core/lib/play/concordat'
import { useConcordatViewStore } from '@/core/store/play/concordatView'
import { CONCORDAT_BUILDING_LABELS } from '@/declarations/play/concordat/hudCopy'
import { fillPlayMessage } from '@/declarations/play/copy'
import { CONCORDAT_HUD_COPY, CONCORDAT_OFFER_LABELS } from '@/declarations/play/concordat/hudCopy'
import { CONCORDAT_HUD } from '@/declarations/ui/variants'
import { ConcordatIntents, ConcordatPhases } from '@/utils/constants/concordat'
import type { ConcordatOfferKind } from '@/utils/constants/concordat'

export interface ConcordatNoticesProps {
  client: ConcordatClientState
  names: string[]
  isSeated: boolean
  act: (body: Record<string, unknown>) => Promise<boolean>
}

/**
 * Under the info card: how to pick a start, who attacks me, offers waiting
 * @param {ConcordatNoticesProps} props - Game
 * @return {JSX.Element}
 */

export const ConcordatNotices = ({ client, names, isSeated, act }: ConcordatNoticesProps) => {
  const attackers = [
    ...new Set(
      client.corps.filter((corps) => corps.target === client.me).map((corps) => corps.owner)
    ),
  ]
  const isPicking = client.phase === ConcordatPhases.Picking
  const tool = useConcordatViewStore((state) => state.tool)
  const setTool = useConcordatViewStore((state) => state.setTool)

  return (
    <div className={CONCORDAT_HUD.notice}>
      {isPicking && (
        <div className={CONCORDAT_HUD.pick}>
          <span className={CONCORDAT_HUD.pickTitle}>{CONCORDAT_HUD_COPY.pickTitle}</span>
          <span className={CONCORDAT_HUD.pickHint}>
            {isSeated ? CONCORDAT_HUD_COPY.pickHint : CONCORDAT_HUD_COPY.pickSpectator}
          </span>
        </div>
      )}
      {tool && !isPicking && (
        <div className={CONCORDAT_HUD.toolBar} role="status">
          <span>
            {tool.kind === 'build'
              ? fillPlayMessage(CONCORDAT_HUD_COPY.toolBuild, {
                  name: CONCORDAT_BUILDING_LABELS[tool.building],
                })
              : fillPlayMessage(CONCORDAT_HUD_COPY.toolLaunch, {
                  name: tool.isHeavy ? CONCORDAT_HUD_COPY.heavy : CONCORDAT_HUD_COPY.missile,
                })}
          </span>
          <button type="button" className={CONCORDAT_HUD.retreat} onClick={() => setTool(null)}>
            {CONCORDAT_HUD_COPY.cancel}
          </button>
        </div>
      )}
      {attackers.map((id) => (
        <div key={id} className={CONCORDAT_HUD.threat} role="alert">
          {fillPlayMessage(CONCORDAT_HUD_COPY.threat, { name: names[id] })}
        </div>
      ))}
      {client.offers.length > 0 && (
        <div className={CONCORDAT_HUD.offers}>
          {client.offers.map((offer) => (
            <div key={offer.id} className={CONCORDAT_HUD.offer}>
              <span className={CONCORDAT_HUD.offerText}>
                {names[offer.from]} {CONCORDAT_OFFER_LABELS[offer.kind as ConcordatOfferKind]}
              </span>
              <button
                type="button"
                className={CONCORDAT_HUD.accept}
                onClick={() => void act({ type: ConcordatIntents.Accept, offer: offer.id })}
              >
                {CONCORDAT_HUD_COPY.accept}
              </button>
              <button
                type="button"
                className={CONCORDAT_HUD.refuse}
                onClick={() => void act({ type: ConcordatIntents.Refuse, offer: offer.id })}
              >
                {CONCORDAT_HUD_COPY.refuse}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
