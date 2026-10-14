import { WRITTEN_CONTEXTS } from '@/declarations/recruitment/questionnaire/contexts'
import type { ContextLevel } from '@/declarations/recruitment/questionnaire'
import { EXERCISE_COPY } from '@/declarations/recruitment/exerciseCopy'
import { EXERCISE_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Column title per level
const LEVEL_TITLES: Record<ContextLevel, string> = {
  moderate: EXERCISE_COPY.moderateTitle,
  complex: EXERCISE_COPY.complexTitle,
}

export interface ContextPickerProps {
  picks: Partial<Record<ContextLevel, string>>
  onPick: (level: ContextLevel, key: string) => void
}

/**
 * One context to choose per difficulty
 * @param {ContextPickerProps} props - Component props
 * @return {JSX.Element}
 */

export const ContextPicker = ({ picks, onPick }: ContextPickerProps) => (
  <div className={EXERCISE_STYLES.levels}>
    {(Object.keys(LEVEL_TITLES) as ContextLevel[]).map((level) => (
      <div key={level} className={EXERCISE_STYLES.level}>
        <span className={EXERCISE_STYLES.label}>{LEVEL_TITLES[level]}</span>
        {WRITTEN_CONTEXTS.map((context, index) =>
          context.level === level ? (
            <button
              key={context.key}
              type="button"
              aria-pressed={picks[level] === context.key}
              className={cn(
                EXERCISE_STYLES.context,
                picks[level] === context.key && EXERCISE_STYLES.contextOn
              )}
              onClick={() => onPick(level, context.key)}
            >
              <span className={EXERCISE_STYLES.stepNumber}>{index + 1}</span>
              {context.title}
            </button>
          ) : null
        )}
      </div>
    ))}
  </div>
)
