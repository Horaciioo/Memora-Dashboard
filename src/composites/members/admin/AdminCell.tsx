import { Button } from '@/components/elements/actions/Button'
import { MEMBER_ADMIN } from '@/declarations/ui/variants'

export interface AdminCellProps {
  label: string
  note: string
  variant?: 'primary' | 'danger'
  isLoading?: boolean
  onClick: () => void
}

/**
 * Filled gesture and its note
 * @param {AdminCellProps} props - Label, note and handler
 * @return {JSX.Element}
 */

export const AdminCell = ({
  label,
  note,
  variant = 'primary',
  isLoading,
  onClick,
}: AdminCellProps) => (
  <div className={MEMBER_ADMIN.cell}>
    <Button variant={variant} isLoading={isLoading} onClick={onClick}>
      {label}
    </Button>
    <p className={MEMBER_ADMIN.cellNote}>{note}</p>
  </div>
)
