'use client'

import { MODVIEW_MOBILE_COPY as COPY } from '@/declarations/modview/mobile'
import { MODVIEW_MOBILE } from '@/declarations/ui/variants'
import type { ViewerSanction } from '@/types/lives'
import { cn } from '@/utils/classnames'
import { formatDuration } from '@/utils/format/modview'

export interface ViewerHighlightsProps {
  // Null while loading
  history: ViewerSanction[] | null
}

/**
 * Timeouts first, then the other measures a viewer got, big enough to read at a glance
 * @param {ViewerHighlightsProps} props - Sanctions of the viewer
 * @return {JSX.Element | null}
 */

export const ViewerHighlights = ({ history }: ViewerHighlightsProps) => {
  if (!history) return null

  const timeouts = history.filter((row) => row.kind === 'TIMEOUT')
  const bans = history.filter((row) => row.kind === 'BAN')
  const warns = history.filter((row) => row.kind === 'WARN')
  const others = history.length - timeouts.length - bans.length - warns.length
  const longest = Math.max(0, ...timeouts.map((row) => row.durationSeconds ?? 0))

  const tiles = [
    {
      label: COPY.timeouts,
      value: timeouts.length,
      hint: longest ? formatDuration(longest) : COPY.none,
      isHot: timeouts.length > 0,
    },
    { label: COPY.bans, value: bans.length, hint: undefined, isHot: bans.length > 0 },
    { label: COPY.warns, value: warns.length, hint: undefined, isHot: false },
    { label: COPY.others, value: others, hint: undefined, isHot: false },
  ]

  return (
    <div className={MODVIEW_MOBILE.highlights}>
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className={cn(MODVIEW_MOBILE.highlight, tile.isHot && MODVIEW_MOBILE.highlightHot)}
        >
          <span className={MODVIEW_MOBILE.highlightLabel}>{tile.label}</span>
          <span className={MODVIEW_MOBILE.highlightValue}>{tile.value}</span>
          {tile.hint && <span className={MODVIEW_MOBILE.highlightHint}>{tile.hint}</span>}
        </div>
      ))}
    </div>
  )
}
