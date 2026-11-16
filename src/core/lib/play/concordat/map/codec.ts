import { readerOf, writeVarint } from '@/core/lib/play/concordat/bytes'
import type { ConcordatMap, ConcordatProvince } from '@/types/concordat'
import type { ConcordatResourceName, ConcordatStyleName } from '@/utils/constants/concordat'

// Format version in the first byte
const MAP_VERSION = 1

interface MapMeta {
  seed: number
  style: ConcordatStyleName
  width: number
  height: number
  starts: number[]
  names: string[]
  resources: ConcordatResourceName[]
}

/**
 * Compact binary map, run-length coded
 * @param {ConcordatMap} map - Map
 * @return {Uint8Array} - Bytes
 */

export const encodeMap = (map: ConcordatMap): Uint8Array => {
  const meta: MapMeta = {
    seed: map.seed,
    style: map.style,
    width: map.width,
    height: map.height,
    starts: map.starts,
    names: map.provinces.map((province) => province.name),
    resources: map.provinces.map((province) => province.resource),
  }
  const head = new TextEncoder().encode(JSON.stringify(meta))
  const body: number[] = []

  // Runs of the same terrain and province
  let run = 1
  for (let tile = 1; tile <= map.terrain.length; tile++) {
    const isSame =
      tile < map.terrain.length &&
      map.terrain[tile] === map.terrain[tile - 1] &&
      map.province[tile] === map.province[tile - 1]
    if (isSame) {
      run++
      continue
    }
    body.push(map.terrain[tile - 1])
    writeVarint(body, map.province[tile - 1])
    writeVarint(body, run)
    run = 1
  }

  // Version, meta length, meta, runs
  const out = new Uint8Array(5 + head.length + body.length)
  out[0] = MAP_VERSION
  new DataView(out.buffer).setUint32(1, head.length)
  out.set(head, 5)
  out.set(body, 5 + head.length)

  return out
}

/**
 * Map from its binary form
 * @param {Uint8Array} bytes - Bytes
 * @return {ConcordatMap} - Map
 */

export const decodeMap = (bytes: Uint8Array): ConcordatMap => {
  if (bytes[0] !== MAP_VERSION) throw new Error('Unknown map version')

  const length = new DataView(bytes.buffer, bytes.byteOffset).getUint32(1)
  const meta = JSON.parse(new TextDecoder().decode(bytes.subarray(5, 5 + length))) as MapMeta
  const terrain = new Uint8Array(meta.width * meta.height)
  const province = new Uint16Array(terrain.length)
  const cursor = 5 + length

  const reader = readerOf(bytes, cursor)

  // Expand runs
  let tile = 0
  while (tile < terrain.length && !reader.isDone()) {
    const kind = reader.byte()
    const owner = reader.varint()
    const size = reader.varint()
    terrain.fill(kind, tile, tile + size)
    province.fill(owner, tile, tile + size)
    tile += size
  }

  // Rebuild province sizes and centres
  const provinces: ConcordatProvince[] = meta.names.map((name, index) => ({
    id: index + 1,
    name,
    resource: meta.resources[index],
    tiles: 0,
    x: 0,
    y: 0,
  }))
  for (let at = 0; at < province.length; at++) {
    const entry = provinces[province[at] - 1]
    if (!entry) continue
    entry.tiles++
    entry.x += at % meta.width
    entry.y += Math.floor(at / meta.width)
  }
  for (const entry of provinces) {
    entry.x = Math.round(entry.x / Math.max(1, entry.tiles))
    entry.y = Math.round(entry.y / Math.max(1, entry.tiles))
  }

  return {
    width: meta.width,
    height: meta.height,
    seed: meta.seed,
    style: meta.style,
    terrain,
    province,
    provinces,
    starts: meta.starts,
  }
}
