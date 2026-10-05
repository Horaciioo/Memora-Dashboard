import type { ModViewScene, SceneStep } from '@/core/lib/modview/scene'
import type { ChatMessage, Chatter } from '@/types/modview'
import { LivePlatforms } from '@/utils/constants/lives'

// Fixed clock so the scene reads the same every time
const START = '2026-10-03T20:00:00.000Z'

/**
 * Build one chatter of the scene
 * @param {string} login - Login
 * @param {Partial<Chatter>} [extra] - Badges
 * @return {Chatter} - Chatter
 */

const chatter = (login: string, extra: Partial<Chatter> = {}): Chatter => ({
  id: `demo-${login}`,
  login,
  name: login,
  colour: null,
  badges: [],
  ...extra,
})

const CAST = {
  creator: chatter('michou', { name: 'Michou', badges: ['broadcaster'], colour: '#d12f78' }),
  nightbot: chatter('nightbot', {
    name: 'Nightbot',
    badges: ['bot', 'moderator'],
    colour: '#2f7df0',
  }),
  streamelements: chatter('streamelements', { name: 'StreamElements', badges: ['bot'] }),
  modo: chatter('modo_lune', { name: 'modo_lune', badges: ['moderator'], colour: '#16a34a' }),
  vip: chatter('pixel_vip', { name: 'pixel_vip', badges: ['vip'], colour: '#c98a1e' }),
  calm: chatter('tartine_bleue', { colour: '#0aa0d6' }),
  fan: chatter('soleil_2009', { badges: ['subscriber'], colour: '#d98ba6' }),
  newcomer: chatter('premiere_fois', { colour: '#ea580c' }),
  spammer: chatter('xX_spam_Xx', { colour: '#dc2626' }),
  rude: chatter('pas_sympa_42', { colour: '#9a3412' }),
}

let sequence = 0

/**
 * Build one chat line of the scene
 * @param {Chatter} author - Who writes
 * @param {string} text - Line
 * @param {Partial<ChatMessage>} [extra] - First message
 * @return {ChatMessage} - Message
 */

const line = (author: Chatter, text: string, extra: Partial<ChatMessage> = {}): ChatMessage => {
  sequence += 1

  return { id: `demo-line-${sequence}`, author, text, sentAt: START, ...extra }
}

// Messages the scene deletes later
const SPAM = line(CAST.spammer, 'GRATUIT abonnements offerts ici >>> lien-douteux.example')
const RUDE = line(CAST.rude, 'franchement t’es nul, arrête le stream', { flagged: ['nul'] })

const STEPS: SceneStep[] = [
  { at: 600, event: { kind: 'message', message: line(CAST.calm, 'Salut tout le monde !') } },
  { at: 1800, event: { kind: 'message', message: line(CAST.fan, 'LA FINALE ENFIN') } },
  {
    at: 3000,
    event: {
      kind: 'message',
      message: line(CAST.newcomer, 'Coucou, c’est mon premier live ici', { isFirst: true }),
    },
  },
  { at: 4200, event: { kind: 'message', message: line(CAST.vip, 'Allez Michou on y croit') } },
  { at: 5600, event: { kind: 'message', message: SPAM } },
  { at: 6400, event: { kind: 'message', message: line(CAST.spammer, 'GRATUIT GRATUIT GRATUIT') } },
  {
    at: 8200,
    event: {
      kind: 'act',
      act: {
        id: 'demo-act-1',
        kind: 'delete',
        target: CAST.spammer.name,
        moderator: CAST.modo.name,
        at: START,
        quote: SPAM.text,
      },
      deleteMessageId: SPAM.id,
    },
  },
  {
    at: 9400,
    event: {
      kind: 'hold',
      held: {
        id: 'demo-held-1',
        author: CAST.rude,
        text: 'ce candidat est un vrai débile',
        flagged: ['débile'],
        category: 'Insultes',
        at: START,
      },
    },
  },
  { at: 10600, event: { kind: 'message', message: RUDE } },
  { at: 12000, event: { kind: 'message', message: line(CAST.calm, 'tranquille le chat ce soir') } },
  {
    at: 13500,
    event: { kind: 'message', message: line(CAST.nightbot, 'Rappel : pas de spoil du casting !') },
  },
  { at: 15000, event: { kind: 'join', group: 'viewers', chatter: CAST.newcomer } },
  { at: 16500, event: { kind: 'message', message: line(CAST.fan, 'Le candidat 3 est trop fort') } },
  {
    at: 18000,
    event: {
      kind: 'act',
      act: {
        id: 'demo-act-2',
        kind: 'timeout',
        target: CAST.spammer.name,
        moderator: CAST.modo.name,
        at: START,
        durationSeconds: 600,
        reason: 'Spam',
      },
    },
  },
  { at: 19500, event: { kind: 'message', message: line(CAST.vip, 'GG à toute l’équipe') } },
]

/**
 * Preview scene of the Mod View
 * @type {ModViewScene}
 */

export const DEMO_SCENE: ModViewScene = {
  initial: {
    platform: LivePlatforms.Twitch,
    connection: 'scripted',
    channel: { name: 'Michou', avatar: null, category: 'Just Chatting', categoryArt: null },
    title: 'FINALE DU CASTING TERMINAL (et on s’ouvre du 30 ans pokémon)',
    embedUrl: null,
    messages: [],
    acts: [],
    held: [],
    unbanRequests: [
      {
        id: 'demo-unban-1',
        author: chatter('ancien_banni'),
        text: 'Je m’excuse pour mes messages de l’an dernier, je voudrais revenir.',
        at: START,
      },
    ],
    blockedTerms: ['débile', 'nul'],
    allowedTerms: [],
    modes: {
      shield: false,
      subscribers: false,
      followers: false,
      emotes: false,
      slowSeconds: null,
    },
    community: {
      broadcaster: [CAST.creator],
      moderators: [CAST.modo, CAST.nightbot],
      vips: [CAST.vip],
      bots: [CAST.streamelements, CAST.nightbot],
      viewers: [CAST.calm, CAST.fan, CAST.spammer, CAST.rude],
    },
    liveconLevel: 3,
  },
  steps: STEPS,
}
