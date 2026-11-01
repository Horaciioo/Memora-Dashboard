'use client'

import { NodeViewWrapper } from '@tiptap/react'
import type { ReactNodeViewProps } from '@tiptap/react'

import Link from '@/components/elements/navigation/AppLink'
import { usePageTree } from '@/core/hooks/data/pages'
import { ROUTES } from '@/declarations/navigation'
import { PAGE_EDITOR_COPY, PAGES_COPY } from '@/declarations/pages/copy'
import { ICONS } from '@/declarations/ui/icons'
import { PAGE_BLOCK_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Link card to a child page, closed pages stay unnamed
 * @param {ReactNodeViewProps} props - Node view props
 * @return {JSX.Element}
 */

export const SubpageView = ({ node }: ReactNodeViewProps) => {
  const { pages } = usePageTree()
  const pageId = String(node.attrs.pageId ?? '')
  const page = pages.find((entry) => entry.id === pageId)
  const PageIcon = ICONS.page

  return (
    <NodeViewWrapper data-subpage="" data-page-id={pageId} className={PAGE_BLOCK_STYLES.subpage}>
      {page ? (
        <Link href={ROUTES.page(page.id)} className={PAGE_BLOCK_STYLES.subpageLink} contentEditable={false}>
          {page.icon ? (
            <span className={PAGE_BLOCK_STYLES.subpageEmoji}>{page.icon}</span>
          ) : (
            <PageIcon className={PAGE_BLOCK_STYLES.subpageGlyph} aria-hidden="true" />
          )}
          <span className={PAGE_BLOCK_STYLES.subpageTitle}>{page.title || PAGES_COPY.untitled}</span>
        </Link>
      ) : (
        <span className={cn(PAGE_BLOCK_STYLES.subpageLink, PAGE_BLOCK_STYLES.subpageMissing)} contentEditable={false}>
          <PageIcon className={PAGE_BLOCK_STYLES.subpageGlyph} aria-hidden="true" />
          {PAGE_EDITOR_COPY.subpageMissing}
        </span>
      )}
    </NodeViewWrapper>
  )
}
