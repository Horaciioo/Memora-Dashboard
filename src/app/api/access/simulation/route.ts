import { invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { simulateFunctionGrants, simulateRoleGrants } from '@/core/services/auth/GrantsService'
import { readCategory } from '@/declarations/access/categories'
import { ROLE_REGISTRY } from '@/declarations/access/roles'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import type { AccessSimulation } from '@/types/access'
import type { MemberRoleName } from '@/utils/constants/hierarchy'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.AccessManage,
  descriptor: { summary: 'Resolve what a role or function effectively opens', tags: ['access'] },
  handler: async ({ query }): Promise<AccessSimulation> => {
    const youtuberId = query.get('youtuberId') || null
    const role = query.get('role')
    const functionId = query.get('functionId')

    if (role && ROLE_REGISTRY.has(role)) {
      return {
        label: ROLE_REGISTRY.get(role as MemberRoleName).label,
        permissions: await simulateRoleGrants(role as MemberRoleName, youtuberId),
        youtuberId,
      }
    }

    if (functionId) {
      const category = readCategory(query.get('category') ?? '')

      return {
        label: query.get('label') ?? '',
        permissions: await simulateFunctionGrants(functionId, category, youtuberId),
        youtuberId,
      }
    }

    throw invalidInput([{ field: 'role', message: FORM_COPY.notAnOption }])
  },
})
