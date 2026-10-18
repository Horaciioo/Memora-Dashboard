import { createRegistry } from '@/core/lib/registry'
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
 * @property {ModViewWindow[][]} columns - Starting arrangement, column by column
 * @property {number[]} widths - Starting width of each column
 * @property {Partial<Record<ModViewWindow, number>>} sizes - Starting height share of a window
 * @property {ModViewWindow[]} hidden - Windows closed at first
 */

interface ModViewProfileOption {
  label: string
  windows: ModViewWindow[]
  columns: ModViewWindow[][]
  widths: number[]
  sizes: Partial<Record<ModViewWindow, number>>
  hidden: ModViewWindow[]
}

const FLOOR: ModViewWindow[] = ['stream', 'chat', 'automod', 'modActions', 'community']

// The stream and the chat get the room first
const SIZES: Partial<Record<ModViewWindow, number>> = { stream: 1.8 }
const FLOOR_COLUMNS: ModViewWindow[][] = [
  ['stream', 'modActions'],
  ['chat'],
  ['automod', 'community'],
]

const PROFILE_MAP: Record<ModViewProfileName, ModViewProfileOption> = {
  moderator: {
    label: 'Modérateur',
    windows: FLOOR,
    columns: FLOOR_COLUMNS,
    widths: [1.8, 1.6, 1],
    sizes: SIZES,
    hidden: ['community'],
  },
  trainer: {
    label: 'Formateur',
    windows: FLOOR,
    columns: FLOOR_COLUMNS,
    widths: [1.8, 1.6, 1],
    sizes: SIZES,
    hidden: ['community'],
  },
  lead: {
    label: 'Responsable',
    windows: FLOOR,
    columns: FLOOR_COLUMNS,
    widths: [1.8, 1.6, 1],
    sizes: SIZES,
    hidden: [],
  },
  admin: {
    label: 'Admin',
    windows: [...FLOOR, 'unbanRequests'],
    columns: [['stream', 'modActions'], ['chat'], ['automod', 'community', 'unbanRequests']],
    widths: [1.8, 1.6, 1],
    sizes: SIZES,
    hidden: [],
  },
}

export const MODVIEW_PROFILES = createRegistry(PROFILE_MAP)
