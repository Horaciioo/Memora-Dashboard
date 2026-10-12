import Link from '@/components/elements/navigation/AppLink'
import { Button } from '@/components/elements/actions/Button'
import { SystemScreen } from '@/components/structures/SystemScreen'
import { ROUTES } from '@/declarations/navigation'
import { ERROR_PAGE_COPY } from '@/declarations/ui/copy'

/**
 * Shown when the member lacks access
 * @return {JSX.Element}
 */

export default function Forbidden() {
  return (
    <SystemScreen
      word={ERROR_PAGE_COPY.forbiddenWord}
      title={ERROR_PAGE_COPY.forbiddenTitle}
      description={ERROR_PAGE_COPY.forbiddenDescription}
      action={
        <Link href={ROUTES.dashboard}>
          <Button variant="primary" icon="back">
            {ERROR_PAGE_COPY.forbiddenHome}
          </Button>
        </Link>
      }
    />
  )
}
