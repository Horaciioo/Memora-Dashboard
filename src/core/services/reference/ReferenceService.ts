import 'server-only'

import { prisma } from '@/core/lib/db'
import { conflict, notFound } from '@/core/lib/errors'
import { TONE_OPTIONS, rowsToOptions, toOptions } from '@/core/lib/forms/options'
import { readDate, readFlag, readList, readNumberValue, readText } from '@/core/lib/forms/values'
import {
  ACADEMY_SETTINGS,
  FORM_SETTINGS,
  LIVECON_SETTINGS,
} from '@/declarations/configurations/settings'
import {
  ACADEMY_STAGE_REGISTRY,
  STEP_ANCHOR_REGISTRY,
  STEP_OWNER_REGISTRY,
} from '@/declarations/academy/registries'
import { ACADEMY_PERIOD_REGISTRY } from '@/declarations/access/roles'
import {
  EVENT_VISIBILITY_REGISTRY,
  FUNCTION_KIND_REGISTRY,
  WORKFLOW_SCOPE_REGISTRY,
} from '@/declarations/reference/registries'
import { REFERENCE_FIELD_COPY } from '@/declarations/reference/copy'
import type { ReferenceKey } from '@/declarations/reference/sections'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type { ReferenceRow } from '@/types/reference'
import { AcademyStages, StepAnchors, StepOwners } from '@/utils/constants/hierarchy'
import { EventVisibilities, FunctionKinds, WorkflowScopes } from '@/utils/constants/workflow'
import type {
  AcademyPeriodName,
  AcademyStageName,
  StepAnchorName,
  StepOwnerName,
  EventVisibilityName,
  FunctionKindName,
  WorkflowScopeName,
} from '@/utils/constants'

/**
 * Operations backing one reference collection
 * @typedef {Object} ReferenceResource
 * @property {() => Promise<FieldDefinition[]>} fields - Form declarations
 * @property {() => Promise<ReferenceRow[]>} list - Existing rows
 * @property {(values: FormValues) => Promise<ReferenceRow>} create - Add a row
 * @property {(id: string, values: FormValues) => Promise<ReferenceRow>} update - Edit a row
 * @property {(id: string) => Promise<void>} remove - Drop a row
 * @property {(ids: string[]) => Promise<void>} reorder - Apply a new order
 */

export interface ReferenceResource {
  fields: () => Promise<FieldDefinition[]>
  list: () => Promise<ReferenceRow[]>
  create: (values: FormValues) => Promise<ReferenceRow>
  update: (id: string, values: FormValues) => Promise<ReferenceRow>
  remove: (id: string) => Promise<void>
  reorder: (ids: string[]) => Promise<void>
}

const { shortTextMaxLength, longTextMaxLength, markdownMaxLength } = FORM_SETTINGS

// Shared shape of the name field of every collection
const nameField: FieldDefinition = {
  name: 'name',
  kind: 'text',
  label: REFERENCE_FIELD_COPY.name,
  required: true,
  maxLength: shortTextMaxLength,
}

// Shared shape of the colour field of every collection
const accentField: FieldDefinition = {
  name: 'accent',
  kind: 'select',
  label: REFERENCE_FIELD_COPY.accent,
  options: TONE_OPTIONS,
  mark: 'dot',
  span: 'half',
}

/**
 * Reject a duplicate name
 * @param {unknown} error - Caught value
 * @return {never} - Always throws
 */

const rethrow = (error: unknown): never => {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    if ((error as { code: unknown }).code === 'P2002') throw conflict()
  }

  throw error
}

/**
 * Read the next free position of a collection
 * @param {{ aggregate: (args: object) => Promise<{ _max: { position: number | null } }> }} model - Prisma delegate
 * @return {Promise<number>} - Next position
 */

const nextPosition = async (model: {
  aggregate: (args: { _max: { position: true } }) => Promise<{ _max: { position: number | null } }>
}): Promise<number> => {
  const result = await model.aggregate({ _max: { position: true } })

  return (result._max.position ?? 0) + 1
}

/**
 * Apply an explicit order to a collection
 * @param {(id: string, position: number) => Promise<unknown>} write - Row updater
 * @param {string[]} ids - Identifiers in their new order
 * @return {Promise<void>} - Applied
 */

const applyOrder = async (
  write: (id: string, position: number) => Promise<unknown>,
  ids: string[]
): Promise<void> => {
  await Promise.all(ids.map((id, index) => write(id, index)))
}

/**
 * Reject reordering on a collection ordered by another column
 * @return {Promise<void>} - Never reorders
 */

const noReorder = async (): Promise<void> => {}

const youtubers: ReferenceResource = {
  fields: async () => [
    nameField,
    {
      name: 'handle',
      kind: 'text',
      label: REFERENCE_FIELD_COPY.handle,
      maxLength: shortTextMaxLength,
      span: 'half',
    },
    accentField,
    { name: 'avatarUrl', kind: 'image', label: REFERENCE_FIELD_COPY.avatarUrl, bucket: 'avatars' },
    { name: 'archived', kind: 'toggle', label: REFERENCE_FIELD_COPY.archived },
  ],
  list: async () => {
    const rows = await prisma.youtuber.findMany({
      orderBy: { position: 'asc' },
      include: { _count: { select: { accounts: true, projects: true } } },
    })

    return rows.map((row) => ({
      id: row.id,
      label: row.name,
      hint: row.handle,
      accent: row.accent,
      image: row.avatarUrl,
      badges: row.archived ? [REFERENCE_FIELD_COPY.archivedBadge] : [],
      position: row.position,
      usage: row._count.accounts + row._count.projects,
      values: {
        name: row.name,
        handle: row.handle,
        accent: row.accent,
        avatarUrl: row.avatarUrl,
        archived: row.archived,
      },
    }))
  },
  create: async (values) => {
    const row = await prisma.youtuber
      .create({
        data: {
          name: readText(values, 'name') ?? '',
          handle: readText(values, 'handle'),
          accent: readText(values, 'accent'),
          avatarUrl: readText(values, 'avatarUrl'),
          archived: readFlag(values, 'archived'),
          position: await nextPosition(prisma.youtuber),
        },
      })
      .catch(rethrow)

    return youtubers.list().then((rows) => rows.find((entry) => entry.id === row.id)!)
  },
  update: async (id, values) => {
    await prisma.youtuber
      .update({
        where: { id },
        data: {
          name: readText(values, 'name') ?? undefined,
          handle: readText(values, 'handle'),
          accent: readText(values, 'accent'),
          avatarUrl: readText(values, 'avatarUrl'),
          archived: readFlag(values, 'archived'),
        },
      })
      .catch(rethrow)

    return youtubers.list().then((rows) => rows.find((entry) => entry.id === id)!)
  },
  remove: async (id) => {
    await prisma.youtuber.delete({ where: { id } })
  },
  reorder: (ids) =>
    applyOrder(
      (id, position) => prisma.youtuber.update({ where: { id }, data: { position } }),
      ids
    ),
}

const divisions: ReferenceResource = {
  fields: async () => [
    nameField,
    {
      name: 'glyph',
      kind: 'text',
      label: REFERENCE_FIELD_COPY.glyph,
      maxLength: shortTextMaxLength,
      span: 'half',
    },
    {
      name: 'rank',
      kind: 'number',
      label: REFERENCE_FIELD_COPY.rank,
      required: true,
      min: 0,
      max: FORM_SETTINGS.divisionMaxRank,
      span: 'half',
    },
    {
      name: 'imagePath',
      kind: 'image',
      label: REFERENCE_FIELD_COPY.imagePath,
      bucket: 'avatars',
    },
    {
      name: 'summary',
      kind: 'textarea',
      label: REFERENCE_FIELD_COPY.summary,
      maxLength: longTextMaxLength,
    },
  ],
  list: async () => {
    const rows = await prisma.division.findMany({
      orderBy: { rank: 'asc' },
      include: { _count: { select: { accounts: true } } },
    })

    return rows.map((row) => ({
      id: row.id,
      label: row.name,
      hint: row.summary,
      accent: null,
      image: row.imagePath,
      badges: row.glyph ? [row.glyph] : [],
      position: row.rank,
      usage: row._count.accounts,
      values: {
        name: row.name,
        glyph: row.glyph,
        rank: row.rank,
        imagePath: row.imagePath,
        summary: row.summary,
      },
    }))
  },
  create: async (values) => {
    const row = await prisma.division
      .create({
        data: {
          name: readText(values, 'name') ?? '',
          glyph: readText(values, 'glyph'),
          rank: readNumberValue(values, 'rank') ?? 0,
          imagePath: readText(values, 'imagePath'),
          summary: readText(values, 'summary'),
        },
      })
      .catch(rethrow)

    return divisions.list().then((rows) => rows.find((entry) => entry.id === row.id)!)
  },
  update: async (id, values) => {
    await prisma.division
      .update({
        where: { id },
        data: {
          name: readText(values, 'name') ?? undefined,
          glyph: readText(values, 'glyph'),
          rank: readNumberValue(values, 'rank') ?? undefined,
          imagePath: readText(values, 'imagePath'),
          summary: readText(values, 'summary'),
        },
      })
      .catch(rethrow)

    return divisions.list().then((rows) => rows.find((entry) => entry.id === id)!)
  },
  remove: async (id) => {
    await prisma.division.delete({ where: { id } })
  },
  reorder: noReorder,
}

const jobFunctions: ReferenceResource = {
  fields: async () => [
    nameField,
    {
      name: 'kind',
      kind: 'select',
      label: REFERENCE_FIELD_COPY.kind,
      required: true,
      options: toOptions(FUNCTION_KIND_REGISTRY),
      mark: 'dot',
      span: 'half',
    },
    accentField,
    {
      name: 'summary',
      kind: 'textarea',
      label: REFERENCE_FIELD_COPY.summary,
      maxLength: longTextMaxLength,
    },
    { name: 'archived', kind: 'toggle', label: REFERENCE_FIELD_COPY.archived },
  ],
  list: async () => {
    const rows = await prisma.jobFunction.findMany({
      orderBy: [{ kind: 'asc' }, { position: 'asc' }],
      include: { _count: { select: { primaryHolders: true, secondaryHolders: true } } },
    })

    return rows.map((row) => ({
      id: row.id,
      label: row.name,
      hint: row.summary,
      accent: row.accent,
      badges: [
        FUNCTION_KIND_REGISTRY.label(row.kind),
        ...(row.archived ? [REFERENCE_FIELD_COPY.archivedBadge] : []),
      ],
      position: row.position,
      usage: row._count.primaryHolders + row._count.secondaryHolders,
      values: {
        name: row.name,
        kind: row.kind,
        accent: row.accent,
        summary: row.summary,
        archived: row.archived,
      },
    }))
  },
  create: async (values) => {
    const row = await prisma.jobFunction
      .create({
        data: {
          name: readText(values, 'name') ?? '',
          kind: (readText(values, 'kind') ?? FunctionKinds.Primary) as FunctionKindName,
          accent: readText(values, 'accent'),
          summary: readText(values, 'summary'),
          archived: readFlag(values, 'archived'),
          position: await nextPosition(prisma.jobFunction),
        },
      })
      .catch(rethrow)

    return jobFunctions.list().then((rows) => rows.find((entry) => entry.id === row.id)!)
  },
  update: async (id, values) => {
    await prisma.jobFunction
      .update({
        where: { id },
        data: {
          name: readText(values, 'name') ?? undefined,
          kind: (readText(values, 'kind') ?? undefined) as FunctionKindName | undefined,
          accent: readText(values, 'accent'),
          summary: readText(values, 'summary'),
          archived: readFlag(values, 'archived'),
        },
      })
      .catch(rethrow)

    return jobFunctions.list().then((rows) => rows.find((entry) => entry.id === id)!)
  },
  remove: async (id) => {
    await prisma.jobFunction.delete({ where: { id } })
  },
  reorder: (ids) =>
    applyOrder(
      (id, position) => prisma.jobFunction.update({ where: { id }, data: { position } }),
      ids
    ),
}

const platforms: ReferenceResource = {
  fields: async () => [
    nameField,
    accentField,
    { name: 'avatarUrl', kind: 'image', label: REFERENCE_FIELD_COPY.avatarUrl, bucket: 'avatars' },
    { name: 'archived', kind: 'toggle', label: REFERENCE_FIELD_COPY.archived },
  ],
  list: async () => {
    const rows = await prisma.platform.findMany({
      orderBy: { position: 'asc' },
      include: { _count: { select: { projects: true } } },
    })

    return rows.map((row) => ({
      id: row.id,
      label: row.name,
      hint: null,
      accent: row.accent,
      image: row.avatarUrl,
      badges: row.archived ? [REFERENCE_FIELD_COPY.archivedBadge] : [],
      position: row.position,
      usage: row._count.projects,
      values: {
        name: row.name,
        accent: row.accent,
        avatarUrl: row.avatarUrl,
        archived: row.archived,
      },
    }))
  },
  create: async (values) => {
    const row = await prisma.platform
      .create({
        data: {
          name: readText(values, 'name') ?? '',
          accent: readText(values, 'accent'),
          avatarUrl: readText(values, 'avatarUrl'),
          archived: readFlag(values, 'archived'),
          position: await nextPosition(prisma.platform),
        },
      })
      .catch(rethrow)

    return platforms.list().then((rows) => rows.find((entry) => entry.id === row.id)!)
  },
  update: async (id, values) => {
    await prisma.platform
      .update({
        where: { id },
        data: {
          name: readText(values, 'name') ?? undefined,
          accent: readText(values, 'accent'),
          avatarUrl: readText(values, 'avatarUrl'),
          archived: readFlag(values, 'archived'),
        },
      })
      .catch(rethrow)

    return platforms.list().then((rows) => rows.find((entry) => entry.id === id)!)
  },
  remove: async (id) => {
    await prisma.platform.delete({ where: { id } })
  },
  reorder: (ids) =>
    applyOrder(
      (id, position) => prisma.platform.update({ where: { id }, data: { position } }),
      ids
    ),
}

const workflowStates: ReferenceResource = {
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
    accentField,
    { name: 'isDefault', kind: 'toggle', label: REFERENCE_FIELD_COPY.isDefault },
    { name: 'isTerminal', kind: 'toggle', label: REFERENCE_FIELD_COPY.isTerminal },
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
        ...(row.isDefault ? [REFERENCE_FIELD_COPY.defaultBadge] : []),
        ...(row.isTerminal ? [REFERENCE_FIELD_COPY.terminalBadge] : []),
      ],
      position: row.position,
      usage: row._count.projects + row._count.tasks + row._count.meetings,
      values: {
        scope: row.scope,
        name: row.name,
        accent: row.accent,
        isDefault: row.isDefault,
        isTerminal: row.isTerminal,
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
          accent: readText(values, 'accent'),
          isDefault: readFlag(values, 'isDefault'),
          isTerminal: readFlag(values, 'isTerminal'),
          position: await nextPosition(prisma.workflowState),
        },
      })
      .catch(rethrow)

    // One default per scope, the newest wins
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
          accent: readText(values, 'accent'),
          isDefault: readFlag(values, 'isDefault'),
          isTerminal: readFlag(values, 'isTerminal'),
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

const priorities: ReferenceResource = {
  fields: async () => [
    nameField,
    {
      name: 'weight',
      kind: 'number',
      label: REFERENCE_FIELD_COPY.weight,
      required: true,
      min: 0,
      max: FORM_SETTINGS.priorityMaxWeight,
      span: 'half',
    },
    accentField,
  ],
  list: async () => {
    const rows = await prisma.priority.findMany({
      orderBy: { weight: 'desc' },
      include: { _count: { select: { projects: true, tasks: true } } },
    })

    return rows.map((row) => ({
      id: row.id,
      label: row.name,
      hint: null,
      accent: row.accent,
      badges: [],
      position: row.weight,
      usage: row._count.projects + row._count.tasks,
      values: { name: row.name, weight: row.weight, accent: row.accent },
    }))
  },
  create: async (values) => {
    const row = await prisma.priority
      .create({
        data: {
          name: readText(values, 'name') ?? '',
          weight: readNumberValue(values, 'weight') ?? 0,
          accent: readText(values, 'accent'),
        },
      })
      .catch(rethrow)

    return priorities.list().then((rows) => rows.find((entry) => entry.id === row.id)!)
  },
  update: async (id, values) => {
    await prisma.priority
      .update({
        where: { id },
        data: {
          name: readText(values, 'name') ?? undefined,
          weight: readNumberValue(values, 'weight') ?? undefined,
          accent: readText(values, 'accent'),
        },
      })
      .catch(rethrow)

    return priorities.list().then((rows) => rows.find((entry) => entry.id === id)!)
  },
  remove: async (id) => {
    await prisma.priority.delete({ where: { id } })
  },
  reorder: noReorder,
}

const eventTypes: ReferenceResource = {
  fields: async () => [
    nameField,
    {
      name: 'visibility',
      kind: 'select',
      label: REFERENCE_FIELD_COPY.visibility,
      required: true,
      options: toOptions(EVENT_VISIBILITY_REGISTRY),
      mark: 'dot',
      span: 'half',
    },
    accentField,
    {
      name: 'summary',
      kind: 'textarea',
      label: REFERENCE_FIELD_COPY.summary,
      maxLength: longTextMaxLength,
    },
    { name: 'archived', kind: 'toggle', label: REFERENCE_FIELD_COPY.archived },
  ],
  list: async () => {
    const rows = await prisma.eventType.findMany({
      orderBy: { position: 'asc' },
      include: { _count: { select: { events: true } } },
    })

    return rows.map((row) => ({
      id: row.id,
      label: row.name,
      hint: row.summary,
      accent: row.accent,
      badges: [
        EVENT_VISIBILITY_REGISTRY.label(row.visibility),
        ...(row.archived ? [REFERENCE_FIELD_COPY.archivedBadge] : []),
      ],
      position: row.position,
      usage: row._count.events,
      values: {
        name: row.name,
        visibility: row.visibility,
        accent: row.accent,
        summary: row.summary,
        archived: row.archived,
      },
    }))
  },
  create: async (values) => {
    const row = await prisma.eventType
      .create({
        data: {
          name: readText(values, 'name') ?? '',
          visibility: (readText(values, 'visibility') ??
            EventVisibilities.Everyone) as EventVisibilityName,
          accent: readText(values, 'accent'),
          summary: readText(values, 'summary'),
          archived: readFlag(values, 'archived'),
          position: await nextPosition(prisma.eventType),
        },
      })
      .catch(rethrow)

    return eventTypes.list().then((rows) => rows.find((entry) => entry.id === row.id)!)
  },
  update: async (id, values) => {
    await prisma.eventType
      .update({
        where: { id },
        data: {
          name: readText(values, 'name') ?? undefined,
          visibility: (readText(values, 'visibility') ??
            EventVisibilities.Everyone) as EventVisibilityName,
          accent: readText(values, 'accent'),
          summary: readText(values, 'summary'),
          archived: readFlag(values, 'archived'),
        },
      })
      .catch(rethrow)

    return eventTypes.list().then((rows) => rows.find((entry) => entry.id === id)!)
  },
  remove: async (id) => {
    await prisma.eventType.delete({ where: { id } })
  },
  reorder: (ids) =>
    applyOrder(
      (id, position) => prisma.eventType.update({ where: { id }, data: { position } }),
      ids
    ),
}

const trainings: ReferenceResource = {
  fields: async () => {
    const [functions, dispositifRows] = await Promise.all([
      prisma.jobFunction.findMany({ where: { archived: false }, orderBy: { position: 'asc' } }),
      prisma.dispositif.findMany({ orderBy: { position: 'asc' } }),
    ])

    return [
      nameField,
      {
        name: 'period',
        kind: 'select',
        label: REFERENCE_FIELD_COPY.period,
        options: toOptions(ACADEMY_PERIOD_REGISTRY),
        mark: 'dot',
        span: 'half',
      },
      {
        name: 'functionId',
        kind: 'select',
        label: REFERENCE_FIELD_COPY.jobFunction,
        options: rowsToOptions(functions),
        span: 'half',
      },
      {
        name: 'dispositifId',
        kind: 'select',
        label: REFERENCE_FIELD_COPY.dispositif,
        options: rowsToOptions(dispositifRows),
        span: 'half',
      },
      {
        name: 'summary',
        kind: 'textarea',
        label: REFERENCE_FIELD_COPY.summary,
        maxLength: markdownMaxLength,
      },
      { name: 'mandatory', kind: 'toggle', label: REFERENCE_FIELD_COPY.mandatory },
    ]
  },
  list: async () => {
    const rows = await prisma.training.findMany({
      orderBy: [{ period: 'asc' }, { position: 'asc' }],
      include: { jobFunction: true, dispositif: true, _count: { select: { records: true } } },
    })

    return rows.map((row) => ({
      id: row.id,
      label: row.name,
      hint: row.jobFunction?.name ?? null,
      accent: row.mandatory ? 'brand' : null,
      badges: [
        ...(row.dispositif ? [row.dispositif.name] : []),
        ...(row.period ? [ACADEMY_PERIOD_REGISTRY.label(row.period)] : []),
        ...(row.mandatory ? [REFERENCE_FIELD_COPY.mandatoryBadge] : []),
      ],
      position: row.position,
      usage: row._count.records,
      values: {
        name: row.name,
        period: row.period,
        functionId: row.functionId,
        dispositifId: row.dispositifId,
        summary: row.summary,
        mandatory: row.mandatory,
      },
    }))
  },
  create: async (values) => {
    const row = await prisma.training
      .create({
        data: {
          name: readText(values, 'name') ?? '',
          period: (readText(values, 'period') ?? null) as AcademyPeriodName | null,
          functionId: readText(values, 'functionId'),
          dispositifId: readText(values, 'dispositifId'),
          summary: readText(values, 'summary'),
          mandatory: readFlag(values, 'mandatory'),
          position: await nextPosition(prisma.training),
        },
      })
      .catch(rethrow)

    return trainings.list().then((rows) => rows.find((entry) => entry.id === row.id)!)
  },
  update: async (id, values) => {
    await prisma.training
      .update({
        where: { id },
        data: {
          name: readText(values, 'name') ?? undefined,
          period: (readText(values, 'period') ?? null) as AcademyPeriodName | null,
          functionId: readText(values, 'functionId'),
          dispositifId: readText(values, 'dispositifId'),
          summary: readText(values, 'summary'),
          mandatory: readFlag(values, 'mandatory'),
        },
      })
      .catch(rethrow)

    return trainings.list().then((rows) => rows.find((entry) => entry.id === id)!)
  },
  remove: async (id) => {
    await prisma.training.delete({ where: { id } })
  },
  reorder: (ids) =>
    applyOrder(
      (id, position) => prisma.training.update({ where: { id }, data: { position } }),
      ids
    ),
}

const liveconLevels: ReferenceResource = {
  fields: async () => [
    {
      name: 'level',
      kind: 'number',
      label: REFERENCE_FIELD_COPY.level,
      required: true,
      min: LIVECON_SETTINGS.minLevel,
      max: LIVECON_SETTINGS.maxLevel,
      span: 'half',
    },
    { ...nameField, span: 'half' },
    accentField,
    {
      name: 'summary',
      kind: 'textarea',
      label: REFERENCE_FIELD_COPY.situation,
      maxLength: longTextMaxLength,
    },
    {
      name: 'guidelines',
      kind: 'markdown',
      label: REFERENCE_FIELD_COPY.guidelines,
      maxLength: markdownMaxLength,
    },
  ],
  list: async () => {
    const rows = await prisma.liveconLevel.findMany({
      orderBy: { level: 'desc' },
      include: { _count: { select: { entries: true } } },
    })

    return rows.map((row) => ({
      id: row.id,
      label: row.name,
      hint: row.summary,
      accent: row.accent,
      badges: [`${REFERENCE_FIELD_COPY.levelBadge} ${row.level}`],
      position: row.level,
      usage: row._count.entries,
      values: {
        level: row.level,
        name: row.name,
        accent: row.accent,
        summary: row.summary,
        guidelines: row.guidelines,
      },
    }))
  },
  create: async (values) => {
    const row = await prisma.liveconLevel
      .create({
        data: {
          level: readNumberValue(values, 'level') ?? LIVECON_SETTINGS.defaultLevel,
          name: readText(values, 'name') ?? '',
          accent: readText(values, 'accent'),
          summary: readText(values, 'summary'),
          guidelines: readText(values, 'guidelines'),
        },
      })
      .catch(rethrow)

    return liveconLevels.list().then((rows) => rows.find((entry) => entry.id === row.id)!)
  },
  update: async (id, values) => {
    await prisma.liveconLevel
      .update({
        where: { id },
        data: {
          level: readNumberValue(values, 'level') ?? undefined,
          name: readText(values, 'name') ?? undefined,
          accent: readText(values, 'accent'),
          summary: readText(values, 'summary'),
          guidelines: readText(values, 'guidelines'),
        },
      })
      .catch(rethrow)

    return liveconLevels.list().then((rows) => rows.find((entry) => entry.id === id)!)
  },
  remove: async (id) => {
    await prisma.liveconLevel.delete({ where: { id } })
  },
  reorder: noReorder,
}

const dispositifs: ReferenceResource = {
  fields: async () => [
    nameField,
    accentField,
    {
      name: 'summary',
      kind: 'textarea',
      label: REFERENCE_FIELD_COPY.summary,
      maxLength: longTextMaxLength,
    },
  ],
  list: async () => {
    const rows = await prisma.dispositif.findMany({
      orderBy: { position: 'asc' },
      include: { _count: { select: { juniors: true } } },
    })

    return rows.map((row) => ({
      id: row.id,
      label: row.name,
      hint: row.summary,
      accent: row.accent,
      badges: [],
      position: row.position,
      usage: row._count.juniors,
      values: {
        name: row.name,
        accent: row.accent,
        summary: row.summary,
      },
    }))
  },
  create: async (values) => {
    const row = await prisma.dispositif
      .create({
        data: {
          name: readText(values, 'name') ?? '',
          accent: readText(values, 'accent'),
          summary: readText(values, 'summary'),
          position: await nextPosition(prisma.dispositif),
        },
      })
      .catch(rethrow)

    return dispositifs.list().then((rows) => rows.find((entry) => entry.id === row.id)!)
  },
  update: async (id, values) => {
    await prisma.dispositif
      .update({
        where: { id },
        data: {
          name: readText(values, 'name') ?? undefined,
          accent: readText(values, 'accent'),
          summary: readText(values, 'summary'),
        },
      })
      .catch(rethrow)

    return dispositifs.list().then((rows) => rows.find((entry) => entry.id === id)!)
  },
  remove: async (id) => {
    await prisma.dispositif.delete({ where: { id } })
  },
  reorder: (ids) =>
    applyOrder(
      (id, position) => prisma.dispositif.update({ where: { id }, data: { position } }),
      ids
    ),
}

const skillCategories: ReferenceResource = {
  fields: async () => [nameField, accentField],
  list: async () => {
    const rows = await prisma.skillCategory.findMany({
      orderBy: { position: 'asc' },
      include: { _count: { select: { skills: true } } },
    })

    return rows.map((row) => ({
      id: row.id,
      label: row.name,
      hint: null,
      accent: row.accent,
      badges: [],
      position: row.position,
      usage: row._count.skills,
      values: { name: row.name, accent: row.accent },
    }))
  },
  create: async (values) => {
    const row = await prisma.skillCategory
      .create({
        data: {
          name: readText(values, 'name') ?? '',
          accent: readText(values, 'accent'),
          position: await nextPosition(prisma.skillCategory),
        },
      })
      .catch(rethrow)

    return skillCategories.list().then((rows) => rows.find((entry) => entry.id === row.id)!)
  },
  update: async (id, values) => {
    await prisma.skillCategory
      .update({
        where: { id },
        data: {
          name: readText(values, 'name') ?? undefined,
          accent: readText(values, 'accent'),
        },
      })
      .catch(rethrow)

    return skillCategories.list().then((rows) => rows.find((entry) => entry.id === id)!)
  },
  remove: async (id) => {
    await prisma.skillCategory.delete({ where: { id } })
  },
  reorder: (ids) =>
    applyOrder(
      (id, position) => prisma.skillCategory.update({ where: { id }, data: { position } }),
      ids
    ),
}

const skills: ReferenceResource = {
  fields: async () => {
    const [categories, functions, dispositifRows] = await Promise.all([
      prisma.skillCategory.findMany({ orderBy: { position: 'asc' } }),
      prisma.jobFunction.findMany({ where: { archived: false }, orderBy: { position: 'asc' } }),
      prisma.dispositif.findMany({ orderBy: { position: 'asc' } }),
    ])

    return [
      nameField,
      {
        name: 'categoryId',
        kind: 'select',
        label: REFERENCE_FIELD_COPY.category,
        required: true,
        options: rowsToOptions(categories),
      },
      {
        name: 'functionId',
        kind: 'select',
        label: REFERENCE_FIELD_COPY.jobFunction,
        options: rowsToOptions(functions),
        span: 'half',
      },
      {
        name: 'dispositifId',
        kind: 'select',
        label: REFERENCE_FIELD_COPY.dispositif,
        options: rowsToOptions(dispositifRows),
        span: 'half',
      },
      {
        name: 'description',
        kind: 'textarea',
        label: REFERENCE_FIELD_COPY.summary,
        maxLength: longTextMaxLength,
      },
    ]
  },
  list: async () => {
    const rows = await prisma.skill.findMany({
      orderBy: [{ category: { position: 'asc' } }, { position: 'asc' }],
      include: { category: true, jobFunction: true, dispositif: true },
    })

    return rows.map((row) => ({
      id: row.id,
      label: row.name,
      hint: row.description,
      accent: row.category.accent,
      badges: [
        row.category.name,
        ...(row.jobFunction ? [row.jobFunction.name] : []),
        ...(row.dispositif ? [row.dispositif.name] : []),
      ],
      position: row.position,
      // No consumer reads a skill yet, wired once the FSI lands
      usage: 0,
      values: {
        name: row.name,
        categoryId: row.categoryId,
        functionId: row.functionId,
        dispositifId: row.dispositifId,
        description: row.description,
      },
    }))
  },
  create: async (values) => {
    const row = await prisma.skill
      .create({
        data: {
          name: readText(values, 'name') ?? '',
          categoryId: readText(values, 'categoryId') ?? '',
          functionId: readText(values, 'functionId'),
          dispositifId: readText(values, 'dispositifId'),
          description: readText(values, 'description'),
          position: await nextPosition(prisma.skill),
        },
      })
      .catch(rethrow)

    return skills.list().then((rows) => rows.find((entry) => entry.id === row.id)!)
  },
  update: async (id, values) => {
    await prisma.skill
      .update({
        where: { id },
        data: {
          name: readText(values, 'name') ?? undefined,
          categoryId: readText(values, 'categoryId') ?? undefined,
          functionId: readText(values, 'functionId'),
          dispositifId: readText(values, 'dispositifId'),
          description: readText(values, 'description'),
        },
      })
      .catch(rethrow)

    return skills.list().then((rows) => rows.find((entry) => entry.id === id)!)
  },
  remove: async (id) => {
    await prisma.skill.delete({ where: { id } })
  },
  reorder: (ids) =>
    applyOrder((id, position) => prisma.skill.update({ where: { id }, data: { position } }), ids),
}

const pimStepTemplates: ReferenceResource = {
  fields: async () => {
    const [functions, dispositifRows] = await Promise.all([
      prisma.jobFunction.findMany({ where: { archived: false }, orderBy: { position: 'asc' } }),
      prisma.dispositif.findMany({ orderBy: { position: 'asc' } }),
    ])

    return [
      {
        name: 'title',
        kind: 'text',
        label: REFERENCE_FIELD_COPY.title,
        required: true,
        maxLength: shortTextMaxLength,
      },
      {
        name: 'stage',
        kind: 'select',
        label: REFERENCE_FIELD_COPY.stage,
        required: true,
        options: toOptions(ACADEMY_STAGE_REGISTRY),
        mark: 'dot',
        span: 'half',
      },
      {
        name: 'anchor',
        kind: 'select',
        label: REFERENCE_FIELD_COPY.anchor,
        required: true,
        options: toOptions(STEP_ANCHOR_REGISTRY),
        mark: 'dot',
        span: 'half',
      },
      {
        name: 'offset',
        kind: 'number',
        label: REFERENCE_FIELD_COPY.offset,
        required: true,
        min: ACADEMY_SETTINGS.stepOffsetMin,
        max: ACADEMY_SETTINGS.stepOffsetMax,
        span: 'half',
      },
      {
        name: 'owner',
        kind: 'select',
        label: REFERENCE_FIELD_COPY.owner,
        required: true,
        options: toOptions(STEP_OWNER_REGISTRY),
        mark: 'dot',
        span: 'half',
      },
      {
        name: 'functionId',
        kind: 'select',
        label: REFERENCE_FIELD_COPY.jobFunction,
        options: rowsToOptions(functions),
        span: 'half',
      },
      {
        name: 'dispositifId',
        kind: 'select',
        label: REFERENCE_FIELD_COPY.dispositif,
        options: rowsToOptions(dispositifRows),
        span: 'half',
      },
      {
        name: 'description',
        kind: 'textarea',
        label: REFERENCE_FIELD_COPY.summary,
        maxLength: longTextMaxLength,
      },
      { name: 'required', kind: 'toggle', label: REFERENCE_FIELD_COPY.mandatory },
    ]
  },
  list: async () => {
    const rows = await prisma.pimStepTemplate.findMany({
      orderBy: [{ stage: 'asc' }, { offset: 'asc' }, { position: 'asc' }],
      include: { jobFunction: true, dispositif: true },
    })

    return rows.map((row) => ({
      id: row.id,
      label: row.title,
      hint: row.description,
      accent: ACADEMY_STAGE_REGISTRY.get(row.stage).accent,
      badges: [
        ACADEMY_STAGE_REGISTRY.label(row.stage),
        `${STEP_ANCHOR_REGISTRY.label(row.anchor)} ${row.offset >= 0 ? '+' : ''}${row.offset}`,
        STEP_OWNER_REGISTRY.label(row.owner),
        ...(row.jobFunction ? [row.jobFunction.name] : []),
        ...(row.dispositif ? [row.dispositif.name] : []),
        ...(row.required ? [REFERENCE_FIELD_COPY.mandatoryBadge] : []),
      ],
      position: row.position,
      // No session instantiates a step from it yet, wired in the timeline phase
      usage: 0,
      values: {
        title: row.title,
        stage: row.stage,
        anchor: row.anchor,
        offset: row.offset,
        owner: row.owner,
        functionId: row.functionId,
        dispositifId: row.dispositifId,
        description: row.description,
        required: row.required,
      },
    }))
  },
  create: async (values) => {
    const row = await prisma.pimStepTemplate
      .create({
        data: {
          title: readText(values, 'title') ?? '',
          stage: (readText(values, 'stage') ?? AcademyStages.Preparation) as AcademyStageName,
          anchor: (readText(values, 'anchor') ?? StepAnchors.Day) as StepAnchorName,
          offset: readNumberValue(values, 'offset') ?? 0,
          owner: (readText(values, 'owner') ?? StepOwners.Responsable) as StepOwnerName,
          functionId: readText(values, 'functionId'),
          dispositifId: readText(values, 'dispositifId'),
          description: readText(values, 'description'),
          required: readFlag(values, 'required'),
          position: await nextPosition(prisma.pimStepTemplate),
        },
      })
      .catch(rethrow)

    return pimStepTemplates.list().then((rows) => rows.find((entry) => entry.id === row.id)!)
  },
  update: async (id, values) => {
    await prisma.pimStepTemplate
      .update({
        where: { id },
        data: {
          title: readText(values, 'title') ?? undefined,
          stage: (readText(values, 'stage') ?? undefined) as AcademyStageName | undefined,
          anchor: (readText(values, 'anchor') ?? undefined) as StepAnchorName | undefined,
          offset: readNumberValue(values, 'offset') ?? undefined,
          owner: (readText(values, 'owner') ?? undefined) as StepOwnerName | undefined,
          functionId: readText(values, 'functionId'),
          dispositifId: readText(values, 'dispositifId'),
          description: readText(values, 'description'),
          required: readFlag(values, 'required'),
        },
      })
      .catch(rethrow)

    return pimStepTemplates.list().then((rows) => rows.find((entry) => entry.id === id)!)
  },
  remove: async (id) => {
    await prisma.pimStepTemplate.delete({ where: { id } })
  },
  reorder: (ids) =>
    applyOrder(
      (id, position) => prisma.pimStepTemplate.update({ where: { id }, data: { position } }),
      ids
    ),
}

/**
 * Reference collections by key
 * @type {Record<ReferenceKey, ReferenceResource>}
 */

const RESOURCES: Record<ReferenceKey, ReferenceResource> = {
  youtubeurs: youtubers,
  divisions,
  fonctions: jobFunctions,
  plateformes: platforms,
  etats: workflowStates,
  priorites: priorities,
  evenements: eventTypes,
  formations: trainings,
  livecon: liveconLevels,
  dispositifs,
  'categories-competences': skillCategories,
  competences: skills,
  'etapes-pim': pimStepTemplates,
}

/**
 * Read the operations of a reference collection
 * @param {ReferenceKey} key - Collection key
 * @return {ReferenceResource} - Collection operations
 */

export const referenceResource = (key: ReferenceKey): ReferenceResource => {
  const resource = RESOURCES[key]
  if (!resource) throw notFound()

  return resource
}

/**
 * Read the identifiers submitted for a reorder
 * @param {FormValues} values - Parsed body
 * @return {string[]} - Identifiers in their new order
 */

export const readOrder = (values: FormValues): string[] => readList(values, 'ids')

/**
 * Read a date value of a reference form
 * @param {FormValues} values - Parsed body
 * @param {string} name - Field name
 * @return {Date | null} - Date or null
 */

export const readReferenceDate = (values: FormValues, name: string): Date | null =>
  readDate(values, name)
