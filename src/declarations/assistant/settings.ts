import assistant from '@/configurations/system/assistant.json'
import { readInteger } from '@/declarations/configurations/readers'

/**
 * Assistant behaviour
 * @type {{ debounceMs: number, maxChoices: number, idempotencyMinutes: number, nudgeFirstSeconds: number, nudgeEverySeconds: number, nudgeShowSeconds: number, typingMsPerChar: number, typingLeadMs: number, typingMinMs: number, typingMaxMs: number, eraseMsPerChar: number, draftPauseMs: number, handoffSeconds: number, maxPicks: number, paletteAsks: number, pickStaggerMs: number, thinkingMs: number, remindGapMinutes: number, liveAskEverySeconds: number, serviceLeadMinutes: number, bubbleGrowMs: number }}
 */

export const ASSISTANT_SETTINGS = {
  debounceMs: readInteger(assistant.debounceMs, {
    path: 'system/assistant.debounceMs',
    fallback: 50,
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
    fallback: 5,
    min: 0,
  }),
  // Pause on the dots before a line starts to be written
  typingLeadMs: readInteger(assistant.typingLeadMs, {
    path: 'system/assistant.typingLeadMs',
    fallback: 150,
    min: 0,
  }),
  typingMinMs: readInteger(assistant.typingMinMs, {
    path: 'system/assistant.typingMinMs',
    fallback: 150,
    min: 0,
  }),
  typingMaxMs: readInteger(assistant.typingMaxMs, {
    path: 'system/assistant.typingMaxMs',
    fallback: 450,
    min: 0,
  }),
  // A drafted line is read, then wiped
  eraseMsPerChar: readInteger(assistant.eraseMsPerChar, {
    path: 'system/assistant.eraseMsPerChar',
    fallback: 5,
    min: 0,
  }),
  draftPauseMs: readInteger(assistant.draftPauseMs, {
    path: 'system/assistant.draftPauseMs',
    fallback: 300,
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
    fallback: 350,
    min: 0,
  }),
  // Two reminders on a roll-call never come closer than this
  remindGapMinutes: readInteger(assistant.remindGapMinutes, {
    path: 'system/assistant.remindGapMinutes',
    fallback: 30,
    min: 1,
  }),
  // The lives asking the member are looked up this often
  liveAskEverySeconds: readInteger(assistant.liveAskEverySeconds, {
    path: 'system/assistant.liveAskEverySeconds',
    fallback: 60,
    min: 10,
  }),
  // The service push goes out this long before it starts
  serviceLeadMinutes: readInteger(assistant.serviceLeadMinutes, {
    path: 'system/assistant.serviceLeadMinutes',
    fallback: 10,
    min: 1,
  }),
  // The bubble grows into the page for this long
  bubbleGrowMs: readInteger(assistant.bubbleGrowMs, {
    path: 'system/assistant.bubbleGrowMs',
    fallback: 320,
    min: 0,
  }),
}
