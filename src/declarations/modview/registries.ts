import { createRegistry } from '@/core/lib/registry'
import type { IconName } from '@/declarations/ui/icons'
import { LivePlatforms } from '@/utils/constants/lives'
import type { LivePlatformName } from '@/utils/constants/lives'
import { Permissions } from '@/utils/constants/permissions'
import type { PermissionName } from '@/utils/constants/permissions'
import type {
  ChatModeName,
  ModActKind,
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
  automod: {
    label: 'File d’attente de l’AutoMod',
    icon: 'automod',
    platforms: [LivePlatforms.Twitch],
  },
  chat: { label: 'Chat', icon: 'chat', platforms: BOTH },
  community: { label: 'Communauté', icon: 'viewer', platforms: BOTH },
  unbanRequests: {
    label: 'Demandes de débannissement',
    icon: 'unbanRequest',
    platforms: [LivePlatforms.Twitch],
  },
}

export const MODVIEW_WINDOWS = createRegistry(WINDOW_MAP)

/**
 * One chat mode
 * @typedef {Object} ChatModeOption
 * @property {string} label - Mode name
 * @property {IconName} icon - Glyph
 * @property {PermissionName} permission - Needed to switch it
 * @property {string} owners - Who holds it, said when greyed
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
    owners: 'Jérémy',
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
    owners: 'Jérémy, aux Responsables et au Coordinateur',
  },
}

export const CHAT_MODES = createRegistry(MODE_MAP)

/**
 * How one act reads in the actions window
 * @typedef {Object} ModActOption
 * @property {string} label - Short name
 * @property {IconName} icon - Glyph
 */

interface ModActOption {
  label: string
  icon: IconName
}

const ACT_MAP: Record<ModActKind, ModActOption> = {
  delete: { label: 'Suppression', icon: 'modDelete' },
  warn: { label: 'Avertissement', icon: 'modWarn' },
  timeout: { label: 'Exclusion', icon: 'modTimeout' },
  ban: { label: 'Bannissement', icon: 'modBan' },
  unban: { label: 'Débannissement', icon: 'modUnban' },
  automodApprove: { label: 'AutoMod accepté', icon: 'automod' },
  automodDeny: { label: 'AutoMod refusé', icon: 'automod' },
  termAdd: { label: 'Terme bloqué', icon: 'blockedTerms' },
  termRemove: { label: 'Terme retiré', icon: 'blockedTerms' },
  mode: { label: 'Mode', icon: 'modeSlow' },
  unbanRequest: { label: 'Demande de débannissement', icon: 'unbanRequest' },
}

export const MOD_ACTS = createRegistry(ACT_MAP)

/**
 * Who holds each gated gesture, said when greyed
 * @type {Partial<Record<PermissionName, string>>}
 */

export const PERMISSION_OWNERS: Partial<Record<PermissionName, string>> = {
  [Permissions.LiveModerate]: 'l’équipe de modération',
  [Permissions.LiveUnbanRequest]: 'Jérémy et aux Responsables',
  [Permissions.LiveTerms]: 'Jérémy, aux Responsables et au Coordinateur',
  [Permissions.LiveCrisisChat]: 'Jérémy',
}

/**
 * Timeout lengths offered on the user card, in seconds
 * @type {readonly number[]}
 */

export const TIMEOUT_PRESETS: readonly number[] = [60, 600, 3600, 86_400]

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
 * Default lengths of the chat gestures, in seconds
 * @type {{ quickTimeout: number, slowMode: number }}
 */

export const MODVIEW_DEFAULTS = {
  quickTimeout: 600,
  slowMode: 30,
}

/**
 * Display options of the chat, the three dots
 * @type {Record<string, { label: string }>}
 */

const CHAT_OPTION_MAP = {
  timestamps: { label: 'Afficher l’heure des messages' },
  badges: { label: 'Afficher les badges' },
  deleted: { label: 'Garder le texte des messages supprimés' },
  firstMessages: { label: 'Mettre en avant les premiers messages' },
}

export const CHAT_OPTIONS = createRegistry(CHAT_OPTION_MAP)

export type ChatOptionName = keyof typeof CHAT_OPTION_MAP
