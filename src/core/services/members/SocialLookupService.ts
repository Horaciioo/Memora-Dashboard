import 'server-only'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { FORM_SETTINGS, TIMEOUT_SETTINGS } from '@/declarations/configurations/settings'
import type { HandleVerdict } from '@/types/social'

// Characters a handle may hold, so it never reaches another host or path
const HANDLE_PATTERN = /^[A-Za-z0-9._-]+$/

// Only the document head is read
const HEAD_END = '</head>'

// Title and meta contents of a page head
const HEAD_TEXT = /<title[^>]*>([^<]*)<\/title>|<meta[^>]+content="([^"]*)"/gi

/**
 * Check a handle is well formed
 * @param {string} handle - Typed handle
 * @return {boolean} - Safe to probe
 */

const isProbeable = (handle: string): boolean =>
  handle.length > 0 &&
  handle.length <= FORM_SETTINGS.shortTextMaxLength &&
  HANDLE_PATTERN.test(handle)

/**
 * Title and meta text of a page
 * @param {string} html - Page source
 * @return {string} - Lowered head text
 */

const headText = (html: string): string => {
  const head = html.slice(0, html.toLowerCase().indexOf(HEAD_END) + 1 || undefined)

  return Array.from(head.matchAll(HEAD_TEXT), (match) => match[1] ?? match[2] ?? '')
    .join(' ')
    .toLowerCase()
}

/**
 * Probe whether an account exists on a declared network
 * @param {string} networkId - Network identifier
 * @param {string} handle - Typed handle
 * @return {Promise<HandleVerdict>} - Found, missing or unknown
 */

export const lookupHandle = async (networkId: string, handle: string): Promise<HandleVerdict> => {
  const network = await prisma.socialNetwork.findFirst({
    where: { id: networkId, archived: false },
  })
  if (!network) throw notFound()

  if (!isProbeable(handle)) return 'missing'

  // The probe never leaves the network's own host
  const base = new URL(network.urlPrefix)
  const target = new URL(`${network.urlPrefix}${handle}`)
  if (target.host !== base.host || target.protocol !== 'https:') return 'unknown'

  try {
    const response = await fetch(target, {
      redirect: 'manual',
      signal: AbortSignal.timeout(TIMEOUT_SETTINGS.externalMs),
      headers: { accept: 'text/html' },
    })

    // Plain answers first
    if (response.status === 404 || response.status === 410) return 'missing'
    if (response.status !== 200) return 'unknown'

    // A page naming the handle is theirs
    return headText(await response.text()).includes(handle.toLowerCase()) ? 'found' : 'unknown'
  } catch {
    return 'unknown'
  }
}
