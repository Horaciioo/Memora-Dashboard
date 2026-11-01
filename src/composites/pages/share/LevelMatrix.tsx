'use client'

import { PAGE_CAPABILITY_LABELS, PAGE_LEVELS, PageCapabilities } from '@/declarations/pages/access'
import { PAGE_SHARE_COPY } from '@/declarations/pages/copy'
import { ICONS } from '@/declarations/ui/icons'
import { SHARE_PANEL_STYLES } from '@/declarations/ui/variants'

/**
 * What each level allows, one row per gesture
 * @return {JSX.Element}
 */

export const LevelMatrix = () => {
  const CheckIcon = ICONS.check
  const capabilities = Object.values(PageCapabilities)

  return (
    <details className={SHARE_PANEL_STYLES.matrix}>
      <summary className={SHARE_PANEL_STYLES.matrixSummary}>{PAGE_SHARE_COPY.matrixTitle}</summary>
      <table className={SHARE_PANEL_STYLES.matrixTable}>
        <thead>
          <tr>
            <th scope="col" />
            {PAGE_LEVELS.keys.map((level) => (
              <th key={level} scope="col" className={SHARE_PANEL_STYLES.matrixHead}>
                {PAGE_LEVELS.get(level).label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {capabilities.map((capability) => (
            <tr key={capability}>
              <th scope="row" className={SHARE_PANEL_STYLES.matrixRow}>
                {PAGE_CAPABILITY_LABELS[capability].label}
              </th>
              {PAGE_LEVELS.keys.map((level) => {
                const allowed = PAGE_LEVELS.get(level).capabilities.includes(capability)

                return (
                  <td key={level} className={SHARE_PANEL_STYLES.matrixCell}>
                    {allowed ? <CheckIcon className={SHARE_PANEL_STYLES.matrixCheck} aria-label={PAGE_CAPABILITY_LABELS[capability].label} /> : null}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  )
}
