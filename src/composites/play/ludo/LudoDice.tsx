import { LudoDie } from '@/composites/play/ludo/LudoDie'
import { LUDO_CHAOS_UI } from '@/declarations/play/ludo/copy'
import { LUDO_CHAOS_PIECES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface LudoDiceProps {
  face: number | null
  // Second die of a double throw
  face2: number | null
  isRolling: boolean
  isRolling2: boolean
  // Die kept of the two
  kept: 0 | 1 | null
  canRoll: boolean
  // The viewer chooses between the two
  canPick: boolean
  onRoll: () => void
  onPick: (die: number) => void
}

/**
 * One die, or two stacked over the avatar's middle when the throw is double: the die not kept turns see-through
 * @param {LudoDiceProps} props - Dice
 * @return {JSX.Element}
 */

export const LudoDice = ({
  face,
  face2,
  isRolling,
  isRolling2,
  kept,
  canRoll,
  canPick,
  onRoll,
  onPick,
}: LudoDiceProps) => {
  if (face2 === null)
    return <LudoDie face={face} isRolling={isRolling} canRoll={canRoll} onRoll={onRoll} />
  const dice = [
    { face, isRolling },
    { face: face2, isRolling: isRolling2 },
  ]

  return (
    <span className={LUDO_CHAOS_PIECES.dieStack}>
      {dice.map((die, index) => (
        <span
          key={index}
          className={cn(
            kept === index && LUDO_CHAOS_PIECES.dieKept,
            kept !== null && kept !== index && LUDO_CHAOS_PIECES.dieDropped,
            canPick && LUDO_CHAOS_PIECES.dieChoice
          )}
        >
          <LudoDie
            face={die.face}
            isRolling={die.isRolling}
            canRoll={canPick}
            onRoll={() => onPick(index)}
            label={LUDO_CHAOS_UI.pickDie}
          />
        </span>
      ))}
    </span>
  )
}
