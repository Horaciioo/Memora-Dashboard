import 'server-only'
import { prisma } from '@/core/lib/db'
import { activeFunctions, activeYoutubers, allDivisions } from '@/core/services/reference/lookups'
import { ACCESS_CATEGORY_REGISTRY } from '@/declarations/access/categories'
import { rowsToOptions, toOptions } from '@/core/lib/forms/options'
import { temporaryFields } from '@/core/services/members/seats'
import { MEMBER_STATUS_REGISTRY, ROLE_REGISTRY } from '@/declarations/access/roles'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { FORM_GROUPS } from '@/declarations/ui/copy'
import { MEMBER_FIELD_COPY, MEMBER_FIELD_INFO } from '@/declarations/members/copy'
import { LANGUAGE_OPTIONS, timezoneOptions } from '@/declarations/system/locales'
import type { FieldDefinition } from '@/types/forms'
import { MemberStatuses } from '@/utils/constants/hierarchy'
import type { MemberRoleName } from '@/utils/constants/hierarchy'
import { FunctionKinds } from '@/utils/constants/workflow'
import type { FunctionKindName } from '@/utils/constants/workflow'
import {
  BELOW_LEAD_ROLES,
  LEGACY_FUNCTION_NAMES,
} from '@/core/services/members/MemberService/rules'

/**
 * Build the moderator form declarations
 * @param {boolean} [isAdmin] - Viewer sits at admin level
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const memberFields = async (isAdmin = false): Promise<FieldDefinition[]> => {
  const [divisions, youtubers, functions, opened] = await Promise.all([
    allDivisions(),
    activeYoutubers(),
    activeFunctions(),
    prisma.youtuberFunction.findMany({ select: { youtuberId: true, functionId: true } }),
  ])

  // Creators each function is open for, a moderator only offers those of their creators
  const creatorsOf = new Map<string, string[]>()
  for (const seat of opened) {
    creatorsOf.set(seat.functionId, [...(creatorsOf.get(seat.functionId) ?? []), seat.youtuberId])
  }

  // Each kind only offers its own functions
  const optionsOf = (kind: FunctionKindName) =>
    functions
      .filter(
        (entry) => entry.kind === kind && (isAdmin || !LEGACY_FUNCTION_NAMES.includes(entry.name))
      )
      .sort(
        (left, right) =>
          ACCESS_CATEGORY_REGISTRY.get(left.category).position -
          ACCESS_CATEGORY_REGISTRY.get(right.category).position
      )
      .flatMap((entry) =>
        rowsToOptions([entry]).map((option) => ({
          ...option,
          // Secondary functions share one category, no heading
          group:
            kind === FunctionKinds.Secondary
              ? undefined
              : ACCESS_CATEGORY_REGISTRY.get(entry.category).label,
          owners: creatorsOf.get(entry.id) ?? [],
        }))
      )

  // A restricted division still shows
  const divisionOptions = rowsToOptions(divisions).map((option, index) => ({
    ...option,
    disabled: !isAdmin && !divisions[index].leadAssignable,
  }))

  const base: FieldDefinition[] = [
    {
      name: 'displayName',
      kind: 'text',
      label: MEMBER_FIELD_COPY.displayName,
      info: MEMBER_FIELD_INFO.displayName,
      required: true,
      maxLength: FORM_SETTINGS.shortTextMaxLength,
      span: 'half',
      group: FORM_GROUPS.identity,
    },
    {
      name: 'discordId',
      kind: 'discord',
      label: MEMBER_FIELD_COPY.discordId,
      info: MEMBER_FIELD_INFO.discordId,
      required: true,
      span: 'half',
      group: FORM_GROUPS.identity,
    },
    {
      name: 'birthday',
      kind: 'date',
      dayOnly: true,
      startYear: FORM_SETTINGS.birthdayStartYear,
      label: MEMBER_FIELD_COPY.birthday,
      info: MEMBER_FIELD_INFO.birthday,
      span: 'half',
      group: FORM_GROUPS.identity,
    },
    {
      name: 'celebrateBirthday',
      kind: 'toggle',
      label: MEMBER_FIELD_COPY.celebrateBirthday,
      span: 'half',
      group: FORM_GROUPS.identity,
      binary: true,
    },
    {
      name: 'role',
      kind: 'select',
      label: MEMBER_FIELD_COPY.role,
      info: MEMBER_FIELD_INFO.role,
      required: true,
      options: toOptions(ROLE_REGISTRY).filter(
        (option) => isAdmin || BELOW_LEAD_ROLES.includes(option.value as MemberRoleName)
      ),
      mark: 'role',
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'status',
      kind: 'select',
      label: MEMBER_FIELD_COPY.status,
      info: MEMBER_FIELD_INFO.status,
      required: true,
      options: toOptions(MEMBER_STATUS_REGISTRY),
      mark: 'dot',
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'divisionId',
      kind: 'select',
      label: MEMBER_FIELD_COPY.division,
      info: MEMBER_FIELD_INFO.division,
      options: divisionOptions,
      mark: 'division',
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'youtuberIds',
      kind: 'multiselect',
      label: MEMBER_FIELD_COPY.youtuber,
      info: MEMBER_FIELD_INFO.youtuber,
      options: rowsToOptions(youtubers),
      mark: 'avatar',
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'primaryFunctionIds',
      kind: 'multiselect',
      label: MEMBER_FIELD_COPY.primaryFunctions,
      info: MEMBER_FIELD_INFO.primaryFunctions,
      options: optionsOf(FunctionKinds.Primary),
      ownerField: 'youtuberIds',
      mark: 'glyph',
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'secondaryFunctionIds',
      kind: 'multiselect',
      label: MEMBER_FIELD_COPY.secondaryFunctions,
      info: MEMBER_FIELD_INFO.secondaryFunctions,
      options: optionsOf(FunctionKinds.Secondary),
      ownerField: 'youtuberIds',
      mark: 'glyph',
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'timezone',
      kind: 'select',
      label: MEMBER_FIELD_COPY.timezone,
      info: MEMBER_FIELD_INFO.timezone,
      options: timezoneOptions(),
      span: 'half',
      group: FORM_GROUPS.contact,
    },
    {
      name: 'languages',
      kind: 'multiselect',
      label: MEMBER_FIELD_COPY.languages,
      info: MEMBER_FIELD_INFO.languages,
      options: LANGUAGE_OPTIONS,
      mark: 'flag',
      maxItems: FORM_SETTINGS.tagMaxCount,
      group: FORM_GROUPS.contact,
    },
    {
      name: 'joinedAt',
      kind: 'date',
      label: MEMBER_FIELD_COPY.joinedAt,
      info: MEMBER_FIELD_INFO.joinedAt,
      preset: 'today',
      span: 'half',
      group: FORM_GROUPS.planning,
    },
    {
      name: 'leftAt',
      kind: 'date',
      label: MEMBER_FIELD_COPY.leftAt,
      info: MEMBER_FIELD_INFO.leftAt,
      visibleWhen: { field: 'status', equals: MemberStatuses.Left },
      span: 'half',
      group: FORM_GROUPS.planning,
    },
  ]

  // A temporary function asks for the session it lasts through
  const functionIds = new Map(functions.map((entry) => [entry.name, entry.id]))
  const temporary = await temporaryFields(functionIds)
  const at = base.findIndex((field) => field.name === 'secondaryFunctionIds') + 1

  return [...base.slice(0, at), ...temporary, ...base.slice(at)]
}
