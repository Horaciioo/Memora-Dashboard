'use client'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/elements/actions/Button'
import { FormPreview } from '@/composites/unban/form/FormPreview'
import { useUnbanForm } from '@/core/hooks/data/unban/useUnbanForm'
import { ROUTES } from '@/declarations/navigation'
import { UNBAN_DESK_STYLES } from '@/declarations/ui/variants'
import { UNBAN_SCREEN_COPY } from '@/declarations/unban/screen'
import type { FieldOption } from '@/types/forms'

export interface FormPreviewPageProps {
  creator: FieldOption | undefined
  // Creator filter the form tab comes back with
  backQuery?: string
}

/**
 * Page of the preview, the draft drawn as the public page with a way back to the editor
 * @param {FormPreviewPageProps} props - Component props
 * @return {JSX.Element | null}
 */

export const FormPreviewPage = ({ creator, backQuery }: FormPreviewPageProps) => {
  const router = useRouter()
  const { snapshot } = useUnbanForm()

  const params = new URLSearchParams({ tab: 'form', ...(backQuery ? { youtuber: backQuery } : {}) })

  return (
    <div className={UNBAN_DESK_STYLES.list}>
      <div className={UNBAN_DESK_STYLES.actions}>
        <Button icon="back" onClick={() => router.push(`${ROUTES.unban}?${params}`)}>
          {UNBAN_SCREEN_COPY.formBack}
        </Button>
      </div>
      {snapshot && <FormPreview snapshot={snapshot} creator={creator} />}
    </div>
  )
}
