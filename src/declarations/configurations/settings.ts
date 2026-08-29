import absences from '@/configurations/system/absences.json'
import academy from '@/configurations/system/academy.json'
import calendar from '@/configurations/system/calendrier.json'
import colours from '@/configurations/system/couleurs.json'
import emojis from '@/configurations/system/emojis.json'
import files from '@/configurations/system/fichiers.json'
import forms from '@/configurations/system/forms.json'
import livecon from '@/configurations/system/livecon.json'
import pagination from '@/configurations/system/pagination.json'
import perimeter from '@/configurations/system/perimetre.json'
import projects from '@/configurations/system/projets.json'
import sanctions from '@/configurations/system/sanctions.json'
import search from '@/configurations/system/search.json'
import {
  readBoolean,
  readInteger,
  readString,
  readStringList,
} from '@/declarations/configurations/readers'

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

const maxSteps = readInteger(sanctions.maxSteps, {
  path: 'system/sanctions.maxSteps',
  fallback: 6,
  min: 1,
})

/**
 * Sanction ladder bounds
 * @type {{ maxSteps: number, defaultSteps: number, maxTimeoutMinutes: number }}
 */

export const SANCTION_SETTINGS = {
  maxSteps,
  defaultSteps: readInteger(sanctions.defaultSteps, {
    path: 'system/sanctions.defaultSteps',
    fallback: 3,
    min: 1,
    max: maxSteps,
  }),
  maxTimeoutMinutes: readInteger(sanctions.maxTimeoutMinutes, {
    path: 'system/sanctions.maxTimeoutMinutes',
    fallback: 20160,
    min: 1,
  }),
}

/**
 * Creator perimeter settings
 * @type {{ includeUnassigned: boolean }}
 */

export const SCOPE_SETTINGS = {
  includeUnassigned: readBoolean(perimeter.includeUnassigned, {
    path: 'system/perimetre.includeUnassigned',
    fallback: true,
  }),
}

/**
 * Upload bounds of the file field
 * @type {{ maxBytes: number, allowedTypes: string[] }}
 */

export const FILE_SETTINGS = {
  maxBytes: readInteger(files.maxBytes, {
    path: 'system/fichiers.maxBytes',
    fallback: 2_097_152,
    min: 1,
  }),
  allowedTypes: readStringList(files.allowedTypes, {
    path: 'system/fichiers.allowedTypes',
    fallback: ['image/png', 'image/jpeg', 'image/webp'],
  }),
}

const weeksMax = readInteger(academy.weeksMax, {
  path: 'system/academy.weeksMax',
  fallback: 6,
  min: 1,
})

const stepOffsetMax = readInteger(academy.stepOffsetMax, {
  path: 'system/academy.stepOffsetMax',
  fallback: 60,
  min: 1,
})

const skillMaxPercent = readInteger(academy.skillMaxPercent, {
  path: 'system/academy.skillMaxPercent',
  fallback: 100,
  min: 1,
})

const trainingMaxMinutes = readInteger(academy.trainingMaxMinutes, {
  path: 'system/academy.trainingMaxMinutes',
  fallback: 50,
  min: 1,
})

/**
 * Academy bounds
 * @type {{ maxLives: number, minObjectives: number, weeksMin: number, weeksMax: number, stepOffsetMin: number, stepOffsetMax: number, bonusMaxLives: number, skillMaxPercent: number, skillStep: number, trainingMinMinutes: number, trainingMaxMinutes: number, inviteExpiryDays: number, inviteMaxUses: number }}
 */

export const ACADEMY_SETTINGS = {
  weeksMax,
  stepOffsetMax,
  skillMaxPercent,
  trainingMaxMinutes,
  trainingMinMinutes: readInteger(academy.trainingMinMinutes, {
    path: 'system/academy.trainingMinMinutes',
    fallback: 20,
    min: 1,
    max: trainingMaxMinutes,
  }),
  inviteExpiryDays: readInteger(academy.inviteExpiryDays, {
    path: 'system/academy.inviteExpiryDays',
    fallback: 14,
    min: 1,
  }),
  inviteMaxUses: readInteger(academy.inviteMaxUses, {
    path: 'system/academy.inviteMaxUses',
    fallback: 50,
    min: 1,
  }),
  maxLives: readInteger(academy.maxLives, {
    path: 'system/academy.maxLives',
    fallback: 13,
    min: 1,
  }),
  minObjectives: readInteger(academy.minObjectives, {
    path: 'system/academy.minObjectives',
    fallback: 2,
    min: 1,
  }),
  weeksMin: readInteger(academy.weeksMin, {
    path: 'system/academy.weeksMin',
    fallback: 4,
    min: 1,
    max: weeksMax,
  }),
  stepOffsetMin: readInteger(academy.stepOffsetMin, {
    path: 'system/academy.stepOffsetMin',
    fallback: -30,
    max: stepOffsetMax,
  }),
  bonusMaxLives: readInteger(academy.bonusMaxLives, {
    path: 'system/academy.bonusMaxLives',
    fallback: 4,
    min: 0,
  }),
  skillStep: readInteger(academy.skillStep, {
    path: 'system/academy.skillStep',
    fallback: 5,
    min: 1,
    max: skillMaxPercent,
  }),
}

const dayEndHour = readInteger(calendar.dayEndHour, {
  path: 'system/calendrier.dayEndHour',
  fallback: 23,
  min: 1,
  max: 23,
})

/**
 * Calendar bounds
 * @type {{ dayStartHour: number, dayEndHour: number, maxEntriesPerDay: number }}
 */

export const CALENDAR_SETTINGS = {
  dayEndHour,
  dayStartHour: readInteger(calendar.dayStartHour, {
    path: 'system/calendrier.dayStartHour',
    fallback: 7,
    min: 0,
    max: dayEndHour,
  }),
  maxEntriesPerDay: readInteger(calendar.maxEntriesPerDay, {
    path: 'system/calendrier.maxEntriesPerDay',
    fallback: 3,
    min: 1,
  }),
}

/**
 * Project team bounds
 * @type {{ leadMax: number }}
 */

export const PROJECT_SETTINGS = {
  leadMax: readInteger(projects.leadMax, {
    path: 'system/projets.leadMax',
    fallback: 3,
    min: 1,
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
    path: 'system/couleurs.defaultAccent',
    fallback: 'var(--color-brand-600)',
  }),
  swatches: readStringList(colours.swatches, {
    path: 'system/couleurs.swatches',
    fallback: [],
  }),
}
