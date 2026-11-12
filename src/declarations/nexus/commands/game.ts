import type { ArgSpec } from '@/core/lib/nexus/args'
import { defineCommand } from '@/declarations/nexus/commands/types'
import type { CommandInput, NexusCommand } from '@/declarations/nexus/commands/types'

// Declaration without its family
type GameInput = Omit<CommandInput, 'category'>

const GAMES = [
  'baccalaureat',
  'golf',
  'bomb',
  'ludo',
  'naval',
  'jumble',
  'echo',
  'glitch',
  'suspens',
  'croquis',
]

const GAME_ARG: ArgSpec = { name: 'game', type: 'id', required: true }

const PLAYER_ARG: ArgSpec = { name: 'player', type: 'id', required: true }

const ID_ARG: ArgSpec = { name: 'id', type: 'id', required: true }

const TARGET_ARG: ArgSpec = { name: 'game', type: 'string', max: 20 }

// A change shown before it runs
const change = (input: GameInput): NexusCommand =>
  defineCommand({ category: 'game', confirm: 'preview', audit: 'full', risk: 'medium', ...input })

// A read of the game module
const read = (input: GameInput): NexusCommand => defineCommand({ category: 'game', ...input })

/**
 * Game commands
 * @type {NexusCommand[]}
 */

export const GAME_COMMANDS: NexusCommand[] = [
  read({
    id: 'game.list',
    syntax: '$game.list --type=<jeu> --status=<statut> --player=<id> --page=<n>',
    description: 'Lister les parties, toutes visibilités',
    handler: 'game.list',
    args: [
      { name: 'type', type: 'enum', values: GAMES },
      {
        name: 'status',
        type: 'enum',
        values: ['lobby', 'running', 'paused', 'finished', 'abandoned'],
      },
      { name: 'player', type: 'id' },
      { name: 'page', type: 'integer', min: 1, max: 10000, fallback: 1 },
      { name: 'take', type: 'integer', min: 1, max: 200 },
    ],
    output: 'table',
  }),
  read({
    id: 'game.get',
    syntax: '$game.get --game=<partie>',
    description: 'Lire une partie',
    handler: 'game.get',
    args: [GAME_ARG],
    output: 'record',
  }),
  read({
    id: 'game.players',
    syntax: '$game.players --game=<partie>',
    description: 'Sièges, scores et droits',
    handler: 'game.players',
    args: [GAME_ARG],
    output: 'table',
  }),
  read({
    id: 'game.state',
    syntax: '$game.state --game=<partie> --reveal',
    description: 'État côté serveur, caché avec --reveal',
    handler: 'game.state',
    level: 'diagnostic',
    args: [GAME_ARG, { name: 'reveal', type: 'boolean' }],
    output: 'tree',
  }),
  read({
    id: 'game.events',
    syntax: '$game.events --game=<partie>',
    description: 'Messages, invitations, erreurs et surcharges',
    handler: 'game.events',
    level: 'diagnostic',
    args: [GAME_ARG],
    output: 'timeline',
  }),
  read({
    id: 'game.history',
    syntax: '$game.history --game=<partie> --page=<n>',
    description: 'Tours de la partie',
    handler: 'game.history',
    level: 'diagnostic',
    args: [GAME_ARG, { name: 'page', type: 'integer', min: 1, max: 10000, fallback: 1 }],
    output: 'table',
  }),
  change({
    id: 'game.create',
    syntax: '$game.create --type=<jeu> --private',
    description: 'Créer une partie, le propriétaire en hôte',
    handler: 'game.create',
    level: 'write',
    args: [
      { name: 'type', type: 'enum', values: GAMES, required: true },
      { name: 'private', type: 'boolean' },
    ],
    output: 'record',
  }),
  change({
    id: 'game.start',
    syntax: '$game.start --game=<partie>',
    description: 'Lancer une partie sans passer par l’hôte',
    handler: 'game.start',
    level: 'write',
    args: [GAME_ARG],
    output: 'record',
  }),
  change({
    id: 'game.pause',
    syntax: '$game.pause --game=<partie> --reason=<texte>',
    description: 'Suspendre une partie en cours',
    handler: 'game.pause',
    level: 'write',
    args: [GAME_ARG, { name: 'reason', type: 'string', max: 200 }],
    output: 'record',
  }),
  change({
    id: 'game.resume',
    syntax: '$game.resume --game=<partie>',
    description: 'Reprendre une partie, échéances décalées',
    handler: 'game.resume',
    level: 'write',
    args: [GAME_ARG],
    output: 'record',
  }),
  change({
    id: 'game.stop',
    syntax: '$game.stop --game=<partie> --outcome=abandon|settle --confirm=<partie>',
    description: 'Arrêter une partie, avec ou sans XP',
    handler: 'game.stop',
    level: 'dangerous',
    args: [
      GAME_ARG,
      { name: 'outcome', type: 'enum', values: ['abandon', 'settle'], fallback: 'abandon' },
    ],
    confirm: 'double',
    confirmArg: 'game',
    risk: 'high',
    output: 'record',
  }),
  change({
    id: 'game.delete',
    syntax: '$game.delete --game=<partie> --confirm=<partie>',
    description: 'Supprimer une partie terminée',
    handler: 'game.delete',
    level: 'dangerous',
    args: [GAME_ARG],
    confirm: 'double',
    confirmArg: 'game',
    risk: 'critical',
    output: 'record',
  }),
  change({
    id: 'game.override.kick',
    syntax: '$game.override.kick --game=<partie> --player=<id>',
    description: 'Retirer un joueur d’une partie',
    handler: 'game.overrideKick',
    level: 'write',
    args: [GAME_ARG, PLAYER_ARG],
    output: 'record',
  }),
  change({
    id: 'game.override.score',
    syntax: '$game.override.score --game=<partie> --player=<id> --score=<n>',
    description: 'Corriger le score d’un siège',
    handler: 'game.overrideScore',
    level: 'write',
    args: [
      GAME_ARG,
      PLAYER_ARG,
      { name: 'score', type: 'integer', min: -100000, max: 100000, required: true },
    ],
    output: 'diff',
  }),
  read({
    id: 'game.override.list',
    syntax: '$game.override.list --game=<partie>',
    description: 'Surcharges faites sur une partie',
    handler: 'game.overrideList',
    args: [GAME_ARG],
    output: 'table',
  }),
  change({
    id: 'game.override.clear',
    syntax: '$game.override.clear --game=<partie> --id=<audit> --confirm=<partie>',
    description: 'Annuler les surcharges encore réversibles',
    handler: 'game.overrideClear',
    level: 'dangerous',
    args: [GAME_ARG, { name: 'id', type: 'id' }],
    confirm: 'double',
    confirmArg: 'game',
    risk: 'high',
    output: 'table',
  }),
  read({
    id: 'game.player',
    syntax: '$game.player --id=<joueur>',
    description: 'Profil Play et statistiques',
    handler: 'game.player',
    args: [ID_ARG],
    output: 'tree',
  }),
  change({
    id: 'game.player.xp',
    syntax: '$game.player.xp --id=<joueur> --delta=<n> --game=<jeu|global>',
    description: 'Donner ou retirer de l’XP',
    handler: 'game.playerXp',
    level: 'write',
    args: [
      ID_ARG,
      { name: 'delta', type: 'integer', min: -100000, max: 100000, required: true },
      TARGET_ARG,
    ],
    output: 'tree',
  }),
  change({
    id: 'game.player.level',
    syntax: '$game.player.level --id=<joueur> --level=<n> --game=<jeu|global>',
    description: 'Placer un joueur à un niveau',
    handler: 'game.playerLevel',
    level: 'write',
    args: [
      ID_ARG,
      { name: 'level', type: 'integer', min: 1, max: 1000, required: true },
      TARGET_ARG,
    ],
    output: 'tree',
  }),
  change({
    id: 'game.player.ban',
    syntax: '$game.player.ban --id=<joueur> --reason=<texte> --lift',
    description: 'Bannir ou rétablir un joueur de Play',
    handler: 'game.playerBan',
    level: 'dangerous',
    args: [ID_ARG, { name: 'reason', type: 'string', max: 200 }, { name: 'lift', type: 'boolean' }],
    confirm: 'double',
    confirmArg: 'id',
    risk: 'high',
    output: 'tree',
  }),
  read({
    id: 'game.tournament',
    syntax: '$game.tournament --id=<tournoi>',
    description: 'Lister ou lire les tournois',
    handler: 'game.tournament',
    args: [
      { name: 'id', type: 'id' },
      { name: 'take', type: 'integer', min: 1, max: 200 },
    ],
    output: 'tree',
  }),
  read({
    id: 'game.group',
    syntax: '$game.group --id=<groupe>',
    description: 'Lister ou lire les groupes',
    handler: 'game.group',
    args: [
      { name: 'id', type: 'id' },
      { name: 'take', type: 'integer', min: 1, max: 200 },
    ],
    output: 'tree',
  }),
]
