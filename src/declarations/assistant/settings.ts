import assistant from '@/configurations/system/assistant.json'
import { readInteger } from '@/declarations/configurations/readers'

/**
 * Assistant behaviour
 * @type {{ debounceMs: number, maxChoices: number, idempotencyMinutes: number, nudgeFirstSeconds: number, nudgeEverySeconds: number, nudgeShowSeconds: number, typingMsPerChar: number, typingLeadMs: number, typingMinMs: number, typingMaxMs: number, eraseMsPerChar: number, draftPauseMs: number, handoffSeconds: number, maxPicks: number, paletteAsks: number, pickStaggerMs: number, thinkingMs: number, remindGapMinutes: number, liveAskEverySeconds: number, serviceLeadMinutes: number, bubbleGrowMs: number, bubbleExpandMs: number, liveDefaultHours: number, bubbleOpenMs: number, bubbleStaySeconds: number, bubbleReloadMs: number, closeSeconds: number, undoSeconds: number, pointLines: number, statsMaxDays: number, memoryTurns: number, maxBatch: number }}
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
  // The bubble opens for this long, the sentence is written after it
  bubbleOpenMs: readInteger(assistant.bubbleOpenMs, {
    path: 'system/assistant.bubbleOpenMs',
    fallback: 450,
    min: 0,
  }),
  // A bubble nobody touches folds away after this long
  bubbleStaySeconds: readInteger(assistant.bubbleStaySeconds, {
    path: 'system/assistant.bubbleStaySeconds',
    fallback: 45,
    min: 5,
  }),
  // The answers are read again this long after the bubble was entered
  bubbleReloadMs: readInteger(assistant.bubbleReloadMs, {
    path: 'system/assistant.bubbleReloadMs',
    fallback: 4000,
    min: 0,
  }),
  // The bubble closes for this long
  bubbleGrowMs: readInteger(assistant.bubbleGrowMs, {
    path: 'system/assistant.bubbleGrowMs',
    fallback: 320,
    min: 0,
  }),
  // The bubble grows over the page for this long before the page opens
  bubbleExpandMs: readInteger(assistant.bubbleExpandMs, {
    path: 'system/assistant.bubbleExpandMs',
    fallback: 550,
    min: 0,
  }),
  // A live with no planned end is taken to last this many hours
  liveDefaultHours: readInteger(assistant.liveDefaultHours, {
    path: 'system/assistant.liveDefaultHours',
    fallback: 5,
    min: 1,
  }),
  // A closed talk keeps its window this long
  closeSeconds: readInteger(assistant.closeSeconds, {
    path: 'system/assistant.closeSeconds',
    fallback: 10,
    min: 1,
  }), // A gesture can be taken back for this long
  undoSeconds: readInteger(assistant.undoSeconds, {
    path: 'system/assistant.undoSeconds',
    fallback: 10,
    min: 1,
  }), // A point names this many items of a kind, the rest is counted
  pointLines: readInteger(assistant.pointLines, {
    path: 'system/assistant.pointLines',
    fallback: 6,
    min: 1,
  }), // A figure is never read over more days than this
  statsMaxDays: readInteger(assistant.statsMaxDays, {
    path: 'system/assistant.statsMaxDays',
    fallback: 366,
    min: 7,
  }), // A reference is forgotten after this many of the member's sentences
  memoryTurns: readInteger(assistant.memoryTurns, {
    path: 'system/assistant.memoryTurns',
    fallback: 3,
    min: 1,
  }), // A series never runs more gestures than this
  maxBatch: readInteger(assistant.maxBatch, {
    path: 'system/assistant.maxBatch',
    fallback: 20,
    min: 2,
  }),
}

/**
 * Keys that answer Cmd or Ctrl
 * @type {{ palette: string, chat: string }}
 */

export const ASSISTANT_KEYS = { palette: 'k', chat: 'j' } as const
