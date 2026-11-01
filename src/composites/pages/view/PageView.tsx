'use client'

import { useCallback, useRef } from 'react'
import type { Editor } from '@tiptap/core'

import { BreadcrumbLabel } from '@/components/tools/BreadcrumbLabel'
import { PageEditor } from '@/composites/pages/editor/PageEditor'
import { ConflictBanner } from '@/composites/pages/view/ConflictBanner'
import { PageComments } from '@/composites/pages/view/PageComments'
import { PageHeading } from '@/composites/pages/view/PageHeading'
import { PageMenu } from '@/composites/pages/view/PageMenu'
import { PageTopBar } from '@/composites/pages/view/PageTopBar'
import { TrashedBanner } from '@/composites/pages/view/TrashedBanner'
import { usePageWidth } from '@/core/hooks/interaction/state/usePageWidth'
import { usePageActions, usePageMeta, usePageSync } from '@/core/hooks/data/pages'
import { levelAllows } from '@/core/lib/pages'
import { PAGES_COPY } from '@/declarations/pages/copy'
import { PAGE_VIEW_STYLES } from '@/declarations/ui/variants'
import type { PageDetail, PageDocument } from '@/types/pages'
import { cn } from '@/utils/classnames'

export interface PageViewProps {
  page: PageDetail
  accountId: string
}

/**
 * Private page: heading, block editor, sync and discussion
 * @param {PageDetail} page - Page
 * @param {string} accountId - Signed-in account
 * @return {JSX.Element}
 */

export const PageView = ({ page, accountId }: PageViewProps) => {
  const editorRef = useRef<Editor | null>(null)
  const { create } = usePageActions()
  const { upload } = usePageMeta(page.id)
  const { isWide } = usePageWidth()
  const canWrite = levelAllows(page.level, 'write') && !page.trashedAt

  // A chosen server copy lands in the editor
  const replace = useCallback((content: PageDocument) => {
    editorRef.current?.commands.setContent(content, { emitUpdate: false })
  }, [])
  const sync = usePageSync(page, accountId, replace)

  const onReady = useCallback((editor: Editor | null) => {
    editorRef.current = editor
  }, [])

  const createSubpage = useCallback(
    async () => (await create({ parentId: page.id, open: false }))?.id ?? null,
    [create, page.id]
  )

  return (
    <div className={cn(PAGE_VIEW_STYLES.column, isWide && PAGE_VIEW_STYLES.columnWide)}>
      <BreadcrumbLabel label={page.title || PAGES_COPY.untitled} />
      <PageTopBar page={page} status={sync.status} contentAt={sync.contentAt} onRetry={() => void sync.retry()} />
      <PageMenu page={page} />

      <PageHeading page={page} />

      {page.trashedAt && <TrashedBanner pageId={page.id} />}
      {sync.conflict && <ConflictBanner conflict={sync.conflict} onKeepMine={sync.keepMine} onKeepTheirs={sync.keepTheirs} />}
      {!canWrite && !page.trashedAt && <p className={PAGE_VIEW_STYLES.readOnly}>{PAGES_COPY.readOnlyHint}</p>}

      {sync.opening.isReady && (
        <PageEditor
          pageId={page.id}
          initialContent={sync.opening.resumed ?? page.content}
          editable={canWrite}
          onChange={sync.change}
          onReady={onReady}
          uploadImage={upload}
          createSubpage={createSubpage}
        />
      )}

      {!page.trashedAt && (
        <PageComments
          pageId={page.id}
          canComment={levelAllows(page.level, 'comment')}
          canModerate={levelAllows(page.level, 'share')}
        />
      )}
    </div>
  )
}
