'use client'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/elements/actions/Button'
import { Markdown } from '@/components/elements/display/Markdown'
import type { ReadBlock } from '@/declarations/academy/curriculum/types'
import { ROUTES } from '@/declarations/navigation'
import { COURSE_READ } from '@/declarations/ui/variants'

export interface AskBlockProps {
  block: Extract<ReadBlock, { kind: 'ask' }>
  onYes: () => void
}

/**
 * Question closing a welcome screen: one answer goes on, the other leaves to the home page
 * @param {AskBlockProps} props - Question and what the yes does
 * @return {JSX.Element}
 */

export const AskBlock = ({ block, onYes }: AskBlockProps) => {
  const router = useRouter()

  return (
    <div className={COURSE_READ.ask}>
      <Markdown source={block.prompt} className={COURSE_READ.askPrompt} />
      <div className={COURSE_READ.askActions}>
        <Button variant="primary" onClick={onYes}>
          {block.yes}
        </Button>
        <Button variant="secondary" onClick={() => router.push(ROUTES.dashboard)}>
          {block.no}
        </Button>
      </div>
      {block.note && <p className={COURSE_READ.askNote}>{block.note}</p>}
    </div>
  )
}
