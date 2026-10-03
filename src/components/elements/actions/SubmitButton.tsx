'use client'

import { useFormStatus } from 'react-dom'

import { Button } from '@/components/elements/actions/Button'
import type { ButtonProps } from '@/components/elements/actions/Button'

/**
 * Submit button of a server action form, locked with the brand loader while the action runs
 * @param {ButtonProps} props - Any button prop, the type being forced to submit
 * @return {JSX.Element}
 */

export const SubmitButton = (props: ButtonProps) => {
  const { pending } = useFormStatus()

  return <Button {...props} type="submit" isLoading={pending || props.isLoading} />
}
