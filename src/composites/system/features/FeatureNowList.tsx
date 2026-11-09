import { Button } from '@/components/elements/actions/Button'
import { FEATURE_MAP, FeatureModes } from '@/declarations/features'
import { FEATURE_COPY, FEATURE_MODE_COPY } from '@/declarations/features/copy'
import { FEATURE_STYLES } from '@/declarations/ui/variants'
import type { FeatureRow } from '@/types/features'

export interface FeatureNowListProps {
  rows: FeatureRow[]
  isBusy: boolean
  onResume: (key: string) => void
}

/**
 * What is not open to everyone right now
 * @param {FeatureRow[]} rows - Every row
 * @param {boolean} isBusy - A change is on its way
 * @param {(key: string) => void} onResume - Switch back on
 * @return {JSX.Element | null}
 */

export const FeatureNowList = ({ rows, isBusy, onResume }: FeatureNowListProps) => {
  const held = rows.filter((row) => row.isPaused || row.own !== FeatureModes.On)
  if (held.length === 0) return null

  return (
    <section className={FEATURE_STYLES.now} aria-label={FEATURE_COPY.nowTitle}>
      <h2 className={FEATURE_STYLES.sectionTitle}>{FEATURE_COPY.nowTitle}</h2>
      <p className={FEATURE_STYLES.sectionLead}>{FEATURE_COPY.nowLead}</p>
      {held.map((row) => (
        <div key={row.key} className={FEATURE_STYLES.nowRow}>
          <p>
            <span className={FEATURE_STYLES.nowName}>{FEATURE_MAP.get(row.key)?.label}</span>
            <span className={FEATURE_STYLES.nowState}>
              {row.isPaused ? FEATURE_COPY.paused : FEATURE_MODE_COPY[row.own].label}
            </span>
          </p>
          {!row.isPaused && (
            <Button variant="ghost" disabled={isBusy} onClick={() => onResume(row.key)}>
              {FEATURE_COPY.resume}
            </Button>
          )}
        </div>
      ))}
    </section>
  )
}
