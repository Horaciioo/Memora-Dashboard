import { randomUUID } from 'node:crypto'
import { prisma, fx } from '../lib/client.ts'

// Route the app serves stored files from
const FILE_ROUTE = '/api/fichiers/'

/**
 * Store one generated picture and return the URL the app serves it from
 * @param {string} bucket - Storage bucket
 * @param {string} svg - Picture source
 * @return {Promise<string>} - Served URL
 */

export const storeImage = async (bucket: 'avatars' | 'banners', svg: string): Promise<string> => {
  const data = Buffer.from(svg, 'utf8')
  const row = await prisma.storageEntry.create({
    data: {
      id: fx('file'),
      bucket,
      key: randomUUID(),
      mimeType: 'image/svg+xml',
      byteSize: data.byteLength,
      data,
      metadata: { name: `${bucket}.svg`, fixture: true },
    },
  })

  return `${FILE_ROUTE}${row.id}`
}

/**
 * Initials of a name
 * @param {string} name - Display name
 * @return {string} - Initials
 */

const initials = (name: string): string =>
  name
    .split(/[\s_]+/)
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()

/**
 * Round portrait on a two-colour gradient
 * @param {string} name - Whose portrait
 * @param {[string, string]} palette - Gradient stops
 * @return {string} - SVG source
 */

export const creatorPortrait = (name: string, [from, to]: [string, string]): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="128" height="128" fill="url(#g)"/><text x="64" y="78" text-anchor="middle" font-family="Arial, sans-serif" font-size="44" font-weight="700" fill="#ffffff">${initials(name)}</text></svg>`

/**
 * Wide banner on the same gradient
 * @param {string} name - Whose banner
 * @param {[string, string]} palette - Gradient stops
 * @return {string} - SVG source
 */

export const creatorBanner = (name: string, [from, to]: [string, string]): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${to}"/><stop offset="1" stop-color="${from}"/></linearGradient></defs><rect width="1200" height="300" fill="url(#g)"/><text x="60" y="190" font-family="Arial, sans-serif" font-size="96" font-weight="800" fill="#ffffff" fill-opacity="0.9">${name}</text></svg>`

// Portrait colours of the members
const MEMBER_PALETTES: [string, string][] = [
  ['#f472b6', '#9d174d'],
  ['#e07fae', '#5e1f42'],
  ['#60a5fa', '#1e3a8a'],
  ['#34d399', '#065f46'],
  ['#fbbf24', '#92400e'],
  ['#f87171', '#7f1d1d'],
  ['#22d3ee', '#155e75'],
  ['#a3e635', '#3f6212'],
]

/**
 * Portrait of one member
 * @param {string} name - Display name
 * @param {number} index - Rank
 * @return {string} - SVG source
 */

export const memberPortrait = (name: string, index: number): string =>
  creatorPortrait(name, MEMBER_PALETTES[index % MEMBER_PALETTES.length])
