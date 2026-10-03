import { invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { saveFeedback } from '@/core/services/academy/CurriculumService'
import { ACADEMY_SETTINGS, FORM_SETTINGS } from '@/declarations/configurations/settings'
import { FORM_COPY } from '@/declarations/ui/copy/forms'

/**
 * Read one mark of the review
 * @param {unknown} value - Raw mark
 * @return {number | null} - Mark within the scale
 */

const readMark = (value: unknown): number | null => {
  const mark = Number(value)

  return Number.isInteger(mark) && mark >= 1 && mark <= ACADEMY_SETTINGS.feedbackScale ? mark : null
}

export const POST = createProtectedRoute({
  status: 201,
  descriptor: { summary: 'Review an interactive course', tags: ['academy'] },
  handler: async ({ params, raw, session }) => {
    const content = readMark(raw.content)
    const fluency = readMark(raw.fluency)
    if (content === null || fluency === null) {
      throw invalidInput([
        ...(content === null ? [{ field: 'content', message: FORM_COPY.required }] : []),
        ...(fluency === null ? [{ field: 'fluency', message: FORM_COPY.required }] : []),
      ])
    }

    const comment =
      typeof raw.comment === 'string' && raw.comment.trim()
        ? raw.comment.trim().slice(0, FORM_SETTINGS.longTextMaxLength)
        : null

    await saveFeedback(params.id, session, { content, fluency, comment })

    return { saved: true }
  },
})
