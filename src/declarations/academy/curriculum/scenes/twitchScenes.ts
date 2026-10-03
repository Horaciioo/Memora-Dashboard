import type { ModViewScene } from '@/core/lib/modview/scene'
import { act, beats, chatter, line, scene, twitchStage } from '@/declarations/modview/sceneKit'

// Cast of every scene of the Twitch course
const CAST = {
  streamer: chatter('lumi', { name: 'Lumi', badges: ['broadcaster'], colour: '#d12f78' }),
  nightbot: chatter('nightbot', {
    name: 'Nightbot',
    badges: ['bot', 'moderator'],
    colour: '#2f7df0',
  }),
  modo: chatter('modo_lune', { badges: ['moderator'], colour: '#16a34a' }),
  coordinator: chatter('coordo_sacha', { badges: ['moderator'], colour: '#d97706' }),
  responsable: chatter('resp_elio', { badges: ['moderator'], colour: '#ea580c' }),
  vip: chatter('pixel_vip', { badges: ['vip'], colour: '#c98a1e' }),
  calm: chatter('tartine_bleue', { colour: '#0aa0d6' }),
  fan: chatter('soleil_2009', { badges: ['subscriber'], colour: '#7c3aed' }),
  newcomer: chatter('premiere_fois', { colour: '#ea580c' }),
  spammer: chatter('xX_spam_Xx', { colour: '#dc2626' }),
  // The harassment wave of the case study
  wave1: chatter('raid_noir_01', { colour: '#9a3412' }),
  wave2: chatter('raid_noir_02', { colour: '#9a3412' }),
  wave3: chatter('raid_noir_03', { colour: '#9a3412' }),
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
    { kind: 'message', message: line('tour-4', CAST.vip, 'Lumi en forme ce soir') },
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
    { kind: 'message', message: line('chat-6', CAST.vip, 'Lumi tu nous montres le projet ?') },
  ])
)

/**
 * Community window: the streamer arrives, moderators come and go
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
 * Title of the live, lit
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
 * Automod queue: held words in red, the same line in the chat
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
 * Modes: switched on one after the other, the chat reacting
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
 * Display options, the three dots lit
 * @type {ModViewScene}
 */

export const OPTIONS_SCENE: ModViewScene = scene(
  twitchStage({
    community: COMMUNITY,
    // Everything hidden, the scene turns each option on
    chatScript: {
      menu: null,
      options: { timestamps: false, badges: false, deleted: false, firstMessages: false },
      lit: null,
    },
    messages: [
      line('opt-1', CAST.calm, 'Bonsoir !'),
      line('opt-2', CAST.fan, 'Coucou Lumi'),
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
 * Case study, act 1: the wave starts, the windows tell where
 * @type {ModViewScene}
 */

export const WAVE_START_SCENE: ModViewScene = scene(
  twitchStage({ community: COMMUNITY, blockedTerms: ['nul', 'naze'] }),
  beats(500, 1500, [
    { kind: 'message', message: line('w1-1', CAST.calm, 'Le projet a l’air trop bien') },
    {
      kind: 'message',
      message: line('w1-2', CAST.wave1, 'Lumi t’es une arnaque', { isFirst: true }),
    },
    {
      kind: 'message',
      message: line('w1-3', CAST.wave2, 'Lumi arnaque, tout le monde le sait', { isFirst: true }),
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
        quote: 'Lumi t’es une arnaque',
      }),
      deleteMessageId: 'w1-2',
    },
    { kind: 'message', message: line('w1-4', CAST.fan, 'c’est quoi ces comptes ?') },
  ])
)

/**
 * Case study, act 2: the wave insists, the coordinator then a responsable speak
 * @type {ModViewScene}
 */

export const WAVE_INSIST_SCENE: ModViewScene = scene(
  twitchStage({
    community: { ...COMMUNITY, moderators: [...COMMUNITY.moderators, CAST.coordinator] },
  }),
  beats(500, 1600, [
    { kind: 'message', message: line('w2-1', CAST.wave1, 'on reviendra tous les soirs') },
    { kind: 'message', message: line('w2-2', CAST.wave2, 'Lumi arnaque Lumi arnaque') },
    {
      kind: 'message',
      message: line(
        'w2-3',
        CAST.coordinator,
        'Consigne équipe : chaque message de la vague est supprimé, pas de réponse publique.'
      ),
    },
    {
      kind: 'act',
      act: act('w2-act-1', {
        kind: 'timeout',
        target: CAST.wave2.name,
        moderator: CAST.modo.name,
        durationSeconds: 600,
        reason: 'Harcèlement',
      }),
    },
    { kind: 'join', group: 'moderators', chatter: CAST.responsable },
    {
      kind: 'message',
      message: line(
        'w2-4',
        CAST.responsable,
        'Je prends le lead : bannissement direct pour tout compte de la vague.'
      ),
    },
    {
      kind: 'act',
      act: act('w2-act-2', {
        kind: 'ban',
        target: CAST.wave1.name,
        moderator: CAST.responsable.name,
      }),
    },
  ])
)

/**
 * Case study, act 3: the wave turns into a drama, Livecon 1
 * @type {ModViewScene}
 */

export const WAVE_DRAMA_SCENE: ModViewScene = scene(
  twitchStage({ community: COMMUNITY, liveconLevel: 2 }),
  beats(500, 1700, [
    {
      kind: 'message',
      message: line('w3-1', CAST.wave3, 'tout le monde parle de toi sur les réseaux Lumi'),
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
    { kind: 'message', message: line('w3-3', CAST.fan, 'on est avec toi Lumi') },
  ])
)
