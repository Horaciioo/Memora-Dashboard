import type { CourseSurface } from '@/declarations/academy/curriculum/types'

/**
 * Flat colours of a course poster
 * @typedef {Object} PosterPalette
 * @property {string} ground - Background
 * @property {string} blob - Large round shape behind the scene
 * @property {string} blobSoft - Second round shape
 * @property {string} ink - Dark shapes
 * @property {string} paper - Light shapes
 * @property {string} accent - Pink accent
 * @property {string} alert - Red mark of what a moderator acts on
 */

export interface PosterPalette {
  ground: string
  blob: string
  blobSoft: string
  ink: string
  paper: string
  accent: string
  alert: string
}

// Shared by every poster
const INK = '#18181b'
const PAPER = '#ffffff'
const ACCENT = '#ff7fb2'
const ALERT = '#dc2626'

/**
 * Palette of each place a course happens
 * @type {Record<CourseSurface, PosterPalette>}
 */

export const COURSE_POSTERS: Record<CourseSurface, PosterPalette> = {
  twitch: {
    ground: '#ffe3ee',
    blob: '#ffcfe3',
    blobSoft: '#ffd7e7',
    ink: INK,
    paper: PAPER,
    accent: ACCENT,
    alert: ALERT,
  },
  discord: {
    ground: '#dbe8ff',
    blob: '#c4d9ff',
    blobSoft: '#cfe0ff',
    ink: INK,
    paper: PAPER,
    accent: ACCENT,
    alert: ALERT,
  },
  youtube: {
    ground: '#ffe1e1',
    blob: '#ffc9c9',
    blobSoft: '#ffd3d3',
    ink: INK,
    paper: PAPER,
    accent: ACCENT,
    alert: ALERT,
  },
  lives: {
    ground: '#dcf5e4',
    blob: '#c3ecd1',
    blobSoft: '#cdf0d9',
    ink: INK,
    paper: PAPER,
    accent: ACCENT,
    alert: ALERT,
  },
  general: {
    ground: '#ffe8d1',
    blob: '#ffd9b0',
    blobSoft: '#ffdcb8',
    ink: INK,
    paper: PAPER,
    accent: ACCENT,
    alert: ALERT,
  },
}
