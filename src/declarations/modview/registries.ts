import { createRegistry } from '@/core/lib/registry'
import type { IconName } from '@/declarations/ui/icons'
import { LivePlatforms } from '@/utils/constants/lives'
import type { LivePlatformName } from '@/utils/constants/lives'
import { Permissions } from '@/utils/constants/permissions'
import type { PermissionName } from '@/utils/constants/permissions'
import type {
  ChatModeName,
  ChatTier,
  ModActKind,
  ModActTone,
  ModViewState,
  ModViewTarget,
  ModViewWindow,
} from '@/types/modview'

/**
 * One window of the grid
 * @typedef {Object} ModViewWindowOption
 * @property {string} label - Heading
 * @property {IconName} icon - Rail glyph
 * @property {LivePlatformName[]} platforms - Platforms that expose it
 */

interface ModViewWindowOption {
  label: string
  icon: IconName
  platforms: LivePlatformName[]
}

const BOTH = [LivePlatforms.Twitch, LivePlatforms.YouTube]

const WINDOW_MAP: Record<ModViewWindow, ModViewWindowOption> = {
  stream: { label: 'Flux', icon: 'stream', platforms: BOTH },
  modActions: { label: 'Actions de modérateur', icon: 'modActions', platforms: BOTH },
  // Surveillance runs on both platforms, the queue only on Twitch
  automod: { label: 'File d’attente de l’AutoMod', icon: 'automod', platforms: BOTH },
  chat: { label: 'Chat', icon: 'chat', platforms: BOTH },
  community: { label: 'Communauté', icon: 'viewer', platforms: BOTH },
  // Responsables only, the Mod View adds it for those who hold the Inspect right
  inspect: { label: 'Inspect Mod', icon: 'search', platforms: BOTH },
}

export const MODVIEW_WINDOWS = createRegistry(WINDOW_MAP)

/**
 * One chat mode
 * @typedef {Object} ChatModeOption
 * @property {string} label - Mode name
 * @property {IconName} icon - Glyph
 * @property {PermissionName} permission - Needed to switch it
 * @property {string} owners - Who holds it
 */

interface ChatModeOption {
  label: string
  icon: IconName
  permission: PermissionName
  owners: string
}

const MODE_MAP: Record<ChatModeName, ChatModeOption> = {
  shield: {
    label: 'Mode bouclier',
    icon: 'modeShield',
    permission: Permissions.LiveModeShield,
    owners: 'Jérémy',
  },
  subscribers: {
    label: 'Chat réservé aux abonnés',
    icon: 'modeSubscribers',
    permission: Permissions.LiveModeSubscribers,
    owners: 'Jérémy et aux Responsables',
  },
  emotes: {
    label: 'Chat en émoticônes uniquement',
    icon: 'modeEmotes',
    permission: Permissions.LiveModeEmotes,
    owners: 'Jérémy, aux Responsables et au Coordinateur',
  },
  followers: {
    label: 'Réservé aux followers',
    icon: 'modeFollowers',
    permission: Permissions.LiveModeFollowers,
    owners: 'Jérémy',
  },
  slow: {
    label: 'Mode lent',
    icon: 'modeSlow',
    permission: Permissions.LiveModeSlow,
    owners: 'l’équipe de modération',
  },
}

export const CHAT_MODES = createRegistry(MODE_MAP)

/**
 * How one act reads in the actions window
 * @typedef {Object} ModActOption
 * @property {string} label - Short name
 * @property {IconName} icon - Glyph
 * @property {string} verb - Word coloured in its sentence
 * @property {ModActTone} tone - Verb colour
 */

interface ModActOption {
  label: string
  icon: IconName
  verb: string
  tone: ModActTone
}

const ACT_MAP: Record<ModActKind, ModActOption> = {
  delete: { label: 'Suppression', icon: 'modDelete', verb: 'supprimé', tone: 'danger' },
  warn: { label: 'Avertissement', icon: 'modWarn', verb: 'Averti', tone: 'caution' },
  timeout: { label: 'Exclusion', icon: 'modTimeout', verb: 'Banni temporairement', tone: 'danger' },
  ban: { label: 'Bannissement', icon: 'modBan', verb: 'Banni', tone: 'danger' },
  unban: { label: 'Débannissement', icon: 'modUnban', verb: 'Débanni', tone: 'success' },
  automodApprove: { label: 'AutoMod accepté', icon: 'automod', verb: 'accepté', tone: 'success' },
  automodDeny: { label: 'AutoMod refusé', icon: 'automod', verb: 'refusé', tone: 'danger' },
  termAdd: { label: 'Terme bloqué', icon: 'blockedTerms', verb: 'ajouté', tone: 'info' },
  termRemove: { label: 'Terme retiré', icon: 'blockedTerms', verb: 'retiré', tone: 'info' },
  mode: { label: 'Mode', icon: 'modeSlow', verb: 'changé', tone: 'info' },
  unbanRequest: {
    label: 'Demande de débannissement',
    icon: 'unbanRequest',
    verb: 'traitée',
    tone: 'info',
  },
}

export const MOD_ACTS = createRegistry(ACT_MAP)

/**
 * Who holds each gated gesture
 * @type {Partial<Record<PermissionName, string>>}
 */

export const PERMISSION_OWNERS: Partial<Record<PermissionName, string>> = {
  [Permissions.LiveModerate]: 'l’équipe de modération',
  [Permissions.LiveUnbanRequest]: 'Jérémy et aux Responsables',
  [Permissions.LiveTerms]: 'Jérémy, aux Responsables et au Coordinateur',
  [Permissions.LivePin]: 'Jérémy, aux Responsables et au Coordinateur',
  [Permissions.LiveCrisisChat]: 'Jérémy',
}

/**
 * Timeout lengths offered on the user card
 * @type {readonly number[]}
 */

export const TIMEOUT_PRESETS: readonly number[] = [
  60, 300, 600, 1800, 3600, 86_400, 172_800, 604_800,
]

/**
 * One group of the community window
 * @typedef {Object} CommunityGroupOption
 * @property {string} label - Heading
 * @property {IconName} icon - Glyph
 * @property {string} empty - Said when nobody is in it
 * @property {ModViewTarget | null} target - Part a scene can light
 */

interface CommunityGroupOption {
  label: string
  icon: IconName
  empty: string
  target: ModViewTarget | null
}

const COMMUNITY_GROUP_MAP: Record<keyof ModViewState['community'], CommunityGroupOption> = {
  broadcaster: {
    label: 'Diffuseur',
    icon: 'broadcaster',
    empty: 'Hors ligne',
    target: 'broadcaster',
  },
  moderators: { label: 'Modérateurs', icon: 'shield', empty: 'Personne', target: 'moderators' },
  vips: { label: 'VIP', icon: 'vip', empty: 'Personne', target: 'vips' },
  bots: { label: 'Bots de chat', icon: 'chatBot', empty: 'Aucun bot', target: null },
  viewers: { label: 'Spectateurs', icon: 'viewer', empty: 'Personne', target: null },
}

export const MODVIEW_COMMUNITY_GROUPS = createRegistry(COMMUNITY_GROUP_MAP)

/**
 * Glyph a Memora rank wears in the chat
 * @type {Partial<Record<ChatTier, IconName>>}
 */

export const TIER_BADGE_ICONS: Partial<Record<ChatTier, IconName>> = {
  admin: 'crown',
  responsable: 'legacy',
  moderator: 'shield',
}

/**
 * Default lengths of the chat gestures
 * @type {{ quickTimeout: number, slowMode: number, messagesPerPage: number }}
 */

export const MODVIEW_DEFAULTS = {
  quickTimeout: 600,
  slowMode: 30,
  messagesPerPage: 5,
}

/**
 * Slow mode delays Twitch offers, in seconds
 * @type {readonly number[]}
 */

export const SLOW_DURATIONS: readonly number[] = [3, 5, 10, 20, 30, 60, 120]

/**
 * Follow ages Twitch offers for the followers only chat
 * @type {readonly { minutes: number, label: string }[]}
 */

export const FOLLOWER_DURATIONS: readonly { minutes: number; label: string }[] = [
  { minutes: 0, label: 'Tous les followers' },
  { minutes: 10, label: '10 minutes' },
  { minutes: 30, label: '30 minutes' },
  { minutes: 60, label: '1 heure' },
  { minutes: 1440, label: '1 jour' },
  { minutes: 10_080, label: '1 semaine' },
  { minutes: 43_200, label: '1 mois' },
  { minutes: 129_600, label: '3 mois' },
]

/**
 * Display options of the chat
 * @type {Record<string, { label: string }>}
 */

const CHAT_OPTION_MAP = {
  timestamps: { label: 'Afficher l’heure des messages' },
  badges: { label: 'Afficher les badges' },
  deleted: { label: 'Garder le texte des messages supprimés' },
  firstMessages: { label: 'Encadrer les premiers messages' },
  colouredNames: { label: 'Afficher les pseudos en couleur' },
}

export const CHAT_OPTIONS = createRegistry(CHAT_OPTION_MAP)

export type ChatOptionName = keyof typeof CHAT_OPTION_MAP

/**
 * Ways to stand the chat still while reading it, one at a time
 * @type {Record<PauseModeName, { label: string }>}
 */

const PAUSE_MODE_MAP = {
  hover: { label: 'Au survol de la souris' },
  alt: { label: 'Tant que Alt est maintenue' },
}

export const PAUSE_MODES = createRegistry(PAUSE_MODE_MAP)

export type PauseModeName = keyof typeof PAUSE_MODE_MAP

/**
 * Where the gestures of a chat line show, one at a time
 * @type {Record<ToolsPositionName, { label: string }>}
 */

const TOOLS_POSITION_MAP = {
  left: { label: 'À gauche, toujours visibles' },
  hover: { label: 'Au survol de la ligne' },
}

export const TOOLS_POSITIONS = createRegistry(TOOLS_POSITION_MAP)

export type ToolsPositionName = keyof typeof TOOLS_POSITION_MAP

/**
 * Colours Twitch hands out to chatters who never picked one
 * @type {readonly string[]}
 */

export const CHAT_DEFAULT_COLOURS: readonly string[] = [
  '#ff0000',
  '#0000ff',
  '#008000',
  '#b22222',
  '#ff7f50',
  '#9acd32',
  '#ff4500',
  '#2e8b57',
  '#daa520',
  '#d2691e',
  '#5f9ea0',
  '#1e90ff',
  '#ff69b4',
  '#8a2be2',
  '#00ff7f',
]
