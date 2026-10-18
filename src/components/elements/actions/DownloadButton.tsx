'use client'

import { Button } from '@/components/elements/actions/Button'

export interface DownloadButtonProps {
  label: string
  filename: string
  mime: string
  // Content built on click
  build: () => string
}

/**
 * Save a generated file
 * @param {string} label - Button text
 * @param {string} filename - File name
 * @param {string} mime - Media type
 * @param {() => string} build - Content builder
 * @return {JSX.Element}
 */

export const DownloadButton = ({ label, filename, mime, build }: DownloadButtonProps) => {
  const save = () => {
    // Temporary link
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([build()], { type: `${mime};charset=utf-8` }))
    link.download = filename
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <Button variant="secondary" icon="sheet" onClick={save}>
      {label}
    </Button>
  )
}
