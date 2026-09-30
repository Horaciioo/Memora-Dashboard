import { Button } from '@/components/elements/actions/Button'
import { ERROR_PAGE_COPY } from '@/declarations/ui/copy'
import { QUERY_ERROR } from '@/declarations/ui/variants'

export interface QueryErrorProps {
  onRetry: () => void
}

/**
 * Failed load with retry
 * @param {() => void} onRetry - Retry handler
 * @return {JSX.Element}
 */

export const QueryError = ({ onRetry }: QueryErrorProps) => (
  <div className={QUERY_ERROR.frame} role="alert">
    <div className={QUERY_ERROR.body}>
      <p className={QUERY_ERROR.title}>{ERROR_PAGE_COPY.loadFailedTitle}</p>
      <p className={QUERY_ERROR.hint}>{ERROR_PAGE_COPY.loadFailedHint}</p>
    </div>
    <Button icon="refresh" onClick={onRetry}>
      {ERROR_PAGE_COPY.retry}
    </Button>
  </div>
)
