import type { FieldDefinition } from '@/types/forms'
import type { PlayConfigView } from '@/types/play'
import { PlayGames } from '@/utils/constants/play'

/**
 * Bounds of the settings the admins steer
 * @type {Record<string, number>}
 */

export const PLAY_CONFIG_LIMITS = {
  featuredMax: 5,
  boostMax: 200,
  announcementMax: 160,
}

/**
 * Settings before any admin touched them
 * @type {PlayConfigView}
 */

export const PLAY_CONFIG_DEFAULTS: PlayConfigView = {
  featuredGames: [PlayGames.StopGo, PlayGames.Concordat],
  featuredBoostOn: true,
  featuredBoostPercent: 30,
  featuredBoostUntil: null,
  globalBoostOn: false,
  globalBoostPercent: 20,
  globalBoostUntil: null,
  tablesPaused: false,
  announcement: null,
  announcementOn: false,
}

/**
 * Copy of the admin pages for games, boosts and settings
 * @type {Record<string, string>}
 */

export const PLAY_CONFIG_COPY = {
  titleGames: 'Jeux',
  titleBoosts: 'Boosts d’XP',
  titleSettings: 'Réglages',
  tabGames: 'Jeux',
  tabBoosts: 'Boosts',
  tabSettings: 'Réglages',
  // Games page
  gamesIntro:
    'Active ou coupe un jeu pour tout le monde, et choisis ceux qui passent en vedette sur l’accueil.',
  gameOn: 'Ouvert',
  gameOff: 'Fermé',
  gameSoon: 'Pas encore sorti',
  gameToggle: 'Ouvrir {game} aux joueurs',
  featureOn: 'En vedette',
  featureOff: 'Mettre en vedette',
  featureFull: 'Cinq jeux en vedette au maximum.',
  featureCount: '{count} sur {max} en vedette',
  gameDone: '{game} est ouvert.',
  gameClosed: '{game} est fermé.',
  featuredDone: 'Vedettes mises à jour.',
  // Boosts page
  boostsIntro:
    'Offre de l’XP en plus sur les parties terminées, sur les jeux en vedette ou sur tous.',
  boostFeatured: 'Boost des jeux en vedette',
  boostFeaturedNote: 'Pour les jeux choisis sur la page Jeux.',
  boostGlobal: 'Boost sur tous les jeux',
  boostGlobalNote: 'Pour chaque partie, quel que soit le jeu.',
  boostLive: 'Actif',
  boostIdle: 'Éteint',
  boostEnded: 'Terminé',
  boostPercent: 'Bonus d’XP en %',
  boostPercentHint: 'De 1 à 200. Un joueur gagne 30 % de plus avec 30.',
  boostUntil: 'Jusqu’au',
  boostUntilHint: 'Vide pour ne pas fixer de fin.',
  boostEdit: 'Régler',
  boostOpen: 'Sans fin',
  boostEndsOn: 'Jusqu’au {date}',
  boostSaved: 'Boost enregistré.',
  boostBadge: '+{percent} % d’XP',
  boostStack: 'Les deux boosts se cumulent sur un jeu en vedette.',
  // Settings page
  settingsIntro: 'Commandes de la salle de jeu.',
  tablesPaused: 'Pause des nouvelles parties',
  tablesPausedNote: 'Personne ne peut ouvrir de table. Les parties en cours continuent.',
  announcement: 'Annonce sur l’accueil',
  announcementNote: 'Un message affiché en haut de l’accueil de Play.',
  announcementField: 'Message',
  announcementEmpty: 'Aucun message',
  announcementEdit: 'Écrire',
  settingsSaved: 'Réglage enregistré.',
  paused: 'Les nouvelles parties sont en pause pour le moment.',
  // Sidebar
  sidebarTitle: 'Administration',
  sidebarBack: 'Retour à Memora Play',
  // Hub badge
  vedette: 'Vedette',
} as const

/**
 * Fields of the boost drawer
 * @type {FieldDefinition[]}
 */

export const PLAY_BOOST_FIELDS: FieldDefinition[] = [
  {
    name: 'percent',
    kind: 'number',
    label: PLAY_CONFIG_COPY.boostPercent,
    hint: PLAY_CONFIG_COPY.boostPercentHint,
    required: true,
    min: 1,
    max: PLAY_CONFIG_LIMITS.boostMax,
  },
  {
    name: 'until',
    kind: 'datetime',
    label: PLAY_CONFIG_COPY.boostUntil,
    hint: PLAY_CONFIG_COPY.boostUntilHint,
  },
]

/**
 * Field of the announcement drawer
 * @type {FieldDefinition[]}
 */

export const PLAY_ANNOUNCEMENT_FIELDS: FieldDefinition[] = [
  {
    name: 'announcement',
    kind: 'textarea',
    label: PLAY_CONFIG_COPY.announcementField,
    maxLength: PLAY_CONFIG_LIMITS.announcementMax,
  },
]
