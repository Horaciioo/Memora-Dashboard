import { MODVIEW_DEFAULTS } from '@/declarations/modview/registries'
import type { ModViewIntent } from '@/types/modview'

/**
 * One command of the chat box
 * @typedef {Object} ChatCommandOption
 * @property {string} name - Word after the slash
 * @property {string[]} aliases - Other words that mean the same
 * @property {string} usage - Arguments, as shown after the name
 * @property {string} description - What it does
 * @property {ModViewIntent} probe - Gesture the gate is asked about to grey it
 */

export interface ChatCommandOption {
  name: string
  aliases: string[]
  usage: string
  description: string
  probe: ModViewIntent
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
