import { BAC_BOARD_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { BAC_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Glyph, tone and name of each verdict
const VERDICTS = {
  yes: { icon: 'playTick', tone: BAC_BOARD.verdictYes, label: BAC_BOARD_COPY.accepted },
  no: { icon: 'playClose', tone: BAC_BOARD.verdictNo, label: BAC_BOARD_COPY.refused },
  none: { icon: 'playTick', tone: BAC_BOARD.verdictNone, label: BAC_BOARD_COPY.undecided },
} as const

export type BacVerdictKind = keyof typeof VERDICTS

/**
 * Check or cross of a word
 * @param {Object} props - Verdict
 * @param {BacVerdictKind} props.kind - Check, cross or undecided
 * @return {JSX.Element}
 */

export const BacVerdict = ({ kind }: { kind: BacVerdictKind }) => {
  const { icon, tone, label } = VERDICTS[kind]
  const Icon = ICONS[icon]

  return (
    <span className={cn(BAC_BOARD.verdict, tone)} role="img" aria-label={label}>
      <Icon className={BAC_BOARD.verdictIcon} aria-hidden="true" />
    </span>
  )
}
