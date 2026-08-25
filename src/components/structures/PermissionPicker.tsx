'use client'

import { useMemo, useState } from 'react'
import { Badge } from '@/components/elements/display/Badge'
import { Button } from '@/components/elements/actions/Button'
import { Checkbox } from '@/components/elements/forms/Toggle'
import { Input } from '@/components/elements/forms/Input'
import { SegmentedControl } from '@/components/elements/actions/SegmentedControl'
import { ACCESS_COPY } from '@/declarations/access/copy'
import { PERMISSION_SECTIONS } from '@/declarations/access/permissions'
import { ICONS } from '@/declarations/ui/icons'
import { PERMISSION_PICKER_STYLES } from '@/declarations/ui/variants'
import type { PermissionMeta, PermissionName } from '@/utils/constants/permissions'
import { cn } from '@/utils/classnames'

export type PermissionState = 'inherited' | 'allowed' | 'denied'

/**
 * Draft of every permission whose state differs from plain inheritance
 * @type {Partial<Record<PermissionName, PermissionState>>}
 */

export type PermissionDraft = Partial<Record<PermissionName, PermissionState>>

export interface PermissionPickerProps {
  mode: 'binary' | 'tristate'
  value: PermissionDraft
  onChange: (next: PermissionDraft) => void
  baseline?: PermissionName[]
  pending?: number
  readOnly?: boolean
}

/**
 * Read the state of one permission inside a draft
 * @param {PermissionDraft} draft - Current draft
 * @param {PermissionName} permission - Permission key
 * @return {PermissionState} - Resolved state
 */

const stateOf = (draft: PermissionDraft, permission: PermissionName): PermissionState =>
  draft[permission] ?? 'inherited'

/**
 * Match a permission against the search term
 * @param {PermissionMeta} permission - Permission metadata
 * @param {string} term - Lowercased search term
 * @return {boolean} - Permission is kept
 */

const matches = (permission: PermissionMeta, term: string): boolean =>
  term.length === 0 ||
  permission.displayName.toLowerCase().includes(term) ||
  permission.description.toLowerCase().includes(term)

/**
 * Permission catalogue shared by the access matrix and the per-account overrides — searchable,
 * grouped, and honest about what the role and the functions already grant
 * @param {'binary' | 'tristate'} mode - Binary for role and function grants, tristate for overrides
 * @param {PermissionDraft} value - Current draft
 * @param {(next: PermissionDraft) => void} onChange - Draft handler
 * @param {PermissionName[]} [baseline] - Permissions inheritance already grants
 * @param {number} [pending] - Count of unsaved changes
 * @param {boolean} [readOnly] - Blocks every control
 * @return {JSX.Element}
 */

export const PermissionPicker = ({
  mode,
  value,
  onChange,
  baseline,
  pending,
  readOnly,
}: PermissionPickerProps) => {
  const [term, setTerm] = useState('')
  const [collapsed, setCollapsed] = useState<string[]>([])

  const Chevron = ICONS.next
  const inherited = useMemo(() => new Set(baseline ?? []), [baseline])

  // Search-filtered sections, empty ones dropped
  const sections = useMemo(() => {
    const needle = term.trim().toLowerCase()

    return PERMISSION_SECTIONS.map((section) => ({
      ...section,
      permissions: section.permissions.filter((permission) => matches(permission, needle)),
    })).filter((section) => section.permissions.length > 0)
  }, [term])

  const total = PERMISSION_SECTIONS.reduce((count, section) => count + section.permissions.length, 0)
  const granted = PERMISSION_SECTIONS.reduce(
    (count, section) =>
      count + section.permissions.filter((entry) => stateOf(value, entry.name) === 'allowed').length,
    0
  )

  const apply = (permission: PermissionName, state: PermissionState) => {
    const next = { ...value }
    if (state === 'inherited') delete next[permission]
    else next[permission] = state

    onChange(next)
  }

  // Grants or clears every permission of one group at once
  const applyGroup = (permissions: PermissionMeta[], state: PermissionState) => {
    const next = { ...value }
    permissions.forEach((permission) => {
      if (state === 'inherited') delete next[permission.name]
      else next[permission.name] = state
    })

    onChange(next)
  }

  const options = [
    { value: 'inherited' as const, label: ACCESS_COPY.stateInherited },
    { value: 'allowed' as const, label: ACCESS_COPY.stateAllowed },
    { value: 'denied' as const, label: ACCESS_COPY.stateDenied },
  ]

  return (
    <div className={PERMISSION_PICKER_STYLES.wrapper}>
      <div className={PERMISSION_PICKER_STYLES.header}>
        <Input
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder={ACCESS_COPY.search}
          aria-label={ACCESS_COPY.search}
          className={PERMISSION_PICKER_STYLES.search}
        />
        <span className={PERMISSION_PICKER_STYLES.tally}>
          {`${granted} / ${total} ${granted === 1 ? ACCESS_COPY.grantedOne : ACCESS_COPY.granted}`}
        </span>
        {pending !== undefined && pending > 0 && (
          <span className={PERMISSION_PICKER_STYLES.dirty}>
            {`${pending} ${pending === 1 ? ACCESS_COPY.pending : ACCESS_COPY.pendingMany}`}
          </span>
        )}
      </div>

      {sections.length === 0 ? (
        <p className={PERMISSION_PICKER_STYLES.empty}>{ACCESS_COPY.noMatch}</p>
      ) : (
        <div className={PERMISSION_PICKER_STYLES.groups}>
          {sections.map((section) => {
            const isOpen = !collapsed.includes(section.group)
            const count = section.permissions.filter(
              (entry) => stateOf(value, entry.name) === 'allowed'
            ).length

            return (
              <section key={section.group} className={PERMISSION_PICKER_STYLES.group}>
                <div className={PERMISSION_PICKER_STYLES.groupHead}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() =>
                      setCollapsed((current) =>
                        current.includes(section.group)
                          ? current.filter((key) => key !== section.group)
                          : [...current, section.group]
                      )
                    }
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <Chevron
                      className={cn(
                        PERMISSION_PICKER_STYLES.groupChevron,
                        isOpen && PERMISSION_PICKER_STYLES.groupChevronOpen
                      )}
                      aria-hidden="true"
                    />
                    <span className={PERMISSION_PICKER_STYLES.groupLabel}>{section.label}</span>
                    <span className={PERMISSION_PICKER_STYLES.groupTally}>
                      {`${count}/${section.permissions.length}`}
                    </span>
                  </button>
                  {!readOnly && (
                    <span className={PERMISSION_PICKER_STYLES.groupActions}>
                      <Button
                        variant="ghost"
                        onClick={() => applyGroup(section.permissions, 'allowed')}
                      >
                        {ACCESS_COPY.grantAll}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() =>
                          applyGroup(
                            section.permissions,
                            mode === 'binary' ? 'inherited' : 'denied'
                          )
                        }
                      >
                        {ACCESS_COPY.grantNone}
                      </Button>
                    </span>
                  )}
                </div>

                {isOpen && (
                  <div className={PERMISSION_PICKER_STYLES.body}>
                    {section.permissions.map((permission) => {
                      const state = stateOf(value, permission.name)

                      if (mode === 'binary') {
                        return (
                          <Checkbox
                            key={permission.name}
                            checked={state === 'allowed'}
                            disabled={readOnly}
                            onChange={(checked) =>
                              apply(permission.name, checked ? 'allowed' : 'inherited')
                            }
                            label={permission.displayName}
                            hint={permission.description}
                          />
                        )
                      }

                      return (
                        <div key={permission.name} className={PERMISSION_PICKER_STYLES.row}>
                          <span className={PERMISSION_PICKER_STYLES.identity}>
                            <span className={PERMISSION_PICKER_STYLES.name}>
                              {permission.displayName}
                              {permission.important && (
                                <Badge label={ACCESS_COPY.sensitive} tone="warning" />
                              )}
                            </span>
                            <span className={PERMISSION_PICKER_STYLES.description}>
                              {inherited.has(permission.name)
                                ? ACCESS_COPY.inheritedYes
                                : ACCESS_COPY.inheritedNo}
                            </span>
                          </span>
                          <span className={PERMISSION_PICKER_STYLES.control}>
                            <SegmentedControl
                              options={options}
                              value={state}
                              onChange={(next) => !readOnly && apply(permission.name, next)}
                              label={permission.displayName}
                            />
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
