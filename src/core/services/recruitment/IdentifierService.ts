import 'server-only'

import { readRequiredText, readText } from '@/core/lib/forms/values'
import { createIdentifier } from '@/core/services/discord/DiscordIdentifierService'
import { reachableSession } from '@/core/services/recruitment'
import { DISCORD_ID_COPY } from '@/declarations/discord/copy'
import { DISCORD_ID_KIND_REGISTRY } from '@/declarations/discord/registries'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { toOptions } from '@/core/lib/forms/options'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import type { DiscordIdentifierView } from '@/types/discord'
import type { FieldDefinition, FormValues } from '@/types/forms'
import { DiscordIdKinds } from '@/utils/constants/discord'

/**
 * Declarations of the form storing an identifier from an announcement
 * @return {FieldDefinition[]} - Fields
 */

export const identifierFields = (): FieldDefinition[] => [
  {
    name: 'name',
    kind: 'text',
    label: DISCORD_ID_COPY.name,
    required: true,
    maxLength: FORM_SETTINGS.shortTextMaxLength,
  },
  { name: 'discordId', kind: 'text', label: DISCORD_ID_COPY.discordId, required: true },
  {
    name: 'kind',
    kind: 'select',
    label: DISCORD_ID_COPY.kind,
    required: true,
    options: toOptions(DISCORD_ID_KIND_REGISTRY),
  },
]

/**
 * Store an identifier met in a session announcement
 * @param {string} sessionId - Session identifier
 * @param {FormValues} values - Parsed body
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<DiscordIdentifierView>} - Stored identifier
 */

export const addSessionIdentifier = async (
  sessionId: string,
  values: FormValues,
  scope: AccessScope
): Promise<DiscordIdentifierView> => {
  const session = await reachableSession(sessionId, scope)
  const requested = readText(values, 'kind') ?? ''
  const kind = DISCORD_ID_KIND_REGISTRY.has(requested) ? requested : DiscordIdKinds.Role

  return createIdentifier({
    discordId: readRequiredText(values, 'discordId'),
    kind,
    name: readRequiredText(values, 'name'),
    // A waiting role belongs to the creator of the session
    youtuberId: kind === DiscordIdKinds.RecruitmentRole ? session.youtuberId : null,
  })
}
