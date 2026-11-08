import type { ReactNode } from 'react'
import { LEFT_SIDEBAR } from '@/declarations/ui/blocks'

export interface RailSlidesProps {
  // Pane on screen
  index: number
  panes: ReactNode[]
}

/**
 * Panes side by side in the rail, the whole strip gliding to bring one into view
 * @param {number} index - Pane on screen
 * @param {ReactNode[]} panes - Panes, left to right
 * @return {JSX.Element}
 */

export const RailSlides = ({ index, panes }: RailSlidesProps) => (
  <div className={LEFT_SIDEBAR.slides}>
    <div
      className={LEFT_SIDEBAR.slidesStrip}
      style={{
        width: `${panes.length * 100}%`,
        transform: `translateX(-${(index * 100) / panes.length}%)`,
      }}
    >
      {panes.map((pane, at) => (
        <div key={at} className={LEFT_SIDEBAR.slidesPane} inert={at !== index}>
          {pane}
        </div>
      ))}
    </div>
  </div>
)
