import assistant from '@/configurations/system/assistant.json'
import { readInteger } from '@/declarations/configurations/readers'

/**
 * Assistant behaviour
 * @type {{ debounceMs: number, maxChoices: number, idempotencyMinutes: number, nudgeFirstSeconds: number, nudgeEverySeconds: number, nudgeShowSeconds: number, typingMsPerChar: number, typingMinMs: number, typingMaxMs: number, eraseMsPerChar: number, draftPauseMs: number, handoffSeconds: number, maxPicks: number, paletteAsks: number, pickStaggerMs: number, thinkingMs: number }}
 */

export const ASSISTANT_SETTINGS = {
  debounceMs: readInteger(assistant.debounceMs, {
    path: 'system/assistant.debounceMs',
    fallback: 220,
    min: 0,
  }),
  maxChoices: readInteger(assistant.maxChoices, {
    path: 'system/assistant.maxChoices',
    fallback: 5,
    min: 2,
    max: 10,
  }),
  idempotencyMinutes: readInteger(assistant.idempotencyMinutes, {
    path: 'system/assistant.idempotencyMinutes',
    fallback: 10,
    min: 1,
  }),
  nudgeFirstSeconds: readInteger(assistant.nudgeFirstSeconds, {
    path: 'system/assistant.nudgeFirstSeconds',
    fallback: 8,
    min: 1,
  }),
  nudgeEverySeconds: readInteger(assistant.nudgeEverySeconds, {
    path: 'system/assistant.nudgeEverySeconds',
    fallback: 75,
    min: 10,
  }),
  nudgeShowSeconds: readInteger(assistant.nudgeShowSeconds, {
    path: 'system/assistant.nudgeShowSeconds',
    fallback: 6,
    min: 2,
  }),
  typingMsPerChar: readInteger(assistant.typingMsPerChar, {
    path: 'system/assistant.typingMsPerChar',
    fallback: 22,
    min: 0,
  }),
  typingMinMs: readInteger(assistant.typingMinMs, {
    path: 'system/assistant.typingMinMs',
    fallback: 500,
    min: 0,
  }),
  typingMaxMs: readInteger(assistant.typingMaxMs, {
    path: 'system/assistant.typingMaxMs',
    fallback: 1200,
    min: 0,
  }),
  // A drafted line is read, then wiped
  eraseMsPerChar: readInteger(assistant.eraseMsPerChar, {
    path: 'system/assistant.eraseMsPerChar',
    fallback: 12,
    min: 0,
  }),
  draftPauseMs: readInteger(assistant.draftPauseMs, {
    path: 'system/assistant.draftPauseMs',
    fallback: 600,
    min: 0,
  }),
  // A creation asked elsewhere opens on landing
  handoffSeconds: readInteger(assistant.handoffSeconds, {
    path: 'system/assistant.handoffSeconds',
    fallback: 10,
    min: 1,
  }),
  // Questions offered in the chat
  maxPicks: readInteger(assistant.maxPicks, {
    path: 'system/assistant.maxPicks',
    fallback: 6,
    min: 1,
  }),
  // Proposals under Ask Memora in the palette
  paletteAsks: readInteger(assistant.paletteAsks, {
    path: 'system/assistant.paletteAsks',
    fallback: 3,
    min: 1,
  }),
  pickStaggerMs: readInteger(assistant.pickStaggerMs, {
    path: 'system/assistant.pickStaggerMs',
    fallback: 90,
    min: 0,
  }),
  // Memora thinks before she acts
  thinkingMs: readInteger(assistant.thinkingMs, {
    path: 'system/assistant.thinkingMs',
    fallback: 900,
    min: 0,
  }),
}
