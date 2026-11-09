import 'server-only'
import { prisma } from '@/core/lib/db'
import { invalidInput } from '@/core/lib/errors'
import { readList, readText } from '@/core/lib/forms/values'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { LIVE_FIELD_COPY } from '@/declarations/lives/copy'
import { LIVE_PLATFORMS_SOON } from '@/declarations/lives/registries'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import type { FieldDefinition, FormValues } from '@/types/forms'
import { LivePlatforms } from '@/utils/constants/lives'
import type { LivePlatformName } from '@/utils/constants/lives'
import {
  assertCoordinators,
  coordinatorOptions,
  coordinatorPicks,
} from '@/core/services/lives/LiveService/coordinators'

/**
 * Calendar templates a live is filed under, one per platform
 * @return {Promise<Map<string, LivePlatformName>>} - Platform of each live template
 */

export const readLiveTemplates = async (): Promise<Map<string, LivePlatformName>> => {
  const rows = await prisma.eventTemplate.findMany({
    where: { platform: { not: null }, archived: false },
    select: { id: true, platform: true },
  })

  return new Map(rows.map((row) => [row.id, row.platform as LivePlatformName]))
}

/**
 * Template the Live button of "Live en cours" opens the form on
 * @return {Promise<string | null>} - First live template
 */

export const readLiveTemplateId = async (): Promise<string | null> =>
  [...(await readLiveTemplates())].find(
    ([, platform]) => !LIVE_PLATFORMS_SOON.includes(platform)
  )?.[0] ?? null

/**
 * Hand a live entry the platform of its template
 * @param {FormValues} values - Parsed body
 * @param {Map<string, LivePlatformName>} templates - Live templates
 * @return {FormValues} - Values holding the platform
 */

export const withTemplatePlatform = (
  values: FormValues,
  templates: Map<string, LivePlatformName>
): FormValues => {
  const platform = templates.get(readText(values, 'templateId') ?? '')

  return platform ? { ...values, platform } : values
}

/**
 * Live fields the calendar form shows once the Live template is picked
 * @param {AccessScope} [scope] - Creator perimeter
 * @param {string[]} templateIds - Live templates
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const liveFormFields = async (
  scope: AccessScope | undefined,
  templateIds: string[]
): Promise<FieldDefinition[]> => {
  const coordinators = await coordinatorOptions(scope)
  const visibleWhen = { field: 'templateId', oneOf: templateIds }

  return [
    {
      name: 'coordinatorIds',
      kind: 'multiselect',
      label: LIVE_FIELD_COPY.coordinator,
      options: coordinators,
      ownerField: 'youtuberId',
      // Two holders of the Coordinator function who coordinated the least recently, nobody absent
      defaultPicks: await coordinatorPicks(coordinators),
      mark: 'avatar',
      visibleWhen,
    },
    {
      name: 'instructions',
      kind: 'markdown',
      label: LIVE_FIELD_COPY.instructions,
      hint: LIVE_FIELD_COPY.instructionsHint,
      maxLength: FORM_SETTINGS.markdownMaxLength,
      visibleWhen,
    },
  ]
}

/**
 * Read the platform picked on the form
 * @param {FormValues} values - Parsed body
 * @return {LivePlatformName} - Platform
 */

const readPlatform = (values: FormValues): LivePlatformName => {
  const raw = readText(values, 'platform')
  if (raw === LivePlatforms.Twitch || raw === LivePlatforms.YouTube) {
    if (LIVE_PLATFORMS_SOON.includes(raw)) {
      throw invalidInput([{ field: 'templateId', message: LIVE_FIELD_COPY.platformSoon }])
    }

    return raw
  }

  throw invalidInput([{ field: 'platform', message: FORM_COPY.required }])
}

/**
 * What the Live template adds to a calendar entry
 * @typedef {Object} LiveInput
 * @property {string} youtuberId - Creator
 * @property {LivePlatformName} platform - Platform
 * @property {string[]} coordinatorIds - Members asked to coordinate
 * @property {string[]} pickedIds - Members convened on top of the live team
 * @property {string | null} instructions - Notes for the team
 */

export interface LiveInput {
  youtuberId: string
  platform: LivePlatformName
  coordinatorIds: string[]
  pickedIds: string[]
  instructions: string | null
}

/**
 * Read and check what the Live template needs, before anything is written
 * @param {FormValues} values - Parsed body
 * @return {Promise<LiveInput>} - Live fields
 */

export const readLiveInput = async (values: FormValues): Promise<LiveInput> => {
  const youtuberId = readText(values, 'youtuberId')
  if (!youtuberId) {
    throw invalidInput([{ field: 'youtuberId', message: FORM_COPY.required }])
  }

  const platform = readPlatform(values)
  const coordinatorIds = readList(values, 'coordinatorIds')
  await assertCoordinators(youtuberId, coordinatorIds)

  return {
    youtuberId,
    platform,
    coordinatorIds,
    // The creator's live team is convened, nobody else is named
    pickedIds: [],
    instructions: readText(values, 'instructions'),
  }
}
