'use client'

import { Badge } from '@/components/elements/display/Badge'
import { Markdown } from '@/components/elements/display/Markdown'
import { SANCTION_COPY } from '@/declarations/sanctions/copy'
import { toTone } from '@/declarations/ui/theme'
import type { LiveconLevelView } from '@/types/livecon'

export interface LiveconLevelCardProps {
  level: LiveconLevelView
  current?: boolean
}

/**
 * One livecon level with its guidelines, shared by the banner dialog and the panel
 * @param {LiveconLevelView} level - Declared level
 * @param {boolean} [current] - Level in force right now
 * @return {JSX.Element}
 */

export const LiveconLevelCard = ({ level, current }: LiveconLevelCardProps) => {
  const tone = toTone(level.accent, 'neutral')

  return (
    <article className="flex flex-col gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4">
      <header className="flex flex-wrap items-center gap-2">
        <Badge label={`${SANCTION_COPY.panel} ${level.level}`} tone={tone} dot />
        <h3 className="font-bold">{level.name}</h3>
        {current && <Badge label={SANCTION_COPY.currentBadge} tone="brand" />}
      </header>
      {level.summary && (
        <p className="text-sm text-[var(--color-ink-subtle)]">{level.summary}</p>
      )}
      {level.guidelines ? (
        <Markdown source={level.guidelines} />
      ) : (
        <p className="text-sm text-[var(--color-ink-subtle)] italic">
          {SANCTION_COPY.noGuidelines}
        </p>
      )}
    </article>
  )
}
