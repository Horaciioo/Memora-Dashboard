'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { SegmentedControl } from '@/components/elements/actions/SegmentedControl'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { FeatureNowList } from '@/composites/system/features/FeatureNowList'
import { FeatureSectionBlock } from '@/composites/system/features/FeatureSectionBlock'
import { FeatureSectionNav } from '@/composites/system/features/FeatureSectionNav'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { apiDelete, apiPatch } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { showsFeature } from '@/core/lib/features/filter'
import type { FeatureFilter } from '@/core/lib/features/filter'
import { FeatureModes, rootsOfSection } from '@/declarations/features'
import type { FeatureModeName } from '@/declarations/features'
import { FEATURE_COPY, FEATURE_SECTIONS } from '@/declarations/features/copy'
import { FEATURE_STYLES } from '@/declarations/ui/variants'
import type { FeatureRow } from '@/types/features'

export interface FeatureConsoleProps {
  initialRows: FeatureRow[]
}

const FILTER_OPTIONS: { value: FeatureFilter; label: string }[] = [
  { value: 'all', label: FEATURE_COPY.filterAll },
  { value: FeatureModes.Off, label: FEATURE_COPY.filterOff },
  { value: FeatureModes.Admins, label: FEATURE_COPY.filterAdmins },
  { value: FeatureModes.On, label: FEATURE_COPY.filterOn },
]

/**
 * Every page, game and system with its switch
 * @param {FeatureRow[]} initialRows - Rows read server-side
 * @return {JSX.Element}
 */

export const FeatureConsole = ({ initialRows }: FeatureConsoleProps) => {
  const [rows, setRows] = useState(initialRows)
  const [term, setTerm] = useState('')
  const [filter, setFilter] = useState<FeatureFilter>('all')
  const { isSaving, run } = useMutation()

  const byKey = new Map(rows.map((row) => [row.key, row]))
  const needle = term.trim().toLowerCase()
  const isSearching = needle !== '' || filter !== 'all'
  const isShown = (key: string) => showsFeature(key, byKey, needle, filter)

  // Server answers with every row, parents' switches already counted
  const apply = async (keys: string[], mode: FeatureModeName, note?: string) => {
    const result = await run(
      () => apiPatch<{ rows: FeatureRow[] }>(API_ROUTES.features, { keys, mode, note }),
      FEATURE_COPY.saved
    )
    if (result) setRows(result.rows)
  }

  const resetAll = async () => {
    const result = await run(
      () => apiDelete<{ rows: FeatureRow[] }>(API_ROUTES.features),
      FEATURE_COPY.reset
    )
    if (result) setRows(result.rows)
  }

  const sections = FEATURE_SECTIONS.map((section) => ({
    section,
    roots: rootsOfSection(section.key).filter((root) => isShown(root.key)),
  })).filter((entry) => entry.roots.length > 0)

  return (
    <div className={FEATURE_STYLES.column}>
      <div className={FEATURE_STYLES.toolbar}>
        <input
          type="search"
          value={term}
          aria-label={FEATURE_COPY.searchPlaceholder}
          placeholder={FEATURE_COPY.searchPlaceholder}
          className={FEATURE_STYLES.search}
          onChange={(event) => setTerm(event.target.value)}
        />
        <div className={FEATURE_STYLES.filters}>
          <SegmentedControl
            options={FILTER_OPTIONS}
            value={filter}
            onChange={setFilter}
            label={FEATURE_COPY.title}
          />
          <Button variant="secondary" disabled={isSaving} onClick={() => void resetAll()}>
            {FEATURE_COPY.allOn}
          </Button>
        </div>
      </div>

      <FeatureNowList
        rows={rows}
        isBusy={isSaving}
        onResume={(key) => void apply([key], FeatureModes.On)}
      />

      <div className={FEATURE_STYLES.layout}>
        <FeatureSectionNav rows={byKey} />
        <div className={FEATURE_STYLES.sections}>
          {sections.length === 0 && (
            <EmptyState
              variant="filter"
              title={FEATURE_COPY.emptyTitle}
              description={FEATURE_COPY.emptyDescription}
            />
          )}

          {sections.map(({ section, roots }) => (
            <FeatureSectionBlock
              key={section.key}
              section={section}
              roots={roots}
              rows={byKey}
              isShown={isShown}
              isSearching={isSearching}
              isBusy={isSaving}
              onApply={(keys, mode, note) => void apply(keys, mode, note)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
