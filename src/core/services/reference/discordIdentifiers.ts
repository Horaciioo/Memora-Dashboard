import 'server-only'

import { prisma } from '@/core/lib/db'
import { rowsToOptions, toOptions } from '@/core/lib/forms/options'
import { readRequiredText, readText } from '@/core/lib/forms/values'
import {
  collectKnownIdentifiers,
  readSnowflake,
  rethrowDuplicate,
} from '@/core/services/discord/DiscordIdentifierService'
import { activeYoutubers } from '@/core/services/reference/lookups'
import type { ReferenceResource } from '@/core/services/reference/ReferenceService'
import { DISCORD_ID_COPY } from '@/declarations/discord/copy'
import { DISCORD_ID_KIND_REGISTRY } from '@/declarations/discord/registries'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { DiscordIdKinds } from '@/utils/constants/discord'
import type { DiscordIdKindName } from '@/utils/constants/discord'
import type { FormValues } from '@/types/forms'
import type { ReferenceRow } from '@/types/reference'
import type { DiscordIdentifier, Youtuber } from '@prisma/client'

/**
 * Map a row to the console list
 * @param {DiscordIdentifier & { youtuber: Youtuber | null }} row - Stored row
 * @return {ReferenceRow} - Console row
 */

const toRow = (row: DiscordIdentifier & { youtuber: Youtuber | null }): ReferenceRow => ({
  id: row.id,
  label: row.name,
  hint: row.discordId,
  accent: DISCORD_ID_KIND_REGISTRY.get(row.kind).accent,
  badges: [DISCORD_ID_KIND_REGISTRY.label(row.kind), ...(row.youtuber ? [row.youtuber.name] : [])],
  position: 0,
  usage: 0,
  values: {
    name: row.name,
    discordId: row.discordId,
    kind: row.kind,
    youtuberId: row.youtuberId,
  },
})

/**
 * Read the kind submitted
 * @param {FormValues} values - Parsed body
 * @return {DiscordIdKindName} - Kind, role by default
 */

const readKind = (values: FormValues): DiscordIdKindName => {
  const kind = readText(values, 'kind') ?? ''

  return DISCORD_ID_KIND_REGISTRY.has(kind) ? kind : DiscordIdKinds.Role
}

/**
 * Columns written by the form
 * @param {FormValues} values - Parsed body
 * @return {Object} - Row data
 */

const toData = (values: FormValues) => ({
  name: readRequiredText(values, 'name'),
  discordId: readSnowflake(readRequiredText(values, 'discordId')),
  kind: readKind(values),
  youtuberId: readText(values, 'youtuberId'),
})

const include = { youtuber: true } as const

export const discordIdentifiers: ReferenceResource = {
  fields: async () => [
    {
      name: 'name',
      kind: 'text',
      label: DISCORD_ID_COPY.name,
      required: true,
      maxLength: FORM_SETTINGS.shortTextMaxLength,
      span: 'half',
    },
    {
      name: 'kind',
      kind: 'select',
      label: DISCORD_ID_COPY.kind,
      required: true,
      options: toOptions(DISCORD_ID_KIND_REGISTRY),
      mark: 'dot',
      span: 'half',
    },
    {
      name: 'discordId',
      kind: 'text',
      label: DISCORD_ID_COPY.discordId,
      hint: DISCORD_ID_COPY.discordIdHint,
      required: true,
      maxLength: 20,
    },
    {
      name: 'youtuberId',
      kind: 'select',
      label: DISCORD_ID_COPY.creator,
      hint: DISCORD_ID_COPY.creatorHint,
      options: rowsToOptions(await activeYoutubers()),
    },
  ],
  list: async () => {
    await collectKnownIdentifiers()
    const rows = await prisma.discordIdentifier.findMany({ include, orderBy: { name: 'asc' } })

    // Members last, they are the many
    const isMember = (row: DiscordIdentifier) => row.kind === DiscordIdKinds.Member

    return [...rows.filter((row) => !isMember(row)), ...rows.filter(isMember)].map(toRow)
  },
  create: async (values) =>
    toRow(
      await prisma.discordIdentifier
        .create({ data: toData(values), include })
        .catch(rethrowDuplicate)
    ),
  update: async (id, values) =>
    toRow(
      await prisma.discordIdentifier
        .update({ where: { id }, data: toData(values), include })
        .catch(rethrowDuplicate)
    ),
  remove: async (id) => {
    await prisma.discordIdentifier.delete({ where: { id } })
  },
  reorder: async () => {},
}
