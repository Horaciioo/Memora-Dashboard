import { PLAY_GAMES } from '@/declarations/play/games'
import type { FeatureDefinition } from '@/declarations/features/types'

/**
 * Key of the feature behind one game
 * @param {string} slug - Game URL segment
 * @return {string} - Feature key
 */

export const gameFeatureKey = (slug: string): string => `play.games.${slug}`

/**
 * One feature per game, from the catalogue
 * @type {FeatureDefinition[]}
 */

const GAME_FEATURES: FeatureDefinition[] = PLAY_GAMES.list.map((game) => ({
  key: gameFeatureKey(game.slug),
  label: game.label,
  description: game.tagline,
  kind: 'game',
  parent: 'play',
  group: 'games',
  routes: [`/play/${game.slug}`],
}))

/**
 * Memora Play: the hub, its games, sub-pages and systems
 * @type {FeatureDefinition[]}
 */

export const PLAY_FEATURES: FeatureDefinition[] = [
  {
    key: 'play',
    label: 'Memora Play',
    description: 'Tout l’espace de jeux, ses salles et ses classements.',
    kind: 'page',
    section: 'play',
    routes: ['/play'],
    api: ['/api/play'],
  },
  ...GAME_FEATURES,
  {
    key: 'play.lounge',
    label: 'Salon',
    description: 'Les parties publiques ouvertes.',
    kind: 'subpage',
    parent: 'play',
    group: 'tables',
    routes: ['/play/lounge'],
  },
  {
    key: 'play.invites',
    label: 'Invitations et codes',
    description: 'Inviter un joueur ou rejoindre avec un code.',
    kind: 'system',
    parent: 'play',
    group: 'tables',
    routes: ['/play/join'],
    api: ['/api/play/invitations', '/api/play/sessions/*/invite', '/api/play/join-code'],
  },
  {
    key: 'play.spectators',
    label: 'Spectateurs',
    description: 'Suivre une partie sans y jouer.',
    kind: 'system',
    parent: 'play',
    group: 'tables',
    api: ['/api/play/sessions/*/follow'],
  },
  {
    key: 'play.rematch',
    label: 'Revanche',
    description: 'Relancer la même partie.',
    kind: 'system',
    parent: 'play',
    group: 'tables',
    api: ['/api/play/sessions/*/rematch'],
  },
  {
    key: 'play.tournaments',
    label: 'Tournois',
    description: 'Enchaîner plusieurs manches dans un tournoi.',
    kind: 'system',
    parent: 'play',
    group: 'tables',
  },
  {
    key: 'play.bots',
    label: 'Bots',
    description: 'Ajouter des bots à une partie.',
    kind: 'system',
    parent: 'play',
    group: 'tables',
    api: ['/api/play/sessions/*/bots'],
  },
  {
    key: 'play.bots.golf',
    label: 'Bots du Golf 3D',
    description: 'Les bots ne jouent plus au Golf 3D, les autres jeux les gardent.',
    kind: 'system',
    parent: 'play.bots',
  },
  {
    key: 'play.group',
    label: 'Groupes',
    description: 'Les groupes de joueurs, leur chat et leurs propositions.',
    kind: 'subpage',
    parent: 'play',
    group: 'social',
    routes: ['/play/group'],
    api: ['/api/play/group'],
  },
  {
    key: 'play.group.chat',
    label: 'Chat de groupe',
    description: 'Les messages échangés dans un groupe.',
    kind: 'system',
    parent: 'play.group',
    api: ['/api/play/group/*/messages'],
  },
  {
    key: 'play.feed',
    label: 'Fil d’actualité',
    description: 'Ce que font les joueurs que tu suis.',
    kind: 'subpage',
    parent: 'play',
    group: 'social',
    routes: ['/play/feed'],
  },
  {
    key: 'play.chat',
    label: 'Chat de partie',
    description: 'Le chat dans une salle de jeu.',
    kind: 'system',
    parent: 'play',
    group: 'social',
    api: ['/api/play/sessions/*/messages'],
  },
  {
    key: 'play.notices',
    label: 'Bulles du dock',
    description: 'Les invitations qui s’affichent en bas de l’écran.',
    kind: 'system',
    parent: 'play',
    group: 'social',
    api: ['/api/play/notices'],
  },
  {
    key: 'play.stats',
    label: 'Statistiques',
    description: 'Les statistiques et la progression de chaque joueur.',
    kind: 'subpage',
    parent: 'play',
    group: 'progress',
    routes: ['/play/stats', '/play/players'],
    api: ['/api/play/profile'],
  },
  {
    key: 'play.history',
    label: 'Historique',
    description: 'Les parties passées.',
    kind: 'subpage',
    parent: 'play',
    group: 'progress',
    routes: ['/play/history'],
  },
  {
    key: 'play.trophies',
    label: 'Trophées',
    description: 'Les trophées à gagner.',
    kind: 'subpage',
    parent: 'play',
    group: 'progress',
    routes: ['/play/trophies'],
  },
  {
    key: 'play.ranking',
    label: 'Classements',
    description: 'Les classements par jeu et global.',
    kind: 'subpage',
    parent: 'play',
    group: 'progress',
    routes: ['/play/ranking'],
    api: ['/api/play/ranking'],
  },
  {
    key: 'play.xp',
    label: 'Système d’XP',
    description: 'Les parties ne rapportent plus d’XP, les niveaux n’avancent plus.',
    kind: 'system',
    parent: 'play',
    group: 'progress',
  },
]
