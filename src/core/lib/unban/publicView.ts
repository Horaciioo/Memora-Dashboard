import { decryptField } from '@/core/lib/crypto'
import { answerText, readAnswers } from '@/core/lib/unban/answers'
import { UNBAN_STATUS_REGISTRY } from '@/declarations/unban/registries'
import type { PublicRequestView } from '@/types/unban'
import type { UnbanStatusName } from '@/utils/constants/unban'

/**
 * Columns of a request the public view reads, and no others
 * @typedef {Object} PublicRequestSource
 */

export interface PublicRequestSource {
  reference: string
  status: UnbanStatusName
  submittedAt: Date
  statusChangedAt: Date
  decidedAt: Date | null
  reviewNote: string | null
  answers: string
}

/**
 * Projection of a request for its requester, built key by key so nothing else can slip in
 * @param {PublicRequestSource} request - Stored request
 * @param {string} youtuberName - Creator it was filed with
 * @param {Date} linkExpiresAt - Expiry of its link
 * @return {PublicRequestView} - What the requester may read
 */

export const toPublicView = (
  request: PublicRequestSource,
  youtuberName: string,
  linkExpiresAt: Date
): PublicRequestView => ({
  reference: request.reference,
  status: request.status,
  statusLabel: UNBAN_STATUS_REGISTRY.get(request.status).label,
  submittedAt: request.submittedAt.toISOString(),
  updatedAt: request.statusChangedAt.toISOString(),
  decidedAt: request.decidedAt?.toISOString() ?? null,
  reviewNote: decryptField(request.reviewNote),
  answers: readAnswers(request.answers).map((answer) => ({
    label: answer.label,
    text: answerText(answer),
  })),
  youtuberName,
  linkExpiresAt: linkExpiresAt.toISOString(),
})
