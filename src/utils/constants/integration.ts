/**
 * What an integration link opens once its form is submitted
 * @type {Record<string, string>}
 */

export const IntegrationLinkKinds = {
  Account: 'ACCOUNT',
  Profile: 'PROFILE',
  Academy: 'ACADEMY',
} as const

export type IntegrationLinkKindName =
  (typeof IntegrationLinkKinds)[keyof typeof IntegrationLinkKinds]

/**
 * Kind of personal constraint a member volunteers
 * @type {Record<string, string>}
 */

export const ConstraintKinds = {
  Medical: 'MEDICAL',
  Illness: 'ILLNESS',
  Private: 'PRIVATE',
} as const

export type ConstraintKindName = (typeof ConstraintKinds)[keyof typeof ConstraintKinds]
