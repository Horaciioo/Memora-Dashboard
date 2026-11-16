'use client'

import type { ConcordatClientState } from '@/core/lib/play/concordat'
import { useConcordatViewStore } from '@/core/store/play/concordatView'
import { CONCORDAT_BUILDING_LABELS } from '@/declarations/play/concordat/hudCopy'
import { fillPlayMessage } from '@/declarations/play/copy'
import { CONCORDAT_HUD_COPY } from '@/declarations/play/concordat/hudCopy'
import { CONCORDAT_HUD } from '@/declarations/ui/variants'
import { ConcordatPhases } from '@/utils/constants/concordat'

export interface ConcordatNoticesProps {
  client: ConcordatClientState
  isSeated: boolean
}

/**
 * Under the info card: how to pick a start, the tool in hand
 * @param {ConcordatNoticesProps} props - Game
 * @return {JSX.Element}
 */

export const ConcordatNotices = ({ client, isSeated }: ConcordatNoticesProps) => {
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
              : tool.kind === 'sortie'
                ? fillPlayMessage(
                    tool.air === 'heli'
                      ? CONCORDAT_HUD_COPY.toolGuard
                      : CONCORDAT_HUD_COPY.toolSortie,
                    { name: CONCORDAT_HUD_COPY[tool.air] }
                  )
                : fillPlayMessage(CONCORDAT_HUD_COPY.toolLaunch, {
                    name: tool.weapon
                      ? CONCORDAT_HUD_COPY[tool.weapon]
                      : tool.isHeavy
                        ? CONCORDAT_HUD_COPY.heavy
                        : CONCORDAT_HUD_COPY.missile,
                  })}
          </span>
          <button type="button" className={CONCORDAT_HUD.retreat} onClick={() => setTool(null)}>
            {CONCORDAT_HUD_COPY.cancel}
          </button>
        </div>
      )}
    </div>
  )
}
