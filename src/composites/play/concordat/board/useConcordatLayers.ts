'use client'

import { useCallback, useEffect, useRef } from 'react'

import type { ConcordatLayers, ConcordatWave } from '@/composites/play/concordat/board/draw/types'
import {
  drainTouched,
  landTilesOf,
  playerRgb,
  paintMask,
  paintMaskTiles,
  paintOwners,
  paintTerrain,
  placesOf,
} from '@/core/lib/play/concordat'
import type { ConcordatClientState, ConcordatPlace } from '@/core/lib/play/concordat'
import { CONCORDAT_ART } from '@/declarations/play/concordat/art'
import { CONCORDAT_HUB } from '@/declarations/play/concordat/hub'
import { ConcordatTerrains } from '@/utils/constants/concordat'

const { nation, territory, wash, repaintShare, labelMs, flash } = CONCORDAT_ART

// Scattered order of a tile, so a batch dissolves in instead of sweeping row by row
const scatter = (tile: number): number => Math.imul(tile ^ (tile >>> 15), 2246822519) >>> 0

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
  // Tiles taken but not yet painted, each shows when its moment comes
  pending: ConcordatWave[]
  // Moment the last batch of tiles arrived
  batchAt: number
}

// Layers of a map, the ones of the same map held before are kept
const build = (client: ConcordatClientState, previous: Held | null): Held => {
  const { width, height } = client.map
  const isSameMap = previous?.client.map === client.map
  const layers = isSameMap
    ? previous.layers
    : {
        terrain: layerOf(width, height),
        owner: layerOf(width, height),
        mask: layerOf(width, height),
      }
  if (!isSameMap) {
    layers.terrain.getContext('2d')?.putImageData(paintTerrain(client.map, CONCORDAT_HUB), 0, 0)
  }
  const colors: [number, number, number][] = [[0, 0, 0]]
  for (const player of client.players) colors[player.id] = playerRgb(player, nation)

  return {
    client,
    layers,
    owner: isSameMap ? previous.owner : new ImageData(width, height),
    mask: isSameMap ? previous.mask : new ImageData(width, height),
    colors,
    places: [],
    placesAt: 0,
    washed: 0,
    land: isSameMap ? previous.land : landTilesOf(client.map.terrain, ConcordatTerrains.Sea),
    waves: [],
    pending: [],
    batchAt: 0,
  }
}

// Box around touched tiles and their ring, so only that part is uploaded
const boxOf = (tiles: number[], width: number, height: number) => {
  let left = width
  let right = 0
  let top = height
  let bottom = 0
  for (const tile of tiles) {
    const column = tile % width
    const row = (tile - column) / width
    if (column < left) left = column
    if (column > right) right = column
    if (row < top) top = row
    if (row > bottom) bottom = row
  }
  left = Math.max(0, left - 1)
  top = Math.max(0, top - 1)

  return {
    x: left,
    y: top,
    width: Math.min(width, right + 2) - left,
    height: Math.min(height, bottom + 2) - top,
  }
}

// Mask of the washed nation
const washLayer = (current: Held, holder: number): void => {
  current.washed = holder
  paintMask(current.mask, current.client.owner, holder, wash.rgb)
  current.layers.mask.getContext('2d')?.putImageData(current.mask, 0, 0)
}

/**
 * Paint the tiles whose moment has come
 * @param {Held} current - Held layers
 * @param {number} now - Clock in milliseconds
 * @return {boolean} - Tiles still waiting
 */

export const revealDue = (current: Held, now: number): boolean => {
  const { pending, client } = current
  if (!pending.length) return false
  const due: number[] = []
  let kept = 0
  for (const wave of pending) {
    if (wave.at <= now) due.push(wave.tile)
    else pending[kept++] = wave
  }
  pending.length = kept
  if (due.length) {
    paintOwners(current.owner, client.owner, due, current.colors, territory)
    const box = boxOf(due, client.map.width, client.map.height)
    current.layers.owner
      .getContext('2d')
      ?.putImageData(current.owner, 0, 0, box.x, box.y, box.width, box.height)
  }

  return kept > 0
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
  const trailing = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (trailing.current) clearTimeout(trailing.current)
    },
    []
  )

  useEffect(() => {
    if (!client) return
    const isFresh = held.current?.client !== client
    const current = isFresh || !held.current ? build(client, held.current) : held.current
    held.current = current
    const touched = drainTouched(client)
    // A backlog too deep to trickle is shown at once, like a big change
    const isBulk =
      isFresh ||
      touched.length > client.owner.length * repaintShare ||
      current.pending.length + touched.length > flash.cap
    // Taken tiles come in one after the other across the gap to the next batch
    if (isFresh || isBulk) current.pending.length = 0
    if (!isBulk && touched.length) {
      const start = performance.now()
      const gap = Math.min(flash.spread, Math.max(flash.minSpread, start - current.batchAt))
      current.batchAt = start
      const order = [...touched].sort((first, second) => scatter(first) - scatter(second))
      order.forEach((tile, index) => {
        const wave = { tile, at: start + (index / order.length) * gap }
        current.waves.push(wave)
        current.pending.push(wave)
      })
      if (current.waves.length > flash.cap)
        current.waves.splice(0, current.waves.length - flash.cap)
    }
    if (isBulk) {
      paintOwners(current.owner, client.owner, null, current.colors, territory)
      current.layers.owner.getContext('2d')?.putImageData(current.owner, 0, 0)
    }
    // Names follow the land a little late
    // A full scan costs tens of ms on a big map: only when land moved
    const isStale = performance.now() - current.placesAt > labelMs
    if (isFresh || (touched.length > 0 && isStale)) {
      current.places = placesOf(client.owner, client.map.width, client.players.length)
      current.placesAt = performance.now()
    } else if (touched.length > 0) {
      // Last change inside the window: refresh once it ends
      if (trailing.current) clearTimeout(trailing.current)
      trailing.current = setTimeout(
        () => {
          current.places = placesOf(client.owner, client.map.width, client.players.length)
          current.placesAt = performance.now()
          invalidate()
        },
        Math.max(0, labelMs - (performance.now() - current.placesAt)) + 50
      )
    }
    // A wash outlives the tiles under it
    if (current.washed && isBulk) washLayer(current, current.washed)
    else if (current.washed && touched.length) {
      paintMaskTiles(current.mask, client.owner, touched, current.washed)
      const box = boxOf(touched, client.map.width, client.map.height)
      current.layers.mask
        .getContext('2d')
        ?.putImageData(current.mask, 0, 0, box.x, box.y, box.width, box.height)
    }
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
