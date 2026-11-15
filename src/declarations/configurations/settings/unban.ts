import unban from '@/configurations/system/unban.json'
import { readBoolean, readInteger } from '@/declarations/configurations/readers'

const shortAnswerMaxLength = readInteger(unban.shortAnswerMaxLength, {
  path: 'system/unban.shortAnswerMaxLength',
  fallback: 200,
  min: 1,
})

/**
 * Unban requests and form bounds
 * @type {{ requireDiscordIdentity: boolean, minFillSeconds: number, maxQuestions: number, maxPages: number, maxOptions: number, answerMaxLength: number, shortAnswerMaxLength: number, reviewNoteMaxLength: number, ticketMinutes: number, statsRecentDays: number, statsMonthDays: number, notifyMax: number }}
 */

export const UNBAN_SETTINGS = {
  requireDiscordIdentity: readBoolean(unban.requireDiscordIdentity, {
    path: 'system/unban.requireDiscordIdentity',
    fallback: true,
  }),
  // Quickest a person can honestly fill the form
  minFillSeconds: readInteger(unban.minFillSeconds, {
    path: 'system/unban.minFillSeconds',
    fallback: 20,
    min: 0,
  }),
  maxQuestions: readInteger(unban.maxQuestions, {
    path: 'system/unban.maxQuestions',
    fallback: 20,
    min: 1,
  }),
  maxPages: readInteger(unban.maxPages, {
    path: 'system/unban.maxPages',
    fallback: 10,
    min: 1,
  }),
  maxOptions: readInteger(unban.maxOptions, {
    path: 'system/unban.maxOptions',
    fallback: 12,
    min: 2,
  }),
  answerMaxLength: readInteger(unban.answerMaxLength, {
    path: 'system/unban.answerMaxLength',
    fallback: 4000,
    min: shortAnswerMaxLength,
  }),
  shortAnswerMaxLength,
  reviewNoteMaxLength: readInteger(unban.reviewNoteMaxLength, {
    path: 'system/unban.reviewNoteMaxLength',
    fallback: 2000,
    min: 1,
  }),
  // How long a verified identity and a served form stay valid
  ticketMinutes: readInteger(unban.ticketMinutes, {
    path: 'system/unban.ticketMinutes',
    fallback: 120,
    min: 5,
  }),
  // Windows the overview counts over
  statsRecentDays: readInteger(unban.statsRecentDays, {
    path: 'system/unban.statsRecentDays',
    fallback: 7,
    min: 1,
  }),
  statsMonthDays: readInteger(unban.statsMonthDays, {
    path: 'system/unban.statsMonthDays',
    fallback: 30,
    min: 1,
  }),
  // Most members alerted by one filing
  notifyMax: readInteger(unban.notifyMax, {
    path: 'system/unban.notifyMax',
    fallback: 20,
    min: 1,
  }),
} as const
