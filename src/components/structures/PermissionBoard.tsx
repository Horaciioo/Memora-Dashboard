'use client'

import { Fragment, useMemo, useState } from 'react'

import { Badge } from '@/components/elements/display/Badge'
import { Button } from '@/components/elements/actions/Button'
import { Input } from '@/components/elements/forms/Input'
import { TriToggle } from '@/components/elements/forms/Toggle'
import { stateOf } from '@/core/lib/permissions'
import { ACCESS_COPY } from '@/declarations/access/copy'
import { PERMISSION_SECTIONS } from '@/declarations/access/permissions'
import type { PermissionRoot } from '@/declarations/access/permissions'
import { PERMISSION_TOGGLE_STYLES } from '@/declarations/ui/variants'
import type { PermissionDraft, PermissionState } from '@/core/lib/permissions'
import type { PermissionMeta, PermissionName } from '@/utils/constants/permissions'
import { cn } from '@/utils/classnames'

export interface PermissionBoardProps {
  value: PermissionDraft
  onChange: (next: PermissionDraft) => void
  baseline: PermissionName[]
  pending?: number
  readOnly?: boolean
}

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
 * The one permission board of the product — a page per section, its permission, then the
 * refinements it opens, each set from the same three-state switch. Green allows outright,
 * grey falls back on what the layer underneath already grants, red takes it away even there
 * @param {PermissionDraft} value - Current draft
 * @param {(next: PermissionDraft) => void} onChange - Draft handler
 * @param {PermissionName[]} baseline - Permissions the layer underneath already grants
 * @param {number} [pending] - Count of unsaved changes
 * @param {boolean} [readOnly] - Blocks every switch
 * @return {JSX.Element}
 */

export const PermissionBoard = ({
  value,
  onChange,
  baseline,
  pending,
  readOnly,
}: PermissionBoardProps) => {
  const [term, setTerm] = useState('')
  const inherited = useMemo(() => new Set(baseline), [baseline])

  // Search-filtered sections, keeping a refinement only alongside its page permission
  const sections = useMemo(() => {
    const needle = term.trim().toLowerCase()

    return PERMISSION_SECTIONS.map((section) => ({
      ...section,
      roots: section.roots
        .map((root) => ({
          ...root,
          children: root.children.filter((child) => matches(child, needle)),
        }))
        .filter((root) => matches(root.meta, needle) || root.children.length > 0),
    })).filter((section) => section.roots.length > 0)
  }, [term])

  // What the draft resolves to once the baseline underneath is folded in
  const holds = (permission: PermissionName): boolean => {
    const state = stateOf(value, permission)

    return state === 'allowed' || (state === 'inherited' && inherited.has(permission))
  }

  // Closing a page permission takes its refinements back to inheritance with it
  const apply = (permission: PermissionName, state: PermissionState, root?: PermissionRoot) => {
    const next = { ...value }

    if (state === 'inherited') delete next[permission]
    else next[permission] = state

    if (state !== 'allowed' && root) {
      root.children.forEach((child) => delete next[child.name])
    }

    onChange(next)
  }

  // Grants or clears a whole page at once, its refinements travelling with it
  const applyRoot = (root: PermissionRoot, state: PermissionState) => {
    const next = { ...value }

    for (const entry of [root.meta, ...root.children]) {
      if (state === 'inherited') delete next[entry.name]
      else next[entry.name] = state
    }

    onChange(next)
  }

  const renderRow = (
    permission: PermissionMeta,
    { child, disabled, root }: { child?: boolean; disabled?: boolean; root?: PermissionRoot }
  ) => (
    <div className={cn(PERMISSION_TOGGLE_STYLES.row, child && PERMISSION_TOGGLE_STYLES.rowChild)}>
      <span className={PERMISSION_TOGGLE_STYLES.identity}>
        <span
          className={cn(PERMISSION_TOGGLE_STYLES.name, child && PERMISSION_TOGGLE_STYLES.nameChild)}
        >
          {permission.displayName}
          {permission.important && <Badge label={ACCESS_COPY.sensitive} tone="warning" />}
        </span>
        <span className={PERMISSION_TOGGLE_STYLES.description}>
          {disabled
            ? ACCESS_COPY.refinementLocked
            : inherited.has(permission.name)
              ? ACCESS_COPY.inheritedYes
              : ACCESS_COPY.inheritedNo}
        </span>
      </span>
      <span className={PERMISSION_TOGGLE_STYLES.control}>
        <TriToggle
          value={stateOf(value, permission.name)}
          disabled={readOnly || disabled}
          label={permission.displayName}
          onChange={(next) => apply(permission.name, next, root)}
        />
      </span>
    </div>
  )

  return (
    <div className={PERMISSION_TOGGLE_STYLES.wrapper}>
      <div className={PERMISSION_TOGGLE_STYLES.head}>
        <Input
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder={ACCESS_COPY.search}
          aria-label={ACCESS_COPY.search}
          className={PERMISSION_TOGGLE_STYLES.search}
        />
        {pending !== undefined && pending > 0 && (
          <span className={PERMISSION_TOGGLE_STYLES.dirty}>{ACCESS_COPY.unsaved}</span>
        )}
      </div>

      {sections.length === 0 ? (
        <p className={PERMISSION_TOGGLE_STYLES.empty}>{ACCESS_COPY.noMatch}</p>
      ) : (
        sections.map((section) => (
          <section key={section.group} className={PERMISSION_TOGGLE_STYLES.section}>
            <h3 className={PERMISSION_TOGGLE_STYLES.sectionTitle}>{section.label}</h3>
            <div className={PERMISSION_TOGGLE_STYLES.rows}>
              {section.roots.map((root, rootIndex) => {
                const rootOpen = holds(root.meta.name)

                return (
                  <Fragment key={root.meta.name}>
                    {rootIndex > 0 && (
                      <span className={PERMISSION_TOGGLE_STYLES.divider} aria-hidden="true" />
                    )}
                    <div className={PERMISSION_TOGGLE_STYLES.rootRow}>
                      {renderRow(root.meta, { root })}
                      {!readOnly && root.children.length > 0 && (
                        <span className={PERMISSION_TOGGLE_STYLES.rootActions}>
                          <Button variant="ghost" onClick={() => applyRoot(root, 'allowed')}>
                            {ACCESS_COPY.grantAll}
                          </Button>
                          <Button variant="ghost" onClick={() => applyRoot(root, 'inherited')}>
                            {ACCESS_COPY.grantNone}
                          </Button>
                        </span>
                      )}
                    </div>
                    {root.children.map((child) => (
                      <Fragment key={child.name}>
                        <span className={PERMISSION_TOGGLE_STYLES.divider} aria-hidden="true" />
                        {renderRow(child, { child: true, disabled: !rootOpen, root: undefined })}
                      </Fragment>
                    ))}
                  </Fragment>
                )
              })}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
