import application from '@/configurations/system/application.json'
import legacy from '@/configurations/system/legacy.json'
import academy from '@/configurations/system/academy.json'
import exercises from '@/configurations/system/exercises.json'
import { readInteger } from '@/declarations/configurations/readers'
import { maxPerPage } from '@/declarations/configurations/settings/forms'

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

const skillStars = readInteger(academy.skillStars, {
  path: 'system/academy.skillStars',
  fallback: 5,
  min: 1,
})

const trainingMaxMinutes = readInteger(academy.trainingMaxMinutes, {
  path: 'system/academy.trainingMaxMinutes',
  fallback: 50,
  min: 1,
})

/**
 * Academy bounds
 * @type {{ exercisePassPercent: number, chatLineDelayMs: number, chatTypingMs: number, conversationLineMs: number, judgementLineMs: number, courseSampleOffenses: number, tourStepMs: number, tourBuildMs: number, orgBubbleMs: number, liveconCycleMs: number, ladderRungDelayMs: number, feedbackScale: number, ceremonyFillMs: number, ceremonySlamMs: number, ceremonyFlyMs: number, ceremonyConfetti: number, ceremonyBurstPx: number, maxLives: number, minObjectives: number, weeksMin: number, weeksMax: number, stepOffsetMin: number, stepOffsetMax: number, bonusMaxLives: number, skillMaxPercent: number, skillStars: number, trainingMinMinutes: number, trainingMaxMinutes: number, inviteExpiryDays: number, inviteMaxUses: number }}
 */

export const ACADEMY_SETTINGS = {
  weeksMax,
  stepOffsetMax,
  skillMaxPercent,
  skillStars,
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
  formJuniorsLimit: readInteger(academy.formJuniorsLimit, {
    path: 'system/academy.formJuniorsLimit',
    fallback: 200,
    min: 1,
  }),
  juniorLivesLimit: readInteger(academy.juniorLivesLimit, {
    path: 'system/academy.juniorLivesLimit',
    fallback: 60,
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
}

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
 * Interview exercises
 * @type {Record<string, number>}
 */

export const EXERCISE_SETTINGS = {
  linkTtlMinutes: readInteger(exercises.linkTtlMinutes, {
    path: 'system/exercises.linkTtlMinutes',
    fallback: 120,
    min: 5,
  }),
  maxPlays: readInteger(exercises.maxPlays, {
    path: 'system/exercises.maxPlays',
    fallback: 3,
    min: 1,
  }),
  revealMs: readInteger(exercises.revealMs, {
    path: 'system/exercises.revealMs',
    fallback: 1600,
    min: 400,
  }),
  shuffleMs: readInteger(exercises.shuffleMs, {
    path: 'system/exercises.shuffleMs',
    fallback: 1000,
    min: 0,
  }),
  shuffleStepMs: readInteger(exercises.shuffleStepMs, {
    path: 'system/exercises.shuffleStepMs',
    fallback: 90,
    min: 30,
  }),
  sceneLineMs: readInteger(exercises.sceneLineMs, {
    path: 'system/exercises.sceneLineMs',
    fallback: 2200,
    min: 500,
  }),
  defaultStepSeconds: readInteger(exercises.defaultStepSeconds, {
    path: 'system/exercises.defaultStepSeconds',
    fallback: 30,
    min: 5,
  }),
  pollSeconds: readInteger(exercises.pollSeconds, {
    path: 'system/exercises.pollSeconds',
    fallback: 6,
    min: 2,
  }),
} as const

/**
 * Installed application, pushes and phone dock
 * @type {{ installHintVisits: number, updateCheckMs: number, dockSlots: number, pushTtlSeconds: number, pushRecipientsPerJob: number, journalPageSize: number }}
 */

export const APPLICATION_SETTINGS = {
  // Visits before the install hint shows up
  installHintVisits: readInteger(application.installHintVisits, {
    path: 'system/application.installHintVisits',
    fallback: 3,
    min: 1,
  }),
  // Gap between two update checks
  updateCheckMs: readInteger(application.updateCheckMs, {
    path: 'system/application.updateCheckMs',
    fallback: 1_800_000,
    min: 60_000,
  }),
  // Pages beside Home, the menu closing the row
  dockSlots: readInteger(application.dockSlots, {
    path: 'system/application.dockSlots',
    fallback: 3,
    min: 1,
    max: 4,
  }),
  // How long a push service keeps an undelivered push
  pushTtlSeconds: readInteger(application.pushTtlSeconds, {
    path: 'system/application.pushTtlSeconds',
    fallback: 86_400,
    min: 60,
    max: 2_419_200,
  }),
  pushRecipientsPerJob: readInteger(application.pushRecipientsPerJob, {
    path: 'system/application.pushRecipientsPerJob',
    fallback: 200,
    min: 1,
  }),
  journalPageSize: readInteger(application.journalPageSize, {
    path: 'system/application.journalPageSize',
    fallback: 50,
    min: 1,
    max: maxPerPage,
  }),
}
