'use client'

import { useState } from 'react'

import { Markdown } from '@/components/elements/display/Markdown'
import { FormRenderer } from '@/components/structures/data/FormRenderer'
import { UnbanShell } from '@/composites/unban/public/UnbanShell'
import { fillCreator } from '@/core/lib/academy/creator'
import { toPageGroups } from '@/declarations/unban/form'
import { UNBAN_PUBLIC_COPY } from '@/declarations/unban/copy'
import { UNBAN_SCREEN_COPY } from '@/declarations/unban/screen'
import { UNBAN_SHELL_STYLES } from '@/declarations/ui/variants'
import type { UnbanFormSnapshot } from '@/declarations/unban/form'
import type { FieldOption, FieldValue, FormValues } from '@/types/forms'

export interface FormPreviewProps {
  snapshot: UnbanFormSnapshot
  // Creator whose banner, portrait and name fill the page
  creator: FieldOption | undefined
}

/**
 * The public page as it will be served, banner, words of the team then every question, nothing typed is sent
 * @param {UnbanFormSnapshot} snapshot - Questions as edited
 * @param {FieldOption | undefined} creator - Creator the page is for
 * @return {JSX.Element}
 */

export const FormPreview = ({ snapshot, creator }: FormPreviewProps) => {
  const [values, setValues] = useState<FormValues>({})
  const shown = fillCreator(snapshot, creator?.label ?? '')
  const pages = toPageGroups(shown)

  return (
    <section aria-label={UNBAN_SCREEN_COPY.formPreview}>
      <UnbanShell
        isPreview
        title={UNBAN_PUBLIC_COPY.title}
        creator={
          creator
            ? {
                id: creator.value,
                name: creator.label,
                accent: creator.accent ?? null,
                avatarUrl: creator.image ?? null,
                bannerUrl: creator.banner ?? null,
              }
            : null
        }
      >
        {shown.intro && <Markdown source={shown.intro} className={UNBAN_SHELL_STYLES.intro} />}
        {pages.map((page, position) => (
          <div key={page.id} className={UNBAN_SHELL_STYLES.previewPage}>
            {pages.length > 1 && (
              <h2 className={UNBAN_SHELL_STYLES.previewPageTitle}>
                {page.title ?? UNBAN_SCREEN_COPY.formPageName.replace('{n}', String(position + 1))}
              </h2>
            )}
            <FormRenderer
              idPrefix={`unban-preview-${page.id}`}
              single
              fields={page.fields}
              values={values}
              issues={[]}
              onChange={(name: string, value: FieldValue) =>
                setValues((current) => ({ ...current, [name]: value }))
              }
            />
          </div>
        ))}
        {shown.outro && <Markdown source={shown.outro} className={UNBAN_SHELL_STYLES.intro} />}
      </UnbanShell>
    </section>
  )
}
