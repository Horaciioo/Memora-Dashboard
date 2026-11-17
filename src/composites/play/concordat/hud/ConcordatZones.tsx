'use client'

import { useEffect, useRef, useState } from 'react'

import type { ConcordatClientState } from '@/core/lib/play/concordat'
import { ConcordatGold } from '@/composites/play/concordat/hud/ConcordatGold'
import { fillPlayMessage } from '@/declarations/play/copy'
import { CONCORDAT_HUD_COPY } from '@/declarations/play/concordat/hudCopy'
import { CONCORDAT_HUD } from '@/declarations/ui/variants'

// Packing of a zone event, zone ids stay under it
const ZONE_PACK = 4096
// Time a banner stays up
const BANNER_MS = 2600

interface Banner {
  id: number
  title: string
  gold: number
}

/**
 * Banner of each zone the reader just won, with its gold
 * @param {Object} props - Game
 * @param {ConcordatClientState} props.client - Live game
 * @return {JSX.Element}
 */

export const ConcordatZones = ({
  client,
  names,
}: {
  client: ConcordatClientState
  names: string[]
}) => {
  const [banners, setBanners] = useState<Banner[]>([])
  const seen = useRef(client.log.length)
  const next = useRef(0)

  // New journal lines only, never the old ones
  useEffect(() => {
    const fresh = client.log.slice(seen.current)
    seen.current = client.log.length
    const won = fresh.filter(
      (event) =>
        (event.kind === 'zoneWon' || event.kind === 'eliminated') && event.actor === client.me
    )
    if (!won.length) return

    const added = won.map((event) => ({
      id: next.current++,
      title:
        event.kind === 'zoneWon'
          ? fillPlayMessage(CONCORDAT_HUD_COPY.zoneWon, {
              zone: client.map.provinces[(event.tile % ZONE_PACK) - 1]?.name ?? '',
            })
          : fillPlayMessage(CONCORDAT_HUD_COPY.killed, { name: names[event.victim] ?? '' }),
      gold: event.kind === 'zoneWon' ? Math.floor(event.tile / ZONE_PACK) : Math.max(0, event.tile),
    }))
    setBanners((current) => [...current, ...added].slice(-3))
    const ids = new Set(added.map((banner) => banner.id))
    window.setTimeout(
      () => setBanners((current) => current.filter((banner) => !ids.has(banner.id))),
      BANNER_MS
    )
  }, [client.log, client.me, client.map.provinces, names])

  return (
    <div className={CONCORDAT_HUD.zones} role="status">
      {banners.map((banner) => (
        <div key={banner.id} className={CONCORDAT_HUD.zone}>
          <span className={CONCORDAT_HUD.zoneTitle}>{banner.title}</span>
          <ConcordatGold amount={banner.gold} prefix="+" className={CONCORDAT_HUD.zoneGold} />
        </div>
      ))}
    </div>
  )
}
