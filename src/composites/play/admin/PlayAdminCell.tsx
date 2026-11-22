import { Button } from '@/components/elements/actions/Button'
import { PLAY_ADMIN } from '@/declarations/ui/variants'

export interface PlayAdminCellProps {
  label: string
  note: string
  variant?: 'primary' | 'danger'
  isLoading?: boolean
  onClick: () => void
}

/**
 * Gesture of a player file and its note, on its own raised box
 * @param {PlayAdminCellProps} props - Label, note and handler
 * @return {JSX.Element}
 */

export const PlayAdminCell = ({
  label,
  note,
  variant = 'primary',
  isLoading,
  onClick,
}: PlayAdminCellProps) => (
  <div className={PLAY_ADMIN.cellBox}>
    <Button
      variant={variant === 'danger' ? 'danger' : 'arcade'}
      isLoading={isLoading}
      onClick={onClick}
    >
      {label}
    </Button>
    <p className={PLAY_ADMIN.cellNote}>{note}</p>
  </div>
)
