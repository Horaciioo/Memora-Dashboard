import { COURSE_CATALOG } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface CourseStepsProps {
  total: number
  passed: number
  // Fills the whole bar
  isDone?: boolean
}

/**
 * One segment per exercise, filled as they are cleared
 * @param {CourseStepsProps} props - Progress
 * @return {JSX.Element}
 */

export const CourseSteps = ({ total, passed, isDone }: CourseStepsProps) => (
  <div className={COURSE_CATALOG.stageSteps} aria-hidden="true">
    {Array.from({ length: total }, (_, step) => (
      <span
        key={step}
        className={cn(
          COURSE_CATALOG.stageStep,
          (isDone || step < passed) && COURSE_CATALOG.stageStepDone
        )}
      />
    ))}
  </div>
)
