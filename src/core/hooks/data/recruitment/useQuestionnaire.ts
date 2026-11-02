'use client'

import { useMemo } from 'react'

import { bankFor } from '@/core/lib/recruitment/questionnaire'
import type { ResolvedQuestion } from '@/core/lib/recruitment/questionnaire'
import type { RecruitmentPlatformName } from '@/utils/constants/recruitment'

/**
 * Questions of a session
 * @typedef {Object} Questionnaire
 * @property {ResolvedQuestion[]} bank - Every question the platform can ask
 * @property {ResolvedQuestion[]} picked - The ones the recruiters kept, in asking order
 */

export interface Questionnaire {
  bank: ResolvedQuestion[]
  picked: ResolvedQuestion[]
}

/**
 * Resolve the bank and the pick of a session
 * @param {RecruitmentPlatformName} platform - Platform of the session
 * @param {string} creator - Creator recruited for
 * @param {string[]} keys - Keys picked
 * @param {boolean} [formal] - Read with « vous »
 * @return {Questionnaire} - Bank and pick
 */

export const useQuestionnaire = (
  platform: RecruitmentPlatformName,
  creator: string,
  keys: string[],
  formal = true
): Questionnaire =>
  useMemo(() => {
    const bank = bankFor(platform, creator, formal)
    const wanted = new Set(keys)
    // A fold family comes whole, whichever of its members was kept
    const families = new Set(
      bank.flatMap((question) =>
        wanted.has(question.key) && question.family ? [question.family] : []
      )
    )

    return {
      bank,
      picked: bank.filter(
        (question) => wanted.has(question.key) || (question.family && families.has(question.family))
      ),
    }
  }, [platform, creator, keys, formal])
