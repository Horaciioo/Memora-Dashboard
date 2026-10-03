'use client'

import { Button } from '@/components/elements/actions/Button'

export interface PrintButtonProps {
  label: string
}

/**
 * Open the browser's print dialog, where saving as PDF lives too
 * @param {string} label - Button text
 * @return {JSX.Element}
 */

export const PrintButton = ({ label }: PrintButtonProps) => (
  <Button variant="secondary" icon="sheet" onClick={() => window.print()}>
    {label}
  </Button>
)
