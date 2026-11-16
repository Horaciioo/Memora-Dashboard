// Rasterise Natural Earth land (public domain) into an RLE mask
// Usage: node scripts/concordat/buildWorld.mjs land.geojson lakes.geojson out.json
import { readFileSync, writeFileSync } from 'node:fs'
import { deflateSync } from 'node:zlib'

const [landPath, lakesPath, outPath] = process.argv.slice(2)
const PPD = 12
const LON_MIN = -180
const LAT_MAX = 84
const LAT_MIN = -58
const width = 360 * PPD
const height = (LAT_MAX - LAT_MIN) * PPD
const mask = new Uint8Array(width * height)

const polygonsOf = (geometry) =>
  geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.type === 'MultiPolygon' ? geometry.coordinates : []

// Even-odd fill of one polygon at pixel centres, value 1 or 0
const fill = (rings, value) => {
  const rows = new Map()
  for (const ring of rings) {
    for (let index = 0; index < ring.length - 1; index++) {
      const [x1, y1] = ring[index]
      const [x2, y2] = ring[index + 1]
      if (y1 === y2 || Math.abs(x2 - x1) > 180) continue
      const top = Math.max(0, Math.ceil((LAT_MAX - Math.max(y1, y2)) * PPD - 0.5))
      const bottom = Math.min(height - 1, Math.floor((LAT_MAX - Math.min(y1, y2)) * PPD - 0.5))
      for (let row = top; row <= bottom; row++) {
        const lat = LAT_MAX - (row + 0.5) / PPD
        const t = (lat - y1) / (y2 - y1)
        if (t < 0 || t >= 1) continue
        const x = (x1 + t * (x2 - x1) - LON_MIN) * PPD
        if (!rows.has(row)) rows.set(row, [])
        rows.get(row).push(x)
      }
    }
  }
  for (const [row, xs] of rows) {
    xs.sort((a, b) => a - b)
    for (let index = 0; index + 1 < xs.length; index += 2) {
      const from = Math.max(0, Math.ceil(xs[index] - 0.5))
      const to = Math.min(width - 1, Math.floor(xs[index + 1] - 0.5))
      mask.fill(value, row * width + from, row * width + to + 1)
    }
  }
}

for (const feature of JSON.parse(readFileSync(landPath)).features)
  for (const rings of polygonsOf(feature.geometry)) fill(rings, 1)
// Lakes: keep only the big ones
for (const feature of JSON.parse(readFileSync(lakesPath)).features) {
  if ((feature.properties.scalerank ?? 9) > 1) continue
  for (const rings of polygonsOf(feature.geometry)) fill(rings, 0)
}

// Alternating runs, sea first, as varints
const bytes = []
let current = 0
let run = 0
const push = (value) => {
  while (value >= 128) {
    bytes.push((value & 127) | 128)
    value >>>= 7
  }
  bytes.push(value)
}
for (const cell of mask) {
  if (cell === current) run++
  else {
    push(run)
    current = cell
    run = 1
  }
}
push(run)

const packed = deflateSync(Uint8Array.from(bytes)).toString('base64')
writeFileSync(outPath, JSON.stringify({ ppd: PPD, lonMin: LON_MIN, latMax: LAT_MAX, width, height, data: packed }))
console.log(width, height, bytes.length, packed.length)
