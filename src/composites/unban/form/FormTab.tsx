'use client'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/elements/actions/Button'
import { FormBar } from '@/composites/unban/form/FormBar'
import { FormTextBox } from '@/composites/unban/form/FormTextBox'
import { QuestionnaireBox } from '@/composites/unban/form/QuestionnaireBox'
import { useUnbanForm } from '@/core/hooks/data/unban/useUnbanForm'
import { ROUTES } from '@/declarations/navigation'
import { UNBAN_DESK_STYLES } from '@/declarations/ui/variants'
import { UNBAN_SCREEN_COPY } from '@/declarations/unban/screen'
import type { FieldOption } from '@/types/forms'

// Longest intro or outro, as the server holds it
const TEXT_MAX_LENGTH = 2000

export interface FormTabProps {
  // Creator the preview is drawn for
  creator: FieldOption | undefined
}

/**
 * Editor of the public form in three boxes, the preview lives on its own page
 * @param {FieldOption | undefined} creator - Creator the preview is drawn for
 * @return {JSX.Element | null}
 */

export const FormTab = ({ creator }: FormTabProps) => {
  const editor = useUnbanForm()
  const router = useRouter()
  const { snapshot, active } = editor

  if (!snapshot || !active) return null

  const query = creator ? `?youtuber=${encodeURIComponent(creator.value)}` : ''

  return (
    <div className={UNBAN_DESK_STYLES.list}>
      <FormBar editor={editor} />

      <div className={UNBAN_DESK_STYLES.actions}>
        <Button
          icon="visible"
          // A change still on its way would be missing from the preview
          disabled={editor.saveState === 'saving'}
          onClick={() => router.push(`${ROUTES.unbanEdit}${query}`)}
        >
          {UNBAN_SCREEN_COPY.formPreview}
        </Button>
      </div>

      <div className={UNBAN_DESK_STYLES.editorColumn}>
        <FormTextBox
          id="unban-form-intro"
          title={UNBAN_SCREEN_COPY.formIntro}
          placeholder={UNBAN_SCREEN_COPY.formIntroHint}
          value={snapshot.intro ?? ''}
          maxLength={TEXT_MAX_LENGTH}
          onChange={(intro) => editor.edit({ ...snapshot, intro })}
        />
        <QuestionnaireBox snapshot={snapshot} onEdit={editor.edit} />
        <FormTextBox
          id="unban-form-outro"
          title={UNBAN_SCREEN_COPY.formOutro}
          placeholder={UNBAN_SCREEN_COPY.formOutroHint}
          value={snapshot.outro ?? ''}
          maxLength={TEXT_MAX_LENGTH}
          onChange={(outro) => editor.edit({ ...snapshot, outro })}
        />
      </div>
    </div>
  )
}
