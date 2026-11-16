import { fillPlayMessage } from '@/declarations/play/copy'
import { GOLF_VOTE_COPY } from '@/declarations/play/golf/vote'
import { PLAY_VOTE_PROGRESS } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface PlayVoteProgressProps {
  // Steps still on the path, in order
  steps: string[]
  // Step on screen
  step: string
}

/**
 * Session progress of a launch vote: a bar of segments and the step count
 * @param {PlayVoteProgressProps} props - Steps and current step
 * @return {JSX.Element | null}
 */

export const PlayVoteProgress = ({ steps, step }: PlayVoteProgressProps) => {
  const index = steps.indexOf(step)
  if (index < 0 || steps.length < 2) return null

  const label = fillPlayMessage(GOLF_VOTE_COPY.progress, { n: index + 1, total: steps.length })

  return (
    <div
      className={PLAY_VOTE_PROGRESS.root}
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={steps.length}
      aria-valuenow={index + 1}
      aria-label={label}
    >
      <div className={PLAY_VOTE_PROGRESS.bar}>
        {steps.map((key, at) => (
          <i
            key={key}
            className={cn(PLAY_VOTE_PROGRESS.segment, at <= index && PLAY_VOTE_PROGRESS.done)}
          />
        ))}
      </div>
      <p className={PLAY_VOTE_PROGRESS.text}>{label}</p>
    </div>
  )
}
