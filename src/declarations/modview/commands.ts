import { MODVIEW_DEFAULTS } from '@/declarations/modview/registries'
import type { ModViewIntent } from '@/types/modview'

/**
 * One command of the chat box
 * @typedef {Object} ChatCommandOption
 * @property {string} name - Word after the slash
 * @property {string[]} aliases - Other words that mean the same
 * @property {string} usage - Arguments, as shown after the name
 * @property {string} description - What it does
 * @property {ModViewIntent | null} probe - Gesture the gate is asked about to grey it, null when free
 */

export interface ChatCommandOption {
  name: string
  aliases: string[]
  usage: string
  description: string
  probe: ModViewIntent | null
}

const channelMode = (
  mode: Extract<ModViewIntent, { kind: 'mode' }>['mode'],
  enabled: boolean
): ModViewIntent => ({ kind: 'mode', mode, enabled })

/**
 * Commands the chat box understands, in the order the menu lists them
 * @type {readonly ChatCommandOption[]}
 */

export const CHAT_COMMANDS: readonly ChatCommandOption[] = [
  {
    name: 'user',
    aliases: ['u'],
    usage: '<viewer>',
    description: 'Ouvrir le dossier d’un viewer, sans rien envoyer',
    probe: null,
  },
  {
    name: 'warn',
    aliases: [],
    usage: '<viewer> <motif>',
    description: 'Avertir un viewer',
    probe: { kind: 'warn', chatterId: '', reason: 'x' },
  },
  {
    name: 'timeout',
    aliases: ['to'],
    usage: '<viewer> <durée> [motif]',
    description: 'Exclure un viewer un temps',
    probe: { kind: 'timeout', chatterId: '', seconds: 1, reason: null },
  },
  {
    name: 'ban',
    aliases: [],
    usage: '<viewer> [motif]',
    description: 'Bannir un viewer',
    probe: { kind: 'ban', chatterId: '', reason: null },
  },
  {
    name: 'unban',
    aliases: ['untimeout'],
    usage: '<viewer>',
    description: 'Débannir ou lever une exclusion',
    probe: { kind: 'unban', chatterId: '' },
  },
  {
    name: 'poll',
    aliases: ['sondage'],
    usage: '',
    description: 'Lancer un sondage dans le chat',
    probe: null,
  },
  {
    name: 'slow',
    aliases: ['slowmode'],
    usage: `[secondes, ${MODVIEW_DEFAULTS.slowMode} par défaut]`,
    description: 'Activer le mode lent',
    probe: channelMode('slow', true),
  },
  {
    name: 'slowoff',
    aliases: ['slowmodeoff'],
    usage: '',
    description: 'Couper le mode lent',
    probe: channelMode('slow', false),
  },
  {
    name: 'emoteonly',
    aliases: ['emotes'],
    usage: '',
    description: 'Chat en émoticônes uniquement',
    probe: channelMode('emotes', true),
  },
  {
    name: 'emoteonlyoff',
    aliases: ['emotesoff'],
    usage: '',
    description: 'Couper le chat en émoticônes',
    probe: channelMode('emotes', false),
  },
  {
    name: 'subscribers',
    aliases: [],
    usage: '',
    description: 'Chat réservé aux abonnés',
    probe: channelMode('subscribers', true),
  },
  {
    name: 'subscribersoff',
    aliases: [],
    usage: '',
    description: 'Ouvrir le chat à tous',
    probe: channelMode('subscribers', false),
  },
  {
    name: 'followers',
    aliases: [],
    usage: '',
    description: 'Chat réservé aux followers',
    probe: channelMode('followers', true),
  },
  {
    name: 'followersoff',
    aliases: [],
    usage: '',
    description: 'Couper le chat réservé aux followers',
    probe: channelMode('followers', false),
  },
  {
    name: 'shield',
    aliases: [],
    usage: '',
    description: 'Activer le mode bouclier',
    probe: channelMode('shield', true),
  },
  {
    name: 'shieldoff',
    aliases: [],
    usage: '',
    description: 'Couper le mode bouclier',
    probe: channelMode('shield', false),
  },
]

/**
 * Category of each command, as the menu groups them
 * @type {Record<string, string>}
 */

export const COMMAND_CATEGORY: Record<string, string> = {
  user: 'Utilisateurs',
  warn: 'Sanctions',
  timeout: 'Sanctions',
  ban: 'Sanctions',
  unban: 'Sanctions',
  poll: 'Chat',
  slow: 'Modes du chat',
  slowoff: 'Modes du chat',
  emoteonly: 'Modes du chat',
  emoteonlyoff: 'Modes du chat',
  subscribers: 'Modes du chat',
  subscribersoff: 'Modes du chat',
  followers: 'Modes du chat',
  followersoff: 'Modes du chat',
  shield: 'Modes du chat',
  shieldoff: 'Modes du chat',
}

/**
 * Command a typed word stands for
 * @param {string} word - Word after the slash
 * @return {ChatCommandOption | null} - Command
 */

export const findChatCommand = (word: string): ChatCommandOption | null => {
  const wanted = word.toLowerCase()

  return (
    CHAT_COMMANDS.find((entry) => entry.name === wanted || entry.aliases.includes(wanted)) ?? null
  )
}
