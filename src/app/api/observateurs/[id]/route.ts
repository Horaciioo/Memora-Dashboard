import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import {
  observerFields,
  removeObserver,
  updateObserver,
} from '@/core/services/recruitment/ObserverService'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.RecruitmentManage,
  descriptor: { summary: 'Change an observer quota', tags: ['recruitment'] },
  handler: async ({ params, raw, scope }) => {
    const quota = (await observerFields()).filter((field) => field.name === 'quota')
    const parsed = parseFormValues(quota, raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    return updateObserver(params.id, parsed.values, await scope())
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.RecruitmentManage,
  descriptor: { summary: 'Take an observer seat back', tags: ['recruitment'] },
  handler: async ({ params, scope }) => removeObserver(params.id, await scope()),
})
