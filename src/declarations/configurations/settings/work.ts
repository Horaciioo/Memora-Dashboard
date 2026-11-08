import absences from '@/configurations/system/absences.json'
import agenda from '@/configurations/system/agenda.json'
import home from '@/configurations/system/home.json'
import calendar from '@/configurations/system/calendar.json'
import gestures from '@/configurations/system/gestures.json'
import notifications from '@/configurations/system/notifications.json'
import tour from '@/configurations/system/tour.json'
import { readBoolean, readInteger } from '@/declarations/configurations/readers'
import { maxPerPage } from '@/declarations/configurations/settings/forms'
import { readNumber } from '@/declarations/configurations/settings/shared'

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

const pageSize = readInteger(notifications.pageSize, {
  path: 'system/notifications.pageSize',
  fallback: 40,
  min: 1,
  max: maxPerPage,
})

/**
 * Personal notification bounds
 * @type {{ panelSize: number, pageSize: number, maxActions: number, maxMentions: number, mentionResults: number, mentionMatchMs: number, mentionCalmMs: number, staleMs: number }}
 */

export const NOTIFICATION_SETTINGS = {
  pageSize,
  // Quiet time between two rings of the bell
  ringGapMs: readInteger(notifications.ringGapMs, {
    path: 'system/notifications.ringGapMs',
    fallback: 30000,
    min: 1000,
    max: 3_600_000,
  }),
  // Rows per page of the notifications page
  listSize: readInteger(notifications.listSize, {
    path: 'system/notifications.listSize',
    fallback: 10,
    min: 1,
    max: pageSize,
  }),
  panelSize: readInteger(notifications.panelSize, {
    path: 'system/notifications.panelSize',
    fallback: 5,
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
  mentionMatchMs: readInteger(notifications.mentionMatchMs, {
    path: 'system/notifications.mentionMatchMs',
    fallback: 15_000,
    min: 1000,
  }),
  mentionCalmMs: readInteger(notifications.mentionCalmMs, {
    path: 'system/notifications.mentionCalmMs',
    fallback: 10_000,
    min: 1000,
  }),
  mentionResults: readInteger(notifications.mentionResults, {
    path: 'system/notifications.mentionResults',
    fallback: 6,
    min: 1,
  }),
  staleMs: readInteger(notifications.staleMs, {
    path: 'system/notifications.staleMs',
    fallback: 60_000,
    min: 0,
  }),
}

const dayEndHour = readInteger(calendar.dayEndHour, {
  path: 'system/calendar.dayEndHour',
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
    path: 'system/calendar.dayStartHour',
    fallback: 7,
    min: 0,
    max: dayEndHour,
  }),
  maxEntriesPerDay: readInteger(calendar.maxEntriesPerDay, {
    path: 'system/calendar.maxEntriesPerDay',
    fallback: 3,
    min: 1,
  }),
  maxEntriesPerDayMobile: readInteger(calendar.maxEntriesPerDayMobile, {
    path: 'system/calendar.maxEntriesPerDayMobile',
    fallback: 4,
    min: 1,
  }),
  rollCallReminderLeadDays: readInteger(calendar.rollCallReminderLeadDays, {
    path: 'system/calendar.rollCallReminderLeadDays',
    fallback: 1,
    min: 0,
  }),
  rollCallReminderHour: readInteger(calendar.rollCallReminderHour, {
    path: 'system/calendar.rollCallReminderHour',
    fallback: 18,
    min: 0,
    max: 23,
  }),
  rollCallResponsesShared: readBoolean(calendar.rollCallResponsesShared, {
    path: 'system/calendar.rollCallResponsesShared',
    fallback: false,
  }),
  // Pointer snap
  stepMinutes: readInteger(calendar.stepMinutes, {
    path: 'system/calendar.stepMinutes',
    fallback: 15,
    min: 5,
    max: 60,
  }),
  // One grid row
  rowMinutes: readInteger(calendar.rowMinutes, {
    path: 'system/calendar.rowMinutes',
    fallback: 60,
    min: 15,
    max: 120,
  }),
  // Click-created length
  defaultDurationMinutes: readInteger(calendar.defaultDurationMinutes, {
    path: 'system/calendar.defaultDurationMinutes',
    fallback: 60,
    min: 5,
  }),
}

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
    fallback: 12000,
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
    path: 'system/gestures.startSlopPx',
    fallback: 8,
    min: 0,
  }),
  barSolidAfterPx: readInteger(gestures.barSolidAfterPx, {
    path: 'system/gestures.barSolidAfterPx',
    fallback: 8,
    min: 0,
  }),
  barHideAfterPx: readInteger(gestures.barHideAfterPx, {
    path: 'system/gestures.barHideAfterPx',
    fallback: 120,
    min: 0,
  }),
  barDirectionDeltaPx: readInteger(gestures.barDirectionDeltaPx, {
    path: 'system/gestures.barDirectionDeltaPx',
    fallback: 6,
    min: 0,
  }),
  countUpMs: readInteger(gestures.countUpMs, {
    path: 'system/gestures.countUpMs',
    fallback: 900,
    min: 0,
  }),
  readingLineRatio: readNumber(gestures.readingLineRatio, 0.3),
  tiltDegrees: readNumber(gestures.tiltDegrees, 7),
  tiltPerspectivePx: readInteger(gestures.tiltPerspectivePx, {
    path: 'system/gestures.tiltPerspectivePx',
    fallback: 900,
    min: 1,
  }),
} as const

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
    path: 'system/home.birthdayWindowDays',
    fallback: 30,
    min: 1,
  }),
  birthdayMax: readInteger(home.birthdayMax, {
    path: 'system/home.birthdayMax',
    fallback: 4,
    min: 1,
  }),
  plannedWindowDays: readInteger(home.plannedWindowDays, {
    path: 'system/home.plannedWindowDays',
    fallback: 30,
    min: 1,
  }),
  plannedMax: readInteger(home.plannedMax, {
    path: 'system/home.plannedMax',
    fallback: 5,
    min: 1,
  }),
  taskMax: readInteger(home.taskMax, {
    path: 'system/home.taskMax',
    fallback: 4,
    min: 1,
  }),
}

/**
 * First visit timings and spotlight sizes
 * @type {{ newcomerDays: number, typingMsPerChar: number, typingMinMs: number, typingMaxMs: number, sendPauseMs: number, loadingMs: number, demoStepMs: number, demoBeats: number, stageHoldMs: number, sealMs: number, paneInsetPx: number, photoSharePercent: number, ringPaddingPx: number, bubbleGapPx: number, bubbleWidthPx: number, bubbleHeightPx: number, minAgeYears: number, maxAgeYears: number, graceMs: number }}
 */

export const TOUR_SETTINGS = {
  newcomerDays: readInteger(tour.newcomerDays, {
    path: 'system/tour.newcomerDays',
    fallback: 14,
    min: 1,
  }),
  typingMsPerChar: readInteger(tour.typingMsPerChar, {
    path: 'system/tour.typingMsPerChar',
    fallback: 28,
    min: 1,
  }),
  typingMinMs: readInteger(tour.typingMinMs, {
    path: 'system/tour.typingMinMs',
    fallback: 600,
    min: 0,
  }),
  typingMaxMs: readInteger(tour.typingMaxMs, {
    path: 'system/tour.typingMaxMs',
    fallback: 1800,
    min: 0,
  }),
  sendPauseMs: readInteger(tour.sendPauseMs, {
    path: 'system/tour.sendPauseMs',
    fallback: 350,
    min: 0,
  }),
  loadingMs: readInteger(tour.loadingMs, {
    path: 'system/tour.loadingMs',
    fallback: 3200,
    min: 0,
  }),
  demoStepMs: readInteger(tour.demoStepMs, {
    path: 'system/tour.demoStepMs',
    fallback: 1800,
    min: 200,
  }),
  demoBeats: readInteger(tour.demoBeats, {
    path: 'system/tour.demoBeats',
    fallback: 3,
    min: 1,
  }),
  stageHoldMs: readInteger(tour.stageHoldMs, {
    path: 'system/tour.stageHoldMs',
    fallback: 4000,
    min: 0,
  }),
  // Welcome seal before the dashboard
  sealMs: readInteger(tour.sealMs, {
    path: 'system/tour.sealMs',
    fallback: 2800,
    min: 0,
  }),
  paneInsetPx: readInteger(tour.paneInsetPx, {
    path: 'system/tour.paneInsetPx',
    fallback: 12,
    min: 0,
  }),
  photoSharePercent: readInteger(tour.photoSharePercent, {
    path: 'system/tour.photoSharePercent',
    fallback: 40,
    min: 20,
    max: 60,
  }),
  ringPaddingPx: readInteger(tour.ringPaddingPx, {
    path: 'system/tour.ringPaddingPx',
    fallback: 8,
    min: 0,
  }),
  bubbleGapPx: readInteger(tour.bubbleGapPx, {
    path: 'system/tour.bubbleGapPx',
    fallback: 16,
    min: 0,
  }),
  bubbleWidthPx: readInteger(tour.bubbleWidthPx, {
    path: 'system/tour.bubbleWidthPx',
    fallback: 352,
    min: 200,
  }),
  bubbleHeightPx: readInteger(tour.bubbleHeightPx, {
    path: 'system/tour.bubbleHeightPx',
    fallback: 220,
    min: 100,
  }),
  minAgeYears: readInteger(tour.minAgeYears, {
    path: 'system/tour.minAgeYears',
    fallback: 12,
    min: 0,
  }),
  maxAgeYears: readInteger(tour.maxAgeYears, {
    path: 'system/tour.maxAgeYears',
    fallback: 90,
    min: 1,
  }),
  graceMs: readInteger(tour.graceMs, {
    path: 'system/tour.graceMs',
    fallback: 700,
    min: 0,
  }),
}
