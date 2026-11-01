import { createProtectedRoute } from '@/core/lib/http/route'
import { academyScope, assertJuniorViewer } from '@/core/services/academy/AcademyScope'
import { objectivesUnlocked } from '@/core/lib/academy/objectives'
import {
  NOTE_FIELDS,
  OBJECTIVE_FIELDS,
  juniorFields,
  readJunior,
} from '@/core/services/academy/AcademyService'
import { readTimeline } from '@/core/services/academy/parkour/PimTimelineService'
import { planOptionsFor } from '@/core/services/calendar/academyForm'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.AcademyRead,
  descriptor: { summary: 'Read a junior with what a member may do on them', tags: ['academy'] },
  handler: async ({ params, session, access }) => {
    const scope = academyScope(session, access)
    const { junior } = await readJunior(params.id, scope)
    assertJuniorViewer(session, access, junior)

    const can = {
      edit: access.can(Permissions.AcademyManage),
      plan: access.can(Permissions.CalendarManage),
      note: access.can(Permissions.AcademyNoteWrite),
      skill: access.can(Permissions.AcademySkillWrite),
      // A junior never reads the objectives set for them
      objective: access.can(Permissions.AcademyObjectiveWrite) && junior.accountId !== session.id,
      follow: access.isResponsable || access.isAdmin,
    }

    return {
      junior,
      can,
      fields: can.edit ? await juniorFields(junior.sessionId) : [],
      noteFields: can.note ? NOTE_FIELDS : [],
      objectiveFields: can.objective ? OBJECTIVE_FIELDS : [],
      isObjectivesOpen: objectivesUnlocked(junior.status, junior.stage),
      steps: (await readTimeline(params.id, scope)).steps,
      agenda: can.plan ? await planOptionsFor(scope, params.id) : [],
    }
  },
})
