import absences from '@/configurations/system/absences.json'
import forms from '@/configurations/system/forms.json'
import livecon from '@/configurations/system/livecon.json'
import pagination from '@/configurations/system/pagination.json'
import search from '@/configurations/system/search.json'
import { readInteger } from '@/declarations/configurations/readers'

const maxPerPage = readInteger(pagination.maxPerPage, {
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
  divisionMaxRank: readInteger(forms.divisionMaxRank, {
    path: 'system/forms.divisionMaxRank',
    fallback: 10,
    min: 1,
  }),
  priorityMaxWeight: readInteger(forms.priorityMaxWeight, {
    path: 'system/forms.priorityMaxWeight',
    fallback: 100,
    min: 1,
  }),
} as const

const maxDays = readInteger(absences.maxDays, {
  path: 'system/absences.maxDays',
  fallback: 180,
  min: 1,
})

/**
 * Absence rules
 * @type {{ thresholdDays: number, maxDays: number, noticeDays: number }}
 */

export const ABSENCE_SETTINGS = {
  maxDays,
  thresholdDays: readInteger(absences.thresholdDays, {
    path: 'system/absences.thresholdDays',
    fallback: 5,
    min: 0,
    max: maxDays,
  }),
  noticeDays: readInteger(absences.noticeDays, {
    path: 'system/absences.noticeDays',
    fallback: 3,
    min: 0,
    max: maxDays,
  }),
}

/**
 * Search behaviour
 * @type {{ minLength: number, maxResultsPerGroup: number, debounceMs: number }}
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
}

const maxLevel = readInteger(livecon.maxLevel, {
  path: 'system/livecon.maxLevel',
  fallback: 3,
  min: 1,
})

/**
 * Livecon bounds
 * @type {{ minLevel: number, maxLevel: number, defaultLevel: number }}
 */

export const LIVECON_SETTINGS = {
  maxLevel,
  minLevel: readInteger(livecon.minLevel, {
    path: 'system/livecon.minLevel',
    fallback: 1,
    min: 1,
    max: maxLevel,
  }),
  defaultLevel: readInteger(livecon.defaultLevel, {
    path: 'system/livecon.defaultLevel',
    fallback: 3,
    min: 1,
    max: maxLevel,
  }),
}
