'use client'

import { useEffect, useRef, useState } from 'react'

import type { ConcordatClientState } from '@/core/lib/play/concordat'
import { playerRgb, rgbText, troopFigure } from '@/core/lib/play/concordat'
import { useConcordatViewStore } from '@/core/store/play/concordatView'
import { CONCORDAT_ART } from '@/declarations/play/concordat/art'
import { CONCORDAT_HUD_COPY } from '@/declarations/play/concordat/hudCopy'
import { CONCORDAT_TICKS_PER_SECOND } from '@/declarations/play/concordat/rules'
import { fillPlayMessage } from '@/declarations/play/copy'
import { CONCORDAT_HUD } from '@/declarations/ui/variants'
import { ConcordatIntents } from '@/utils/constants/concordat'

// Assailants listed at once, the heaviest first
const LISTED = 3

export interface ConcordatAlertsProps {
  client: ConcordatClientState
  names: string[]
  act: (body: Record<string, unknown>) => Promise<boolean>
}

/**
 * Attacks against me: red edges, a banner per assailant, defend and counter keys
 * @param {ConcordatAlertsProps} props - Game
 * @return {JSX.Element | null}
 */

export const ConcordatAlerts = ({ client, names, act }: ConcordatAlertsProps) => {
  const percent = useConcordatViewStore((state) => state.percent)
  const [flash, setFlash] = useState(0)
  const known = useRef(new Set<number>())
  const me = client.players[client.me - 1]
  const incoming = (
    me?.alive ? client.corps.filter((corps) => corps.target === client.me && corps.owner) : []
  ).toSorted((first, second) => second.troops - first.troops)
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

  // Missiles on their way to my land, one line per sender and kind with the nearest impact
  const inbound = new Map<string, { owner: number; kind: string; left: number }>()
  for (const strike of client.systems.strikes) {
    if (strike.owner === client.me || strike.kind === 'warhead' || strike.killAt) continue
    if (client.owner[strike.tile] !== client.me || strike.impactAt <= client.tick) continue

    const left = (strike.impactAt - client.tick) / CONCORDAT_TICKS_PER_SECOND
    const key = `${strike.owner}-${strike.kind}`
    const held = inbound.get(key)
    if (!held || left < held.left)
      inbound.set(key, { owner: strike.owner, kind: strike.kind, left })
  }
  if (!incoming.length && !inbound.size) return null
  const reserve = Math.max(1, me?.troops ?? 1)

  return (
    <>
      <div className={CONCORDAT_HUD.alarm} aria-hidden />
      {flash > 0 && <div key={flash} className={CONCORDAT_HUD.alarmFlash} aria-hidden />}
      <div className={CONCORDAT_HUD.alerts} role="alert">
        {[...inbound.values()].map((strike) => (
          <div key={`${strike.owner}-${strike.kind}`} className={CONCORDAT_HUD.alert}>
            <div className={CONCORDAT_HUD.alertHead}>
              <span className={CONCORDAT_HUD.alertTitle}>
                {fillPlayMessage(CONCORDAT_HUD_COPY.strikeInbound, {
                  name: names[strike.owner],
                  kind: (CONCORDAT_HUD_COPY as Record<string, string>)[strike.kind] ?? strike.kind,
                })}
              </span>
              <span className={CONCORDAT_HUD.alertTroops}>
                {fillPlayMessage(CONCORDAT_HUD_COPY.strikeSeconds, {
                  seconds: Math.ceil(strike.left),
                })}
              </span>
            </div>
          </div>
        ))}
        {incoming.slice(0, LISTED).map((corps) => (
          <div key={corps.owner} className={CONCORDAT_HUD.alert}>
            <div className={CONCORDAT_HUD.alertHead}>
              <span
                className={CONCORDAT_HUD.swatch}
                style={{
                  background: rgbText(
                    playerRgb(client.players[corps.owner - 1], CONCORDAT_ART.nation)
                  ),
                }}
              />
              <span className={CONCORDAT_HUD.alertTitle}>
                {fillPlayMessage(CONCORDAT_HUD_COPY.underAttack, { name: names[corps.owner] })}
              </span>
              <span className={CONCORDAT_HUD.alertTroops}>{troopFigure(corps.troops)}</span>
            </div>
            <div className={CONCORDAT_HUD.alertBar}>
              <div
                className={CONCORDAT_HUD.alertFill}
                style={{ width: `${Math.min(100, (corps.troops / reserve) * 100)}%` }}
              />
            </div>
            <div className={CONCORDAT_HUD.alertActions}>
              <button
                type="button"
                className={CONCORDAT_HUD.alertMain}
                title={CONCORDAT_HUD_COPY.defendHint}
                onClick={() =>
                  void act({ type: ConcordatIntents.Defend, target: corps.owner, percent })
                }
              >
                {fillPlayMessage(CONCORDAT_HUD_COPY.defend, {
                  troops: troopFigure(Math.floor(((me?.troops ?? 0) * percent) / 100)),
                })}
              </button>
              <button
                type="button"
                className={CONCORDAT_HUD.alertSide}
                title={CONCORDAT_HUD_COPY.counterHint}
                onClick={() =>
                  void act({ type: ConcordatIntents.Engage, target: corps.owner, percent })
                }
              >
                {CONCORDAT_HUD_COPY.counter}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
