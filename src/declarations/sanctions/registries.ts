import { createRegistry } from '@/core/lib/registry'
import type { IconName } from '@/declarations/ui/icons'
import { SanctionGravities, SanctionKinds, SanctionPanels } from '@/utils/constants/moderation'
import type {
  SanctionGravityName,
  SanctionKindName,
  SanctionPanelName,
} from '@/utils/constants/moderation'

/**
 * Sanction nature metadata
 * @typedef {Object} SanctionKindOption
 * @property {string} label - Display name
 * @property {string} accent - Token driving the badge colour
 */

interface SanctionKindOption {
  label: string
  accent: string
}

const SANCTION_KIND_MAP: Record<SanctionKindName, SanctionKindOption> = {
  [SanctionKinds.Delete]: { label: 'Suppression', accent: 'success' },
  [SanctionKinds.Warn]: { label: 'Avertissement', accent: 'success' },
  [SanctionKinds.Timeout]: { label: 'Timeout', accent: 'caution' },
  [SanctionKinds.Ban]: { label: 'Bannissement', accent: 'danger' },
  [SanctionKinds.None]: { label: 'Aucune action', accent: 'neutral' },
  [SanctionKinds.Comment]: { label: 'Commentaire', accent: 'neutral' },
  [SanctionKinds.Report]: { label: 'Signalement', accent: 'info' },
}

export const SANCTION_KIND_REGISTRY = createRegistry(SANCTION_KIND_MAP)

/**
 * How one measure is carried out on a surface
 * @typedef {Object} SanctionCommand
 * @property {string | null} command - Command to paste
 * @property {string} how - Where to do it by hand
 */

export interface SanctionCommand {
  command: string | null
  how: string
}

/**
 * Duration a surface writes
 * @typedef {'seconds' | 'marsha'} DurationFormat
 */

export type DurationFormat = 'seconds' | 'marsha'

/**
 * One surface a panel moderates
 * @typedef {Object} SanctionPanelOption
 * @property {string} label - Display name
 * @property {string} functionName - Principal function working it
 * @property {IconName} icon - Glyph
 * @property {string} userPlaceholder - What stands for the member in a command
 * @property {DurationFormat} durationFormat - How a duration is written
 * @property {Partial<Record<SanctionKindName, SanctionCommand>>} commands - Tool per measure
 * @property {boolean} written - Its reference panel exists
 */

interface SanctionPanelOption {
  label: string
  functionName: string
  icon: IconName
  userPlaceholder: string
  durationFormat: DurationFormat
  commands: Partial<Record<SanctionKindName, SanctionCommand>>
  written: boolean
}

const SANCTION_PANEL_MAP: Record<SanctionPanelName, SanctionPanelOption> = {
  [SanctionPanels.Twitch]: {
    label: 'Twitch',
    functionName: 'Lives',
    icon: 'functionLive',
    userPlaceholder: '<pseudo>',
    durationFormat: 'seconds',
    written: true,
    commands: {
      [SanctionKinds.Delete]: {
        command: null,
        how: 'Survole le message puis clique sur la corbeille, ou ouvre la carte du viewer.',
      },
      [SanctionKinds.Warn]: {
        command: '/warn {user} {reason}',
        how: 'Le viewer doit accepter l’avertissement avant de pouvoir écrire à nouveau.',
      },
      [SanctionKinds.Timeout]: {
        command: '/timeout {user} {duration} {reason}',
        how: 'La durée s’écrit en secondes.',
      },
      [SanctionKinds.Ban]: {
        command: '/ban {user} {reason}',
        how: 'Définitif jusqu’à un /unban.',
      },
      [SanctionKinds.Comment]: {
        command: null,
        how: 'Carte du viewer, onglet Notes de modération : écris la raison et le contexte.',
      },
      [SanctionKinds.Report]: {
        command: null,
        how: 'Carte du viewer, Signaler, puis la catégorie qui correspond.',
      },
    },
  },
  [SanctionPanels.Youtube]: {
    label: 'YouTube',
    functionName: 'Lives',
    icon: 'youtuber',
    userPlaceholder: '<pseudo>',
    durationFormat: 'seconds',
    written: false,
    commands: {},
  },
  [SanctionPanels.Discord]: {
    label: 'Discord',
    functionName: 'Discord',
    icon: 'functionDiscord',
    userPlaceholder: 'ID',
    durationFormat: 'marsha',
    written: false,
    commands: {
      [SanctionKinds.Delete]: {
        command: '!clear <@{user}> 1',
        how: 'Supprime le dernier message du membre dans le salon.',
      },
      [SanctionKinds.Warn]: { command: '!warn <@{user}> {reason}', how: 'Le membre reçoit un MP.' },
      [SanctionKinds.Timeout]: {
        command: '!tempmute <@{user}> {duration} {reason}',
        how: 'Le membre doit être présent sur le serveur.',
      },
      [SanctionKinds.Ban]: {
        command: '!ban <@{user}> {reason}',
        how: 'Définitif jusqu’à un !unban.',
      },
      [SanctionKinds.Comment]: {
        command: '!note <@{user}> {reason}',
        how: 'Visible par l’équipe seulement.',
      },
    },
  },
}

export const SANCTION_PANEL_REGISTRY = createRegistry(SANCTION_PANEL_MAP)

/**
 * Gravity metadata
 * @typedef {Object} SanctionGravityOption
 * @property {string} label - Display name
 * @property {string} accent - Tone
 * @property {number} rank - Heavier is higher
 */

interface SanctionGravityOption {
  label: string
  accent: string
  rank: number
}

const SANCTION_GRAVITY_MAP: Record<SanctionGravityName, SanctionGravityOption> = {
  [SanctionGravities.Low]: { label: 'Gravité basse', accent: 'success', rank: 1 },
  [SanctionGravities.Medium]: { label: 'Gravité moyenne', accent: 'caution', rank: 2 },
  [SanctionGravities.High]: { label: 'Gravité haute', accent: 'danger', rank: 3 },
}

export const SANCTION_GRAVITY_REGISTRY = createRegistry(SANCTION_GRAVITY_MAP)
