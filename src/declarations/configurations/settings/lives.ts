import livecon from '@/configurations/system/livecon.json'
import lives from '@/configurations/system/lives.json'
import sanctions from '@/configurations/system/sanctions.json'
import { readInteger } from '@/declarations/configurations/readers'

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
 * @type {{ defaultDurationMinutes: number, endGraceMinutes: number, streamKeepAliveSeconds: number, heartbeatSeconds: number, idleSeconds: number, staleSeconds: number, modSlotMinutes: number, maxOpenLives: number, watchSyncSeconds: number, coverageMinGapSeconds: number, eventsubKeepaliveSeconds: number, feedFlushMs: number, roomMessages: number, roomActs: number, roomHeld: number, heldExpireMinutes: number, feedSlowKilobytes: number, logConcurrency: number, logQueueMax: number, liveconCacheSeconds: number, idempotencyMinutes: number, watchLeadMinutes: number, watchTrailMinutes: number, missedLiveHours: number, reportBucketMinutes: number, logLines: number, pastLives: number, hoursWindowDays: number, memberLives: number, memberLivesPageSize: number, suspensionMaxDays: number, moderatorCacheSeconds: number, emoteCacheSeconds: number, avatarCacheSeconds: number, avatarBatchMax: number, ownedEmoteCacheSeconds: number, memoryHours: number, memoryShareSeconds: number, rateLimitRetrySeconds: number, chatFlushMs: number, chatBatchMax: number, chatBufferMax: number, chatPageSize: number, preferenceSaveMs: number, teamChatPageSize: number, teamChatMaxLength: number, teamChatBubbleSeconds: number, teamChatMentionAccountId: string, mobileStreamPercent: number, mobileFreezeSwipePx: number, mobileSuggestionTags: number, automodPersonalLines: number, automodDecidedSeconds: number, avatarBatchMs: number, mentionSuggestions: number, gestureTextMax: number, suggestionsMax: number, avatarCacheEntries: number, presenceCountCacheEntries: number, modViewCacheEntries: number, seenChattersMax: number, roomQueueFactor: number, echoWindowSeconds: number, timeTicksMax: number, startedBubbleMs: number, arrivalFreshMinutes: number, pollDefaultMinutes: number, pollRefreshSeconds: number, pollResultSeconds: number, hubHistoryLimit: number, teamChatEmojiMax: number }}
 */

export const LIVE_SETTINGS = {
  defaultDurationMinutes: readInteger(lives.defaultDurationMinutes, {
    path: 'system/lives.defaultDurationMinutes',
    fallback: 180,
    min: 15,
  }),
  dossierWindowDays: readInteger(lives.dossierWindowDays, {
    path: 'system/lives.dossierWindowDays',
    fallback: 90,
    min: 1,
  }),
  reportMaxSlices: readInteger(lives.reportMaxSlices, {
    path: 'system/lives.reportMaxSlices',
    fallback: 120,
    min: 10,
  }),
  reportMaxHours: readInteger(lives.reportMaxHours, {
    path: 'system/lives.reportMaxHours',
    fallback: 24,
    min: 1,
  }),
  logPageSize: readInteger(lives.logPageSize, {
    path: 'system/lives.logPageSize',
    fallback: 10,
    min: 5,
  }),
  recentHours: readInteger(lives.recentHours, {
    path: 'system/lives.recentHours',
    fallback: 24,
    min: 1,
  }),
  prepMinutes: readInteger(lives.prepMinutes, {
    path: 'system/lives.prepMinutes',
    fallback: 60,
    min: 0,
  }),
  presenceSuggestHours: readInteger(lives.presenceSuggestHours, {
    path: 'system/lives.presenceSuggestHours',
    fallback: 3,
    min: 1,
  }),
  sampleSeconds: readInteger(lives.sampleSeconds, {
    path: 'system/lives.sampleSeconds',
    fallback: 60,
    min: 15,
  }),
  viewerHistorySize: readInteger(lives.viewerHistorySize, {
    path: 'system/lives.viewerHistorySize',
    fallback: 10,
    min: 1,
  }),
  viewerCommentsSize: readInteger(lives.viewerCommentsSize, {
    path: 'system/lives.viewerCommentsSize',
    fallback: 50,
    min: 1,
  }),
  inspectSize: readInteger(lives.inspectSize, {
    path: 'system/lives.inspectSize',
    fallback: 30,
    min: 1,
  }),
  suspensionMaxDays: readInteger(lives.suspensionMaxDays, {
    path: 'system/lives.suspensionMaxDays',
    fallback: 365,
    min: 1,
  }),
  focusPollSeconds: readInteger(lives.focusPollSeconds, {
    path: 'system/lives.focusPollSeconds',
    fallback: 10,
    min: 2,
  }),
  moderatorCacheSeconds: readInteger(lives.moderatorCacheSeconds, {
    path: 'system/lives.moderatorCacheSeconds',
    fallback: 60,
    min: 0,
  }),
  emoteCacheSeconds: readInteger(lives.emoteCacheSeconds, {
    path: 'system/lives.emoteCacheSeconds',
    fallback: 600,
    min: 0,
  }),
  avatarCacheSeconds: readInteger(lives.avatarCacheSeconds, {
    path: 'system/lives.avatarCacheSeconds',
    fallback: 86400,
    min: 60,
  }),
  avatarBatchMax: readInteger(lives.avatarBatchMax, {
    path: 'system/lives.avatarBatchMax',
    fallback: 100,
    min: 1,
    max: 100,
  }),
  ownedEmoteCacheSeconds: readInteger(lives.ownedEmoteCacheSeconds, {
    path: 'system/lives.ownedEmoteCacheSeconds',
    fallback: 300,
    min: 0,
  }),
  memoryHours: readInteger(lives.memoryHours, {
    path: 'system/lives.memoryHours',
    fallback: 24,
    min: 1,
  }),
  memoryShareSeconds: readInteger(lives.memoryShareSeconds, {
    path: 'system/lives.memoryShareSeconds',
    fallback: 3,
    min: 1,
  }),
  chatFlushMs: readInteger(lives.chatFlushMs, {
    path: 'system/lives.chatFlushMs',
    fallback: 2000,
    min: 200,
  }),
  chatBatchMax: readInteger(lives.chatBatchMax, {
    path: 'system/lives.chatBatchMax',
    fallback: 200,
    min: 10,
  }),
  chatBufferMax: readInteger(lives.chatBufferMax, {
    path: 'system/lives.chatBufferMax',
    fallback: 20000,
    min: 100,
  }),
  chatPageSize: readInteger(lives.chatPageSize, {
    path: 'system/lives.chatPageSize',
    fallback: 50,
    min: 10,
  }),
  preferenceSaveMs: readInteger(lives.preferenceSaveMs, {
    path: 'system/lives.preferenceSaveMs',
    fallback: 1500,
    min: 200,
  }),
  teamChatPageSize: readInteger(lives.teamChatPageSize, {
    path: 'system/lives.teamChatPageSize',
    fallback: 50,
    min: 10,
  }),
  teamChatMaxLength: readInteger(lives.teamChatMaxLength, {
    path: 'system/lives.teamChatMaxLength',
    fallback: 500,
    min: 50,
  }),
  teamChatBubbleSeconds: readInteger(lives.teamChatBubbleSeconds, {
    path: 'system/lives.teamChatBubbleSeconds',
    fallback: 5,
    min: 1,
  }),
  // Member the designated mention reaches
  teamChatMentionAccountId:
    typeof lives.teamChatMentionAccountId === 'string' ? lives.teamChatMentionAccountId : '',
  // Share of the phone height the stream takes in the Mod View
  mobileStreamPercent: readInteger(lives.mobileStreamPercent, {
    path: 'system/lives.mobileStreamPercent',
    fallback: 20,
    min: 10,
    max: 50,
  }),
  // Upward swipe that freezes the chat
  mobileFreezeSwipePx: readInteger(lives.mobileFreezeSwipePx, {
    path: 'system/lives.mobileFreezeSwipePx',
    fallback: 32,
    min: 8,
  }),
  // Suggestion tags shown above the chat
  mobileSuggestionTags: readInteger(lives.mobileSuggestionTags, {
    path: 'system/lives.mobileSuggestionTags',
    fallback: 3,
    min: 1,
  }),
  rateLimitRetrySeconds: readInteger(lives.rateLimitRetrySeconds, {
    path: 'system/lives.rateLimitRetrySeconds',
    fallback: 5,
    min: 1,
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
  modSlotMinutes: readInteger(lives.modSlotMinutes, {
    path: 'system/lives.modSlotMinutes',
    fallback: 15,
    min: 1,
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
  coverageMinGapSeconds: readInteger(lives.coverageMinGapSeconds, {
    path: 'system/lives.coverageMinGapSeconds',
    fallback: 60,
    min: 0,
  }),
  eventsubKeepaliveSeconds: readInteger(lives.eventsubKeepaliveSeconds, {
    path: 'system/lives.eventsubKeepaliveSeconds',
    fallback: 30,
    min: 10,
    max: 600,
  }),
  feedFlushMs: readInteger(lives.feedFlushMs, {
    path: 'system/lives.feedFlushMs',
    fallback: 100,
    min: 16,
    max: 1000,
  }),
  roomMessages: readInteger(lives.roomMessages, {
    path: 'system/lives.roomMessages',
    fallback: 200,
    min: 50,
    max: 1000,
  }),
  roomActs: readInteger(lives.roomActs, {
    path: 'system/lives.roomActs',
    fallback: 200,
    min: 20,
    max: 2000,
  }),
  roomHeld: readInteger(lives.roomHeld, {
    path: 'system/lives.roomHeld',
    fallback: 150,
    min: 20,
    max: 1000,
  }),
  heldExpireMinutes: readInteger(lives.heldExpireMinutes, {
    path: 'system/lives.heldExpireMinutes',
    fallback: 5,
    min: 1,
    max: 55,
  }),
  feedSlowKilobytes: readInteger(lives.feedSlowKilobytes, {
    path: 'system/lives.feedSlowKilobytes',
    fallback: 2048,
    min: 256,
  }),
  logConcurrency: readInteger(lives.logConcurrency, {
    path: 'system/lives.logConcurrency',
    fallback: 4,
    min: 1,
    max: 16,
  }),
  logQueueMax: readInteger(lives.logQueueMax, {
    path: 'system/lives.logQueueMax',
    fallback: 5000,
    min: 100,
  }),
  liveconCacheSeconds: readInteger(lives.liveconCacheSeconds, {
    path: 'system/lives.liveconCacheSeconds',
    fallback: 30,
    min: 1,
  }),
  idempotencyMinutes: readInteger(lives.idempotencyMinutes, {
    path: 'system/lives.idempotencyMinutes',
    fallback: 10,
    min: 1,
  }),
  watchLeadMinutes: readInteger(lives.watchLeadMinutes, {
    path: 'system/lives.watchLeadMinutes',
    fallback: 120,
    min: 0,
  }),
  watchTrailMinutes: readInteger(lives.watchTrailMinutes, {
    path: 'system/lives.watchTrailMinutes',
    fallback: 120,
    min: 0,
  }),
  missedLiveHours: readInteger(lives.missedLiveHours, {
    path: 'system/lives.missedLiveHours',
    fallback: 12,
    min: 1,
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
  memberLivesPageSize: readInteger(lives.memberLivesPageSize, {
    path: 'system/lives.memberLivesPageSize',
    fallback: 5,
    min: 1,
  }),
  // Personal badword lines kept in the AutoMod queue
  automodPersonalLines: readInteger(lives.automodPersonalLines, {
    path: 'system/lives.automodPersonalLines',
    fallback: 50,
    min: 1,
  }),
  // Seconds a decided message stays in the AutoMod queue
  automodDecidedSeconds: readInteger(lives.automodDecidedSeconds, {
    path: 'system/lives.automodDecidedSeconds',
    fallback: 10,
    min: 1,
  }),
  // Wait to gather an avatar batch
  avatarBatchMs: readInteger(lives.avatarBatchMs, {
    path: 'system/lives.avatarBatchMs',
    fallback: 150,
    min: 10,
  }),
  // Names offered under the cursor
  mentionSuggestions: readInteger(lives.mentionSuggestions, {
    path: 'system/lives.mentionSuggestions',
    fallback: 8,
    min: 1,
  }),
  // Longest text a gesture carries
  gestureTextMax: readInteger(lives.gestureTextMax, {
    path: 'system/lives.gestureTextMax',
    fallback: 500,
    min: 1,
  }),
  // Suggestions kept on screen
  suggestionsMax: readInteger(lives.suggestionsMax, {
    path: 'system/lives.suggestionsMax',
    fallback: 12,
    min: 1,
  }),
  // Avatar cache entries at most
  avatarCacheEntries: readInteger(lives.avatarCacheEntries, {
    path: 'system/lives.avatarCacheEntries',
    fallback: 5000,
    min: 10,
  }),
  // Presence verdict cache entries at most
  presenceCountCacheEntries: readInteger(lives.presenceCountCacheEntries, {
    path: 'system/lives.presenceCountCacheEntries',
    fallback: 1000,
    min: 10,
  }),
  // Mod View cache entries at most
  modViewCacheEntries: readInteger(lives.modViewCacheEntries, {
    path: 'system/lives.modViewCacheEntries',
    fallback: 500,
    min: 10,
  }),
  // Chatters remembered per live
  seenChattersMax: readInteger(lives.seenChattersMax, {
    path: 'system/lives.seenChattersMax',
    fallback: 20000,
    min: 100,
  }),
  // Burst kept before a flush, as a multiple of the room size
  roomQueueFactor: readInteger(lives.roomQueueFactor, {
    path: 'system/lives.roomQueueFactor',
    fallback: 4,
    min: 1,
  }),
  // Seconds a Memora gesture and its platform echo may arrive apart
  echoWindowSeconds: readInteger(lives.echoWindowSeconds, {
    path: 'system/lives.echoWindowSeconds',
    fallback: 90,
    min: 1,
  }),
  // Marks wanted at most on a time axis
  timeTicksMax: readInteger(lives.timeTicksMax, {
    path: 'system/lives.timeTicksMax',
    fallback: 9,
    min: 2,
  }),
  // Life of the live started bubble before it folds
  startedBubbleMs: readInteger(lives.startedBubbleMs, {
    path: 'system/lives.startedBubbleMs',
    fallback: 8000,
    min: 1000,
  }),
  // Minutes a new arrival stays flagged
  arrivalFreshMinutes: readInteger(lives.arrivalFreshMinutes, {
    path: 'system/lives.arrivalFreshMinutes',
    fallback: 3,
    min: 1,
  }),
  // Poll duration picked at opening
  pollDefaultMinutes: readInteger(lives.pollDefaultMinutes, {
    path: 'system/lives.pollDefaultMinutes',
    fallback: 2,
    min: 1,
  }),
  // Seconds between two reads of a running poll
  pollRefreshSeconds: readInteger(lives.pollRefreshSeconds, {
    path: 'system/lives.pollRefreshSeconds',
    fallback: 3,
    min: 1,
  }),
  // Seconds poll results stay above the chat
  pollResultSeconds: readInteger(lives.pollResultSeconds, {
    path: 'system/lives.pollResultSeconds',
    fallback: 30,
    min: 1,
  }),
  // Lives shown in the hub history
  hubHistoryLimit: readInteger(lives.hubHistoryLimit, {
    path: 'system/lives.hubHistoryLimit',
    fallback: 4,
    min: 1,
  }),
  // Longest emoji string accepted from the browser
  teamChatEmojiMax: readInteger(lives.teamChatEmojiMax, {
    path: 'system/lives.teamChatEmojiMax',
    fallback: 16,
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
