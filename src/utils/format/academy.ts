import { ACADEMY_COPY } from '@/declarations/academy/copy'
import {
  ACADEMY_SESSION_STATUS_REGISTRY,
  AWAITING_RECRUITMENT_OPTION,
} from '@/declarations/academy/registries'
import type { SessionSummary } from '@/types/academy'
import { AcademySessionStatuses } from '@/utils/constants/hierarchy'

/**
 * Name of a session
 * @param {{ function: { name: string }, number: number }} session - Function and rank
 * @return {string} - Mod. Discord #8
 */

export const sessionTitle = (session: { function: { name: string }; number: number }): string =>
  ACADEMY_COPY.sessionTitle
    .replace('{function}', session.function.name)
    .replace('{number}', String(session.number))

/**
 * State a promotion reads as: its own, or the wait on its campaign
 * @param {Pick<SessionSummary, 'status' | 'awaitingRecruitment'>} session - Session
 * @return {{ label: string, accent: string }} - State to draw
 */

export const sessionState = (
  session: Pick<SessionSummary, 'status' | 'awaitingRecruitment'>
): { label: string; accent: string } =>
  session.awaitingRecruitment && session.status === AcademySessionStatuses.Draft
    ? AWAITING_RECRUITMENT_OPTION
    : ACADEMY_SESSION_STATUS_REGISTRY.get(session.status)
