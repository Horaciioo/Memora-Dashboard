import { emitKeypressEvents } from 'node:readline'

import { goOffline, goOnline } from './channelEffects.ts'
import { spamRaid, teamAction, unbanRequest } from './chat.ts'
import { holdMessage } from './effects.ts'
import { askReconnect, killSockets, sessionCount } from './eventsub.ts'
import { OPERATOR_IDENTITIES, TOXIC_LINES } from './identities.ts'
import { allViewers, channelOf, toggleRevoked } from './world.ts'

/**
 * Keys of the console
 * @type {Record<string, string>}
 */

export const CONSOLE_KEYS: Record<string, string> = {
  o: 'passer en direct',
  f: 'finir le stream',
  s: 'raid de spam',
  t: 'message toxique (AutoMod)',
  m: 'geste d’un autre modérateur',
  u: 'demande de débannissement',
  r: 'reconnexion demandée par Twitch',
  k: 'coupure brute des sockets',
  x: 'révoquer ou rétablir le jeton de Toi_Modo',
  q: 'quitter',
}

/**
 * Run one console key
 * @param {Object} input - Context
 * @param {string} input.key - Pressed key
 * @param {string} input.broadcasterId - Channel
 * @param {string} input.origin - Socket origin
 * @return {string | null} - What happened
 */

export const runKey = (input: {
  key: string
  broadcasterId: string
  origin: string
}): string | null => {
  const channel = channelOf(input.broadcasterId)
  const actions: Record<string, () => string | null> = {
    o: () => (goOnline(channel) ? 'en direct' : 'déjà en direct'),
    f: () =>
      goOffline(channel)
        ? 'stream terminé, Memora clôt le live après le délai de grâce'
        : 'déjà hors ligne',
    s: () => {
      spamRaid(channel)
      return 'raid de spam envoyé'
    },
    t: () => {
      const author = allViewers()[3]
      const line = TOXIC_LINES[Math.floor(Math.random() * TOXIC_LINES.length)]
      if (author && line) holdMessage(channel, author, line)
      return 'message retenu par AutoMod'
    },
    m: () => teamAction(channel) ?? 'aucun message à modérer',
    u: () => {
      const who = unbanRequest(channel)
      return who ? `demande de ${who}` : 'aucun viewer banni'
    },
    r: () => `${askReconnect(input.origin)} session(s) invitée(s) à se reconnecter`,
    k: () => `${killSockets()} socket(s) coupée(s)`,
    x: () => (toggleRevoked(OPERATOR_IDENTITIES.moderator.id) ? 'jeton révoqué' : 'jeton rétabli'),
  }

  return actions[input.key]?.() ?? null
}

/**
 * Listen to the keyboard
 * @param {Object} input - Context
 * @param {string} input.broadcasterId - Channel
 * @param {string} input.origin - Socket origin
 * @param {(line: string) => void} input.onLog - Log line
 * @param {() => void} input.onQuit - Quit
 * @return {void}
 */

export const listenKeys = (input: {
  broadcasterId: string
  origin: string
  onLog: (line: string) => void
  onQuit: () => void
}): void => {
  if (!process.stdin.isTTY) return

  emitKeypressEvents(process.stdin)
  process.stdin.setRawMode(true)
  process.stdin.on('keypress', (_text: string, key: { name?: string; ctrl?: boolean }) => {
    if (key.name === 'q' || (key.ctrl && key.name === 'c')) {
      input.onQuit()
      return
    }

    try {
      const line = runKey({
        key: key.name ?? '',
        broadcasterId: input.broadcasterId,
        origin: input.origin,
      })
      if (line) input.onLog(`${line} · ${sessionCount()} session(s) EventSub`)
    } catch (error) {
      input.onLog(`refusé : ${error instanceof Error ? error.message : 'erreur'}`)
    }
  })
}
