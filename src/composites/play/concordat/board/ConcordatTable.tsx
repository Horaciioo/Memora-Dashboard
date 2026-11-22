'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { drawFlash } from '@/composites/play/concordat/board/draw/drawFlash'
import { drawSignals } from '@/composites/play/concordat/board/draw/drawSignals'
import { drawBoard } from '@/composites/play/concordat/board/draw/drawBoard'
import { warOf } from '@/composites/play/concordat/board/draw/warState'
import { ConcordatToolGhost } from '@/composites/play/concordat/hud/ConcordatToolGhost'
import { ConcordatHud } from '@/composites/play/concordat/hud/ConcordatHud'
import { ConcordatResult } from '@/composites/play/concordat/result/ConcordatResult'
import { ConcordatActionMenu } from '@/composites/play/concordat/board/ConcordatActionMenu'
import { ConcordatTargetMenu } from '@/composites/play/concordat/board/ConcordatTargetMenu'
import { ConcordatHoverCard } from '@/composites/play/concordat/board/ConcordatHoverCard'
import { useConcordatCamera } from '@/composites/play/concordat/board/useConcordatCamera'
import { useConcordatFrame } from '@/composites/play/concordat/board/useConcordatFrame'
import type { ConcordatStrike } from '@/composites/play/concordat/board/useConcordatTaps'
import type { ConcordatDraw } from '@/composites/play/concordat/board/useConcordatFrame'
import { revealDue, useConcordatLayers } from '@/composites/play/concordat/board/useConcordatLayers'
import { useConcordatTaps } from '@/composites/play/concordat/board/useConcordatTaps'
import type { PlayFace } from '@/composites/play/session/BacSessionCrowd'
import type { ConcordatClientState } from '@/core/lib/play/concordat'
import { bodyFor, nationNamesOf, playerRgb, tieOfRows } from '@/core/lib/play/concordat'
import type { ConcordatTool } from '@/core/store/play/concordatView'
import { useConcordatViewStore } from '@/core/store/play/concordatView'
import { fillPlayMessage } from '@/declarations/play/copy'
import { CONCORDAT_ART } from '@/declarations/play/concordat/art'
import { CONCORDAT_HUD_COPY } from '@/declarations/play/concordat/hudCopy'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import { CONCORDAT_BOARD } from '@/declarations/ui/variants'
import { ConcordatIntents, ConcordatPhases } from '@/utils/constants/concordat'
import { ConcordatTargetActions } from '@/utils/constants/concordat'
import type { ConcordatTargetAction } from '@/utils/constants/concordat'

// Zone a tool covers on the map, in tiles
const aimOf = (tool: ConcordatTool | null): { radius: number; isGuard: boolean } | null => {
  if (tool?.kind === 'sortie')
    return tool.air === 'heli'
      ? { radius: CONCORDAT.air.heli.guard, isGuard: true }
      : { radius: CONCORDAT.air.fighter.strafe, isGuard: false }
  if (tool?.kind !== 'launch') return null
  const kind = tool.weapon ?? (tool.isHeavy ? 'heavy' : 'missile')

  return { radius: CONCORDAT.weapons.radius[kind], isGuard: false }
}

export interface ConcordatTableProps {
  sessionId: string
  client: ConcordatClientState
  version: number
  act: (body: Record<string, unknown>) => Promise<boolean>
  faces: PlayFace[]
  isSeated: boolean
}

/**
 * The map on its table: canvas, floating tooltip and menu, HUD over it
 * @param {ConcordatTableProps} props - Live game
 * @return {JSX.Element}
 */

export const ConcordatTable = ({
  sessionId,
  client,
  version,
  act,
  faces,
  isSeated,
}: ConcordatTableProps) => {
  const wrap = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const draw = useRef<ConcordatDraw>(() => false)
  const hoverTile = useRef(-1)
  // Read once, a style lookup per frame forces a layout
  const font = useRef('')
  const percent = useConcordatViewStore((state) => state.percent)
  const recenterTick = useConcordatViewStore((state) => state.recenterTick)
  const jump = useConcordatViewStore((state) => state.jump)
  const marks = useConcordatViewStore((state) => state.marks)
  const setTool = useConcordatViewStore((state) => state.setTool)
  const [menu, setMenu] = useState<{ holder: number; tile: number; x: number; y: number } | null>(
    null
  )
  const [strike, setStrike] = useState<ConcordatStrike | null>(null)

  const invalidate = useConcordatFrame(draw)
  const { held, washNation } = useConcordatLayers(client, version, invalidate)
  const names = useMemo(
    () =>
      nationNamesOf(client.players, faces, (id) =>
        fillPlayMessage(CONCORDAT_HUD_COPY.nation, { id })
      ),
    [client.players, faces]
  )
  const me = client.players[client.me - 1]
  const { hover, onHover, onTap, onMenu } = useConcordatTaps({
    client,
    act,
    isSeated,
    percent,
    hoverTileRef: hoverTile,
    washNation,
    invalidate,
    setMenu,
    setStrike,
  })
  const { camera, size, view, recenter } = useConcordatCamera({
    wrap,
    canvas,
    mapWidth: client.map.width,
    mapHeight: client.map.height,
    focusTile: me && client.phase !== ConcordatPhases.Picking ? Math.max(me.capital, me.start) : -1,
    invalidate,
    onTap,
    onHover,
    onMenu,
  })

  useEffect(() => {
    draw.current = (now) => {
      const current = held.current
      const { tool, marks } = useConcordatViewStore.getState()
      const target = canvas.current
      const context = target?.getContext('2d')
      if (!current || !target || !context || !size.current.width) return false
      context.setTransform(
        target.width / size.current.width,
        0,
        0,
        target.width / size.current.width,
        0,
        0
      )
      const scene = {
        client,
        camera: camera.current,
        width: size.current.width,
        height: size.current.height,
        layers: current.layers,
        colors: current.colors,
        names,
        places: current.places,
        hoverTile: hoverTile.current,
        washed: current.washed,
        aim: aimOf(tool),
        marks,
        war: warOf(client, current.land),
        tick: client.tick,
        font: (font.current ||= getComputedStyle(target).fontFamily),
        now,
      }
      const isRevealing = revealDue(current, now)
      const isWar = drawBoard(context, scene)
      const isSpreading = drawFlash(context, scene, current.waves)
      const isSignalling = drawSignals(context, scene)

      const isEchoing = marks.some((item) => performance.now() - item.at < CONCORDAT_ART.mark.ms)

      const isSailing = client.ships.length > 0

      return (
        isWar ||
        isRevealing ||
        isSignalling ||
        isSpreading ||
        isEchoing ||
        isSailing ||
        client.corps.length > 0
      )
    }
    invalidate()
  })

  // Back to my nation, or to a spot of the minimap, once per request
  const seen = useRef({ tick: recenterTick, jump })
  useEffect(() => {
    if (recenterTick !== seen.current.tick) {
      seen.current.tick = recenterTick
      if (me)
        recenter(Math.max(me.capital, me.start), size.current.height / CONCORDAT_ART.focusTiles)
    }
    if (jump !== seen.current.jump) {
      seen.current.jump = jump
      if (jump.tile >= 0) recenter(jump.tile, camera.current.scale)
    }
  }, [recenterTick, jump, me, recenter, size, camera])

  // Escape leaves the menu
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return
      if (event.key === 'Escape') {
        setMenu(null)
        setStrike(null)
        setTool(null)

        return
      }
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return
      // T and Y move the engagement, C brings the camera home
      const { percent: current, setPercent, recenter: goHome } = useConcordatViewStore.getState()
      const key = event.key.toLowerCase()
      const { min, max, hotkeyStep } = CONCORDAT_ART.engage
      if (key === 't') setPercent(Math.max(min, current - hotkeyStep))
      else if (key === 'y') setPercent(Math.min(max, current + hotkeyStep))
      else if (key === 'c') goHome()
      else if (key === 'k' || key === 'l') {
        // K asks the nation under the pointer for an alliance, L breaks the treaty
        const holder = hoverTile.current >= 0 ? client.owner[hoverTile.current] : 0
        if (!holder || holder === client.me) return
        const action = key === 'k' ? ConcordatTargetActions.Alliance : ConcordatTargetActions.Break
        void act(bodyFor(action, holder, current))
      }
    }
    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)
  }, [setTool, client, act])
  useEffect(() => invalidate(), [marks, invalidate])

  if (client.phase === ConcordatPhases.Ended) {
    return <ConcordatResult client={client} names={names} faces={faces} />
  }

  const pick = (action: ConcordatTargetAction) => {
    if (menu) void act(bodyFor(action, menu.holder, percent, menu.tile, me?.gold ?? 0))
    setMenu(null)
  }

  const fire = () => {
    if (!strike) return
    const body = strike.air
      ? { type: ConcordatIntents.Sortie, id: strike.silo, tile: strike.tile, air: strike.air }
      : {
          type: ConcordatIntents.Launch,
          id: strike.silo,
          tile: strike.tile,
          heavy: strike.isHeavy,
          weapon: strike.weapon,
        }
    void act({ ...body, confirm: true }).then((isDone) => isDone && setTool(null))
    setStrike(null)
  }

  return (
    <div data-hud="concordat" className={CONCORDAT_BOARD.root}>
      <div ref={wrap} className={CONCORDAT_BOARD.canvas}>
        <canvas ref={canvas} className={CONCORDAT_BOARD.canvas} />
      </div>
      <ConcordatToolGhost />
      {hover && !menu && client.phase === ConcordatPhases.Playing && (
        <ConcordatHoverCard client={client} names={names} holder={hover.holder} />
      )}
      {menu && (
        <ConcordatTargetMenu
          name={names[menu.holder]}
          color={playerRgb(client.players[menu.holder - 1], CONCORDAT_ART.nation)}
          tie={tieOfRows(client.systems.ties, client.me, menu.holder)}
          isEmbargoed={client.systems.embargoes.some(
            (ban) => ban.from === client.me && ban.to === menu.holder
          )}
          x={menu.x}
          y={menu.y}
          width={view.width}
          height={view.height}
          onPick={pick}
          onEmoji={(emoji) => {
            void act({ type: ConcordatIntents.Emoji, to: menu.holder, emoji })
            setMenu(null)
          }}
        />
      )}
      {strike && (
        <ConcordatActionMenu
          title={
            strike.air
              ? CONCORDAT_HUD_COPY[strike.air]
              : strike.weapon
                ? CONCORDAT_HUD_COPY[strike.weapon]
                : strike.isHeavy
                  ? CONCORDAT_HUD_COPY.heavy
                  : CONCORDAT_HUD_COPY.missile
          }
          caption={names[client.owner[strike.tile]] ?? CONCORDAT_HUD_COPY.free}
          x={strike.x}
          y={strike.y}
          width={view.width}
          height={view.height}
          items={[
            {
              key: 'fire',
              label: strike.air ? CONCORDAT_HUD_COPY.confirmSortie : CONCORDAT_HUD_COPY.confirmFire,
              isMain: true,
              onPick: fire,
            },
            { key: 'cancel', label: CONCORDAT_HUD_COPY.cancel, onPick: () => setStrike(null) },
          ]}
        />
      )}
      <ConcordatHud
        sessionId={sessionId}
        client={client}
        names={names}
        act={act}
        isSeated={isSeated}
      />
    </div>
  )
}
