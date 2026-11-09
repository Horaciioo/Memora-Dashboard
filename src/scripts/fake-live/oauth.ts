import type { ServerResponse } from 'node:http'

import { OPERATOR_IDENTITIES } from './identities.ts'
import { APP_TOKEN, tokensOf, userOfToken } from './world.ts'

// Lifetime of a fake token
const TOKEN_SECONDS = 4 * 60 * 60

// Callback path of Memora
const CALLBACK_PATH = '/api/connexion/twitch/retour'

/**
 * Answer a JSON body
 * @param {ServerResponse} response - Response
 * @param {number} status - Status
 * @param {unknown} [body] - Body
 * @return {void}
 */

export const sendJson = (response: ServerResponse, status: number, body?: unknown): void => {
  response.writeHead(status, {
    'content-type': 'application/json',
    'ratelimit-limit': '800',
    'ratelimit-remaining': '799',
    'ratelimit-reset': String(Math.floor(Date.now() / 1000) + 60),
  })
  response.end(body === undefined ? undefined : JSON.stringify(body))
}

/**
 * Fake consent page
 * @param {ServerResponse} response - Response
 * @param {URL} url - Authorize URL
 * @return {void}
 */

export const showConsent = (response: ServerResponse, url: URL): void => {
  const state = encodeURIComponent(url.searchParams.get('state') ?? '')
  const scope = encodeURIComponent(url.searchParams.get('scope') ?? '')
  const link = (who: string, label: string) =>
    `<p><a href="approve?who=${who}&state=${state}&scope=${scope}">${label}</a></p>`

  response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
  response.end(
    `<!doctype html><meta charset="utf-8"><title>Faux Twitch</title>` +
      `<body style="font-family:sans-serif;max-width:32rem;margin:4rem auto">` +
      `<h1>Faux Twitch</h1><p>Aucune donnée ne part chez Twitch. Choisis le compte à lier :</p>` +
      link(
        'moderator',
        `${OPERATOR_IDENTITIES.moderator.name}, modérateur de toutes les fausses chaînes`
      ) +
      link(
        'viewer',
        `${OPERATOR_IDENTITIES.viewer.name}, simple viewer (Mod View en lecture seule)`
      ) +
      link('deny', 'Refuser l’autorisation') +
      `</body>`
  )
}

/**
 * Send the browser back to Memora
 * @param {ServerResponse} response - Response
 * @param {URL} url - Approve URL
 * @param {string} appOrigin - Memora origin
 * @return {void}
 */

export const approveConsent = (response: ServerResponse, url: URL, appOrigin: string): void => {
  const who = url.searchParams.get('who')
  const back = new URL(CALLBACK_PATH, appOrigin)
  back.searchParams.set('state', url.searchParams.get('state') ?? '')

  // Twitch answers a refusal on the callback
  if (who === 'moderator' || who === 'viewer') {
    back.searchParams.set('code', tokensOf(OPERATOR_IDENTITIES[who].id).code)
    back.searchParams.set('scope', url.searchParams.get('scope') ?? '')
  } else {
    back.searchParams.set('error', 'access_denied')
    back.searchParams.set('error_description', 'The user denied you access')
  }

  response.writeHead(302, { location: back.toString() })
  response.end()
}

/**
 * Grant answer of a user
 * @param {string} userId - User
 * @param {string[]} scopes - Scopes
 * @return {Record<string, unknown>} - Grant body
 */

const grantOf = (userId: string, scopes: string[]): Record<string, unknown> => ({
  access_token: tokensOf(userId).access,
  refresh_token: tokensOf(userId).refresh,
  expires_in: TOKEN_SECONDS,
  scope: scopes,
  token_type: 'bearer',
})

/**
 * Token endpoint
 * @param {ServerResponse} response - Response
 * @param {URLSearchParams} form - Posted form
 * @param {string[]} scopes - Scopes granted
 * @return {void}
 */

export const issueToken = (
  response: ServerResponse,
  form: URLSearchParams,
  scopes: string[]
): void => {
  const grantType = form.get('grant_type')

  // Application token
  if (grantType === 'client_credentials') {
    sendJson(response, 200, {
      access_token: APP_TOKEN,
      expires_in: TOKEN_SECONDS,
      token_type: 'bearer',
    })
    return
  }

  const user =
    grantType === 'authorization_code'
      ? userOfToken(form.get('code') ?? '', 'code')
      : userOfToken(form.get('refresh_token') ?? '', 'refresh')
  if (!user) {
    sendJson(response, 400, { status: 400, message: 'Invalid refresh token' })
    return
  }

  sendJson(response, 200, grantOf(user.id, scopes))
}
