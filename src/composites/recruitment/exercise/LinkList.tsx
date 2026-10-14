'use client'

import { Fragment } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { useCopy } from '@/core/hooks/interaction/useCopy'
import { EXERCISE_SETTINGS } from '@/declarations/configurations/settings'
import { ROUTES } from '@/declarations/navigation'
import { EXERCISE_COPY } from '@/declarations/recruitment/exerciseCopy'
import { WRITTEN_CONTEXT_BY_KEY } from '@/declarations/recruitment/questionnaire/contexts'
import type { ContextLevel } from '@/declarations/recruitment/questionnaire'
import { EXERCISE_STYLES } from '@/declarations/ui/variants'
import type { ExerciseLinkView } from '@/types/recruitment'
import { cn } from '@/utils/classnames'

// Label before each link
const LEVEL_TITLES: Record<ContextLevel, string> = {
  moderate: EXERCISE_COPY.moderateTitle,
  complex: EXERCISE_COPY.complexTitle,
}

export interface LinkListProps {
  links: ExerciseLinkView[]
  disabled?: boolean
  onExpire: (id: string) => void
}

// Difficulty of a link
const levelOf = (link: ExerciseLinkView): ContextLevel =>
  WRITTEN_CONTEXT_BY_KEY.get(link.contextKey)?.level ?? 'moderate'

// Moderate before complex
const byLevel = (a: ExerciseLinkView, b: ExerciseLinkView): number =>
  Number(levelOf(a) === 'complex') - Number(levelOf(b) === 'complex')

/**
 * Status line of one link
 * @param {ExerciseLinkView} link - Link
 * @return {string} - Sentence
 */

const statusOf = (link: ExerciseLinkView): string => {
  if (link.isExpired) return EXERCISE_COPY.expired

  const time = new Date(link.expiresAt).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const opened = link.isClaimed ? EXERCISE_COPY.opened : EXERCISE_COPY.notOpened
  const plays = EXERCISE_COPY.plays
    .replace('{plays}', String(link.plays))
    .replace('{max}', String(EXERCISE_SETTINGS.maxPlays))

  return `${opened}, ${plays}, ${EXERCISE_COPY.expiresAt.replace('{time}', time)}`
}

/**
 * Links handed to the candidate, one per difficulty
 * @param {LinkListProps} props - Component props
 * @return {JSX.Element}
 */

export const LinkList = ({ links, disabled, onExpire }: LinkListProps) => {
  const copy = useCopy(EXERCISE_COPY.copied)

  return (
    <div className={EXERCISE_STYLES.links}>
      {[...links].sort(byLevel).map((link, index) => {
        const context = WRITTEN_CONTEXT_BY_KEY.get(link.contextKey)
        const url = `${window.location.origin}${ROUTES.exercise(link.token)}`

        return (
          <Fragment key={link.id}>
            {index > 0 && <hr className={EXERCISE_STYLES.linkDivider} />}
            <div className={EXERCISE_STYLES.link}>
              <div className={EXERCISE_STYLES.linkHead}>
                <div className="flex min-w-0 flex-col gap-1">
                  <span className={EXERCISE_STYLES.label}>{LEVEL_TITLES[levelOf(link)]}</span>
                  <h4 className={EXERCISE_STYLES.linkTitle}>{context?.title}</h4>
                </div>
                <span className={EXERCISE_STYLES.linkMeta}>{statusOf(link)}</span>
              </div>
              <div className={EXERCISE_STYLES.linkRow}>
                <span
                  className={cn(
                    EXERCISE_STYLES.linkUrl,
                    link.isExpired && EXERCISE_STYLES.linkDead
                  )}
                >
                  {url}
                </span>
                <div className={EXERCISE_STYLES.linkActions}>
                  <Button disabled={link.isExpired} onClick={() => void copy(url)}>
                    {EXERCISE_COPY.copy}
                  </Button>
                  <Button
                    variant="danger"
                    disabled={disabled || link.isExpired}
                    onClick={() => onExpire(link.id)}
                  >
                    {EXERCISE_COPY.expire}
                  </Button>
                </div>
              </div>
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}
