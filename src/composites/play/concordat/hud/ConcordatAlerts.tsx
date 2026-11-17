'use client'

import { useEffect, useRef, useState } from 'react'

import type { ConcordatClientState } from '@/core/lib/play/concordat'
import { useConcordatViewStore } from '@/core/store/play/concordatView'
import { CONCORDAT_TICKS_PER_SECOND } from '@/declarations/play/concordat/rules'
import { CONCORDAT_HUD } from '@/declarations/ui/variants'
import { ConcordatIntents } from '@/utils/constants/concordat'

/**
 * Corps marching on me, the heaviest first
 * @param {ConcordatClientState} client - Live game
 * @return {ConcordatClientState['corps']}
 */

export const incomingOf = (client: ConcordatClientState) =>
  (client.players[client.me - 1]?.alive
    ? client.corps.filter((corps) => corps.target === client.me && corps.owner)
    : []
  ).toSorted((first, second) => second.troops - first.troops)

export interface Inbound {
  owner: number
  kind: string
  left: number
}

/**
 * Missiles on their way to my land, one per sender and kind with the nearest impact
 * @param {ConcordatClientState} client - Live game
 * @return {Inbound[]}
 */

export const inboundOf = (client: ConcordatClientState): Inbound[] => {
  const found = new Map<string, Inbound>()
  for (const strike of client.systems.strikes) {
    if (strike.owner === client.me || strike.kind === 'warhead' || strike.killAt) continue
    if (client.owner[strike.tile] !== client.me || strike.impactAt <= client.tick) continue

    const left = (strike.impactAt - client.tick) / CONCORDAT_TICKS_PER_SECOND
    const key = `${strike.owner}-${strike.kind}`
    const held = found.get(key)
    if (!held || left < held.left) found.set(key, { owner: strike.owner, kind: strike.kind, left })
  }

  return [...found.values()]
}

export interface ConcordatAlertsProps {
  client: ConcordatClientState
  act: (body: Record<string, unknown>) => Promise<boolean>
}

/**
 * Attacks against me: red edges and a flash, the cards live above the pill
 * @param {ConcordatAlertsProps} props - Game
 * @return {JSX.Element | null}
 */

export const ConcordatAlerts = ({ client, act }: ConcordatAlertsProps) => {
  const percent = useConcordatViewStore((state) => state.percent)
  const [flash, setFlash] = useState(0)
  const known = useRef(new Set<number>())
  const incoming = incomingOf(client)
  const key = incoming.map((corps) => corps.owner).join(',')

  // A new assailant flashes the screen once
  useEffect(() => {
    const owners = key ? key.split(',').map(Number) : []
    const fresh = owners.filter((owner) => !known.current.has(owner))
    known.current = new Set(owners)
    if (!fresh.length) return

    setFlash((value) => value + 1)
  }, [key])

  // Shift + R sends the same share back at the heaviest assailant
  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (!event.shiftKey || event.key.toLowerCase() !== 'r' || !incoming.length) return
      if (event.target instanceof HTMLInputElement) return
      void act({ type: ConcordatIntents.Engage, target: incoming[0].owner, percent })
    }
    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)
  })

  if (!incoming.length && !inboundOf(client).length) return null

  return (
    <>
      <div className={CONCORDAT_HUD.alarm} aria-hidden />
      {flash > 0 && <div key={flash} className={CONCORDAT_HUD.alarmFlash} aria-hidden />}
    </>
  )
}
