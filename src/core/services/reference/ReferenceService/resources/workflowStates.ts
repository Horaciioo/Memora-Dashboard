import 'server-only'
import { prisma } from '@/core/lib/db'
import { toOptions } from '@/core/lib/forms/options'
import { readFlag, readText } from '@/core/lib/forms/values'
import {
  WORKFLOW_PHASE_REGISTRY,
  WORKFLOW_SCOPE_REGISTRY,
} from '@/declarations/reference/registries'
import { REFERENCE_FIELD_COPY } from '@/declarations/reference/copy'
import { WorkflowPhases, WorkflowScopes } from '@/utils/constants/workflow'
import type { WorkflowPhaseName, WorkflowScopeName } from '@/utils/constants'
import {
  accentField,
  applyOrder,
  nameField,
  nextPosition,
  rethrow,
} from '@/core/services/reference/ReferenceService/resources/shared'
import type { ReferenceResource } from '@/core/services/reference/ReferenceService/resources/shared'

export const workflowStates: ReferenceResource = {
  fields: async () => [
    {
      name: 'scope',
      kind: 'select',
      label: REFERENCE_FIELD_COPY.scope,
      required: true,
      options: toOptions(WORKFLOW_SCOPE_REGISTRY),
      mark: 'dot',
      span: 'half',
    },
    { ...nameField, span: 'half' },
    {
      name: 'phase',
      kind: 'select',
      label: REFERENCE_FIELD_COPY.phase,
      required: true,
      options: toOptions(WORKFLOW_PHASE_REGISTRY),
      mark: 'dot',
      span: 'half',
    },
    accentField,
    { name: 'isDefault', kind: 'toggle', label: REFERENCE_FIELD_COPY.isDefault },
  ],
  list: async () => {
    const rows = await prisma.workflowState.findMany({
      orderBy: [{ scope: 'asc' }, { position: 'asc' }],
      include: { _count: { select: { projects: true, tasks: true, meetings: true } } },
    })

    return rows.map((row) => ({
      id: row.id,
      label: row.name,
      hint: null,
      accent: row.accent,
      badges: [
        WORKFLOW_SCOPE_REGISTRY.label(row.scope),
        WORKFLOW_PHASE_REGISTRY.label(row.phase),
        ...(row.isDefault ? [REFERENCE_FIELD_COPY.defaultBadge] : []),
      ],
      position: row.position,
      usage: row._count.projects + row._count.tasks + row._count.meetings,
      values: {
        scope: row.scope,
        name: row.name,
        phase: row.phase,
        accent: row.accent,
        isDefault: row.isDefault,
      },
    }))
  },
  create: async (values) => {
    const scope = (readText(values, 'scope') ?? WorkflowScopes.Project) as WorkflowScopeName
    const row = await prisma.workflowState
      .create({
        data: {
          scope,
          name: readText(values, 'name') ?? '',
          phase: (readText(values, 'phase') ?? WorkflowPhases.Todo) as WorkflowPhaseName,
          accent: readText(values, 'accent'),
          isDefault: readFlag(values, 'isDefault'),
          position: await nextPosition(prisma.workflowState),
        },
      })
      .catch(rethrow)

    // One default per scope
    if (row.isDefault) {
      await prisma.workflowState.updateMany({
        where: { scope, id: { not: row.id } },
        data: { isDefault: false },
      })
    }

    return workflowStates.list().then((rows) => rows.find((entry) => entry.id === row.id)!)
  },
  update: async (id, values) => {
    const row = await prisma.workflowState
      .update({
        where: { id },
        data: {
          scope: (readText(values, 'scope') ?? undefined) as WorkflowScopeName | undefined,
          name: readText(values, 'name') ?? undefined,
          phase: (readText(values, 'phase') ?? undefined) as WorkflowPhaseName | undefined,
          accent: readText(values, 'accent'),
          isDefault: readFlag(values, 'isDefault'),
        },
      })
      .catch(rethrow)

    if (row.isDefault) {
      await prisma.workflowState.updateMany({
        where: { scope: row.scope, id: { not: row.id } },
        data: { isDefault: false },
      })
    }

    return workflowStates.list().then((rows) => rows.find((entry) => entry.id === id)!)
  },
  remove: async (id) => {
    await prisma.workflowState.delete({ where: { id } })
  },
  reorder: (ids) =>
    applyOrder(
      (id, position) => prisma.workflowState.update({ where: { id }, data: { position } }),
      ids
    ),
}
