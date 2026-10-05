import { ERASED_COPY } from '@/declarations/academy/parkour'
import { ERASED_VALUE } from '@/declarations/ui/variants'

/**
 * Personal value erased for good
 * @return {JSX.Element}
 */

export const ErasedValue = () => (
  <span className={ERASED_VALUE.text} title={ERASED_COPY.notice}>
    {ERASED_COPY.value}
  </span>
)
