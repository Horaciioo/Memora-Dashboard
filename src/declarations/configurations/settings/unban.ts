import unban from '@/configurations/system/unban.json'
import { readBoolean, readInteger, readIntegerList } from '@/declarations/configurations/readers'

const expiryChoicesDays = readIntegerList(unban.expiryChoicesDays, {
  path: 'system/unban.expiryChoicesDays',
  fallback: [1, 3, 7, 14, 30],
  min: 1,
})

const defaultExpiryDays = readInteger(unban.defaultExpiryDays, {
  path: 'system/unban.defaultExpiryDays',
  fallback: 14,
  min: 1,
})

const shortAnswerMaxLength = readInteger(unban.shortAnswerMaxLength, {
  path: 'system/unban.shortAnswerMaxLength',
  fallback: 200,
  min: 1,
})

/**
 * Unban requests, links and form bounds
 * @type {{ expiryChoicesDays: number[], defaultExpiryDays: number, requireDiscordIdentity: boolean, minFillSeconds: number, maxQuestions: number, maxOptions: number, answerMaxLength: number, shortAnswerMaxLength: number, reviewNoteMaxLength: number, listedLinks: number, ticketMinutes: number }}
 */

export const UNBAN_SETTINGS = {
  expiryChoicesDays,
  // A default off the offered choices falls back to the longest one
  defaultExpiryDays: expiryChoicesDays.includes(defaultExpiryDays)
    ? defaultExpiryDays
    : expiryChoicesDays[expiryChoicesDays.length - 1],
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
  listedLinks: readInteger(unban.listedLinks, {
    path: 'system/unban.listedLinks',
    fallback: 50,
    min: 1,
  }),
  // How long a verified identity and a served form stay valid
  ticketMinutes: readInteger(unban.ticketMinutes, {
    path: 'system/unban.ticketMinutes',
    fallback: 120,
    min: 5,
  }),
} as const
