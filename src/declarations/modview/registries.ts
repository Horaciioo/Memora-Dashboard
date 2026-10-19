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
  [Permissions.LiveCrisisChat]: 'Jérémy',
}

/**
 * Timeout lengths offered on the user card
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
 * @type {{ quickTimeout: number, slowMode: number }}
 */

export const MODVIEW_DEFAULTS = {
  quickTimeout: 600,
  slowMode: 30,
}

/**
 * Display options of the chat
 * @type {Record<string, { label: string }>}
 */

const CHAT_OPTION_MAP = {
  timestamps: { label: 'Afficher l’heure des messages' },
  badges: { label: 'Afficher les badges' },
  deleted: { label: 'Garder le texte des messages supprimés' },
  firstMessages: { label: 'Mettre en avant les premiers messages' },
  hoverPause: { label: 'Mettre le chat en pause au survol' },
  colouredNames: { label: 'Afficher les noms en couleur' },
}

export const CHAT_OPTIONS = createRegistry(CHAT_OPTION_MAP)

export type ChatOptionName = keyof typeof CHAT_OPTION_MAP
