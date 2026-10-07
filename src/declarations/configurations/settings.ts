import twoFactor from '@/configurations/system/a2f.json'
import absences from '@/configurations/system/absences.json'
import agenda from '@/configurations/system/agenda.json'
import home from '@/configurations/system/accueil.json'
import legacy from '@/configurations/system/legacy.json'
import academy from '@/configurations/system/academy.json'
import authentication from '@/configurations/system/authentification.json'
import cache from '@/configurations/system/cache.json'
import calendar from '@/configurations/system/calendrier.json'
import colours from '@/configurations/system/couleurs.json'
import timeouts from '@/configurations/system/delais.json'
import retention from '@/configurations/system/conservation.json'
import emojis from '@/configurations/system/emojis.json'
import files from '@/configurations/system/fichiers.json'
import forms from '@/configurations/system/forms.json'
import gestures from '@/configurations/system/gestes.json'
import rateLimits from '@/configurations/system/limitation.json'
import livecon from '@/configurations/system/livecon.json'
import lives from '@/configurations/system/lives.json'
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
  readNumber as readBoundedNumber,
  readString,
  readStringList,
} from '@/declarations/configurations/readers'

/**
 * Finite ratio or fallback
 * @param {unknown} value - Raw value
 * @param {number} fallback - Default
 * @return {number} - Number read
 */

const readNumber = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback

// Breakpoint keys
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
  // Rating bounds
  scaleMin: readInteger(forms.scaleMin, { path: 'system/forms.scaleMin', fallback: 1, min: 0 }),
  scaleMax: readInteger(forms.scaleMax, { path: 'system/forms.scaleMax', fallback: 5, min: 1 }),
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

/**
 * Announced lives and their Mod View
 * @type {{ defaultDurationMinutes: number, endGraceMinutes: number, streamKeepAliveSeconds: number, heartbeatSeconds: number, idleSeconds: number, staleSeconds: number, maxOpenLives: number, watchSyncSeconds: number, eventsubKeepaliveSeconds: number, recentEvents: number, idempotencyMinutes: number, watchLeadMinutes: number, reportBucketMinutes: number, logLines: number, pastLives: number, hoursWindowDays: number, memberLives: number }}
 */

export const LIVE_SETTINGS = {
  defaultDurationMinutes: readInteger(lives.defaultDurationMinutes, {
    path: 'system/lives.defaultDurationMinutes',
    fallback: 180,
    min: 15,
  }),
  viewerHistorySize: readInteger(lives.viewerHistorySize, {
    path: 'system/lives.viewerHistorySize',
    fallback: 10,
    min: 1,
  }),
  inspectSize: readInteger(lives.inspectSize, {
    path: 'system/lives.inspectSize',
    fallback: 30,
    min: 1,
  }),
  focusPollSeconds: readInteger(lives.focusPollSeconds, {
    path: 'system/lives.focusPollSeconds',
    fallback: 10,
    min: 2,
  }),
  endGraceMinutes: readInteger(lives.endGraceMinutes, {
    path: 'system/lives.endGraceMinutes',
    fallback: 5,
    min: 0,
  }),
  streamKeepAliveSeconds: readInteger(lives.streamKeepAliveSeconds, {
    path: 'system/lives.streamKeepAliveSeconds',
    fallback: 25,
    min: 5,
  }),
  heartbeatSeconds: readInteger(lives.heartbeatSeconds, {
    path: 'system/lives.heartbeatSeconds',
    fallback: 15,
    min: 5,
  }),
  idleSeconds: readInteger(lives.idleSeconds, {
    path: 'system/lives.idleSeconds',
    fallback: 120,
    min: 10,
  }),
  staleSeconds: readInteger(lives.staleSeconds, {
    path: 'system/lives.staleSeconds',
    fallback: 60,
    min: 10,
  }),
  maxOpenLives: readInteger(lives.maxOpenLives, {
    path: 'system/lives.maxOpenLives',
    fallback: 12,
    min: 1,
  }),
  watchSyncSeconds: readInteger(lives.watchSyncSeconds, {
    path: 'system/lives.watchSyncSeconds',
    fallback: 30,
    min: 5,
  }),
  eventsubKeepaliveSeconds: readInteger(lives.eventsubKeepaliveSeconds, {
    path: 'system/lives.eventsubKeepaliveSeconds',
    fallback: 30,
    min: 10,
    max: 600,
  }),
  recentEvents: readInteger(lives.recentEvents, {
    path: 'system/lives.recentEvents',
    fallback: 300,
    min: 20,
  }),
  idempotencyMinutes: readInteger(lives.idempotencyMinutes, {
    path: 'system/lives.idempotencyMinutes',
    fallback: 10,
    min: 1,
  }),
  watchLeadMinutes: readInteger(lives.watchLeadMinutes, {
    path: 'system/lives.watchLeadMinutes',
    fallback: 90,
    min: 0,
  }),
  reportBucketMinutes: readInteger(lives.reportBucketMinutes, {
    path: 'system/lives.reportBucketMinutes',
    fallback: 5,
    min: 1,
  }),
  logLines: readInteger(lives.logLines, {
    path: 'system/lives.logLines',
    fallback: 500,
    min: 50,
  }),
  pastLives: readInteger(lives.pastLives, {
    path: 'system/lives.pastLives',
    fallback: 20,
    min: 1,
  }),
  hoursWindowDays: readInteger(lives.hoursWindowDays, {
    path: 'system/lives.hoursWindowDays',
    fallback: 30,
    min: 1,
  }),
  memberLives: readInteger(lives.memberLives, {
    path: 'system/lives.memberLives',
    fallback: 20,
    min: 1,
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
 * @type {{ exercisePassPercent: number, chatLineDelayMs: number, chatTypingMs: number, conversationLineMs: number, judgementLineMs: number, courseSampleOffenses: number, tourStepMs: number, tourBuildMs: number, orgBubbleMs: number, liveconCycleMs: number, ladderRungDelayMs: number, feedbackScale: number, ceremonyFillMs: number, ceremonySlamMs: number, ceremonyFlyMs: number, ceremonyConfetti: number, ceremonyBurstPx: number, maxLives: number, minObjectives: number, weeksMin: number, weeksMax: number, stepOffsetMin: number, stepOffsetMax: number, bonusMaxLives: number, skillMaxPercent: number, skillStep: number, trainingMinMinutes: number, trainingMaxMinutes: number, inviteExpiryDays: number, inviteMaxUses: number }}
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
  firstPeriodLives: readInteger(academy.firstPeriodLives, {
    path: 'system/academy.firstPeriodLives',
    fallback: 7,
    min: 1,
  }),
  secondPeriodLives: readInteger(academy.secondPeriodLives, {
    path: 'system/academy.secondPeriodLives',
    fallback: 6,
    min: 1,
  }),
  maxObjectives: readInteger(academy.maxObjectives, {
    path: 'system/academy.maxObjectives',
    fallback: 2,
    min: 0,
  }),
  thirdPeriodMinDays: readInteger(academy.thirdPeriodMinDays, {
    path: 'system/academy.thirdPeriodMinDays',
    fallback: 3,
    min: 1,
  }),
  thirdPeriodMaxDays: readInteger(academy.thirdPeriodMaxDays, {
    path: 'system/academy.thirdPeriodMaxDays',
    fallback: 30,
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
  exercisePassPercent: readInteger(academy.exercisePassPercent, {
    path: 'system/academy.exercisePassPercent',
    fallback: 80,
    min: 1,
    max: 100,
  }),
  chatLineDelayMs: readInteger(academy.chatLineDelayMs, {
    path: 'system/academy.chatLineDelayMs',
    fallback: 900,
    min: 0,
  }),
  chatTypingMs: readInteger(academy.chatTypingMs, {
    path: 'system/academy.chatTypingMs',
    fallback: 700,
    min: 0,
  }),
  courseSampleOffenses: readInteger(academy.courseSampleOffenses, {
    path: 'system/academy.courseSampleOffenses',
    fallback: 3,
    min: 1,
  }),
  tourStepMs: readInteger(academy.tourStepMs, {
    path: 'system/academy.tourStepMs',
    fallback: 5200,
    min: 1000,
  }),
  tourBuildMs: readInteger(academy.tourBuildMs, {
    path: 'system/academy.tourBuildMs',
    fallback: 1400,
    min: 0,
  }),
  orgBubbleMs: readInteger(academy.orgBubbleMs, {
    path: 'system/academy.orgBubbleMs',
    fallback: 2600,
    min: 600,
  }),
  liveconCycleMs: readInteger(academy.liveconCycleMs, {
    path: 'system/academy.liveconCycleMs',
    fallback: 3800,
    min: 1000,
  }),
  judgementLineMs: readInteger(academy.judgementLineMs, {
    path: 'system/academy.judgementLineMs',
    fallback: 1800,
    min: 300,
  }),
  conversationLineMs: readInteger(academy.conversationLineMs, {
    path: 'system/academy.conversationLineMs',
    fallback: 2800,
    min: 500,
  }),
  ladderRungDelayMs: readInteger(academy.ladderRungDelayMs, {
    path: 'system/academy.ladderRungDelayMs',
    fallback: 420,
    min: 0,
  }),
  feedbackScale: readInteger(academy.feedbackScale, {
    path: 'system/academy.feedbackScale',
    fallback: 10,
    min: 2,
  }),
  ceremonyFillMs: readInteger(academy.ceremonyFillMs, {
    path: 'system/academy.ceremonyFillMs',
    fallback: 900,
    min: 0,
  }),
  ceremonySlamMs: readInteger(academy.ceremonySlamMs, {
    path: 'system/academy.ceremonySlamMs',
    fallback: 1600,
    min: 0,
  }),
  ceremonyFlyMs: readInteger(academy.ceremonyFlyMs, {
    path: 'system/academy.ceremonyFlyMs',
    fallback: 900,
    min: 0,
  }),
  ceremonyConfetti: readInteger(academy.ceremonyConfetti, {
    path: 'system/academy.ceremonyConfetti',
    fallback: 40,
    min: 0,
  }),
  ceremonyBurstPx: readInteger(academy.ceremonyBurstPx, {
    path: 'system/academy.ceremonyBurstPx',
    fallback: 340,
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
  // Pointer snap
  stepMinutes: readInteger(calendar.stepMinutes, {
    path: 'system/calendrier.stepMinutes',
    fallback: 15,
    min: 5,
    max: 60,
  }),
  // One grid row
  rowMinutes: readInteger(calendar.rowMinutes, {
    path: 'system/calendrier.rowMinutes',
    fallback: 60,
    min: 15,
    max: 120,
  }),
  // Click-created length
  defaultDurationMinutes: readInteger(calendar.defaultDurationMinutes, {
    path: 'system/calendrier.defaultDurationMinutes',
    fallback: 60,
    min: 5,
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
const responsiveDrawer = readNode(responsive.drawer, 'system/responsive.drawer')
const responsiveToastVisible = readNode(
  responsiveToast.maxVisible,
  'system/responsive.toast.maxVisible'
)

/**
 * Breakpoint and shell chrome bounds
 * @type {{ breakpoints: Record<'sm' | 'md' | 'lg' | 'xl', number>, mobileUntil: 'sm' | 'md' | 'lg' | 'xl', topBarHeight: number, bottomNavHeight: number, sidebarWidth: number, sidebarCompactWidth: number, bannerHeight: number, bannerHeightMobile: number, notchHeight: number, notchSlope: number, maxPrimarySlots: number, toastVisibleMobile: number, toastVisibleDesktop: number, touchTargetMin: number, drawerWidth: number, drawerHeightShare: number, drawerMinHeight: number, drawerGap: number }}
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
    fallback: 264,
    min: 160,
  }),
  sidebarCompactWidth: readInteger(responsiveShell.sidebarCompactWidth, {
    path: 'system/responsive.shell.sidebarCompactWidth',
    fallback: 80,
    min: 64,
  }),
  bannerHeight: readInteger(responsiveShell.bannerHeight, {
    path: 'system/responsive.shell.bannerHeight',
    fallback: 184,
    min: 96,
  }),
  bannerHeightMobile: readInteger(responsiveShell.bannerHeightMobile, {
    path: 'system/responsive.shell.bannerHeightMobile',
    fallback: 144,
    min: 96,
  }),
  notchHeight: readInteger(responsiveShell.notchHeight, {
    path: 'system/responsive.shell.notchHeight',
    fallback: 52,
    min: 32,
  }),
  notchSlope: readInteger(responsiveShell.notchSlope, {
    path: 'system/responsive.shell.notchSlope',
    fallback: 36,
    min: 12,
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
  drawerWidth: readInteger(responsiveDrawer.width, {
    path: 'system/responsive.drawer.width',
    fallback: 600,
    min: 320,
    max: 960,
  }),
  drawerHeightShare: readBoundedNumber(responsiveDrawer.heightShare, {
    path: 'system/responsive.drawer.heightShare',
    fallback: 0.8,
    min: 0.3,
    max: 1,
  }),
  drawerMinHeight: readInteger(responsiveDrawer.minHeight, {
    path: 'system/responsive.drawer.minHeight',
    fallback: 600,
    min: 280,
  }),
  drawerGap: readInteger(responsiveDrawer.gap, {
    path: 'system/responsive.drawer.gap',
    fallback: 0,
    min: 0,
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
 * @type {{ expiredSessionDays: number, readNotificationDays: number, activityLogDays: number, moderationLogDays: number, rejectedCandidateDays: number, orphanFileHours: number, consentVersion: number }}
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
  moderationLogDays: readInteger(retention.moderationLogDays, {
    path: 'system/conservation.moderationLogDays',
    fallback: 180,
    min: 7,
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

/**
 * Request time limits
 * @type {{ readMs: number, writeMs: number, externalMs: number }}
 */

export const TIMEOUT_SETTINGS = {
  readMs: readInteger(timeouts.readMs, {
    path: 'system/delais.readMs',
    fallback: 20000,
    min: 1000,
  }),
  writeMs: readInteger(timeouts.writeMs, {
    path: 'system/delais.writeMs',
    fallback: 60000,
    min: 1000,
  }),
  externalMs: readInteger(timeouts.externalMs, {
    path: 'system/delais.externalMs',
    fallback: 10000,
    min: 1000,
  }),
} as const

/**
 * Client query cache
 * @type {{ staleMs: number, gcMs: number, readRetries: number }}
 */

export const CACHE_SETTINGS = {
  staleMs: readInteger(cache.staleMs, { path: 'system/cache.staleMs', fallback: 30000, min: 0 }),
  gcMs: readInteger(cache.gcMs, { path: 'system/cache.gcMs', fallback: 300000, min: 0 }),
  readRetries: readInteger(cache.readRetries, {
    path: 'system/cache.readRetries',
    fallback: 1,
    min: 0,
    max: 5,
  }),
} as const

/**
 * Live notification bubbles
 * @type {{ pollMs: number, holdMs: number, closeMs: number, delayMs: number, gapPx: number, edgePx: number }}
 */

export const NUDGE_SETTINGS = {
  pollMs: readInteger(notifications.pollMs, {
    path: 'system/notifications.pollMs',
    fallback: 60000,
    min: 10000,
  }),
  holdMs: readInteger(notifications.nudgeHoldMs, {
    path: 'system/notifications.nudgeHoldMs',
    fallback: 4000,
    min: 1000,
  }),
  closeMs: readInteger(notifications.nudgeCloseMs, {
    path: 'system/notifications.nudgeCloseMs',
    fallback: 320,
    min: 0,
  }),
  delayMs: readInteger(notifications.nudgeDelayMs, {
    path: 'system/notifications.nudgeDelayMs',
    fallback: 400,
    min: 0,
  }),
  gapPx: readInteger(notifications.nudgeGapPx, {
    path: 'system/notifications.nudgeGapPx',
    fallback: 10,
    min: 0,
  }),
  edgePx: readInteger(notifications.nudgeEdgePx, {
    path: 'system/notifications.nudgeEdgePx',
    fallback: 16,
    min: 0,
  }),
} as const

/**
 * Gesture and scroll tuning
 * @type {Record<string, number>}
 */

export const GESTURE_SETTINGS = {
  swipeRatio: readNumber(gestures.swipeRatio, 0.18),
  flingVelocity: readNumber(gestures.flingVelocity, 0.5),
  startSlopPx: readInteger(gestures.startSlopPx, {
    path: 'system/gestes.startSlopPx',
    fallback: 8,
    min: 0,
  }),
  barSolidAfterPx: readInteger(gestures.barSolidAfterPx, {
    path: 'system/gestes.barSolidAfterPx',
    fallback: 8,
    min: 0,
  }),
  barHideAfterPx: readInteger(gestures.barHideAfterPx, {
    path: 'system/gestes.barHideAfterPx',
    fallback: 120,
    min: 0,
  }),
  barDirectionDeltaPx: readInteger(gestures.barDirectionDeltaPx, {
    path: 'system/gestes.barDirectionDeltaPx',
    fallback: 6,
    min: 0,
  }),
  countUpMs: readInteger(gestures.countUpMs, {
    path: 'system/gestes.countUpMs',
    fallback: 900,
    min: 0,
  }),
  readingLineRatio: readNumber(gestures.readingLineRatio, 0.3),
  tiltDegrees: readNumber(gestures.tiltDegrees, 7),
  tiltPerspectivePx: readInteger(gestures.tiltPerspectivePx, {
    path: 'system/gestes.tiltPerspectivePx',
    fallback: 900,
    min: 1,
  }),
} as const

/**
 * Legacy track: points
 * @type {{ modulePoints: number, modulesToPass: number, pointsToPass: number, modulePassPoints: number, evaluatorSharePercent: number, minWeeks: number, maxWeeks: number }}
 */

export const LEGACY_SETTINGS = {
  modulePoints: readInteger(legacy.modulePoints, {
    path: 'system/legacy.modulePoints',
    fallback: 100,
    min: 1,
  }),
  modulesToPass: readInteger(legacy.modulesToPass, {
    path: 'system/legacy.modulesToPass',
    fallback: 2,
    min: 1,
  }),
  pointsToPass: readInteger(legacy.pointsToPass, {
    path: 'system/legacy.pointsToPass',
    fallback: 230,
    min: 1,
  }),
  modulePassPoints: readInteger(legacy.modulePassPoints, {
    path: 'system/legacy.modulePassPoints',
    fallback: 70,
    min: 1,
  }),
  // Share of a module total given by the evaluator
  evaluatorSharePercent: readInteger(legacy.evaluatorSharePercent, {
    path: 'system/legacy.evaluatorSharePercent',
    fallback: 40,
    min: 0,
    max: 100,
  }),
  minWeeks: readInteger(legacy.minWeeks, {
    path: 'system/legacy.minWeeks',
    fallback: 3,
    min: 1,
  }),
  maxWeeks: readInteger(legacy.maxWeeks, {
    path: 'system/legacy.maxWeeks',
    fallback: 9,
    min: 1,
  }),
}

/**
 * Busy detection windows and caps
 * @type {{ busyHorizonDays: number, busyDefaultMinutes: number, busyListMax: number }}
 */

export const AGENDA_SETTINGS = {
  busyHorizonDays: readInteger(agenda.busyHorizonDays, {
    path: 'system/agenda.busyHorizonDays',
    fallback: 90,
    min: 1,
  }),
  busyDefaultMinutes: readInteger(agenda.busyDefaultMinutes, {
    path: 'system/agenda.busyDefaultMinutes',
    fallback: 60,
    min: 1,
  }),
  busyListMax: readInteger(agenda.busyListMax, {
    path: 'system/agenda.busyListMax',
    fallback: 3,
    min: 1,
  }),
}

/**
 * Home windows and caps
 * @type {{ birthdayWindowDays: number, birthdayMax: number }}
 */

export const HOME_SETTINGS = {
  birthdayWindowDays: readInteger(home.birthdayWindowDays, {
    path: 'system/accueil.birthdayWindowDays',
    fallback: 30,
    min: 1,
  }),
  birthdayMax: readInteger(home.birthdayMax, {
    path: 'system/accueil.birthdayMax',
    fallback: 4,
    min: 1,
  }),
  plannedWindowDays: readInteger(home.plannedWindowDays, {
    path: 'system/accueil.plannedWindowDays',
    fallback: 30,
    min: 1,
  }),
  plannedMax: readInteger(home.plannedMax, {
    path: 'system/accueil.plannedMax',
    fallback: 5,
    min: 1,
  }),
  taskMax: readInteger(home.taskMax, {
    path: 'system/accueil.taskMax',
    fallback: 4,
    min: 1,
  }),
}
