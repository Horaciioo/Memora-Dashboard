import type { BranchNode, GuideStep, ReplicaRun } from '@/declarations/academy/curriculum/types'
import {
  author,
  discordStage,
  guide,
  message,
  say,
  timeline,
  write,
} from '@/declarations/replicas/discordKit'
import type { Beat } from '@/declarations/replicas/discordKit'
import type { DiscordAuthor, DiscordScene, DiscordSceneStep } from '@/types/replicas'

// Pink of the ticket embeds and of the on-duty role
const TICKET_PINK = '#f47fb0'

// Cast of the support simulations
const CAST = {
  bot: author('lumi-tickets', { name: 'Lumi Tickets', isApp: true, glyph: 'ticket' }),
  modo: author('modo', { name: 'MODO', glyph: 'shield', colour: TICKET_PINK }),
  responsable: author('responsable', { name: 'Responsable', glyph: 'lead', colour: '#ea580c' }),
  delta: author('delta', { name: 'Delta', colour: '#3ba55c' }),
  foxtrot: author('foxtrot', { name: 'Foxtrot', colour: '#f0b232' }),
}

/**
 * The three steps of a ticket, as the guide tells them
 * @type {GuideStep[]}
 */

export const SUPPORT_GUIDE_STEPS: GuideStep[] = [
  {
    title: 'L’engagement',
    tips: [
      'Le premier message donne le ton et installe le cadre.',
      'Toujours une formule polie, adaptée si la demande est déjà claire.',
      'Disponible, clair et courtois : ni robot, ni copain.',
    ],
  },
  {
    title: 'La prise en charge',
    tips: [
      'Traiter rapidement, avec des réponses claires et structurées.',
      'Un ton humain, professionnel mais accessible.',
      'Suivre jusqu’au bout, ou transmettre aux bonnes personnes en prévenant le membre.',
    ],
  },
  {
    title: 'La fermeture du ticket',
    tips: [
      'Demander explicitement si tout est bon.',
      'Conclure par une formule simple et cordiale.',
      'Jamais de fermeture sans validation du membre.',
    ],
  },
]

/**
 * Server decor around one ticket
 * @return {DiscordScene['initial']} - Decor
 */

const ticketDecor = (): DiscordScene['initial'] =>
  discordStage({
    server: 'Lumi',
    categories: [
      { name: 'Informations', channels: [], skeletons: 2 },
      {
        name: 'Support',
        channels: [{ name: 'créer-un-ticket', kind: 'text', lit: true }],
      },
      { name: 'Tickets', channels: [], skeletons: 1 },
      { name: 'Communauté', channels: [], skeletons: 3 },
    ],
    memberGroups: [
      { role: 'Admin', members: [], skeletons: 1 },
      { role: 'Modérateur Discord', members: [], skeletons: 3 },
      { role: 'Membres', members: [], skeletons: 6 },
    ],
    roles: { 'en-service': { name: 'En service', colour: TICKET_PINK } },
  })

/**
 * A member opens a ticket: welcome embeds, then the call to the on-duty team
 * @param {DiscordAuthor} member - Who opens it
 * @param {string} channel - Ticket channel
 * @param {string} ticketId - Fictitious ticket number
 * @return {Beat[]} - Beats
 */

const ticketOpening = (member: DiscordAuthor, channel: string, ticketId: string): Beat[] => [
  [400, { kind: 'open', category: 'Tickets', channel: { name: channel, kind: 'text', lit: true } }],
  [
    900,
    {
      kind: 'message',
      message: message(`${channel}-welcome`, CAST.bot, '21:02', undefined, {
        embeds: [
          { accent: TICKET_PINK, banner: true },
          {
            accent: TICKET_PINK,
            title: 'Bienvenue dans ton Ticket',
            description:
              'Réponds aux questions ci-dessous pour qu’on puisse t’aider de manière claire et rapide. Prends ton temps et lis bien chaque étape pour que l’assistance soit précise.',
            thumbnail: 'ticket',
            footer: `ID du Ticket : ${ticketId}`,
          },
        ],
        buttons: [{ label: 'Fermer mon ticket', style: 'danger', glyph: 'lock' }],
      }),
    },
  ],
  // The member answers the bot's questions
  [1100, { kind: 'typing', author: member, on: true }],
  [1500, { kind: 'typing', author: member, on: false }],
  [700, { kind: 'typing', author: member, on: true }],
  [1500, { kind: 'typing', author: member, on: false }],
  [
    600,
    {
      kind: 'message',
      message: message(`${channel}-call`, CAST.bot, '21:03', '<@&en-service>', {
        embeds: [
          {
            accent: TICKET_PINK,
            title: 'Je dois contacter l’équipe',
            description:
              'En attendant notre intervention, donne un **maximum de détails** sur ta demande et ajoute des fichiers si nécessaire pour qu’on puisse t’aider au mieux.',
          },
        ],
      }),
    },
  ],
]

// Delta's request, the same in every run
const DELTA_REQUEST: Beat[] = say(
  message(
    'delta-request',
    CAST.delta,
    '21:04',
    'Quelqu’un m’insulte en MP depuis la fin du live d’hier soir. J’ai des captures.'
  ),
  { before: 1200, typing: 2600 }
)

/**
 * One Delta run: the shared opening, then the moderator's handling
 * @param {Beat[]} handling - The moderator's part
 * @return {DiscordScene} - Scene
 */

const deltaRun = (handling: Beat[]): DiscordScene => ({
  initial: ticketDecor(),
  steps: timeline([
    ...ticketOpening(CAST.delta, 'ticket-delta', '4821'),
    ...DELTA_REQUEST,
    ...handling,
  ]),
})

/**
 * Delta, three handlings of the same ticket: a terrible one, a bad one, a good one. Declared in
 * the order shown, the good one never last
 * @type {ReplicaRun[]}
 */

export const DELTA_RUNS: ReplicaRun[] = [
  {
    key: 'delta-mauvais',
    correct: false,
    feedback:
      'L’entrée en matière est polie, mais la suite dérape : « Votre requête est en cours de traitement » sonne comme un robot, et le ticket est fermé sans que Delta confirme qu’il n’a plus de question.',
    scene: deltaRun([
      guide(0, 600),
      ...write(message('d1-1', CAST.modo, '21:05', 'Bonjour, comment puis-je t’aider ?')),
      ...say(message('d1-2', CAST.delta, '21:05', 'Bah je viens de l’écrire au-dessus…'), {
        typing: 1400,
      }),
      guide(1, 600),
      ...write(message('d1-3', CAST.modo, '21:06', 'Votre requête est en cours de traitement.')),
      ...say(message('d1-4', CAST.delta, '21:06', 'Ok… et du coup il se passe quoi ?'), {
        typing: 1400,
      }),
      guide(2, 600),
      ...write(message('d1-5', CAST.modo, '21:07', 'C’est transmis. Je ferme le ticket.')),
    ]),
  },
  {
    key: 'delta-bon',
    correct: true,
    feedback:
      'C’est la bonne prise en charge : un engagement adapté à une demande déjà claire, une question précise, la transmission annoncée au membre, puis une fermeture seulement après sa confirmation.',
    scene: deltaRun([
      guide(0, 600),
      ...write(message('d2-1', CAST.modo, '21:05', 'Bonjour. Je m’occupe de ton report de suite.')),
      guide(1, 600),
      ...write(
        message(
          'd2-2',
          CAST.modo,
          '21:05',
          'Bien noté, je prends ta demande en charge. Peux-tu préciser le pseudo exact de la personne concernée ?'
        )
      ),
      ...say(
        message('d2-3', CAST.delta, '21:06', 'C’est raid_noir_01, je t’envoie les captures.'),
        { typing: 1800 }
      ),
      ...write(
        message(
          'd2-4',
          CAST.modo,
          '21:07',
          'Merci. Ta demande va être transmise à l’administration, tu auras une réponse rapidement.'
        )
      ),
      ...write(
        message(
          'd2-5',
          CAST.modo,
          '21:14',
          'C’est réglé, le compte a été banni du serveur. Tout est bon pour toi ? Tu n’as plus de question ?'
        ),
        2200
      ),
      guide(2, 300),
      ...say(message('d2-6', CAST.delta, '21:15', 'Non c’est parfait, merci beaucoup !'), {
        typing: 1400,
      }),
      ...write(message('d2-7', CAST.modo, '21:15', 'D’accord, je te souhaite une bonne soirée.')),
    ]),
  },
  {
    key: 'delta-terrible',
    correct: false,
    feedback:
      'C’est la pire des trois : « Ouais ? Tu veux quoi ? » décrédibilise tout de suite, la demande n’est pas traitée, et « Ok bah je ferme, tchao. » donne l’impression de se débarrasser du membre.',
    scene: deltaRun([
      guide(0, 600),
      ...write(message('d3-1', CAST.modo, '21:05', 'Ouais ? Tu veux quoi ?')),
      ...say(
        message('d3-2', CAST.delta, '21:05', 'Bah je viens de te le dire, on m’insulte en MP.'),
        {
          typing: 1600,
        }
      ),
      guide(1, 600),
      ...write(message('d3-3', CAST.modo, '21:06', 'Bloque-le et c’est réglé.')),
      ...say(
        message('d3-4', CAST.delta, '21:06', 'Il revient avec d’autres comptes à chaque fois…'),
        { typing: 1800 }
      ),
      guide(2, 600),
      ...write(message('d3-5', CAST.modo, '21:07', 'Ok bah je ferme, tchao.')),
    ]),
  },
]

/**
 * Foxtrot's ticket up to the first choice
 * @type {DiscordScene}
 */

export const FOXTROT_OPENING: DiscordScene = {
  initial: ticketDecor(),
  steps: timeline([
    ...ticketOpening(CAST.foxtrot, 'ticket-foxtrot', '5107'),
    ...say(
      message(
        'f-1',
        CAST.foxtrot,
        '21:04',
        'Wesh. J’ai gagné le concours de la semaine dernière et j’ai toujours rien reçu.'
      ),
      { before: 1200, typing: 2400 }
    ),
    guide(0, 600),
    ...write(
      message(
        'f-2',
        CAST.modo,
        '21:05',
        'Bonjour Foxtrot, et félicitations pour ton gain ! Je m’occupe de ta demande.'
      )
    ),
    guide(1, 600),
    ...write(
      message(
        'f-3',
        CAST.modo,
        '21:05',
        'Bien noté. Les lots partent sous deux semaines, je vérifie où en est le tien.'
      )
    ),
    ...say(
      message(
        'f-4',
        CAST.foxtrot,
        '21:06',
        'Deux semaines ?? Sérieux. Bon, dis-moi plutôt où se passe le prochain tournage, je passe récupérer mon lot là-bas.'
      ),
      { typing: 2600 }
    ),
    ...write(
      message(
        'f-5',
        CAST.modo,
        '21:06',
        'Ce n’est pas possible : le lieu des tournages n’est jamais communiqué. Ton lot t’est envoyé chez toi.'
      )
    ),
    ...say(
      message(
        'f-6',
        CAST.foxtrot,
        '21:07',
        'Allez fais pas le relou, juste l’adresse et je te laisse tranquille. C’est MON lot.'
      ),
      { typing: 2200 }
    ),
  ]),
}

/**
 * Steps of a node, timed from zero
 * @param {Beat[]} beats - Beats
 * @return {DiscordSceneStep[]} - Steps
 */

const node = (beats: Beat[]): DiscordSceneStep[] => timeline(beats)

/**
 * Foxtrot's choice game: at each turn, keep going or hand over to a Responsable
 * @type {BranchNode[]}
 */

export const FOXTROT_NODES: BranchNode[] = [
  {
    key: 'insiste',
    steps: [],
    prompt: 'Foxtrot insiste pour obtenir le lieu du tournage. Que fais-tu ?',
    options: [
      { key: 'continuer', label: 'Continuer', next: 'insulte' },
      { key: 'passer', label: 'Passer la main à un Responsable', next: 'fin-trop-tot' },
    ],
  },
  {
    key: 'fin-trop-tot',
    steps: node([
      ...write(
        message(
          'f-early',
          CAST.modo,
          '21:07',
          'Je transmets ta demande à un responsable, il va prendre le relais.'
        )
      ),
    ]),
    ending: {
      good: false,
      title: 'Un peu tôt',
      body: 'Foxtrot insiste, mais reste dans le cadre et ne demande pas de responsable. Un refus clair et poli suffit encore : tu sais traiter cette demande, et la passer maintenant occupe un Responsable pour rien.',
    },
  },
  {
    key: 'insulte',
    steps: node([
      ...write(
        message(
          'f-7',
          CAST.modo,
          '21:07',
          'Je comprends ton impatience, mais je ne peux pas te donner cette information. Je peux en revanche suivre l’envoi de ton lot.'
        )
      ),
      ...say(
        message(
          'f-8',
          CAST.foxtrot,
          '21:08',
          'Toute façon, un pigeon comme toi n’a pas ce genre d’infos. Passe moi un de ses gars avec qui il travaille. toi j’te veux plus'
        ),
        { typing: 2800 }
      ),
    ]),
    prompt: 'Foxtrot t’insulte et demande quelqu’un d’autre. Que fais-tu ?',
    options: [
      { key: 'continuer', label: 'Continuer', next: 'redemande' },
      { key: 'passer', label: 'Passer la main à un Responsable', next: 'relais' },
    ],
  },
  {
    key: 'redemande',
    steps: node([
      ...write(message('f-9', CAST.modo, '21:08', 'Je reste ton interlocuteur pour ce ticket.')),
      ...say(
        message('f-10', CAST.foxtrot, '21:09', 'T’es sourd ? Je veux un responsable, maintenant.'),
        { typing: 1600 }
      ),
    ]),
    prompt: 'Foxtrot redemande un responsable. Que fais-tu ?',
    options: [
      { key: 'continuer', label: 'Continuer', next: 'fin-fermeture' },
      { key: 'passer', label: 'Passer la main à un Responsable', next: 'fin-tard' },
    ],
  },
  {
    key: 'fin-fermeture',
    steps: node([
      guide(2, 400),
      ...write(message('f-11', CAST.modo, '21:09', 'Ok bah je ferme, tchao.')),
    ]),
    ending: {
      good: false,
      title: 'À ne jamais faire',
      body: 'Le droit du membre à demander l’intervention d’un responsable est **inconditionnel**, même quand il est désagréable. Et aucune fermeture ne se fait sans validation explicite.',
    },
  },
  {
    key: 'fin-tard',
    steps: node([
      ...write(
        message(
          'f-12',
          CAST.modo,
          '21:09',
          'Je comprends. Je transmets ta demande à un responsable, il va prendre le relais ici.'
        )
      ),
    ]),
    ending: {
      good: false,
      title: 'Bien, mais trop tard',
      body: 'Tu as fini par passer la main, mais Foxtrot avait déjà demandé quelqu’un d’autre. Ce droit est **inconditionnel** : dès sa première demande, on transmet, sans négocier.',
    },
  },
  {
    key: 'relais',
    steps: node([
      ...write(
        message(
          'f-13',
          CAST.modo,
          '21:08',
          'Je comprends. Je transmets ta demande à un responsable, il va prendre le relais ici.'
        )
      ),
      ...say(
        message(
          'f-14',
          CAST.responsable,
          '21:10',
          'Bonjour Foxtrot, je prends le relais. Ton lot part cette semaine, et le lieu des tournages reste confidentiel pour tout le monde. Par contre, les insultes envers l’équipe ne passent pas ici.'
        ),
        { before: 1600, typing: 3000 }
      ),
      ...say(message('f-15', CAST.foxtrot, '21:11', 'Ouais ok. Désolé.'), { typing: 1400 }),
    ]),
    prompt: 'Le Responsable a pris le relais et Foxtrot s’est calmé. Que fais-tu ?',
    options: [
      { key: 'continuer', label: 'Fermer le ticket toi-même', next: 'fin-sans-validation' },
      { key: 'passer', label: 'Laisser le Responsable conclure', next: 'fin-bonne' },
    ],
  },
  {
    key: 'fin-sans-validation',
    steps: node([guide(2, 400), ...write(message('f-16', CAST.modo, '21:11', 'Bon, je ferme.'))]),
    ending: {
      good: false,
      title: 'Presque',
      body: 'Passer la main était le bon choix. Mais le ticket appartient maintenant au Responsable, et aucune fermeture ne se fait sans que le membre confirme qu’il n’a plus de question.',
    },
  },
  {
    key: 'fin-bonne',
    steps: node([
      guide(2, 400),
      ...say(
        message(
          'f-17',
          CAST.responsable,
          '21:11',
          'Tout est bon pour toi ? Tu n’as plus de question ?'
        ),
        { typing: 1600 }
      ),
      ...say(message('f-18', CAST.foxtrot, '21:12', 'Non c’est bon.'), { typing: 1200 }),
      ...say(
        message('f-19', CAST.responsable, '21:12', 'D’accord, je te souhaite une bonne soirée.'),
        { typing: 1400 }
      ),
    ]),
    ending: {
      good: true,
      title: 'Exactement ce qu’on attend',
      body: 'Tu as tenu le cadre tant que Foxtrot restait dans les limites, puis tu as respecté son droit **inconditionnel** à demander un responsable dès qu’il l’a exigé. La fermeture vient après sa confirmation.',
    },
  },
]
