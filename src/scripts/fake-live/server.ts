import { createServer } from 'node:http'
import type { IncomingMessage, Server, ServerResponse } from 'node:http'

import { TWITCH_SCOPES } from '@/declarations/platforms/twitch'

import { FakeRefusal } from './effects.ts'
import { acceptEventSub } from './eventsub.ts'
import { HELIX_ROUTES } from './helix.ts'
import { approveConsent, issueToken, sendJson, showConsent } from './oauth.ts'
import { APP_TOKEN, userOfToken } from './world.ts'

/**
 * Where the fake Twitch listens
 * @typedef {Object} ServerOptions
 */

export interface ServerOptions {
  port: number
  appOrigin: string
  onLog: (line: string) => void
  control: FakeControl
}

/**
 * What the app may ask of the running fake live
 * @typedef {Object} FakeControl
 */

export interface FakeControl {
  status: () => Record<string, unknown>
  // Runs one console key, what happened or null
  key: (key: string) => string | null
  quit: () => void
}

// Helix prefix
const HELIX_PREFIX = '/helix'

/**
 * Read a request body
 * @param {IncomingMessage} request - Request
 * @return {Promise<string>} - Body text
 */

const readBody = async (request: IncomingMessage): Promise<string> => {
  const chunks: Buffer[] = []
  for await (const chunk of request) chunks.push(chunk as Buffer)

  return Buffer.concat(chunks).toString('utf8')
}

/**
 * Parse a JSON body
 * @param {string} text - Body text
 * @return {Record<string, unknown>} - Body
 */

const parseJson = (text: string): Record<string, unknown> => {
  try {
    const parsed: unknown = JSON.parse(text)
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}

/**
 * Answer one Helix call
 * @param {IncomingMessage} request - Request
 * @param {ServerResponse} response - Response
 * @param {URL} url - Request URL
 * @return {Promise<number>} - Status sent
 */

const answerHelix = async (
  request: IncomingMessage,
  response: ServerResponse,
  url: URL
): Promise<number> => {
  const handler = HELIX_ROUTES[`${request.method} ${url.pathname.slice(HELIX_PREFIX.length)}`]
  if (!handler) {
    sendJson(response, 404, { status: 404, message: 'Not Found' })
    return 404
  }

  // Bearer token of a user or of the app
  const token = (request.headers.authorization ?? '').replace(/^Bearer /i, '')
  const user = userOfToken(token, 'access')
  if (!user && token !== APP_TOKEN) {
    sendJson(response, 401, { status: 401, message: 'Invalid OAuth token' })
    return 401
  }

  try {
    const answer = handler({
      user,
      query: url.searchParams,
      body: parseJson(await readBody(request)),
    })
    sendJson(response, answer.status, answer.body)
    return answer.status
  } catch (error) {
    const status = error instanceof FakeRefusal ? error.status : 500
    sendJson(response, status, {
      status,
      message: error instanceof Error ? error.message : 'error',
    })
    return status
  }
}

/**
 * Answer the control calls of the app: status, console keys, quit
 * @param {IncomingMessage} request - Request
 * @param {ServerResponse} response - Response
 * @param {URL} url - Request URL
 * @param {ServerOptions} options - Options
 * @return {void}
 */

const answerControl = (
  request: IncomingMessage,
  response: ServerResponse,
  url: URL,
  options: ServerOptions
): void => {
  const [, , action, key] = url.pathname.split('/')
  if (action === 'status') return sendJson(response, 200, options.control.status())
  if (request.method !== 'POST') return sendJson(response, 405, { status: 405 })

  if (action === 'quit') {
    sendJson(response, 200, { done: true })
    setTimeout(options.control.quit, 100)
    return
  }
  if (action === 'key' && key) {
    try {
      return sendJson(response, 200, { done: options.control.key(key) ?? 'touche inconnue' })
    } catch (error) {
      return sendJson(response, 409, {
        message: error instanceof Error ? error.message : 'refusé',
      })
    }
  }

  sendJson(response, 404, { status: 404 })
}

/**
 * Route one HTTP request
 * @param {IncomingMessage} request - Request
 * @param {ServerResponse} response - Response
 * @param {ServerOptions} options - Options
 * @return {Promise<void>} - Answered
 */

const route = async (
  request: IncomingMessage,
  response: ServerResponse,
  options: ServerOptions
): Promise<void> => {
  const url = new URL(request.url ?? '/', `http://localhost:${options.port}`)

  if (url.pathname.startsWith(HELIX_PREFIX)) {
    const status = await answerHelix(request, response, url)
    // Reads stay quiet
    if (request.method !== 'GET' || status >= 400)
      options.onLog(`${request.method} ${url.pathname} → ${status}`)
    return
  }

  if (url.pathname.startsWith('/control/')) return answerControl(request, response, url, options)

  // OAuth pages and tokens
  if (url.pathname === '/oauth2/authorize') return showConsent(response, url)
  if (url.pathname === '/oauth2/approve') return approveConsent(response, url, options.appOrigin)
  if (url.pathname === '/oauth2/token') {
    options.onLog('jeton demandé')
    return issueToken(response, new URLSearchParams(await readBody(request)), [...TWITCH_SCOPES])
  }
  if (url.pathname === '/oauth2/revoke') return sendJson(response, 200)

  sendJson(response, 404, { status: 404, message: 'Not Found' })
}

/**
 * Start the fake Twitch
 * @param {ServerOptions} options - Options
 * @return {Promise<Server>} - Listening server
 */

export const startServer = (options: ServerOptions): Promise<Server> =>
  new Promise((resolve, reject) => {
    const server = createServer((request, response) => {
      void route(request, response, options).catch(() => sendJson(response, 500, { status: 500 }))
    })

    // EventSub sockets
    server.on('upgrade', (request, stream) => {
      if ((request.url ?? '').startsWith('/ws')) acceptEventSub(request, stream)
      else stream.destroy()
    })
    server.once('error', reject)
    server.listen(options.port, '127.0.0.1', () => resolve(server))
  })
