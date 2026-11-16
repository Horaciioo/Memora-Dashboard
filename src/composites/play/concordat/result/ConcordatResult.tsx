'use client'

import { PlayPodium } from '@/composites/play/results/PlayPodium'
import type { PlayFace } from '@/composites/play/session/BacSessionCrowd'
import type { ConcordatClientState } from '@/core/lib/play/concordat'
import { featuredPlayers, landShareText, landTilesOf } from '@/core/lib/play/concordat'
import { CONCORDAT_RESULT_COPY } from '@/declarations/play/concordat/hudCopy'
import { fillPlayMessage } from '@/declarations/play/copy'
import { CONCORDAT_RESULT } from '@/declarations/ui/variants'
import { ConcordatTerrains } from '@/utils/constants/concordat'

// Nations on the podium, tribes never
const PODIUM_SIZE = 10

export interface ConcordatResultProps {
  client: ConcordatClientState
  names: string[]
  faces: PlayFace[]
}

/**
 * Podium of the nations
 * @param {ConcordatResultProps} props - Finished game
 * @return {JSX.Element}
 */

export const ConcordatResult = ({ client, names, faces }: ConcordatResultProps) => {
  const ranked = featuredPlayers(client.players, PODIUM_SIZE)
  const land = landTilesOf(client.map.terrain, ConcordatTerrains.Sea)

  return (
    <div data-hud="concordat" className={CONCORDAT_RESULT.root}>
      <PlayPodium
        hasWinner={!!ranked[0]?.alive}
        ranked={ranked.map((player, index) => {
          const face = faces.find(({ id }) => id === player.accountId)
          const note = !player.alive
            ? CONCORDAT_RESULT_COPY.fallen
            : fillPlayMessage(
                index === 0 ? CONCORDAT_RESULT_COPY.first : CONCORDAT_RESULT_COPY.place,
                { place: index + 1, percent: landShareText(player.tiles, land) }
              )

          return {
            accountId: player.accountId ?? `nation-${player.id}`,
            name: names[player.id],
            avatarUrl: face?.avatarUrl ?? null,
            note,
          }
        })}
      />
    </div>
  )
}
