import 'server-only'
import { prisma } from '@/core/lib/db'
import { toOptions } from '@/core/lib/forms/options'
import {
  COLOR_VISION_REGISTRY,
  FONT_SCALE_REGISTRY,
  THEME_REGISTRY,
} from '@/declarations/access/preferences'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { ONBOARDING_FIELD_COPY, ONBOARDING_STEP_COPY } from '@/declarations/onboarding/copy'
import { INTEGRATION_LINK_KIND_REGISTRY } from '@/declarations/onboarding/registries'
import { ACADEMY_FIELD_COPY } from '@/declarations/academy/copy'
import { HISTORY_CONSENT } from '@/declarations/system/security/privacy'
import { LANGUAGE_OPTIONS } from '@/declarations/system/locales'
import type { FieldDefinition } from '@/types/forms'
import type { LiveInvite } from '@/types/onboarding'
import { ConstraintKinds } from '@/utils/constants/integration'
import type { ConstraintKindName } from '@/utils/constants/integration'

/**
 * Constraint field per stored kind
 * @type {Record<ConstraintKindName, { name: string, label: string, hint?: string }>}
 */

export const CONSTRAINT_FIELDS: Record<
  ConstraintKindName,
  { name: string; label: string; hint?: string }
> = {
  [ConstraintKinds.Medical]: {
    name: 'medical',
    label: ONBOARDING_FIELD_COPY.medical,
    hint: ONBOARDING_FIELD_COPY.medicalHint,
  },
  [ConstraintKinds.Illness]: { name: 'illness', label: ONBOARDING_FIELD_COPY.illness },
  [ConstraintKinds.Private]: {
    name: 'private',
    label: ONBOARDING_FIELD_COPY.private,
    hint: ONBOARDING_FIELD_COPY.privateHint,
  },
}

/**
 * Build the social fields from the declared networks
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

const socialFields = async (): Promise<FieldDefinition[]> => {
  const networks = await prisma.socialNetwork.findMany({
    where: { archived: false },
    orderBy: { position: 'asc' },
  })

  return networks.map((network) => ({
    name: `social:${network.id}`,
    kind: 'text',
    label: network.name,
    prefix: network.urlPrefix,
    lookup: network.id,
    required: network.required,
    maxLength: FORM_SETTINGS.shortTextMaxLength,
    group: ONBOARDING_STEP_COPY.socials,
  }))
}

/**
 * Build the public integration form declarations
 * @param {LiveInvite} invite - Live link the form answers to
 * @param {boolean} [admitted] - Identity admitted to the promotion
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const integrationFields = async (
  invite: LiveInvite,
  admitted = false
): Promise<FieldDefinition[]> => {
  const mode = INTEGRATION_LINK_KIND_REGISTRY.get(invite.kind)

  const fields: FieldDefinition[] = [
    {
      name: 'displayName',
      kind: 'text',
      label: ONBOARDING_FIELD_COPY.displayName,
      hint: ONBOARDING_FIELD_COPY.displayNameHint,
      required: true,
      maxLength: FORM_SETTINGS.titleMaxLength,
      group: ONBOARDING_STEP_COPY.informations,
    },
    {
      name: 'birthday',
      kind: 'date',
      startYear: FORM_SETTINGS.birthdayStartYear,
      label: ONBOARDING_FIELD_COPY.birthday,
      required: true,
      span: 'half',
      group: ONBOARDING_STEP_COPY.informations,
    },
    {
      name: 'celebrateBirthday',
      kind: 'toggle',
      label: ONBOARDING_FIELD_COPY.celebrateBirthday,
      span: 'half',
      group: ONBOARDING_STEP_COPY.informations,
    },
    {
      name: 'languages',
      kind: 'multiselect',
      label: ONBOARDING_FIELD_COPY.languages,
      options: LANGUAGE_OPTIONS,
      mark: 'flag',
      maxItems: FORM_SETTINGS.tagMaxCount,
      group: ONBOARDING_STEP_COPY.informations,
    },
    ...(await socialFields()),
  ]

  // The three sensitive questions
  for (const kind of Object.keys(CONSTRAINT_FIELDS) as ConstraintKindName[]) {
    const declared = CONSTRAINT_FIELDS[kind]

    fields.push({
      name: declared.name,
      kind: 'textarea',
      label: declared.label,
      hint: declared.hint,
      maxLength: FORM_SETTINGS.longTextMaxLength,
      group: ONBOARDING_STEP_COPY.constraints,
    })
  }

  fields.push(
    {
      name: 'theme',
      kind: 'select',
      label: ONBOARDING_FIELD_COPY.theme,
      options: toOptions(THEME_REGISTRY),
      span: 'half',
      group: ONBOARDING_STEP_COPY.preferences,
    },
    {
      name: 'fontScale',
      kind: 'select',
      label: ONBOARDING_FIELD_COPY.fontScale,
      options: toOptions(FONT_SCALE_REGISTRY),
      span: 'half',
      group: ONBOARDING_STEP_COPY.preferences,
    },
    {
      name: 'hasColorVision',
      kind: 'toggle',
      label: ONBOARDING_FIELD_COPY.hasColorVision,
      group: ONBOARDING_STEP_COPY.preferences,
    },
    {
      name: 'colorVision',
      kind: 'select',
      label: ONBOARDING_FIELD_COPY.colorVision,
      options: toOptions(COLOR_VISION_REGISTRY),
      visibleWhen: { field: 'hasColorVision', truthy: true },
      group: ONBOARDING_STEP_COPY.preferences,
    }
  )

  // A dispositif is never imposed by the link
  if (mode.enrolsAcademy || admitted) {
    const dispositifs = await prisma.dispositif.findMany({ orderBy: { position: 'asc' } })

    fields.push({
      name: 'dispositifId',
      kind: 'select',
      label: ACADEMY_FIELD_COPY.dispositif,
      required: true,
      options: dispositifs.map((row) => ({ value: row.id, label: row.name })),
      group: ONBOARDING_STEP_COPY.confirmation,
    })
  }

  fields.push({
    name: 'historyConsent',
    kind: 'toggle',
    label: ONBOARDING_FIELD_COPY.consent,
    hint: HISTORY_CONSENT.label,
    required: true,
    group: ONBOARDING_STEP_COPY.confirmation,
  })

  return fields
}
