import colours from '@/configurations/system/colours.json'
import emojis from '@/configurations/system/emojis.json'
import files from '@/configurations/system/files.json'
import forms from '@/configurations/system/forms.json'
import pagination from '@/configurations/system/pagination.json'
import search from '@/configurations/system/search.json'
import { readInteger, readString, readStringList } from '@/declarations/configurations/readers'

export const maxPerPage = readInteger(pagination.maxPerPage, {
  path: 'system/pagination.maxPerPage',
  fallback: 100,
  min: 1,
})

const defaultPerPage = readInteger(pagination.defaultPerPage, {
  path: 'system/pagination.defaultPerPage',
  fallback: 25,
  min: 1,
  max: maxPerPage,
})

/**
 * Pagination settings
 * @type {{ defaultPerPage: number, maxPerPage: number }}
 */

export const PAGINATION_SETTINGS = { defaultPerPage, maxPerPage }

const markdownMaxLength = readInteger(forms.markdownMaxLength, {
  path: 'system/forms.markdownMaxLength',
  fallback: 8000,
  min: 1,
})

const longTextMaxLength = readInteger(forms.longTextMaxLength, {
  path: 'system/forms.longTextMaxLength',
  fallback: 2000,
  min: 1,
  max: markdownMaxLength,
})

const shortTextMaxLength = readInteger(forms.shortTextMaxLength, {
  path: 'system/forms.shortTextMaxLength',
  fallback: 120,
  min: 1,
  max: longTextMaxLength,
})

const meetingMaxDuration = readInteger(forms.meetingMaxDuration, {
  path: 'system/forms.meetingMaxDuration',
  fallback: 480,
  min: 1,
})

/**
 * Form field bounds
 * @type {Record<string, number>}
 */

export const FORM_SETTINGS = {
  shortTextMaxLength,
  // Rating bounds
  scaleMin: readInteger(forms.scaleMin, { path: 'system/forms.scaleMin', fallback: 1, min: 0 }),
  scaleMax: readInteger(forms.scaleMax, { path: 'system/forms.scaleMax', fallback: 5, min: 1 }),
  // Year a birthday picker opens on
  birthdayStartYear: readInteger(forms.birthdayStartYear, {
    path: 'system/forms.birthdayStartYear',
    fallback: 2005,
    min: 1900,
  }),
  longTextMaxLength,
  markdownMaxLength,
  titleMaxLength: readInteger(forms.titleMaxLength, {
    path: 'system/forms.titleMaxLength',
    fallback: 160,
    min: 1,
    max: longTextMaxLength,
  }),
  noteMaxLength: readInteger(forms.noteMaxLength, {
    path: 'system/forms.noteMaxLength',
    fallback: 4000,
    min: 1,
    max: markdownMaxLength,
  }),
  tagMaxCount: readInteger(forms.tagMaxCount, {
    path: 'system/forms.tagMaxCount',
    fallback: 12,
    min: 1,
  }),
  positionStep: readInteger(forms.positionStep, {
    path: 'system/forms.positionStep',
    fallback: 1000,
    min: 1,
  }),
  meetingMaxDuration,
  meetingMinDuration: readInteger(forms.meetingMinDuration, {
    path: 'system/forms.meetingMinDuration',
    fallback: 5,
    min: 1,
    max: meetingMaxDuration,
  }),
  priorityMaxWeight: readInteger(forms.priorityMaxWeight, {
    path: 'system/forms.priorityMaxWeight',
    fallback: 100,
    min: 1,
  }),
} as const

/**
 * Search behaviour
 * @type {{ minLength: number, maxResultsPerGroup: number, debounceMs: number, recentLimit: number, recentPagesShown: number }}
 */

export const SEARCH_SETTINGS = {
  minLength: readInteger(search.minLength, {
    path: 'system/search.minLength',
    fallback: 2,
    min: 1,
  }),
  maxResultsPerGroup: readInteger(search.maxResultsPerGroup, {
    path: 'system/search.maxResultsPerGroup',
    fallback: 5,
    min: 1,
    max: maxPerPage,
  }),
  debounceMs: readInteger(search.debounceMs, {
    path: 'system/search.debounceMs',
    fallback: 180,
    min: 0,
  }),
  recentLimit: 5,
  // Pages shown in the palette
  recentPagesShown: 3,
}

/**
 * Upload bounds of the file field
 * @type {{ maxBytes: number, bodyMaxBytes: number, allowedTypes: string[] }}
 */

export const FILE_SETTINGS = {
  maxBytes: readInteger(files.maxBytes, {
    path: 'system/files.maxBytes',
    fallback: 2_097_152,
    min: 1,
  }),
  bodyMaxBytes: readInteger(files.bodyMaxBytes, {
    path: 'system/files.bodyMaxBytes',
    fallback: 4_194_304,
    min: 1,
  }),
  allowedTypes: readStringList(files.allowedTypes, {
    path: 'system/files.allowedTypes',
    fallback: ['image/png', 'image/jpeg', 'image/webp'],
  }),
}

/**
 * Glyphs offered by the emoji picker
 * @type {{ maxLength: number, searchMax: number, suggestions: string[] }}
 */

export const EMOJI_SETTINGS = {
  maxLength: readInteger(emojis.maxLength, {
    path: 'system/emojis.maxLength',
    fallback: 4,
    min: 1,
  }),
  searchMax: readInteger(emojis.searchMax, {
    path: 'system/emojis.searchMax',
    fallback: 120,
    min: 1,
  }),
  suggestions: readStringList(emojis.suggestions, {
    path: 'system/emojis.suggestions',
    fallback: [],
  }),
}

/**
 * Accent palette offered by the colour wheel
 * @type {{ defaultAccent: string, swatches: string[] }}
 */

export const COLOUR_SETTINGS = {
  defaultAccent: readString(colours.defaultAccent, {
    path: 'system/colours.defaultAccent',
    fallback: 'var(--color-brand-600)',
  }),
  swatches: readStringList(colours.swatches, {
    path: 'system/colours.swatches',
    fallback: [],
  }),
}
