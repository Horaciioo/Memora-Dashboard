import type { IconName } from '@/declarations/ui/icons'

/**
 * One argument of a command
 * @typedef {Object} MarshaArgument
 * @property {string} name - Argument name
 * @property {boolean} required - Must be given
 * @property {string} description - What it takes
 */

export interface MarshaArgument {
  name: string
  required: boolean
  description: string
}

/**
 * One Marsha command
 * @typedef {Object} MarshaCommand
 * @property {string} key - Stable identifier
 * @property {string} name - Command as typed
 * @property {string} summary - What it does, one line
 * @property {MarshaArgument[]} args - Arguments, in order
 * @property {string[]} examples - Ready-made uses
 * @property {string[]} notes - What happens, limits and team rules
 * @property {boolean} [presence] - The member must be on the server
 */

export interface MarshaCommand {
  key: string
  name: string
  summary: string
  args: MarshaArgument[]
  examples: string[]
  notes: string[]
  presence?: boolean
}

/**
 * Commands grouped the way the team uses them
 * @typedef {Object} MarshaCategory
 * @property {string} key - Anchor
 * @property {string} label - Heading
 * @property {IconName} icon - Glyph
 * @property {string} lead - When to reach for it
 * @property {MarshaCommand[]} commands - Commands
 */

export interface MarshaCategory {
  key: string
  label: string
  icon: IconName
  lead: string
  commands: MarshaCommand[]
}

// Arguments met in almost every command
const MEMBER: MarshaArgument = {
  name: '@membre ou ID',
  required: true,
  description:
    'La mention du membre, ou son identifiant Discord (clic droit, Copier l’identifiant).',
}
const REASON: MarshaArgument = {
  name: 'raison',
  required: false,
  description: 'Optionnelle pour Marsha, obligatoire pour l’équipe : écris toujours la raison.',
}
const DURATION: MarshaArgument = {
  name: 'durée',
  required: true,
  description: 'Un nombre suivi de s, m, h, d ou w : 30m, 5h, 7d, 2w.',
}

/**
 * Every command of Marsha Bot, the prefix form the team types
 * @type {readonly MarshaCategory[]}
 */

export const MARSHA_CATEGORIES: readonly MarshaCategory[] = [
  {
    key: 'moderation',
    label: 'Modération',
    icon: 'sanctions',
    lead: 'Les commandes du quotidien. Chacune crée une infraction dans l’historique du membre.',
    commands: [
      {
        key: 'note',
        name: '!note',
        summary: 'Ajoute une note interne sur un membre, sans le sanctionner.',
        args: [MEMBER, { ...REASON, name: 'contenu de la note' }],
        examples: [
          '!note @Pseudo Signalé par 3 membres pour un comportement suspect, à surveiller',
        ],
        notes: [
          'La note n’est visible que par l’équipe de modération, jamais par le membre.',
          'Elle ne déclenche aucune sanction automatique.',
        ],
        presence: true,
      },
      {
        key: 'warn',
        name: '!warn',
        summary: 'Avertit officiellement un membre.',
        args: [MEMBER, REASON],
        examples: [
          '!warn @Pseudo Spam dans #général',
          '!warn 588054997481291816 League Of Legends',
        ],
        notes: [
          'L’avertissement est enregistré dans l’historique et le membre reçoit un message privé.',
          'Si des sanctions automatiques sont réglées (par exemple 3 avertissements = mute 1 h), elles se déclenchent seules.',
          'Tu ne peux pas avertir un membre dont le rôle est au-dessus du tien.',
        ],
        presence: true,
      },
      {
        key: 'tempmute',
        name: '!tempmute',
        summary: 'Rend un membre muet pour une durée donnée.',
        args: [MEMBER, DURATION, REASON],
        examples: [
          '!tempmute @Pseudo 30m Flood dans le chat',
          '!tempmute @Pseudo 2h Blagues déplacées après avertissement',
        ],
        notes: [
          'Utilise le timeout natif de Discord : le membre lit et écoute, mais n’écrit plus et ne parle plus.',
          'Durée maximale : 28 jours, limite de Discord.',
          'La levée est automatique à la fin de la durée.',
        ],
        presence: true,
      },
      {
        key: 'mute',
        name: '!mute',
        summary: 'Rend un membre muet sans limite de durée.',
        args: [MEMBER, REASON],
        examples: ['!mute @Pseudo Comportement inapproprié en vocal'],
        notes: [
          'Reste en place jusqu’à un !unmute. Préfère !tempmute quand le panel donne une durée.',
        ],
        presence: true,
      },
      {
        key: 'unmute',
        name: '!unmute',
        summary: 'Redonne la parole à un membre rendu muet.',
        args: [MEMBER, REASON],
        examples: ['!unmute @Pseudo Mute levé après discussion'],
        notes: ['L’infraction passe au statut « révoquée », la raison de la levée est ajoutée.'],
      },
      {
        key: 'kick',
        name: '!kick',
        summary: 'Expulse un membre du serveur.',
        args: [MEMBER, REASON],
        examples: ['!kick @Pseudo Comportement toxique après plusieurs avertissements'],
        notes: ['Plus léger qu’un bannissement : le membre peut revenir avec une invitation.'],
        presence: true,
      },
      {
        key: 'tempban',
        name: '!tempban',
        summary: 'Bannit un membre pour une durée donnée.',
        args: [MEMBER, DURATION, REASON],
        examples: [
          '!tempban @Pseudo 7d Récidives, période de recul',
          '!tempban @Pseudo 24h Spam pendant l’évènement',
        ],
        notes: ['Le membre est banni tout de suite, Marsha programme seul le débannissement.'],
      },
      {
        key: 'ban',
        name: '!ban',
        summary: 'Bannit définitivement un membre.',
        args: [MEMBER, REASON],
        examples: [
          '!ban @Pseudo Pub répétée malgré les avertissements',
          '!ban 691285937420173312 Compte secondaire pour contourner un ban',
        ],
        notes: [
          'Fonctionne aussi par identifiant pour un compte qui n’est pas sur le serveur, pratique contre les doubles comptes.',
          'Définitif jusqu’à un !unban : vérifie deux fois avant de valider.',
        ],
      },
      {
        key: 'unban',
        name: '!unban',
        summary: 'Débannit un utilisateur.',
        args: [{ ...MEMBER, name: 'ID' }, REASON],
        examples: ['!unban 691285937420173312 Appel accepté'],
        notes: [
          'Par identifiant uniquement : le membre n’est plus sur le serveur, on ne peut pas le mentionner.',
        ],
      },
      {
        key: 'multi-ban',
        name: '!multi-ban',
        summary: 'Bannit plusieurs comptes d’un coup.',
        args: [
          {
            name: 'IDs',
            required: true,
            description: 'Les identifiants séparés par des virgules, sans espace.',
          },
          REASON,
        ],
        examples: ['!multi-ban 691285937420173312,583274691847293952 Tentative de raid'],
        notes: [
          'Pensée pour les raids : Marsha gère seul les limites de Discord et affiche sa progression.',
          'Une confirmation est demandée : relis la liste avant.',
        ],
      },
      {
        key: 'clear',
        name: '!clear',
        summary: 'Supprime des messages en masse dans le salon.',
        args: [
          {
            name: '@membre, rôle ou texte',
            required: false,
            description: 'Filtre : les messages d’un membre, d’un rôle, ou contenant un texte.',
          },
          { name: 'nombre', required: false, description: 'Combien de messages, 100 au plus.' },
        ],
        examples: ['!clear @Pseudo', '!clear @Pseudo 20', '!clear 50'],
        notes: [
          'Sans nombre, Marsha supprime les 100 derniers messages du membre dans le salon.',
          'Discord refuse de supprimer des messages de plus de 14 jours.',
          'Archive d’abord avec !archive si les messages servent de preuve.',
        ],
      },
      {
        key: 'slowmode',
        name: '!slowmode',
        summary: 'Active le mode lent du salon.',
        args: [
          {
            name: 'durée',
            required: true,
            description: 'Temps entre deux messages, 0 pour couper. 6 h au plus.',
          },
        ],
        examples: ['!slowmode 30s', '!slowmode 0'],
        notes: ['À utiliser quand le salon s’emballe, avant de sanctionner à la chaîne.'],
      },
    ],
  },
  {
    key: 'history',
    label: 'Historique et infractions',
    icon: 'history',
    lead: 'Toujours regarder l’historique d’un membre avant d’appliquer un palier du panel.',
    commands: [
      {
        key: 'inf-user',
        name: '!inf user',
        summary: 'Affiche l’historique des sanctions d’un membre.',
        args: [MEMBER],
        examples: ['!inf user @Pseudo'],
        notes: ['Liste paginée : identifiant de l’infraction, type, modérateur, date et raison.'],
      },
      {
        key: 'notes-list',
        name: '!notes',
        summary: 'Affiche les notes internes d’un membre.',
        args: [MEMBER],
        examples: ['!notes @Pseudo'],
        notes: ['Chaque note garde son auteur et sa date.'],
      },
      {
        key: 'automod',
        name: '!auto-moderation',
        summary: 'Affiche les actions de l’auto-modération sur un membre.',
        args: [MEMBER],
        examples: ['!auto-moderation @Pseudo'],
        notes: [
          'Pratique pour comprendre pourquoi un membre a déjà été averti ou rendu muet sans intervention humaine.',
        ],
      },
      {
        key: 'infractions-get',
        name: '/infractions get',
        summary: 'Ouvre le détail d’une infraction.',
        args: [
          {
            name: 'ID de l’infraction',
            required: true,
            description: 'Lu dans l’historique du membre.',
          },
        ],
        examples: ['/infractions get 892154662751637554'],
        notes: [
          'Les boutons permettent de corriger la raison, la durée, ou d’ajouter une preuve (PNG, JPG, GIF, WEBP, MP4, MOV, WEBM, MP3, WAV, OGG, 25 Mo au plus).',
          'Chaque modification est tracée avec son auteur et sa date.',
        ],
      },
      {
        key: 'infractions-delete',
        name: '/infractions delete',
        summary: 'Supprime une infraction de l’historique.',
        args: [
          {
            name: 'ID de l’infraction',
            required: true,
            description: 'Lu dans l’historique du membre.',
          },
        ],
        examples: ['/infractions delete 892154662751637554'],
        notes: [
          'Irréversible. Réservé aux erreurs de membre ou aux appels acceptés, avec l’accord d’un Responsable.',
        ],
      },
      {
        key: 'mod-statistics',
        name: '/mod-statistics',
        summary: 'Statistiques de modération du serveur ou d’un modérateur.',
        args: [{ ...MEMBER, required: false, name: '@modérateur' }],
        examples: ['/mod-statistics', '/mod-statistics @Modérateur'],
        notes: ['Nombre d’infractions par type, modérateurs les plus actifs, tendances.'],
      },
    ],
  },
  {
    key: 'raid',
    label: 'Anti-raid',
    icon: 'alert',
    lead: 'Quand des dizaines de comptes arrivent et spamment en même temps. On agit vite, dans l’ordre.',
    commands: [
      {
        key: 'anti-raid-mode',
        name: '/anti-raid mode',
        summary: 'Active un mode anti-raid préparé à l’avance.',
        args: [
          {
            name: 'mode',
            required: true,
            description: 'Le nom du mode réglé sur le dashboard : Lockdown, Captcha, Quarantaine…',
          },
        ],
        examples: ['/anti-raid mode Lockdown'],
        notes: [
          'Lockdown : plus personne ne rejoint, les salons sont verrouillés, l’équipe est notifiée.',
          'Captcha : chaque nouvel arrivant passe une vérification.',
          'Quarantaine : les nouveaux reçoivent un rôle limité, un modérateur les valide un par un.',
        ],
      },
      {
        key: 'anti-raid-disable',
        name: '/anti-raid disable',
        summary: 'Désactive le mode anti-raid en cours.',
        args: [],
        examples: ['/anti-raid disable'],
        notes: ['Seulement une fois les raiders bannis et le serveur nettoyé.'],
      },
    ],
  },
  {
    key: 'information',
    label: 'Informations',
    icon: 'search',
    lead: 'Vérifier avant d’agir : âge du compte, anciens pseudos, rôles.',
    commands: [
      {
        key: 'user',
        name: '!user',
        summary: 'Affiche les informations Discord d’un utilisateur.',
        args: [MEMBER],
        examples: ['!user @Pseudo'],
        notes: [
          'Date de création du compte (utile contre les doubles comptes), date d’arrivée, rôles, et nombre d’infractions.',
        ],
      },
      {
        key: 'usernames',
        name: '!usernames',
        summary: 'Historique des pseudos Discord d’un utilisateur.',
        args: [MEMBER],
        examples: ['!usernames @Pseudo'],
        notes: ['Repère un membre qui change de nom pour contourner une sanction.'],
      },
      {
        key: 'nicknames',
        name: '!nicknames',
        summary: 'Historique des surnoms sur ce serveur.',
        args: [MEMBER],
        examples: ['!nicknames @Pseudo'],
        notes: ['!usernames lit le pseudo global Discord, !nicknames le surnom propre au serveur.'],
      },
      {
        key: 'server',
        name: '/server',
        summary: 'Informations du serveur : membres, salons, niveau de vérification.',
        args: [],
        examples: ['/server'],
        notes: ['Les réponses d’information sont privées, elles n’encombrent pas le salon.'],
      },
      {
        key: 'role',
        name: '/role',
        summary: 'Détail d’un rôle : position, membres, permissions.',
        args: [{ name: '@rôle', required: true, description: 'La mention du rôle.' }],
        examples: ['/role @Modérateur'],
        notes: [],
      },
      {
        key: 'members',
        name: '/members',
        summary: 'Liste les membres selon un filtre.',
        args: [
          {
            name: 'filtre',
            required: true,
            description: 'role @Rôle, bots, humans, online, boosters ou all.',
          },
        ],
        examples: ['/members role @Nouveau', '/members online'],
        notes: ['25 membres par page.'],
      },
      {
        key: 'help',
        name: '/help',
        summary: 'Menu d’aide interactif de Marsha.',
        args: [
          {
            name: 'commande',
            required: false,
            description: 'Le nom d’une commande pour son détail.',
          },
        ],
        examples: ['/help', '/help warn'],
        notes: [],
      },
    ],
  },
  {
    key: 'utility',
    label: 'Utilitaires',
    icon: 'settings',
    lead: 'Garder des preuves, gérer les vocaux, se rappeler de revenir sur un cas.',
    commands: [
      {
        key: 'remind',
        name: '!remind',
        summary: 'Crée un rappel pour toi, envoyé dans le salon.',
        args: [
          DURATION,
          { name: 'raison', required: true, description: 'Ce que tu dois vérifier.' },
        ],
        examples: ['!remind 1d Vérifier le comportement de @Pseudo après son tempban'],
        notes: ['Un an au plus. Combine-le avec une note pour suivre un cas.'],
      },
      {
        key: 'archive',
        name: '/archive',
        summary: 'Archive les derniers messages du salon dans un lien valable 30 jours.',
        args: [{ name: 'nombre', required: false, description: '100 par défaut et au plus.' }],
        examples: ['/archive', '/archive 50'],
        notes: ['À faire avant un !clear quand les messages servent de preuve.'],
      },
      {
        key: 'bring-all',
        name: '/bring-all',
        summary: 'Déplace tout un salon vocal vers un autre.',
        args: [
          { name: 'source', required: true, description: 'Salon vocal de départ.' },
          { name: 'destination', required: true, description: 'Salon vocal d’arrivée.' },
        ],
        examples: ['/bring-all #vocal-1 #vocal-2'],
        notes: ['Préviens avant de déplacer tout le monde.'],
      },
      {
        key: 'disconnect-all',
        name: '/disconnect-all',
        summary: 'Déconnecte tout le monde d’un salon vocal.',
        args: [{ name: 'salon', required: true, description: 'Salon vocal à vider.' }],
        examples: ['/disconnect-all #vocal-1'],
        notes: ['Immédiat et sans retour : raid vocal ou fin d’évènement seulement.'],
      },
      {
        key: 'report',
        name: '/report',
        summary: 'Commande des membres pour signaler un comportement.',
        args: [MEMBER, { ...REASON, required: true }],
        examples: ['/report @Pseudo Harcèlement dans #général'],
        notes: [
          'Les membres peuvent aussi faire clic droit sur un message, Applications, Report.',
          'Le signalement arrive dans le salon de l’équipe : vérifie, agis avec les commandes, puis marque-le résolu.',
        ],
      },
    ],
  },
]

/**
 * How to talk to the bot, read before the commands
 * @typedef {Object} MarshaRule
 * @property {string} title - Rule
 * @property {string} body - Detail, markdown
 */

export interface MarshaRule {
  title: string
  body: string
}

/**
 * Rules of the team for every Marsha command
 * @type {readonly MarshaRule[]}
 */

export const MARSHA_RULES: readonly MarshaRule[] = [
  {
    title: 'Raison et preuve, à chaque fois',
    body: 'Marsha accepte une sanction sans raison ni pièce jointe. **Pas l’équipe** : chaque action porte une raison lisible et, dès que possible, une capture ajoutée depuis le détail de l’infraction.',
  },
  {
    title: 'Lire une commande',
    body: '`< >` : l’argument est **requis**. `[ ]` : il est **optionnel**. Exemple : `!warn 588054997481291816 League Of Legends` avertit l’identifiant pour la raison « League Of Legends ».',
  },
  {
    title: 'Désigner un membre',
    body: 'Une mention `@Pseudo`, ou l’identifiant Discord. Pour le copier : Paramètres, Avancés, **Mode développeur**, puis clic droit sur le membre, Copier l’identifiant. L’identifiant est la seule façon de viser quelqu’un qui a quitté le serveur.',
  },
  {
    title: 'Écrire une durée',
    body: 'Un nombre et une unité collés : `30s`, `10m`, `5h`, `7d`, `2w`. Un mute temporaire ne dépasse pas **28 jours**, le mode lent **6 heures**.',
  },
  {
    title: 'La hiérarchie des rôles',
    body: 'Tu ne peux sanctionner que les membres dont le rôle est sous le tien, et Marsha seulement ceux sous le sien. Un « Cannot manage this member » vient presque toujours de là : remonte-le à ton Responsable.',
  },
  {
    title: 'Avertissements et strikes',
    body: 'Les **avertissements** viennent des modérateurs et restent. Les **strikes** viennent de l’auto-modération (système de chaleur) et expirent. Les deux peuvent déclencher des sanctions automatiques réglées sur le dashboard.',
  },
  {
    title: 'La vie d’une infraction',
    body: 'Active tant qu’elle court, **expirée** à la fin d’un mute ou d’un ban temporaire, **révoquée** après un `!unmute` ou un `!unban`. Rien ne disparaît sans `/infractions delete`.',
  },
  {
    title: 'Note ou sanction ?',
    body: 'Une **note** documente sans sanctionner : comportement à surveiller, avertissement oral, contexte pour les autres. Une **infraction** sanctionne et prévient le membre. Dans le doute, une note d’abord.',
  },
]

/**
 * Official resources of Marsha
 * @type {readonly { label: string, href: string }[]}
 */

export const MARSHA_RESOURCES: readonly { label: string; href: string }[] = [
  { label: 'Documentation officielle', href: 'https://docs.marsha.app' },
  { label: 'Dashboard de Marsha', href: 'https://dash.marsha.app' },
]
