'use client'

import { useCallback, useEffect, useRef } from 'react'

import type { ConcordatLayers, ConcordatWave } from '@/composites/play/concordat/board/draw/types'
import {
  drainTouched,
  landTilesOf,
  playerRgb,
  paintMask,
  paintOwners,
  paintTerrain,
  placesOf,
} from '@/core/lib/play/concordat'
import type { ConcordatClientState, ConcordatPlace } from '@/core/lib/play/concordat'
import { CONCORDAT_ART } from '@/declarations/play/concordat/art'
import { CONCORDAT_HUB } from '@/declarations/play/concordat/hub'
import { ConcordatTerrains } from '@/utils/constants/concordat'

const { nation, territory, wash, repaintShare, labelMs, flash } = CONCORDAT_ART

// Canvas of one pixel per tile
const layerOf = (width: number, height: number): HTMLCanvasElement => {
  const layer = document.createElement('canvas')
  layer.width = width
  layer.height = height

  return layer
}

export interface Held {
  client: ConcordatClientState
  layers: ConcordatLayers
  owner: ImageData
  mask: ImageData
  colors: [number, number, number][]
  places: ConcordatPlace[]
  placesAt: number
  washed: number
  land: number
  waves: ConcordatWave[]
}

// Layers of a fresh map, terrain painted once
const build = (client: ConcordatClientState): Held => {
  const { width, height } = client.map
  const layers = {
    terrain: layerOf(width, height),
    owner: layerOf(width, height),
    mask: layerOf(width, height),
  }
  layers.terrain.getContext('2d')?.putImageData(paintTerrain(client.map, CONCORDAT_HUB), 0, 0)
  const colors: [number, number, number][] = [[0, 0, 0]]
  for (const player of client.players) colors[player.id] = playerRgb(player, nation)

  return {
    client,
    layers,
    owner: new ImageData(width, height),
    mask: new ImageData(width, height),
    colors,
    places: [],
    placesAt: 0,
    washed: 0,
    land: landTilesOf(client.map.terrain, ConcordatTerrains.Sea),
    waves: [],
  }
}

// Mask of the washed nation
const washLayer = (current: Held, holder: number): void => {
  current.washed = holder
  paintMask(current.mask, current.client.owner, holder, wash.rgb)
  current.layers.mask.getContext('2d')?.putImageData(current.mask, 0, 0)
}

/**
 * Offscreen layers of the map kept in step
 * @param {ConcordatClientState | null} client - Game
 * @param {number} version - Redraw counter
 * @param {() => void} invalidate - Redraw request
 * @return {Object} - Held layers and a wash setter
 */

export const useConcordatLayers = (
  client: ConcordatClientState | null,
  version: number,
  invalidate: () => void
) => {
  const held = useRef<Held | null>(null)

  useEffect(() => {
    if (!client) return
    const isFresh = held.current?.client !== client
    const current = isFresh || !held.current ? build(client) : held.current
    held.current = current
    const touched = drainTouched(client)
    const isBulk = isFresh || touched.length > client.owner.length * repaintShare
    // Taken tiles light up one after the other, front first
    if (!isBulk) {
      const start = performance.now()
      touched.forEach((tile, index) =>
        current.waves.push({ tile, at: start + (index / touched.length) * flash.spread })
      )
      if (current.waves.length > flash.cap)
        current.waves.splice(0, current.waves.length - flash.cap)
    }
    paintOwners(current.owner, client.owner, isBulk ? null : touched, current.colors, territory)
    current.layers.owner.getContext('2d')?.putImageData(current.owner, 0, 0)
    // Names follow the land a little late
    if (isFresh || performance.now() - current.placesAt > labelMs) {
      current.places = placesOf(client.owner, client.map.width, client.players.length)
      current.placesAt = performance.now()
    }
    // A wash outlives the tiles under it
    if (current.washed) washLayer(current, current.washed)
    invalidate()
  }, [client, version, invalidate])

  const washNation = useCallback(
    (holder: number) => {
      const current = held.current
      if (!current || current.washed === holder) return
      washLayer(current, holder)
      invalidate()
    },
    [invalidate]
  )

  return { held, washNation }
}
