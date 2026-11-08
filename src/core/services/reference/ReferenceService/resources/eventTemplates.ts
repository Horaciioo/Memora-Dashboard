import 'server-only'
import { prisma } from '@/core/lib/db'
import { toOptions } from '@/core/lib/forms/options'
import { readFlag, readNumberValue, readText } from '@/core/lib/forms/values'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { EVENT_VISIBILITY_REGISTRY } from '@/declarations/reference/registries'
import { CALENDAR_KIND_REGISTRY } from '@/declarations/calendar/registries'
import { REFERENCE_FIELD_COPY } from '@/declarations/reference/copy'
import { CalendarKinds, EventVisibilities } from '@/utils/constants/workflow'
import type { CalendarKindName, EventVisibilityName } from '@/utils/constants'
import {
  accentField,
  applyOrder,
  longTextMaxLength,
  nameField,
  nextPosition,
  rethrow,
} from '@/core/services/reference/ReferenceService/resources/shared'
import type { ReferenceResource } from '@/core/services/reference/ReferenceService/resources/shared'

export const eventTemplates: ReferenceResource = {
  fields: async () => [
    nameField,
    {
      name: 'kind',
      kind: 'select',
      label: REFERENCE_FIELD_COPY.calendarKind,
      required: true,
      options: toOptions(CALENDAR_KIND_REGISTRY),
      mark: 'dot',
      span: 'half',
    },
    {
      name: 'visibility',
      kind: 'select',
      label: REFERENCE_FIELD_COPY.visibility,
      required: true,
      options: toOptions(EVENT_VISIBILITY_REGISTRY).filter(
        (option) =>
          option.value !== EventVisibilities.Team && option.value !== EventVisibilities.Youtuber
      ),
      mark: 'glyph',
      span: 'half',
    },
    accentField,
    {
      name: 'summary',
      kind: 'textarea',
      label: REFERENCE_FIELD_COPY.summary,
      maxLength: longTextMaxLength,
    },
    {
      name: 'body',
      kind: 'textarea',
      label: REFERENCE_FIELD_COPY.templateBody,
      hint: REFERENCE_FIELD_COPY.templateBodyHint,
      maxLength: longTextMaxLength,
    },
    {
      name: 'defaultMinutes',
      kind: 'number',
      label: REFERENCE_FIELD_COPY.defaultMinutes,
      min: FORM_SETTINGS.meetingMinDuration,
      max: FORM_SETTINGS.meetingMaxDuration,
      span: 'half',
      visibleWhen: { field: 'allDay', equals: false },
    },
    { name: 'allDay', kind: 'toggle', label: REFERENCE_FIELD_COPY.allDay },
    { name: 'archived', kind: 'toggle', label: REFERENCE_FIELD_COPY.archived },
  ],
  list: async () => {
    const rows = await prisma.eventTemplate.findMany({
      orderBy: [{ kind: 'asc' }, { position: 'asc' }],
      include: { _count: { select: { events: true } } },
    })

    return rows.map((row) => ({
      id: row.id,
      label: row.name,
      hint: row.summary,
      accent: row.accent,
      badges: [
        CALENDAR_KIND_REGISTRY.label(row.kind),
        EVENT_VISIBILITY_REGISTRY.label(row.visibility),
        ...(row.archived ? [REFERENCE_FIELD_COPY.archivedBadge] : []),
      ],
      position: row.position,
      usage: row._count.events,
      values: {
        name: row.name,
        kind: row.kind,
        visibility: row.visibility,
        accent: row.accent,
        summary: row.summary,
        body: row.body,
        defaultMinutes: row.defaultMinutes,
        allDay: row.allDay,
        archived: row.archived,
      },
    }))
  },
  create: async (values) => {
    const row = await prisma.eventTemplate
      .create({
        data: {
          name: readText(values, 'name') ?? '',
          kind: (readText(values, 'kind') ?? CalendarKinds.Event) as CalendarKindName,
          visibility: (readText(values, 'visibility') ??
            EventVisibilities.Everyone) as EventVisibilityName,
          accent: readText(values, 'accent'),
          summary: readText(values, 'summary'),
          body: readText(values, 'body'),
          defaultMinutes: readNumberValue(values, 'defaultMinutes'),
          allDay: readFlag(values, 'allDay'),
          archived: readFlag(values, 'archived'),
          position: await nextPosition(prisma.eventTemplate),
        },
      })
      .catch(rethrow)

    return eventTemplates.list().then((rows) => rows.find((entry) => entry.id === row.id)!)
  },
  update: async (id, values) => {
    await prisma.eventTemplate
      .update({
        where: { id },
        data: {
          name: readText(values, 'name') ?? undefined,
          kind: (readText(values, 'kind') ?? CalendarKinds.Event) as CalendarKindName,
          visibility: (readText(values, 'visibility') ??
            EventVisibilities.Everyone) as EventVisibilityName,
          accent: readText(values, 'accent'),
          summary: readText(values, 'summary'),
          body: readText(values, 'body'),
          defaultMinutes: readNumberValue(values, 'defaultMinutes'),
          allDay: readFlag(values, 'allDay'),
          archived: readFlag(values, 'archived'),
        },
      })
      .catch(rethrow)

    return eventTemplates.list().then((rows) => rows.find((entry) => entry.id === id)!)
  },
  remove: async (id) => {
    await prisma.eventTemplate.delete({ where: { id } })
  },
  reorder: (ids) =>
    applyOrder(
      (id, position) => prisma.eventTemplate.update({ where: { id }, data: { position } }),
      ids
    ),
}
