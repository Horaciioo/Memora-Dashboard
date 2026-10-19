import { createRegistry } from '@/core/lib/registry'
import type { ColumnSpec } from '@/core/lib/modview/layout'
import type { ModViewWindow } from '@/types/modview'

/**
 * Seats a Mod View is arranged for
 * @type {Record<string, string>}
 */

export const ModViewProfiles = {
  Moderator: 'moderator',
  Trainer: 'trainer',
  Lead: 'lead',
  Admin: 'admin',
} as const

export type ModViewProfileName = (typeof ModViewProfiles)[keyof typeof ModViewProfiles]

/**
 * One seat of the Mod View
 * @typedef {Object} ModViewProfileOption
 * @property {string} label - Seat name
 * @property {ModViewWindow[]} windows - Windows the seat may open
 * @property {ColumnSpec[]} columns - Starting arrangement, column by column, a pair shares a row
 * @property {number[]} widths - Starting width of each column
 * @property {Partial<Record<ModViewWindow, number>>} sizes - Starting height share of a window
 * @property {ModViewWindow[]} hidden - Windows closed at first
 */

interface ModViewProfileOption {
  label: string
  windows: ModViewWindow[]
  columns: ColumnSpec[]
  widths: number[]
  sizes: Partial<Record<ModViewWindow, number>>
  hidden: ModViewWindow[]
}

const FLOOR: ModViewWindow[] = ['stream', 'chat', 'automod', 'modActions', 'community']

// The stream and the chat get the room first
const SIZES: Partial<Record<ModViewWindow, number>> = { stream: 1.6 }

// The audience is a sidebar glyph, the actions and the queue share a row under the stream
const FLOOR_COLUMNS: ColumnSpec[] = [['stream', ['modActions', 'automod']], ['chat']]

const PROFILE_MAP: Record<ModViewProfileName, ModViewProfileOption> = {
  moderator: {
    label: 'Modérateur',
    windows: FLOOR,
    columns: FLOOR_COLUMNS,
    widths: [1.7, 1],
    sizes: SIZES,
    hidden: ['community'],
  },
  trainer: {
    label: 'Formateur',
    windows: FLOOR,
    columns: FLOOR_COLUMNS,
    widths: [1.7, 1],
    sizes: SIZES,
    hidden: ['community'],
  },
  lead: {
    label: 'Responsable',
    windows: [...FLOOR, 'inspect'],
    columns: [
      ['stream', ['modActions', 'automod']],
      ['chat', 'inspect'],
    ],
    widths: [1.7, 1],
    sizes: SIZES,
    hidden: [],
  },
  admin: {
    label: 'Admin',
    windows: [...FLOOR, 'inspect', 'unbanRequests'],
    columns: [['stream', ['modActions', 'automod']], ['chat'], ['inspect', 'unbanRequests']],
    widths: [1.7, 1, 0.8],
    sizes: SIZES,
    // Inspect Mod takes the place of the unban requests
    hidden: ['unbanRequests'],
  },
}

export const MODVIEW_PROFILES = createRegistry(PROFILE_MAP)
