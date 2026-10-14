import { Button } from '@/components/elements/actions/Button'
import { EXERCISE_ORDER, EXERCISES } from '@/declarations/recruitment/exercises'
import { EXERCISE_COPY } from '@/declarations/recruitment/exerciseCopy'
import type { ExerciseKey } from '@/declarations/recruitment/questionnaire'
import { ICONS } from '@/declarations/ui/icons'
import { EXERCISE_STYLES } from '@/declarations/ui/variants'

export interface ExercisePickerProps {
  offered: ExerciseKey[]
  // Dev-only exercises included
  showsDev: boolean
  onPick: (exercise: ExerciseKey) => void
  onRandom: () => void
}

/**
 * The exercises on offer, plus a draw
 * @param {ExercisePickerProps} props - Component props
 * @return {JSX.Element}
 */

export const ExercisePicker = ({ offered, showsDev, onPick, onRandom }: ExercisePickerProps) => (
  <div className="flex flex-col gap-6">
    <div className={EXERCISE_STYLES.pick}>
      {EXERCISE_ORDER.filter(
        (key) => offered.includes(key) || (showsDev && EXERCISES[key].isDevOnly)
      ).map((key) => {
        const Glyph = ICONS[EXERCISES[key].icon]

        return (
          <button
            key={key}
            type="button"
            className={EXERCISE_STYLES.tile}
            onClick={() => onPick(key)}
          >
            <Glyph className={EXERCISE_STYLES.tileIcon} aria-hidden="true" />
            <span className={EXERCISE_STYLES.tileTitle}>{EXERCISES[key].label}</span>
            <span className={EXERCISE_STYLES.tileLead}>{EXERCISES[key].lead}</span>
          </button>
        )
      })}
    </div>
    <Button className={EXERCISE_STYLES.random} variant="secondary" onClick={onRandom}>
      {EXERCISE_COPY.random}
    </Button>
  </div>
)
