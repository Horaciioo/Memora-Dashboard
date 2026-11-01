/// <reference lib="webworker" />

import { NOTIFICATION_COPY } from '@/declarations/notifications/copy'
import {
  WORKER_ASSET_PREFIX,
  WORKER_CACHES,
  WORKER_MESSAGES,
  WORKER_PARAMS,
} from '@/declarations/pwa/worker'
import type { PushPayload } from '@/declarations/pwa/worker'
import { INSTALL_COPY } from '@/declarations/pwa/copy'
import { staysQuiet } from '@/worker/quiet'

declare const self: ServiceWorkerGlobalScope

// Settings handed over by the page through the script address
const params = new URL(self.location.href).searchParams
const version = params.get(WORKER_PARAMS.version) ?? ''
const offlineUrl = params.get(WORKER_PARAMS.offline)
const isCaching = params.get(WORKER_PARAMS.caching) === '1'

const SHELL_CACHE = `${WORKER_CACHES.shell}${version}`
const ASSET_CACHE = `${WORKER_CACHES.assets}${version}`

// Build output referenced by a page
const ASSET_PATTERN = new RegExp(`${WORKER_ASSET_PREFIX}[^"'\\s)]+`, 'g')

/**
 * Keep the fallback page and the files it needs
 * @return {Promise<void>} - Stored
 */

const storeShell = async (): Promise<void> => {
  if (!offlineUrl) return

  const shell = await caches.open(SHELL_CACHE)
  const page = await fetch(offlineUrl, { cache: 'reload' })
  if (!page.ok) return

  await shell.put(offlineUrl, page.clone())

  // Its styles and scripts, so it renders without network
  if (!isCaching) return
  const assets = [...new Set((await page.text()).match(ASSET_PATTERN) ?? [])]
  const store = await caches.open(ASSET_CACHE)
  await Promise.all(assets.map((asset) => store.add(asset).catch(() => undefined)))
}

/**
 * Drop the caches of older versions
 * @return {Promise<void>} - Cleared
 */

const dropStaleCaches = async (): Promise<void> => {
  const kept = new Set([SHELL_CACHE, ASSET_CACHE])
  const names = await caches.keys()

  await Promise.all(
    names
      .filter((name) => name.startsWith(WORKER_CACHES.prefix) && !kept.has(name))
      .map((name) => caches.delete(name))
  )
}

self.addEventListener('install', (event) => {
  event.waitUntil(storeShell())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      dropStaleCaches(),
      // The page request starts while the worker boots
      self.registration.navigationPreload?.enable(),
      self.clients.claim(),
    ])
  )
})

// The page asks the waiting version to take over
self.addEventListener('message', (event) => {
  if (event.data === WORKER_MESSAGES.skipWaiting) void self.skipWaiting()
})

/**
 * Page from the network, the fallback page once it fails
 * @param {FetchEvent} event - Navigation
 * @return {Promise<Response>} - Page
 */

const navigate = async (event: FetchEvent): Promise<Response> => {
  try {
    const preloaded = (await event.preloadResponse) as Response | undefined

    return preloaded ?? (await fetch(event.request))
  } catch (error) {
    const fallback = offlineUrl ? await caches.match(offlineUrl) : undefined
    if (fallback) return fallback

    throw error
  }
}

/**
 * Content-hashed file from the cache, stored on first sight
 * @param {Request} request - Asset request
 * @return {Promise<Response>} - Asset
 */

const serveAsset = async (request: Request): Promise<Response> => {
  const store = await caches.open(ASSET_CACHE)
  const kept = await store.match(request)
  if (kept) return kept

  const response = await fetch(request)
  if (response.ok && response.type === 'basic') void store.put(request, response.clone())

  return response
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  if (request.mode === 'navigate') return event.respondWith(navigate(event))

  // Only immutable build output is kept, never a page or an API answer
  const url = new URL(request.url)
  if (
    isCaching &&
    url.origin === self.location.origin &&
    url.pathname.startsWith(WORKER_ASSET_PREFIX)
  ) {
    event.respondWith(serveAsset(request))
  }
})

/**
 * Read the payload of a push
 * @param {PushEvent} event - Push
 * @return {PushPayload | null} - Payload or nothing
 */

const readPayload = (event: PushEvent): PushPayload | null => {
  try {
    return (event.data?.json() as PushPayload | undefined) ?? null
  } catch {
    return null
  }
}

/**
 * Draw one push as a system notification
 * @param {PushEvent} event - Push
 * @return {Promise<void>} - Shown
 */

const receive = async (event: PushEvent): Promise<void> => {
  const payload = readPayload(event)

  // Home screen badge
  if (payload && 'setAppBadge' in navigator) {
    await navigator.setAppBadge(payload.unread).catch(() => undefined)
  }

  const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
  const isFocused = windows.some((window) => window.focused)
  if (payload && staysQuiet(isFocused, navigator.userAgent)) return

  // A push always ends on screen, an unreadable one included
  await self.registration.showNotification(payload?.title ?? INSTALL_COPY.name, {
    body: payload?.body ?? NOTIFICATION_COPY.metaUnread,
    tag: payload?.tag,
    icon: payload?.icon,
    badge: payload?.badge,
    data: payload,
    timestamp: payload ? Date.parse(payload.at) : Date.now(),
  } as NotificationOptions)
}

self.addEventListener('push', (event) => {
  event.waitUntil(receive(event))
})

/**
 * Open the page a notification points at, in a Memora window when one is open
 * @param {PushPayload | null} payload - Clicked push
 * @return {Promise<void>} - Opened
 */

const openFrom = async (payload: PushPayload | null): Promise<void> => {
  // Seen on the phone, settled on the server
  if (payload?.readUrl) {
    await fetch(payload.readUrl, {
      method: 'PATCH',
      credentials: 'same-origin',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    }).catch(() => undefined)
  }

  const url = new URL(payload?.url ?? '/', self.location.origin).href
  const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
  const open = windows.find((window) => new URL(window.url).origin === self.location.origin)

  if (!open) {
    await self.clients.openWindow(url)

    return
  }

  // The page routes itself, its state stays
  open.postMessage({ type: WORKER_MESSAGES.opened, url, notificationId: payload?.notificationId })
  await open.focus()
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(openFrom((event.notification.data as PushPayload | undefined) ?? null))
})
