'use client'

import { useState } from 'react'

import { SegmentedControl } from '@/components/elements/actions/SegmentedControl'
import { familiesOf, holdsSwitch } from '@/core/lib/features/filter'
import { FEATURE_MAP, childrenOf, FeatureModes } from '@/declarations/features'
import type { FeatureModeName } from '@/declarations/features'
import {
  FEATURE_COPY,
  FEATURE_GROUP_COPY,
  FEATURE_KIND_COPY,
  FEATURE_MODE_COPY,
} from '@/declarations/features/copy'
import { ICONS } from '@/declarations/ui/icons'
import { FEATURE_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import type { FeatureRow } from '@/types/features'

// Segments of the switch, in the order a member loses access
const MODE_OPTIONS = (Object.keys(FEATURE_MODE_COPY) as FeatureModeName[]).map((value) => ({
  value,
  label: FEATURE_MODE_COPY[value].label,
}))

export interface FeatureNodeProps {
  featureKey: string
  rows: ReadonlyMap<string, FeatureRow>
  isShown: (key: string) => boolean
  isSearching: boolean
  isBusy: boolean
  onChange: (key: string, mode: FeatureModeName, note?: string) => void
}

/**
 * One feature with its switch, and everything under it
 * @param {string} featureKey - Feature key
 * @param {ReadonlyMap<string, FeatureRow>} rows - Rows by key
 * @param {(key: string) => boolean} isShown - Passes the search and the filter
 * @param {boolean} isSearching - A search or filter is active, branches stay open
 * @param {boolean} isBusy - A change is on its way
 * @param {(key: string, mode: FeatureModeName, note?: string) => void} onChange - Switch handler
 * @return {JSX.Element | null}
 */

export const FeatureNode = ({
  featureKey,
  rows,
  isShown,
  isSearching,
  isBusy,
  onChange,
}: FeatureNodeProps) => {
  const feature = FEATURE_MAP.get(featureKey)
  const row = rows.get(featureKey)
  const children = childrenOf(featureKey).filter((child) => isShown(child.key))
  const [isFolded, setFolded] = useState<boolean | null>(null)
  const [draft, setDraft] = useState<string | null>(null)
  if (!feature || !row) return null

  // Open by default where a switch away from default hides below
  const isOpen = isSearching || (isFolded === null ? holdsSwitch(featureKey, rows) : !isFolded)
  const hasChildren = childrenOf(featureKey).length > 0
  const Chevron = ICONS.next
  const Lock = ICONS.lock
  const isOff = row.mode !== FeatureModes.On
  const isInherited = isOff && row.source !== null && row.source !== featureKey
  const parentLabel = row.source ? FEATURE_MAP.get(row.source)?.label : null
  const note = draft ?? row.note ?? ''

  return (
    <>
      <div className={FEATURE_STYLES.row}>
        <div className={FEATURE_STYLES.rowMain}>
          <div className={FEATURE_STYLES.rowText}>
            {hasChildren ? (
              <button
                type="button"
                aria-expanded={isOpen}
                aria-label={isOpen ? FEATURE_COPY.collapse : FEATURE_COPY.expand}
                className={cn(FEATURE_STYLES.fold, isOpen && FEATURE_STYLES.foldOpen)}
                onClick={() => setFolded(isOpen)}
              >
                <Chevron className="size-4" aria-hidden="true" />
              </button>
            ) : (
              <span className={FEATURE_STYLES.foldSpacer} aria-hidden="true" />
            )}
            <div className="min-w-0">
              <p className={FEATURE_STYLES.rowTitle}>
                <span className={isOff ? FEATURE_STYLES.rowNameOff : FEATURE_STYLES.rowName}>
                  {feature.label}
                </span>
                <span className={FEATURE_STYLES.rowKind}>{FEATURE_KIND_COPY[feature.kind]}</span>
              </p>
              <p className={FEATURE_STYLES.rowHint}>{feature.description}</p>
              {isInherited && parentLabel && (
                <p className={FEATURE_STYLES.rowInherited}>
                  {FEATURE_COPY.inherited.replace('{source}', parentLabel)}
                </p>
              )}
            </div>
          </div>

          {row.isPaused || feature.locked ? (
            <span className={FEATURE_STYLES.lock}>
              <Lock className={FEATURE_STYLES.lockIcon} aria-hidden="true" />
              {row.isPaused ? FEATURE_COPY.pausedHint : FEATURE_COPY.locked}
            </span>
          ) : (
            <fieldset disabled={isBusy} className="contents">
              <SegmentedControl
                options={MODE_OPTIONS}
                value={row.own}
                label={feature.label}
                onChange={(mode) => onChange(featureKey, mode)}
              />
            </fieldset>
          )}
        </div>

        {row.own !== FeatureModes.On && !feature.locked && !row.isPaused && (
          <input
            type="text"
            value={note}
            maxLength={200}
            aria-label={FEATURE_COPY.noteLabel}
            placeholder={FEATURE_COPY.notePlaceholder}
            className={FEATURE_STYLES.note}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={() => {
              if (draft !== null && draft !== (row.note ?? '')) onChange(featureKey, row.own, draft)
              setDraft(null)
            }}
          />
        )}
      </div>

      {isOpen && children.length > 0 && (
        <div className={FEATURE_STYLES.children}>
          {familiesOf(children).map(({ group, features }) => (
            <div key={group ?? 'plain'} className={FEATURE_STYLES.familyList}>
              {group && <h3 className={FEATURE_STYLES.family}>{FEATURE_GROUP_COPY[group]}</h3>}
              {features.map((child) => (
                <FeatureNode
                  key={child.key}
                  featureKey={child.key}
                  rows={rows}
                  isShown={isShown}
                  isSearching={isSearching}
                  isBusy={isBusy}
                  onChange={onChange}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
