import twoFactor from '@/configurations/system/a2f.json'
import absences from '@/configurations/system/absences.json'
import academy from '@/configurations/system/academy.json'
import authentication from '@/configurations/system/authentification.json'
import calendar from '@/configurations/system/calendrier.json'
import colours from '@/configurations/system/couleurs.json'
import retention from '@/configurations/system/conservation.json'
import emojis from '@/configurations/system/emojis.json'
import files from '@/configurations/system/fichiers.json'
import forms from '@/configurations/system/forms.json'
import rateLimits from '@/configurations/system/limitation.json'
import livecon from '@/configurations/system/livecon.json'
import notifications from '@/configurations/system/notifications.json'
import pagination from '@/configurations/system/pagination.json'
import perimeter from '@/configurations/system/perimetre.json'
import projects from '@/configurations/system/projets.json'
import responsive from '@/configurations/system/responsive.json'
import sanctions from '@/configurations/system/sanctions.json'
import search from '@/configurations/system/search.json'
import {
  readBoolean,
  readChoice,
  readInteger,
  readNode,
  readString,
  readStringList,
} from '@/declarations/configurations/readers'

// Breakpoint keys, narrowest first
const BREAKPOINT_NAMES = ['sm', 'md', 'lg', 'xl'] as const

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

const pageSize = readInteger(notifications.pageSize, {
  path: 'system/notifications.pageSize',
  fallback: 40,
  min: 1,
  max: maxPerPage,
})

/**
 * Personal notification bounds
 * @type {{ panelSize: number, pageSize: number, maxActions: number, maxMentions: number, staleMs: number }}
 */

export const NOTIFICATION_SETTINGS = {
  pageSize,
  panelSize: readInteger(notifications.panelSize, {
    path: 'system/notifications.panelSize',
    fallback: 6,
    min: 1,
    max: pageSize,
  }),
  maxActions: readInteger(notifications.maxActions, {
    path: 'system/notifications.maxActions',
    fallback: 3,
    min: 0,
    max: pageSize,
  }),
  maxMentions: readInteger(notifications.maxMentions, {
    path: 'system/notifications.maxMentions',
    fallback: 10,
    min: 1,
  }),
  staleMs: readInteger(notifications.staleMs, {
    path: 'system/notifications.staleMs',
    fallback: 60_000,
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
 * @type {{ dayStartHour: number, dayEndHour: number, maxEntriesPerDay: number, rollCallReminderLeadDays: number, rollCallReminderHour: number, rollCallResponsesShared: boolean }}
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
  rollCallReminderLeadDays: readInteger(calendar.rollCallReminderLeadDays, {
    path: 'system/calendrier.rollCallReminderLeadDays',
    fallback: 1,
    min: 0,
  }),
  rollCallReminderHour: readInteger(calendar.rollCallReminderHour, {
    path: 'system/calendrier.rollCallReminderHour',
    fallback: 18,
    min: 0,
    max: 23,
  }),
  rollCallResponsesShared: readBoolean(calendar.rollCallResponsesShared, {
    path: 'system/calendrier.rollCallResponsesShared',
    fallback: false,
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

const smBreakpoint = readInteger((responsive.breakpoints as Record<string, unknown>).sm, {
  path: 'system/responsive.breakpoints.sm',
  fallback: 640,
  min: 320,
})

const mdBreakpoint = readInteger((responsive.breakpoints as Record<string, unknown>).md, {
  path: 'system/responsive.breakpoints.md',
  fallback: 768,
  min: smBreakpoint,
})

const lgBreakpoint = readInteger((responsive.breakpoints as Record<string, unknown>).lg, {
  path: 'system/responsive.breakpoints.lg',
  fallback: 1024,
  min: mdBreakpoint,
})

const xlBreakpoint = readInteger((responsive.breakpoints as Record<string, unknown>).xl, {
  path: 'system/responsive.breakpoints.xl',
  fallback: 1280,
  min: lgBreakpoint,
})

const responsiveShell = readNode(responsive.shell, 'system/responsive.shell')
const responsiveBottomNav = readNode(responsive.bottomNav, 'system/responsive.bottomNav')
const responsiveToast = readNode(responsive.toast, 'system/responsive.toast')
const responsiveToastVisible = readNode(
  responsiveToast.maxVisible,
  'system/responsive.toast.maxVisible'
)

/**
 * Breakpoint and shell chrome bounds
 * @type {{ breakpoints: Record<'sm' | 'md' | 'lg' | 'xl', number>, mobileUntil: 'sm' | 'md' | 'lg' | 'xl', topBarHeight: number, bottomNavHeight: number, sidebarWidth: number, sidebarCollapsedWidth: number, railWidth: number, gutter: number, maxPrimarySlots: number, toastVisibleMobile: number, toastVisibleDesktop: number, touchTargetMin: number }}
 */

export const RESPONSIVE_SETTINGS = {
  breakpoints: { sm: smBreakpoint, md: mdBreakpoint, lg: lgBreakpoint, xl: xlBreakpoint },
  mobileUntil: readChoice(responsive.mobileUntil, {
    path: 'system/responsive.mobileUntil',
    fallback: 'md',
    allowed: BREAKPOINT_NAMES,
  }),
  topBarHeight: readInteger(responsiveShell.topBarHeight, {
    path: 'system/responsive.shell.topBarHeight',
    fallback: 52,
    min: 32,
  }),
  bottomNavHeight: readInteger(responsiveShell.bottomNavHeight, {
    path: 'system/responsive.shell.bottomNavHeight',
    fallback: 64,
    min: 40,
  }),
  sidebarWidth: readInteger(responsiveShell.sidebarWidth, {
    path: 'system/responsive.shell.sidebarWidth',
    fallback: 236,
    min: 160,
  }),
  sidebarCollapsedWidth: readInteger(responsiveShell.sidebarCollapsedWidth, {
    path: 'system/responsive.shell.sidebarCollapsedWidth',
    fallback: 76,
    min: 48,
  }),
  railWidth: readInteger(responsiveShell.railWidth, {
    path: 'system/responsive.shell.railWidth',
    fallback: 68,
    min: 48,
  }),
  gutter: readInteger(responsiveShell.gutter, {
    path: 'system/responsive.shell.gutter',
    fallback: 12,
    min: 0,
    max: 48,
  }),
  maxPrimarySlots: readInteger(responsiveBottomNav.maxSlots, {
    path: 'system/responsive.bottomNav.maxSlots',
    fallback: 4,
    min: 2,
    max: 6,
  }),
  toastVisibleMobile: readInteger(responsiveToastVisible.mobile, {
    path: 'system/responsive.toast.maxVisible.mobile',
    fallback: 1,
    min: 1,
  }),
  toastVisibleDesktop: readInteger(responsiveToastVisible.desktop, {
    path: 'system/responsive.toast.maxVisible.desktop',
    fallback: 3,
    min: 1,
  }),
  touchTargetMin: readInteger(responsive.touchTargetMin, {
    path: 'system/responsive.touchTargetMin',
    fallback: 44,
    min: 24,
    max: 64,
  }),
} as const

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

/**
 * Sign-in and session bounds
 * @type {{ sessionDays: number, stateTtlSeconds: number, avatarSize: number, maxConcurrentSessions: number }}
 */

export const AUTH_SETTINGS = {
  sessionDays: readInteger(authentication.sessionDays, {
    path: 'system/authentification.sessionDays',
    fallback: 14,
    min: 1,
    max: 90,
  }),
  stateTtlSeconds: readInteger(authentication.stateTtlSeconds, {
    path: 'system/authentification.stateTtlSeconds',
    fallback: 600,
    min: 60,
    max: 3600,
  }),
  avatarSize: readInteger(authentication.avatarSize, {
    path: 'system/authentification.avatarSize',
    fallback: 128,
    min: 16,
    max: 4096,
  }),
  maxConcurrentSessions: readInteger(authentication.maxConcurrentSessions, {
    path: 'system/authentification.maxConcurrentSessions',
    fallback: 10,
    min: 1,
  }),
}

/**
 * Second factor bounds
 * @type {{ digits: number, periodSeconds: number, driftSteps: number, secretBytes: number, recoveryCodeCount: number, recoveryCodeBytes: number, unlockMinutes: number, enrolmentMinutes: number }}
 */

export const TWO_FACTOR_SETTINGS = {
  digits: readInteger(twoFactor.digits, {
    path: 'system/a2f.digits',
    fallback: 6,
    min: 6,
    max: 8,
  }),
  periodSeconds: readInteger(twoFactor.periodSeconds, {
    path: 'system/a2f.periodSeconds',
    fallback: 30,
    min: 15,
    max: 120,
  }),
  driftSteps: readInteger(twoFactor.driftSteps, {
    path: 'system/a2f.driftSteps',
    fallback: 1,
    min: 0,
    max: 5,
  }),
  secretBytes: readInteger(twoFactor.secretBytes, {
    path: 'system/a2f.secretBytes',
    fallback: 20,
    min: 16,
    max: 64,
  }),
  recoveryCodeCount: readInteger(twoFactor.recoveryCodeCount, {
    path: 'system/a2f.recoveryCodeCount',
    fallback: 10,
    min: 1,
    max: 32,
  }),
  recoveryCodeBytes: readInteger(twoFactor.recoveryCodeBytes, {
    path: 'system/a2f.recoveryCodeBytes',
    fallback: 5,
    min: 4,
    max: 16,
  }),
  unlockMinutes: readInteger(twoFactor.unlockMinutes, {
    path: 'system/a2f.unlockMinutes',
    fallback: 15,
    min: 1,
    max: 720,
  }),
  enrolmentMinutes: readInteger(twoFactor.enrolmentMinutes, {
    path: 'system/a2f.enrolmentMinutes',
    fallback: 10,
    min: 1,
    max: 60,
  }),
}

/**
 * One rate limit window
 * @typedef {Object} RateLimitWindow
 * @property {number} windowSeconds - Window length
 * @property {number} max - Attempts allowed
 */

export interface RateLimitWindow {
  windowSeconds: number
  max: number
}

/**
 * Read one rate limit window
 * @param {string} name - Policy name
 * @param {RateLimitWindow} fallback - Default window
 * @return {RateLimitWindow} - Bounded window
 */

export const readRateLimitWindow = (name: string, fallback: RateLimitWindow): RateLimitWindow => {
  const path = `system/limitation.${name}`
  const node = readNode((rateLimits as Record<string, unknown>)[name], path)

  return {
    windowSeconds: readInteger(node.windowSeconds, {
      path: `${path}.windowSeconds`,
      fallback: fallback.windowSeconds,
      min: 1,
    }),
    max: readInteger(node.max, { path: `${path}.max`, fallback: fallback.max, min: 1 }),
  }
}

/**
 * How long each family of personal data is kept
 * @type {{ expiredSessionDays: number, readNotificationDays: number, activityLogDays: number, rejectedCandidateDays: number, orphanFileHours: number, consentVersion: number }}
 */

export const RETENTION_SETTINGS = {
  expiredSessionDays: readInteger(retention.expiredSessionDays, {
    path: 'system/conservation.expiredSessionDays',
    fallback: 7,
    min: 1,
  }),
  readNotificationDays: readInteger(retention.readNotificationDays, {
    path: 'system/conservation.readNotificationDays',
    fallback: 90,
    min: 1,
  }),
  activityLogDays: readInteger(retention.activityLogDays, {
    path: 'system/conservation.activityLogDays',
    fallback: 365,
    min: 30,
  }),
  rejectedCandidateDays: readInteger(retention.rejectedCandidateDays, {
    path: 'system/conservation.rejectedCandidateDays',
    fallback: 180,
    min: 1,
  }),
  orphanFileHours: readInteger(retention.orphanFileHours, {
    path: 'system/conservation.orphanFileHours',
    fallback: 24,
    min: 1,
  }),
  consentVersion: readInteger(retention.consentVersion, {
    path: 'system/conservation.consentVersion',
    fallback: 1,
    min: 1,
  }),
}
