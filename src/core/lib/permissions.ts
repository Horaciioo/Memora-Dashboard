import { PermissionEffects } from '@/utils/constants/workflow'
import type { PermissionEffectName } from '@/utils/constants/workflow'
import { isPermissionName, prunePermissions } from '@/utils/constants/permissions'
import type { PermissionName } from '@/utils/constants/permissions'

/**
 * Where a permission stands on one holder
 * @type {'inherited' | 'allowed' | 'denied'}
 */

export type PermissionState = 'inherited' | 'allowed' | 'denied'

/**
 * Draft of every permission whose state differs from plain inheritance
 * @type {Partial<Record<PermissionName, PermissionState>>}
 */

export type PermissionDraft = Partial<Record<PermissionName, PermissionState>>

/**
 * One stored allow or deny
 * @typedef {Object} PermissionOverwrite
 * @property {PermissionName} permission - Permission key
 * @property {PermissionEffectName} effect - Allow or deny
 */

export interface PermissionOverwrite {
  permission: PermissionName
  effect: PermissionEffectName
}

/**
 * Overwrites of every holder sharing one resolution step
 * @type {PermissionOverwrite[][]}
 */

export type PermissionGroup = PermissionOverwrite[][]

/**
 * Fold one resolution step, every deny of the step landing before every allow so a
 * single allow outranks the denies it sits beside
 * @param {Set<PermissionName>} granted - Permissions held so far
 * @param {PermissionGroup} group - Overwrites sharing the step
 * @return {void} - Folded in place
 */

const foldGroup = (granted: Set<PermissionName>, group: PermissionGroup): void => {
  const holders = group.flat()

  // Denies first, so an allow beside them still wins the step
  for (const entry of holders) {
    if (entry.effect === PermissionEffects.Deny) granted.delete(entry.permission)
  }

  for (const entry of holders) {
    if (entry.effect === PermissionEffects.Allow) granted.add(entry.permission)
  }
}

/**
 * Resolve what a member effectively holds, following the order every layer of the product
 * shares — union of the base grants, then one step per overwrite scope, widest last
 * @param {Iterable<PermissionName>} base - Union of the role and function grants
 * @param {PermissionGroup[]} steps - Overwrite steps, applied in order
 * @return {PermissionName[]} - Effective permissions, orphan refinements dropped
 */

export const resolveGrants = (
  base: Iterable<PermissionName>,
  steps: PermissionGroup[]
): PermissionName[] => {
  const granted = new Set(base)

  for (const step of steps) foldGroup(granted, step)

  // A refinement never survives without the page permission it refines
  return prunePermissions(granted)
}

/**
 * Overwrite layers of one holder, the empty key carrying the global layer and every other
 * key the creator its overwrites are narrowed to
 * @type {Record<string, PermissionOverwrite[]>}
 */

export type PermissionLayers = Record<string, PermissionOverwrite[]>

/**
 * Key one layer is stored under, the global layer carrying the empty key
 * @param {string | null} youtuberId - Creator identifier
 * @return {string} - Layer key
 */

export const layerKey = (youtuberId: string | null): string => youtuberId ?? ''

/**
 * Read the state of one permission inside a draft
 * @param {PermissionDraft} draft - Current draft
 * @param {PermissionName} permission - Permission key
 * @return {PermissionState} - Resolved state
 */

export const stateOf = (draft: PermissionDraft, permission: PermissionName): PermissionState =>
  draft[permission] ?? 'inherited'

/**
 * Turn stored overwrites into a picker draft
 * @param {PermissionOverwrite[]} overwrites - Stored overwrites
 * @return {PermissionDraft} - Draft
 */

export const toDraft = (overwrites: PermissionOverwrite[]): PermissionDraft =>
  Object.fromEntries(
    overwrites
      .filter((entry) => isPermissionName(entry.permission))
      .map((entry) => [
        entry.permission,
        entry.effect === PermissionEffects.Allow ? 'allowed' : 'denied',
      ])
  )

/**
 * Read the overwrites back out of a draft, inheritance leaving no row behind
 * @param {PermissionDraft} draft - Current draft
 * @return {PermissionOverwrite[]} - Overwrites to persist
 */

export const fromDraft = (draft: PermissionDraft): PermissionOverwrite[] =>
  (Object.keys(draft) as PermissionName[])
    .filter((permission) => isPermissionName(permission) && draft[permission] !== 'inherited')
    .map((permission) => ({
      permission,
      effect: draft[permission] === 'allowed' ? PermissionEffects.Allow : PermissionEffects.Deny,
    }))

/**
 * Count the entries of a draft that differ from what the baseline already resolves to
 * @param {PermissionDraft} draft - Current draft
 * @param {PermissionDraft} saved - Draft as last stored
 * @return {number} - Change count
 */

export const countChanges = (draft: PermissionDraft, saved: PermissionDraft): number => {
  const keys = new Set([...Object.keys(draft), ...Object.keys(saved)]) as Set<PermissionName>

  return [...keys].filter((permission) => stateOf(draft, permission) !== stateOf(saved, permission))
    .length
}
