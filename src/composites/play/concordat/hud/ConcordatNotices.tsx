'use client'

import { useEffect, useRef, useState } from 'react'

import { clockText, isLandLocked } from '@/core/lib/play/concordat'
import type { ConcordatClientState } from '@/core/lib/play/concordat'
import { useConcordatViewStore } from '@/core/store/play/concordatView'
import { CONCORDAT_BUILDING_LABELS } from '@/declarations/play/concordat/hudCopy'
import { fillPlayMessage } from '@/declarations/play/copy'
import { CONCORDAT_TICKS_PER_SECOND } from '@/declarations/play/concordat/rules'
import { CONCORDAT_HUD_COPY } from '@/declarations/play/concordat/hudCopy'
import { CONCORDAT_HUD } from '@/declarations/ui/variants'
import { ConcordatPhases } from '@/utils/constants/concordat'

// Delay between two scans
const LOCK_CHECK_MS = 5000

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
  const [isLocked, setIsLocked] = useState(false)
  const isPlaying = client.phase === ConcordatPhases.Playing

  // Latest board for the timer, the client changes every tick
  const latest = useRef(client)
  useEffect(() => {
    latest.current = client
  })

  // Checked every few seconds, the scan walks the whole map
  useEffect(() => {
    if (!isPlaying || !isSeated) return
    const check = (): void => {
      const { map, owner, me } = latest.current
      setIsLocked(isLandLocked(map, owner, me))
    }
    const timer = setInterval(check, LOCK_CHECK_MS)

    return () => clearInterval(timer)
  }, [isPlaying, isSeated])

  // Start timer: the pick countdown, then the shield of my nation
  const ticksPerSecond = CONCORDAT_TICKS_PER_SECOND
  const shieldEnd = client.systems.shields[client.me - 1] ?? 0
  const shieldLeft = isPlaying && isSeated ? Math.max(0, shieldEnd - client.tick) : 0
  // The first reading is the full length, the bar drains from there
  const [shieldTotal, setShieldTotal] = useState(0)
  if (shieldLeft > shieldTotal) setShieldTotal(shieldLeft)
  const barShare = isPicking
    ? Math.max(0, (client.pickEnd - client.tick) / Math.max(1, client.pickEnd))
    : shieldTotal
      ? shieldLeft / shieldTotal
      : 0

  return (
    <div className={CONCORDAT_HUD.notice}>
      {(isPicking || shieldLeft > 0) && (
        <div className={CONCORDAT_HUD.timerBar} aria-hidden>
          <div className={CONCORDAT_HUD.timerFill} style={{ width: `${barShare * 100}%` }} />
        </div>
      )}
      {shieldLeft > 0 && (
        <div className={CONCORDAT_HUD.shield} title={CONCORDAT_HUD_COPY.shieldHint}>
          {fillPlayMessage(CONCORDAT_HUD_COPY.shielded, {
            time: clockText(shieldLeft / ticksPerSecond),
          })}
        </div>
      )}
      {isPicking && (
        <div className={CONCORDAT_HUD.pick}>
          <span className={CONCORDAT_HUD.pickTitle}>{CONCORDAT_HUD_COPY.pickTitle}</span>
          <span className={CONCORDAT_HUD.pickHint}>
            {isSeated ? CONCORDAT_HUD_COPY.pickHint : CONCORDAT_HUD_COPY.pickSpectator}
          </span>
        </div>
      )}
      {isLocked && isPlaying && (
        <div className={CONCORDAT_HUD.pick}>
          <span className={CONCORDAT_HUD.pickTitle}>{CONCORDAT_HUD_COPY.landLockedTitle}</span>
          <span className={CONCORDAT_HUD.pickHint}>{CONCORDAT_HUD_COPY.landLockedHint}</span>
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
