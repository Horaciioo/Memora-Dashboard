import { forbidden, invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { listFeatureRows, resetFeatures, setFeatures } from '@/core/services/features'
import { FeatureModes } from '@/declarations/features'
import type { FeatureModeName } from '@/declarations/features'
import { FEATURE_COPY } from '@/declarations/features/copy'
import { Permissions } from '@/utils/constants/permissions'

// Positions a switch accepts
const MODES: string[] = Object.values(FeatureModes)

export const GET = createProtectedRoute({
  permission: Permissions.AccessManage,
  descriptor: { summary: 'Read every feature switch', tags: ['system'] },
  handler: async ({ session }) => {
    if (!session.isRoot) throw forbidden()

    return { rows: await listFeatureRows() }
  },
})

export const PATCH = createProtectedRoute({
  permission: Permissions.AccessManage,
  descriptor: { summary: 'Move one or several feature switches', tags: ['system'] },
  handler: async ({ raw, session }) => {
    if (!session.isRoot) throw forbidden()

    const keys = Array.isArray(raw.keys) ? raw.keys.filter((key) => typeof key === 'string') : []
    const mode = typeof raw.mode === 'string' ? raw.mode : ''
    if (keys.length === 0 || !MODES.includes(mode)) {
      throw invalidInput([{ field: 'mode', message: FEATURE_COPY.unknown }])
    }

    await setFeatures(
      {
        keys,
        mode: mode as FeatureModeName,
        note: typeof raw.note === 'string' ? raw.note : undefined,
        withChildren: raw.withChildren === true,
      },
      session.id
    )

    return { rows: await listFeatureRows() }
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.AccessManage,
  descriptor: { summary: 'Put every feature back to its default', tags: ['system'] },
  handler: async ({ session }) => {
    if (!session.isRoot) throw forbidden()
    await resetFeatures()

    return { rows: await listFeatureRows() }
  },
})
