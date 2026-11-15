'use client'

import { MarkdownEditor } from '@/components/elements/forms/MarkdownEditor'
import { UNBAN_DESK_STYLES } from '@/declarations/ui/variants'

export interface FormTextBoxProps {
  id: string
  title: string
  placeholder: string
  value: string
  maxLength: number
  onChange: (value: string) => void
}

/**
 * Box holding one text of the form, written in markdown
 * @param {FormTextBoxProps} props - Component props
 * @return {JSX.Element}
 */

export const FormTextBox = ({
  id,
  title,
  placeholder,
  value,
  maxLength,
  onChange,
}: FormTextBoxProps) => (
  <section className={UNBAN_DESK_STYLES.box} aria-labelledby={`${id}-title`}>
    <h2 id={`${id}-title`} className={UNBAN_DESK_STYLES.sectionTitle}>
      {title}
    </h2>
    <MarkdownEditor
      id={id}
      value={value}
      placeholder={placeholder}
      maxLength={maxLength}
      onChange={onChange}
    />
  </section>
)
