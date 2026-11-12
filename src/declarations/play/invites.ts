import play from '@/configurations/play/play.json'
import { readInteger, readNode } from '@/declarations/configurations/readers'
import { PlayGames, PlayNoticeKinds } from '@/utils/constants/play'
import type { PlayGameName, PlayNoticeKindName } from '@/utils/constants/play'

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
 * Words of a news popup
 * @type {Record<string, string>}
 */

export const PLAY_INVITE_COPY = {
  label: 'Nouvelle de Memora Play',
  eyebrow: 'Memora Play',
  everyone: '{name} invite tout Memora',
  accept: 'Accepter',
  decline: 'Refuser',
  ignore: 'Ignorer',
} as const

/**
 * Sentence of each kind of news, the game after the name
 * @type {Record<PlayNoticeKindName, string>}
 */

export const PLAY_NOTICE_SENTENCES: Record<PlayNoticeKindName, string> = {
  [PlayNoticeKinds.Invite]: '{name} t’a invité à jouer {game}',
  [PlayNoticeKinds.Spectate]: '{name} t’a invité à regarder sa partie {game}',
  [PlayNoticeKinds.Rematch]: '{name} propose une revanche',
  [PlayNoticeKinds.Started]: 'La partie {game} de {name} que tu suis a commencé',
  [PlayNoticeKinds.Finished]: 'La partie {game} de {name} que tu suis est terminée',
}

/**
 * Main gesture of each kind of news
 * @type {Record<PlayNoticeKindName, string>}
 */

export const PLAY_NOTICE_ACTIONS: Record<PlayNoticeKindName, string> = {
  [PlayNoticeKinds.Invite]: 'Rejoindre',
  [PlayNoticeKinds.Spectate]: 'Regarder',
  [PlayNoticeKinds.Rematch]: 'Accepter la revanche',
  [PlayNoticeKinds.Started]: 'Regarder',
  [PlayNoticeKinds.Finished]: 'Voir le résultat',
}

/**
 * Kinds of news that need no answer, only a look
 * @type {PlayNoticeKindName[]}
 */

export const PLAY_NOTICE_FOLLOWED: PlayNoticeKindName[] = [
  PlayNoticeKinds.Started,
  PlayNoticeKinds.Finished,
]

/**
 * Follow button of a table
 * @type {Record<string, string>}
 */

export const PLAY_FOLLOW_COPY = {
  follow: 'Suivre',
  unfollow: 'Suivi',
  followed: 'Tu suis cette partie, on te prévient du début et de la fin.',
  unfollowed: 'Tu ne suis plus cette partie.',
} as const

/**
 * Game name after « jouer » and after « partie »
 * @type {Record<PlayGameName, { play: string, watch: string }>}
 */

export const PLAY_INVITE_GAMES: Record<PlayGameName, { play: string; watch: string }> = {
  [PlayGames.Baccalaureat]: { play: 'au Baccalauréat', watch: 'de Baccalauréat' },
  [PlayGames.Golf]: { play: 'au Golf', watch: 'de Golf' },
  [PlayGames.Bomb]: { play: 'à Bomb Party', watch: 'de Bomb Party' },
  [PlayGames.Echo]: { play: 'à Écho', watch: 'd’Écho' },
  [PlayGames.Jumble]: { play: 'au Jumble', watch: 'de Jumble' },
  [PlayGames.Croquis]: { play: 'à Croquis', watch: 'de Croquis' },
  [PlayGames.Glitch]: { play: 'à Glitch', watch: 'de Glitch' },
  [PlayGames.Ludo]: { play: 'au Ludo', watch: 'de Ludo' },
  [PlayGames.Naval]: { play: 'à la Bataille navale', watch: 'de Bataille navale' },
}

/**
 * Invitation chime, any page, kept low and muffled
 * @type {Object}
 */

export const PLAY_INVITE_SOUND = {
  path: '/play/sons/effets/invitation.mp3',
  // Share of the Play level
  level: 0.45,
  // Highs cut above, in Hz
  lowpass: 1800,
} as const
