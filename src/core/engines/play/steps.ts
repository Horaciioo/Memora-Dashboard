import type { EngineStep } from '@/types/play'

/**
 * Step with nothing to do
 * @type {EngineStep}
 */

export const IDLE_STEP: EngineStep = { changed: false, finished: false, deadline: null }
