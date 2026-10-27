import play from '@/configurations/play/play.json'
import { readInteger, readNode } from '@/declarations/configurations/readers'
import { PlayGames } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'

// Raw node
const invites = readNode(play.invites, 'play/play.invites')

/**
 * Invitation popups, pacing and placement
 * @type {Record<string, number>}
 */

export const PLAY_INVITE_SETTINGS = {
  // Catch up when the stream is down
  pollSeconds: readInteger(invites.pollSeconds, {
    path: 'play/play.invites.pollSeconds',
    fallback: 60,
    min: 5,
  }),
  // Space between the bell and the bubble
  gapPx: readInteger(invites.gapPx, { path: 'play/play.invites.gapPx', fallback: 14, min: 0 }),
  // Space kept from the window edges
  edgePx: readInteger(invites.edgePx, { path: 'play/play.invites.edgePx', fallback: 12, min: 0 }),
}

/**
 * Words of an invitation popup
 * @type {Record<string, string>}
 */

export const PLAY_INVITE_COPY = {
  label: 'Invitation à jouer',
  eyebrow: 'Memora Play',
  play: '{name} t’invite à jouer {game}',
  watch: '{name} t’invite à regarder sa partie {game}',
  accept: 'Accepter',
  decline: 'Refuser',
} as const

/**
 * Game name after « jouer » and after « partie »
 * @type {Record<PlayGameName, { play: string, watch: string }>}
 */

export const PLAY_INVITE_GAMES: Record<PlayGameName, { play: string; watch: string }> = {
  [PlayGames.Baccalaureat]: { play: 'au Baccalauréat', watch: 'de Baccalauréat' },
  [PlayGames.Golf]: { play: 'au Golf', watch: 'de Golf' },
  [PlayGames.Bomb]: { play: 'à Bomb Party', watch: 'de Bomb Party' },
  [PlayGames.Ludo]: { play: 'au Ludo', watch: 'de Ludo' },
}

// Invitation chime, any page
export const PLAY_INVITE_SOUND = '/play/sons/effets/invitation.mp3'
