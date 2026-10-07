import type { ModViewScene, SceneStep } from '@/core/lib/modview/scene'
import { act, beats, chatter, line, scene, twitchStage } from '@/declarations/modview/sceneKit'

// Cast of every scene of the Twitch course
const CAST = {
  streamer: chatter('{creator_login}', {
    name: '{creator}',
    badges: ['broadcaster'],
    colour: '#d12f78',
  }),
  nightbot: chatter('nightbot', {
    name: 'Nightbot',
    badges: ['bot', 'moderator'],
    colour: '#2f7df0',
  }),
  modo: chatter('echo', { name: 'Echo', badges: ['moderator'], colour: '#16a34a' }),
  coordinator: chatter('golf', { name: 'Golf', badges: ['moderator'], colour: '#d97706' }),
  responsable: chatter('hotel', { name: 'Hotel', badges: ['moderator'], colour: '#ea580c' }),
  vip: chatter('india', { name: 'India', badges: ['vip'], colour: '#c98a1e' }),
  calm: chatter('alpha', { name: 'Alpha', colour: '#0aa0d6' }),
  fan: chatter('bravo', { name: 'Bravo', badges: ['subscriber'], colour: '#d98ba6' }),
  newcomer: chatter('charlie', { name: 'Charlie', colour: '#ea580c' }),
  spammer: chatter('delta', { name: 'Delta', colour: '#dc2626' }),
  // The harassment wave of the case study
  wave1: chatter('foxtrot', { name: 'Foxtrot', colour: '#9a3412' }),
  wave2: chatter('tango', { name: 'Tango', colour: '#9a3412' }),
  wave3: chatter('victor', { name: 'Victor', colour: '#9a3412' }),
}

// Community of an evening
const COMMUNITY = {
  broadcaster: [CAST.streamer],
  moderators: [CAST.modo, CAST.nightbot],
  vips: [CAST.vip],
  bots: [CAST.nightbot],
  viewers: [CAST.calm, CAST.fan],
}

/**
 * Calm evening the guided tour plays over
 * @type {ModViewScene}
 */

export const TOUR_SCENE: ModViewScene = scene(
  twitchStage({
    community: COMMUNITY,
    blockedTerms: ['nul', 'débile'],
    acts: [
      act('tour-act-1', {
        kind: 'delete',
        target: CAST.spammer.name,
        moderator: CAST.modo.name,
        quote: 'GRATUIT abonnements offerts ici',
      }),
    ],
    held: [
      {
        id: 'tour-held-1',
        author: CAST.spammer,
        text: 'tu es vraiment débile',
        flagged: ['débile'],
        category: 'Insultes',
        at: '2026-10-03T20:00:00.000Z',
      },
    ],
  }),
  beats(400, 1800, [
    { kind: 'message', message: line('tour-1', CAST.calm, 'Salut tout le monde !') },
    { kind: 'message', message: line('tour-2', CAST.fan, 'Trop hâte du projet') },
    {
      kind: 'message',
      message: line('tour-3', CAST.newcomer, 'Coucou, première fois ici', { isFirst: true }),
    },
    { kind: 'message', message: line('tour-4', CAST.vip, '{creator} en forme ce soir') },
    {
      kind: 'message',
      message: line('tour-5', CAST.nightbot, 'Pense à lire les règles du chat !'),
    },
    { kind: 'message', message: line('tour-6', CAST.calm, 'trop bien le nouveau décor') },
  ])
)

/**
 * Chat window: deleted line, first message, spam, normal lines
 * @type {ModViewScene}
 */

export const CHAT_SCENE: ModViewScene = scene(
  twitchStage({ community: COMMUNITY }),
  beats(300, 1500, [
    { kind: 'message', message: line('chat-1', CAST.calm, 'Bonsoir le chat') },
    { kind: 'message', message: line('chat-2', CAST.spammer, 'ABONNEZ-VOUS À MA CHAÎNE !!!') },
    {
      kind: 'act',
      act: act('chat-act-1', {
        kind: 'delete',
        target: CAST.spammer.name,
        moderator: CAST.modo.name,
        quote: 'ABONNEZ-VOUS À MA CHAÎNE !!!',
      }),
      deleteMessageId: 'chat-2',
    },
    {
      kind: 'message',
      message: line('chat-3', CAST.newcomer, 'Salut, je découvre la chaîne', { isFirst: true }),
    },
    { kind: 'message', message: line('chat-4', CAST.fan, 'Bienvenue à toi !') },
    {
      kind: 'message',
      message: line('chat-5', CAST.spammer, 'lien-douteux.example lien-douteux.example'),
    },
    { kind: 'message', message: line('chat-6', CAST.vip, '{creator} tu nous montres le projet ?') },
  ])
)

/**
 * Community window: the streamer arrives
 * @type {ModViewScene}
 */

export const COMMUNITY_SCENE: ModViewScene = scene(
  twitchStage({
    community: {
      broadcaster: [],
      moderators: [CAST.nightbot],
      vips: [],
      bots: [CAST.nightbot],
      viewers: [CAST.calm],
    },
  }),
  beats(500, 1400, [
    { kind: 'join', group: 'broadcaster', chatter: CAST.streamer },
    { kind: 'join', group: 'moderators', chatter: CAST.modo },
    { kind: 'join', group: 'vips', chatter: CAST.vip },
    { kind: 'join', group: 'moderators', chatter: CAST.coordinator },
    { kind: 'join', group: 'viewers', chatter: CAST.fan },
    { kind: 'leave', group: 'moderators', chatterId: CAST.coordinator.id },
    { kind: 'join', group: 'moderators', chatter: CAST.coordinator },
  ])
)

/**
 * Title of the live
 * @type {ModViewScene}
 */

export const TITLE_SCENE: ModViewScene = scene(
  twitchStage({ community: COMMUNITY }),
  beats(300, 2000, [
    { kind: 'spotlight', target: 'title' },
    { kind: 'message', message: line('title-1', CAST.fan, 'Le titre donne envie') },
  ])
)

/**
 * Automod queue: held words in red
 * @type {ModViewScene}
 */

export const AUTOMOD_SCENE: ModViewScene = scene(
  twitchStage({ community: COMMUNITY, blockedTerms: ['nul', 'débile'] }),
  beats(400, 1600, [
    { kind: 'message', message: line('auto-1', CAST.calm, 'On attend le projet !') },
    {
      kind: 'hold',
      held: {
        id: 'auto-held-1',
        author: CAST.wave1,
        text: 'ce stream est nul',
        flagged: ['nul'],
        category: 'Insultes',
        at: '2026-10-03T20:00:00.000Z',
      },
    },
    {
      kind: 'message',
      message: line('auto-2', CAST.wave2, 'franchement débile ce projet', { flagged: ['débile'] }),
    },
    { kind: 'message', message: line('auto-3', CAST.fan, 'arrêtez de spammer') },
  ])
)

/**
 * Moderator actions: the team's gestures line up
 * @type {ModViewScene}
 */

export const ACTIONS_SCENE: ModViewScene = scene(
  twitchStage({ community: COMMUNITY }),
  beats(400, 1400, [
    {
      kind: 'act',
      act: act('acts-1', {
        kind: 'delete',
        target: CAST.spammer.name,
        moderator: CAST.modo.name,
        quote: 'lien-douteux.example',
      }),
    },
    {
      kind: 'act',
      act: act('acts-2', {
        kind: 'termAdd',
        target: null,
        moderator: CAST.coordinator.name,
        quote: 'lien-douteux',
      }),
    },
    {
      kind: 'act',
      act: act('acts-3', {
        kind: 'timeout',
        target: CAST.wave1.name,
        moderator: CAST.modo.name,
        durationSeconds: 600,
      }),
    },
    {
      kind: 'act',
      act: act('acts-4', {
        kind: 'ban',
        target: CAST.spammer.name,
        moderator: CAST.responsable.name,
      }),
    },
    {
      kind: 'act',
      act: act('acts-5', { kind: 'unbanRequest', target: 'ancien_banni', moderator: 'jeremy' }),
    },
  ])
)

/**
 * Modes: switched on one after the other
 * @type {ModViewScene}
 */

export const MODES_SCENE: ModViewScene = scene(
  twitchStage({ community: COMMUNITY }),
  beats(400, 1700, [
    { kind: 'spotlight', target: 'modes' },
    { kind: 'message', message: line('modes-1', CAST.calm, 'ça va vite ce soir') },
    { kind: 'modes', modes: { slowSeconds: 30 } },
    { kind: 'message', message: line('modes-2', CAST.fan, 'mode lent activé, ok') },
    { kind: 'modes', modes: { emotes: true } },
    { kind: 'message', message: line('modes-3', CAST.vip, 'LUL LUL LUL') },
    { kind: 'modes', modes: { emotes: false, slowSeconds: null } },
  ])
)

/**
 * Display options
 * @type {ModViewScene}
 */

export const OPTIONS_SCENE: ModViewScene = scene(
  twitchStage({
    community: COMMUNITY,
    // Everything hidden
    chatScript: {
      menu: null,
      options: { timestamps: false, badges: false, deleted: false, firstMessages: false },
      lit: null,
    },
    messages: [
      line('opt-1', CAST.calm, 'Bonsoir !'),
      line('opt-2', CAST.fan, 'Coucou {creator}'),
      line('opt-3', CAST.spammer, 'GRATUIT abonnements offerts ici', {
        deletedBy: CAST.modo.name,
      }),
      line('opt-4', CAST.modo, 'Bienvenue à tous, bon live !'),
      line('opt-5', CAST.newcomer, 'Coucou, première fois ici', { isFirst: true }),
    ],
  }),
  [
    ...beats(300, 900, [
      { kind: 'spotlight', target: 'chatOptions' },
      { kind: 'chatMenu', menu: 'options' },
    ]),
    ...beats(2200, 1500, [
      { kind: 'chatOption', option: 'timestamps', enabled: true },
      { kind: 'chatOption', option: 'badges', enabled: true },
      { kind: 'chatOption', option: 'deleted', enabled: true },
      { kind: 'chatOption', option: 'firstMessages', enabled: true },
      { kind: 'chatMenu', menu: null },
    ]),
    ...beats(10000, 1600, [
      { kind: 'message', message: line('opt-6', CAST.vip, 'Tout est bien plus lisible') },
      { kind: 'message', message: line('opt-7', CAST.calm, 'Le projet a l’air trop bien') },
    ]),
  ]
)

/**
 * Case study
 * @type {ModViewScene}
 */

export const WAVE_START_SCENE: ModViewScene = scene(
  twitchStage({ community: COMMUNITY, blockedTerms: ['nul', 'naze'] }),
  beats(500, 1500, [
    { kind: 'message', message: line('w1-1', CAST.calm, 'Le projet a l’air trop bien') },
    {
      kind: 'message',
      message: line('w1-2', CAST.wave1, '{creator} t’es une arnaque', { isFirst: true }),
    },
    {
      kind: 'message',
      message: line('w1-3', CAST.wave2, '{creator} arnaque, tout le monde le sait', {
        isFirst: true,
      }),
    },
    {
      kind: 'hold',
      held: {
        id: 'w1-held',
        author: CAST.wave3,
        text: 'stream naze, streameuse nulle',
        flagged: ['naze', 'nulle'],
        category: 'Insultes',
        at: '2026-10-03T20:00:00.000Z',
      },
    },
    {
      kind: 'act',
      act: act('w1-act', {
        kind: 'delete',
        target: CAST.wave1.name,
        moderator: CAST.modo.name,
        quote: '{creator} t’es une arnaque',
      }),
      deleteMessageId: 'w1-2',
    },
    { kind: 'message', message: line('w1-4', CAST.fan, 'c’est quoi ces comptes ?') },
  ])
)

/**
 * Case study
 * @type {ModViewScene}
 */

export const WAVE_INSIST_SCENE: ModViewScene = scene(
  twitchStage({
    community: { ...COMMUNITY, moderators: [...COMMUNITY.moderators, CAST.coordinator] },
    // Chat as the Coordinator's rule goes out
    messages: [
      line('w2-0a', CAST.calm, 'Salut tout le monde, belle soirée'),
      line('w2-0b', CAST.fan, 'Le projet a l’air trop bien {creator}'),
      line('w2-0c', CAST.vip, 'Ça fait plaisir de voir autant de monde ce soir'),
      line('w2-0d', CAST.newcomer, 'Première fois ici, l’ambiance est top', { isFirst: true }),
      line('w2-1', CAST.wave1, 'on reviendra tous les soirs', { isFirst: true }),
      line('w2-2', CAST.wave2, '{creator} arnaque {creator} arnaque', { isFirst: true }),
      line(
        'w2-3',
        CAST.coordinator,
        'Consigne équipe : chaque message de la vague est supprimé, pas de réponse publique.'
      ),
      line('w2-0e', CAST.fan, 'C’est quoi ces comptes ?'),
    ],
    acts: [
      act('w2-act-0', {
        kind: 'delete',
        target: CAST.wave2.name,
        moderator: CAST.modo.name,
        quote: '{creator} arnaque {creator} arnaque',
      }),
    ],
  }),
  // Live goes on while the team talks
  beats(1500, 3200, [
    { kind: 'message', message: line('w2-a1', CAST.calm, 'Quelqu’un a vu le dernier clip ?') },
    { kind: 'message', message: line('w2-a2', CAST.vip, 'Oui, il est énorme') },
    { kind: 'message', message: line('w2-a3', CAST.fan, 'On attend la suite du projet !') },
    {
      kind: 'message',
      message: line('w2-a4', CAST.newcomer, 'Je me suis abonné, j’adore le live'),
    },
    { kind: 'message', message: line('w2-a5', CAST.calm, 'Le chat est calme ce soir') },
    { kind: 'message', message: line('w2-a6', CAST.vip, 'Ça ne va pas durer…') },
  ])
)

/**
 * Updates once the talk ends
 * @type {SceneStep[]}
 */

export const WAVE_INSIST_REACTION: SceneStep[] = beats(400, 1700, [
  { kind: 'join', group: 'moderators', chatter: CAST.responsable },
  { kind: 'terms', list: 'blocked', add: ['arnaque'], remove: [] },
  {
    kind: 'act',
    act: act('w2-act-1', {
      kind: 'termAdd',
      target: null,
      moderator: CAST.modo.name,
      quote: 'arnaque',
    }),
  },
  {
    kind: 'message',
    message: line('w2-4', CAST.wave3, 'cette arnaque va finir par tomber', {
      isFirst: true,
      flagged: ['arnaque'],
    }),
  },
  {
    kind: 'hold',
    held: {
      id: 'w2-held-1',
      author: CAST.wave3,
      text: 'cette arnaque va finir par tomber',
      flagged: ['arnaque'],
      category: 'Termes bloqués',
      at: '2026-10-03T20:00:00.000Z',
    },
  },
  { kind: 'message', message: line('w2-5', CAST.calm, 'Quelqu’un peut m’expliquer ?') },
  {
    kind: 'message',
    message: line('w2-6', CAST.wave1, 'arnaque, arnaque, tout le monde le sait', {
      flagged: ['arnaque'],
    }),
  },
  {
    kind: 'hold',
    held: {
      id: 'w2-held-2',
      author: CAST.wave1,
      text: 'arnaque, arnaque, tout le monde le sait',
      flagged: ['arnaque'],
      category: 'Termes bloqués',
      at: '2026-10-03T20:00:00.000Z',
    },
  },
  {
    kind: 'act',
    act: act('w2-act-2', {
      kind: 'delete',
      target: CAST.wave3.name,
      moderator: CAST.modo.name,
      quote: 'cette arnaque va finir par tomber',
    }),
    deleteMessageId: 'w2-4',
  },
  {
    kind: 'act',
    act: act('w2-act-3', {
      kind: 'ban',
      target: CAST.wave1.name,
      moderator: CAST.responsable.name,
    }),
  },
  { kind: 'message', message: line('w2-7', CAST.fan, 'On est avec toi {creator}') },
])

/**
 * Case study
 * @type {ModViewScene}
 */

export const WAVE_DRAMA_SCENE: ModViewScene = scene(
  twitchStage({ community: COMMUNITY, liveconLevel: 2 }),
  beats(500, 1700, [
    {
      kind: 'message',
      message: line('w3-1', CAST.wave3, 'tout le monde parle de toi sur les réseaux {creator}'),
    },
    { kind: 'message', message: line('w3-2', CAST.calm, 'c’est vrai ce qu’ils disent ?') },
    { kind: 'livecon', level: 1 },
    {
      kind: 'act',
      act: act('w3-act', {
        kind: 'ban',
        target: CAST.wave3.name,
        moderator: CAST.modo.name,
        reason: 'Harcèlement',
      }),
    },
    { kind: 'message', message: line('w3-3', CAST.fan, 'on est avec toi {creator}') },
  ])
)
