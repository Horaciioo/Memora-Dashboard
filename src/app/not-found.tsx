import Link from 'next/link'
import { Button } from '@/components/elements/actions/Button'
import { SystemScreen } from '@/components/structures/SystemScreen'
import { ROUTES } from '@/declarations/navigation'
import { ERROR_PAGE_COPY } from '@/declarations/ui/copy'

/**
 * Shown when a route or a record does not exist
 * @return {JSX.Element}
 */

export default function NotFound() {
  return (
    <SystemScreen
      framed
      word={ERROR_PAGE_COPY.notFoundWord}
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
  )
}
