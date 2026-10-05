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
 * @property {string} chrome - Window bar
 * @property {string} rule - Light lines
 * @property {string} alertSoft - Red wash
 * @property {string} muted - Grey line
 * @property {string} deep - Dark shape
 */

export interface PosterPalette {
  ground: string
  blob: string
  blobSoft: string
  ink: string
  paper: string
  accent: string
  alert: string
  chrome: string
  rule: string
  alertSoft: string
  muted: string
  deep: string
}

// Shared by every poster
const SHARED = {
  ink: '#1e1a17',
  paper: '#fffefb',
  accent: '#dfa5ae',
  alert: '#b23a2e',
  chrome: '#2f2a25',
  rule: '#d9cfc0',
  alertSoft: '#f2cdc6',
  muted: '#8a8076',
  deep: '#4a433b',
}

/**
 * Palette of each place a course happens
 * @type {Record<CourseSurface, PosterPalette>}
 */

export const COURSE_POSTERS: Record<CourseSurface, PosterPalette> = {
  twitch: {
    ground: '#faeaec',
    blob: '#f5d8dc',
    blobSoft: '#f7e1e4',
    ...SHARED,
  },
  discord: {
    ground: '#e4effa',
    blob: '#cbe0f5',
    blobSoft: '#d6e7f7',
    ...SHARED,
  },
  youtube: {
    ground: '#f8e3df',
    blob: '#f2cdc6',
    blobSoft: '#f5d6d0',
    ...SHARED,
  },
  lives: {
    ground: '#eef5d6',
    blob: '#e0edb8',
    blobSoft: '#e6f0c6',
    ...SHARED,
  },
  general: {
    ground: '#f9e9d6',
    blob: '#f3d6b0',
    blobSoft: '#f5deba',
    ...SHARED,
  },
}
