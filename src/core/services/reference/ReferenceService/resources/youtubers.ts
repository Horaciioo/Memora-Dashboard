import 'server-only'
import { prisma } from '@/core/lib/db'
import { openEveryFunction } from '@/core/services/teams/FunctionTeamService'
import { encadrementAccounts } from '@/core/services/reference/lookups'
import { replaceAnchors } from '@/core/services/auth/LeadService'
import { roleGroupedOptions } from '@/core/lib/forms/options'
import { readFlag, readList, readText } from '@/core/lib/forms/values'
import { FORM_GROUPS } from '@/declarations/ui/copy/forms'
import { REFERENCE_FIELD_COPY } from '@/declarations/reference/copy'
import { instantiatePanel } from '@/core/services/sanctions/SanctionService'
import { SANCTION_PANEL_REGISTRY } from '@/declarations/sanctions/registries'
import {
  accentField,
  applyOrder,
  nameField,
  nextPosition,
  rethrow,
  shortTextMaxLength,
} from '@/core/services/reference/ReferenceService/resources/shared'
import type { ReferenceResource } from '@/core/services/reference/ReferenceService/resources/shared'

export const youtubers: ReferenceResource = {
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
    {
      name: 'avatarUrl',
      kind: 'image',
      label: REFERENCE_FIELD_COPY.youtuberAvatar,
      bucket: 'avatars',
    },
    { name: 'logoUrl', kind: 'image', label: REFERENCE_FIELD_COPY.logoUrl, bucket: 'logos' },
    { name: 'archived', kind: 'toggle', label: REFERENCE_FIELD_COPY.archived },
    {
      name: 'leadIds',
      kind: 'multiselect',
      label: REFERENCE_FIELD_COPY.leads,
      hint: REFERENCE_FIELD_COPY.leadsHint,
      group: FORM_GROUPS.encadrement,
      mark: 'avatar',
      adminOnly: true,
      options: roleGroupedOptions(await encadrementAccounts()),
    },
  ],
  list: async () => {
    const rows = await prisma.youtuber.findMany({
      orderBy: { position: 'asc' },
      include: {
        leads: { select: { accountId: true } },
        functions: { select: { functionId: true }, orderBy: { position: 'asc' } },
        _count: { select: { accounts: true, projects: true } },
      },
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
        logoUrl: row.logoUrl,
        archived: row.archived,
        leadIds: row.leads.map((lead) => lead.accountId),
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
          logoUrl: readText(values, 'logoUrl'),
          archived: readFlag(values, 'archived'),
          position: await nextPosition(prisma.youtuber),
        },
      })
      .catch(rethrow)

    // A creator starts with the declared sanction panel
    for (const panel of SANCTION_PANEL_REGISTRY.keys) {
      if (SANCTION_PANEL_REGISTRY.get(panel).written) await instantiatePanel(row.id, panel)
    }
    // Every function starts open
    await openEveryFunction(row.id)
    await replaceAnchors(row.id, readList(values, 'leadIds'))

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
          logoUrl: readText(values, 'logoUrl'),
          archived: readFlag(values, 'archived'),
        },
      })
      .catch(rethrow)

    // Anchors travel with the row
    if ('leadIds' in values) await replaceAnchors(id, readList(values, 'leadIds'))

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
