import Link from 'next/link'
import { Button } from '@/components/elements/actions/Button'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { ROUTES } from '@/declarations/navigation'
import { ERROR_PAGE_COPY } from '@/declarations/ui/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'

/**
 * Shown when a route or a record does not exist
 * @return {JSX.Element}
 */

export default function NotFound() {
  return (
    <div className={PAGE_STYLES.wrapper}>
      <EmptyState
        variant="filter"
        title={ERROR_PAGE_COPY.notFoundTitle}
        description={ERROR_PAGE_COPY.notFoundDescription}
        action={
          <Link href={ROUTES.dashboard}>
            <Button variant="primary" icon="back">
              {ERROR_PAGE_COPY.home}
            </Button>
          </Link>
        }
      />
    </div>
  )
}
