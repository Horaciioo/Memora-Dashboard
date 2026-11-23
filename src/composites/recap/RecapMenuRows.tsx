'use client'

import { openRecap } from '@/core/lib/recap/client'
import { useRecapStore } from '@/core/store/recap'
import { RECAP_COPY } from '@/declarations/recap/copy'
import { ICONS } from '@/declarations/ui/icons'
import { RECAP_STYLES } from '@/declarations/ui/variants'
import { useFeatures } from '@/managers/front-end/FeaturesManager'

export interface RecapMenuRowsProps {
  onLeave: () => void
}

/**
 * Rows that bring the recap back by hand, plus the made-up one of the dev build
 * @param {() => void} onLeave - Called once a row is chosen
 * @return {JSX.Element | null}
 */

export const RecapMenuRows = ({ onLeave }: RecapMenuRowsProps) => {
  const { isOpen } = useFeatures()
  const isDemoOffered = useRecapStore((state) => state.isDemoOffered)
  if (!isOpen('recap')) return null

  const HistoryIcon = ICONS.history
  const DemoIcon = ICONS.star

  const rows = [
    { key: 'real', label: RECAP_COPY.menuRow, Icon: HistoryIcon, demo: false },
    ...(isDemoOffered
      ? [{ key: 'demo', label: RECAP_COPY.demoRow, Icon: DemoIcon, demo: true }]
      : []),
  ]

  return rows.map(({ key, label, Icon, demo }) => (
    <button
      key={key}
      type="button"
      className={RECAP_STYLES.menuRow}
      onClick={() => {
        onLeave()
        void openRecap(demo).catch(() => undefined)
      }}
    >
      <Icon className={RECAP_STYLES.menuGlyph} aria-hidden="true" />
      {label}
    </button>
  ))
}
